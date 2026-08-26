from flask import Blueprint, request, jsonify

from app.models.assessment_questions import AssessmentQuestion
from app.schemas.assessment_question_schema import (
	assessment_question_schema,
	assessment_questions_schema,
)

assessment_questions_bp = Blueprint(
	"assessment_questions", __name__, url_prefix="/assessment-questions"
)


@assessment_questions_bp.route("", methods=["GET"])
def list_assessment_questions():
	page = request.args.get("page", 1, type=int)
	per_page = request.args.get("per_page", 20, type=int)
	category = request.args.get("category")

	query = AssessmentQuestion.query.filter_by(is_active=True)

	if category:
		query = query.filter_by(category=category)

	pagination = query.paginate(page=page, per_page=per_page, error_out=False)

	return jsonify(
		{
			"questions": assessment_questions_schema.dump(pagination.items),
			"total": pagination.total,
			"page": pagination.page,
			"per_page": pagination.per_page,
			"pages": pagination.pages,
		}
	), 200


@assessment_questions_bp.route("/<int:question_id>", methods=["GET"])
def get_assessment_question(question_id):
	question = AssessmentQuestion.query.get_or_404(question_id)
	return jsonify(assessment_question_schema.dump(question)), 200