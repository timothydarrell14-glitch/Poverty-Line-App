from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.classification.job_applications import JobApplication
from app.schemas.job_application_schema import (
    job_application_schema,
    job_applications_schema,
    job_application_create_schema,
)
from app.services.notifications import notify

job_applications_bp = Blueprint(
    "job_applications", __name__, url_prefix="/api/job-applications"
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
    db.session.flush()
    notify(
        "job_application",
        "New job application",
        f"A new application was submitted for job #{application.job_id}.",
        related_type="job_application",
        related_id=application.application_id,
    )
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
