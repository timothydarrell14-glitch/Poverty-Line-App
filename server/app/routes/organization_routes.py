from flask import Blueprint

from flask_jwt_extended import jwt_required

from app.controllers.organization_controller import (
    create_organization,
    get_all_organizations,
    get_organization_by_id,
    update_organization,
    delete_organization,
)

from app.utils.decorators import role_required


organization_bp = Blueprint(
    "organizations",
    __name__,
    url_prefix="/api/organizations"
)


# ============================================================
# PUBLIC ENDPOINTS
# ============================================================

@organization_bp.route("", methods=["GET"])
def get_organizations():

    return get_all_organizations()


@organization_bp.route(
    "/<int:organization_id>",
    methods=["GET"]
)
def get_organization(organization_id):

    return get_organization_by_id(
        organization_id
    )


# ============================================================
# ADMIN ENDPOINTS
# ============================================================

@organization_bp.route(
    "",
    methods=["POST"]
)
@jwt_required()
@role_required("ADMIN")
def create_organization_route():

    return create_organization()


@organization_bp.route(
    "/<int:organization_id>",
    methods=["PUT"]
)
@jwt_required()
@role_required("ADMIN")
def update_organization_route(
    organization_id
):

    return update_organization(
        organization_id
    )


@organization_bp.route(
    "/<int:organization_id>",
    methods=["DELETE"]
)
@jwt_required()
@role_required("ADMIN")
def delete_organization_route(
    organization_id
):

    return delete_organization(
        organization_id
    )
