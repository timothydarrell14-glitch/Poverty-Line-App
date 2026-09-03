import secrets

from app.extensions import db
from werkzeug.security import check_password_hash, generate_password_hash

USER_STATUSES = ("Active", "Inactive", "On Leave", "Retired")
ACCOUNT_ROLES = ("member", "donor", "admin", "partner")


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(
        db.String(50), nullable=False, default="member", server_default="member"
    )
    is_active = db.Column(
        db.Boolean, nullable=False, default=True, server_default=db.true()
    )
    status = db.Column(
        db.String(30), nullable=False, default="Active", server_default="Active"
    )
    last_active_at = db.Column(db.DateTime, nullable=True)
    phone = db.Column(db.String(50))
    avatar_url = db.Column(db.String(500))
    cover_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    member = db.relationship("Member", back_populates="user", uselist=False, cascade="all, delete-orphan")
    donor = db.relationship("Donor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin = db.relationship("Admin", back_populates="user", uselist=False, cascade="all, delete-orphan")
    partner = db.relationship("Partner", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def is_admin(self):
        """Return whether this user currently has administrator access."""
        return (self.role or "").strip().lower() == "admin"

    @classmethod
    def get_by_email(cls, email):
        """Find a user by an email address without case sensitivity."""
        return cls.query.filter(
            db.func.lower(cls.email) == email.strip().lower()
        ).first()

    @classmethod
    def create_from_registration(cls, data):
        """Build a standard-user account from validated registration data."""
        return cls(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"].strip().lower(),
            password_hash=generate_password_hash(data["password"]),
            phone=data.get("phone"),
            role=data.get("role", "member"),
        )

    def sync_role_profile(self):
        """Keep exactly one profile linked to this account's role."""
        from app.models.users.admins import Admin
        from app.models.users.donors import Donor
        from app.models.users.members import Member
        from app.models.users.partners import Partner

        profiles = {
            "member": self.member,
            "donor": self.donor,
            "admin": self.admin,
            "partner": self.partner,
        }
        for role, profile in profiles.items():
            if role != self.role and profile is not None:
                db.session.delete(profile)

        if self.role == "donor" and self.donor is None:
            return Donor(user=self, name=f"{self.first_name} {self.last_name}", email=self.email, phone_number=self.phone)
        if self.role == "member" and self.member is None:
            return Member(
                user=self,
                date_of_birth=getattr(self, "_registration_date_of_birth", None),
                gender=getattr(self, "_registration_gender", None),
                education_level=getattr(self, "_registration_education_level", None),
                employment_status=getattr(self, "_registration_employment_status", None),
                skills=getattr(self, "_registration_skills", None),
                location=getattr(self, "_registration_location", None),
            )
        if self.role == "admin" and self.admin is None:
            return Admin(user=self)
        if self.role == "partner" and self.partner is None:
            return Partner(user=self)
        return None

    def verifies_password(self, password):
        """Safely check a plaintext password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def generate_random_password():
        return secrets.token_urlsafe(24)

    @staticmethod
    def hash_password(password):
        return generate_password_hash(password)

    @classmethod
    def list_for_admin(cls, search=None, role=None):
        """Build a filtered user query for administrator management tools."""
        query = cls.query
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                db.or_(
                    cls.first_name.ilike(term),
                    cls.last_name.ilike(term),
                    cls.email.ilike(term),
                )
            )
        if role:
            query = query.filter(db.func.lower(cls.role) == role.strip().lower())
        return query.order_by(cls.created_at.desc(), cls.user_id.desc())
