from sqlalchemy import func

from app.extensions import db
from app.models.organization import Organization


# ============================================================
# CREATE ORGANIZATION
# ============================================================

def create_organization(data):

    # Normalize email
    email = data.get("email")

    if email:
        email = email.strip().lower()
        data["email"] = email

    # Check for existing email case-insensitively
    existing_organization = Organization.query.filter(
        func.lower(Organization.email) == email
    ).first()

    if existing_organization:
        raise ValueError(
            "Organization with this email already exists"
        )

    organization = Organization(**data)

    db.session.add(organization)
    db.session.commit()

    return organization


# ============================================================
# GET ALL ORGANIZATIONS
# ============================================================

def get_all_organizations():
    return Organization.query.all()


# ============================================================
# GET ORGANIZATION BY ID
# ============================================================

def get_organization_by_id(organization_id):

    return db.session.get(
        Organization,
        organization_id
    )


# ============================================================
# UPDATE ORGANIZATION
# ============================================================

def update_organization(organization_id, data):

    organization = db.session.get(
        Organization,
        organization_id
    )

    if not organization:
        return None

    # Normalize email if email is being updated
    if "email" in data and data["email"]:

        email = data["email"].strip().lower()

        # Check whether another organization already
        # uses this email
        existing_organization = Organization.query.filter(
            func.lower(Organization.email) == email,
            Organization.id != organization_id
        ).first()

        if existing_organization:
            raise ValueError(
                "Organization with this email already exists"
            )

        data["email"] = email

    # Update fields
    for key, value in data.items():
        setattr(organization, key, value)

    db.session.commit()

    return organization


# ============================================================
# DELETE ORGANIZATION
# ============================================================

def delete_organization(organization_id):

    organization = db.session.get(
        Organization,
        organization_id
    )

    if not organization:
        return None

    db.session.delete(organization)
    db.session.commit()

    return organization