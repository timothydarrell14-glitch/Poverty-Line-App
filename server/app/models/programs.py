from app.extensions import db


class Program(db.Model):
    __tablename__ = "programs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.String(500))
    description = db.Column(db.Text)
    type = db.Column(db.String(100))
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    created_by = db.Column(db.Integer, db.ForeignKey("users.user_id"))
    active = db.Column(db.Boolean, default=True, nullable=False)
    organisation_id = db.Column(db.Integer, db.ForeignKey("organisations.organisation_id"))

    organisation = db.relationship("Organisation", back_populates="programs")
    financial_donations = db.relationship("FinancialDonation", back_populates="program")
    non_financial_donations = db.relationship("NonFinancialDonation", back_populates="program")

    @classmethod
    def list_for_admin(cls, search=None, active=None, organisation_id=None):
        """Build a filtered program query for administrator management."""
        query = cls.query
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(db.or_(cls.title.ilike(term), cls.description.ilike(term)))
        if active is not None:
            query = query.filter(cls.active == active)
        if organisation_id:
            query = query.filter(cls.organisation_id == organisation_id)
        return query.order_by(cls.title.asc())

    @classmethod
    def create_from_data(cls, data):
        """Create an unsaved program instance from schema-validated input."""
        return cls(
            organisation_id=data["organisation_id"],
            title=data["title"],
            summary=data.get("summary"),
            description=data.get("description"),
            type=data.get("type"),
            location=data.get("location"),
            created_by=data.get("created_by"),
            active=data.get("active", True),
        )
