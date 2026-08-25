from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.jobs import Job
from app.schemas.job_schema import job_schema, job_create_schema

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