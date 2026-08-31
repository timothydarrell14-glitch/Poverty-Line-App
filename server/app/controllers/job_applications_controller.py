from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.job_applications import JobApplication
from app.models.users import User
from app.schemas.job_application_schema import (
	job_application_schema,
	job_applications_schema,
	job_application_create_schema,
	job_application_status_update_schema,
)

job_applications_bp = Blueprint(
    "job_applications", __name__, url_prefix="/job-applications"
)


@job_applications_bp.route("", methods=["POST"])
@jwt_required()
def create_job_application():
    current_user_id = int(get_jwt_identity())

    try:
        data = job_application_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    existing = JobApplication.query.filter_by(
        user_id=current_user_id, job_id=data["job_id"]
    ).first()
    if existing:
        return jsonify({"error": "You have already applied to this job"}), 409

    application = JobApplication(
        user_id=current_user_id,
        job_id=data["job_id"],
        status="pending",
    )
    db.session.add(application)
    db.session.commit()

    return jsonify(job_application_schema.dump(application)), 201


@job_applications_bp.route("", methods=["GET"])
@jwt_required()
def list_my_job_applications():
    current_user_id = int(get_jwt_identity())

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = JobApplication.query.filter_by(user_id=current_user_id).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "applications": job_applications_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@job_applications_bp.route("/<int:application_id>", methods=["GET"])
@jwt_required()
def get_job_application(application_id):
    current_user_id = int(get_jwt_identity())
    application = db.get_or_404(JobApplication, application_id)

    if application.user_id != current_user_id:
        return jsonify({"error": "Not authorized to view this application"}), 403

    return jsonify(job_application_schema.dump(application)), 200


@job_applications_bp.route("/<int:application_id>", methods=["DELETE"])
@jwt_required()
def withdraw_job_application(application_id):
    current_user_id = int(get_jwt_identity())
    application = db.get_or_404(JobApplication, application_id)

    if application.user_id != current_user_id:
        return jsonify({"error": "Not authorized to withdraw this application"}), 403

    db.session.delete(application)
    db.session.commit()

	return "", 204


@job_applications_bp.route("/<int:application_id>/status", methods=["PATCH"])
@jwt_required()
def update_job_application_status(application_id):
	current_user_id = int(get_jwt_identity())
	current_user = User.query.get_or_404(current_user_id)

	if current_user.role != "admin":
		return jsonify({"error": "Admin access required"}), 403

	application = JobApplication.query.get_or_404(application_id)

	try:
		data = job_application_status_update_schema.load(request.get_json())
	except ValidationError as err:
		return jsonify(err.messages), 422

	application.status = data["status"]
	db.session.commit()

	return jsonify(job_application_schema.dump(application)), 200
