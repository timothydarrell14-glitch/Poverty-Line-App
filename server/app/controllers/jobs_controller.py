from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.jobs import Job
from app.schemas.job_schema import (
    job_schema,
    jobs_schema,
    job_create_schema,
    job_update_schema,
)

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")


@jobs_bp.route("", methods=["POST"])
@jwt_required()
def create_job():
    try:
        data = job_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    job = Job(
        organisation_id=data["organisation_id"],
        title=data["title"],
        description=data.get("description"),
        requirements=data.get("requirements"),
        minimum_education=data.get("minimum_education"),
        experience=data.get("experience"),
        application_deadline=data.get("application_deadline"),
        status="open",
    )
    db.session.add(job)
    db.session.commit()

    return jsonify(job_schema.dump(job)), 201


@jobs_bp.route("", methods=["GET"])
def list_jobs():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search")
    status = request.args.get("status")
    organisation_id = request.args.get("organisation_id", type=int)
    minimum_education = request.args.get("minimum_education")

    query = Job.query

    if search:
        like = f"%{search}%"
        query = query.filter((Job.title.ilike(like)) | (Job.description.ilike(like)))
    if status:
        query = query.filter_by(status=status)
    if organisation_id:
        query = query.filter_by(organisation_id=organisation_id)
    if minimum_education:
        query = query.filter_by(minimum_education=minimum_education)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "jobs": jobs_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@jobs_bp.route("/<int:job_id>", methods=["GET"])
def get_job(job_id):
    job = db.get_or_404(Job, job_id)
    return jsonify(job_schema.dump(job)), 200


@jobs_bp.route("/<int:job_id>", methods=["PATCH"])
@jwt_required()
def update_job(job_id):
    job = db.get_or_404(Job, job_id)

    try:
        data = job_update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    for key, value in data.items():
        setattr(job, key, value)

    db.session.commit()
    return jsonify(job_schema.dump(job)), 200


@jobs_bp.route("/<int:job_id>", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
    job = db.get_or_404(Job, job_id)
    db.session.delete(job)
    db.session.commit()
    return "", 204
