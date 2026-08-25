from flask import request, jsonify
from marshmallow import ValidationError

from app.extensions import db
from app.schemas.organization_schema import organization_schema, organizations_schema
from app.services.organization_service import (
    create_organization as create_organization_service,
    get_all_organizations as get_all_organizations_service,
    get_organization_by_id as get_organization_by_id_service,
    update_organization as update_organization_service,
    delete_organization as delete_organization_service,
)


# ============================================================
# HELPER
# ============================================================

def serialize_organization(organization):
    """
    Convert an Organization SQLAlchemy object into JSON-safe data.
    """

    return organization_schema.dump(organization)


# ============================================================
# CREATE ORGANIZATION
# ============================================================

def create_organization():
    """
    Create a new organization.

    JWT protection is handled by the route.
    """

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "message": "Validation error",
                "errors": {
                    "body": [
                        "Request body is required."
                    ]
                }
            }), 400

        # ----------------------------------------------------
        # Normalize email
        # ----------------------------------------------------

        if "email" in data and isinstance(data["email"], str):
            data["email"] = data["email"].strip().lower()

        # ----------------------------------------------------
        # Strip name
        # ----------------------------------------------------

        if "name" in data and isinstance(data["name"], str):
            data["name"] = data["name"].strip()

        # ----------------------------------------------------
        # Validate request
        # ----------------------------------------------------

        validated_data = organization_schema.load(data)

        # ----------------------------------------------------
        # Create organization
        # ----------------------------------------------------

        organization = create_organization_service(validated_data)

        return jsonify({
            "message": "Organization created successfully",
            "organization": serialize_organization(organization)
        }), 201

    except ValidationError as error:

        db.session.rollback()

        return jsonify({
            "message": "Validation error",
            "errors": error.messages
        }), 400

    except ValueError as error:

        db.session.rollback()

        return jsonify({
            "message": str(error)
        }), 400

    except Exception as error:

        db.session.rollback()

        print(
            "CREATE ORGANIZATION ERROR:",
            repr(error)
        )

        return jsonify({
            "message": "Failed to create organization",
            "error": str(error)
        }), 500


# ============================================================
# GET ALL ORGANIZATIONS
# ============================================================

def get_all_organizations():
    """
    Get all organizations.

    Public endpoint.
    """

    try:

        organizations = get_all_organizations_service()

        return jsonify({
            "organizations": organizations_schema.dump(
                organizations
            )
        }), 200

    except Exception as error:

        print(
            "GET ORGANIZATIONS ERROR:",
            repr(error)
        )

        return jsonify({
            "message": "Failed to fetch organizations",
            "error": str(error)
        }), 500


# ============================================================
# GET ORGANIZATION BY ID
# ============================================================

def get_organization_by_id(organization_id):
    """
    Get one organization by ID.

    Public endpoint.
    """

    try:

        organization = get_organization_by_id_service(
            organization_id
        )

        if not organization:

            return jsonify({
                "message": "Organization not found"
            }), 404

        return jsonify({
            "organization": serialize_organization(
                organization
            )
        }), 200

    except Exception as error:

        print(
            "GET ORGANIZATION ERROR:",
            repr(error)
        )

        return jsonify({
            "message": "Failed to fetch organization",
            "error": str(error)
        }), 500


# ============================================================
# UPDATE ORGANIZATION
# ============================================================

def update_organization(organization_id):
    """
    Update an organization.

    JWT protection is handled by the route.
    """

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "message": "Validation error",
                "errors": {
                    "body": [
                        "Request body is required."
                    ]
                }
            }), 400

        # ----------------------------------------------------
        # Normalize email
        # ----------------------------------------------------

        if "email" in data and isinstance(data["email"], str):
            data["email"] = data["email"].strip().lower()

        # ----------------------------------------------------
        # Strip name
        # ----------------------------------------------------

        if "name" in data and isinstance(data["name"], str):
            data["name"] = data["name"].strip()

        # ----------------------------------------------------
        # Partial validation
        # ----------------------------------------------------

        validated_data = organization_schema.load(
            data,
            partial=True
        )

        organization = update_organization_service(
            organization_id,
            validated_data
        )

        if not organization:

            return jsonify({
                "message": "Organization not found"
            }), 404

        return jsonify({
            "message": "Organization updated successfully",
            "organization": serialize_organization(
                organization
            )
        }), 200

    except ValidationError as error:

        db.session.rollback()

        return jsonify({
            "message": "Validation error",
            "errors": error.messages
        }), 400

    except ValueError as error:

        db.session.rollback()

        return jsonify({
            "message": str(error)
        }), 400

    except Exception as error:

        db.session.rollback()

        print(
            "UPDATE ORGANIZATION ERROR:",
            repr(error)
        )

        return jsonify({
            "message": "Failed to update organization",
            "error": str(error)
        }), 500


# ============================================================
# DELETE ORGANIZATION
# ============================================================

def delete_organization(organization_id):
    """
    Delete an organization.

    JWT protection is handled by the route.
    """

    try:

        organization = delete_organization_service(
            organization_id
        )

        if not organization:

            return jsonify({
                "message": "Organization not found"
            }), 404

        return jsonify({
            "message": "Organization deleted successfully"
        }), 200

    except Exception as error:

        db.session.rollback()

        print(
            "DELETE ORGANIZATION ERROR:",
            repr(error)
        )

        return jsonify({
            "message": "Failed to delete organization",
            "error": str(error)
        }), 500