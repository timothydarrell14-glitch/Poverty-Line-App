from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db
from app.models.Classification.assessment_responses import AssessmentResponse
from app.models.Classification.assessment_questions import AssessmentQuestion
from app.models.Users.members import User
from app.schemas.assessment_response_schema import (
    assessment_response_schema,
    assessment_responses_schema,
    assessment_response_create_schema,
)
from app.services.poverty_scoring import calculate_poverty_score

assessment_responses_bp = Blueprint(
    "assessment_responses", __name__, url_prefix="/api/assessment-responses"
)


@assessment_responses_bp.route("", methods=["POST"])
@jwt_required()
def create_assessment_response():
    current_user_id = int(get_jwt_identity())

    try:
        data = assessment_response_create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 422

    response = AssessmentResponse(
        user_id=current_user_id,
        question_id=data["question_id"],
        answer=data["answer"],
        score=data.get("score"),
    )
    db.session.add(response)
    db.session.commit()

    return jsonify(assessment_response_schema.dump(response)), 201


@assessment_responses_bp.route("", methods=["GET"])
@jwt_required()
def list_my_assessment_responses():
    current_user_id = int(get_jwt_identity())

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = AssessmentResponse.query.filter_by(user_id=current_user_id).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "responses": assessment_responses_schema.dump(pagination.items),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    ), 200


@assessment_responses_bp.route("/<int:response_id>", methods=["GET"])
@jwt_required()
def get_assessment_response(response_id):
    current_user_id = int(get_jwt_identity())
    response = db.get_or_404(AssessmentResponse, response_id)

    if response.user_id != current_user_id:
        return jsonify({"error": "Not authorized to view this response"}), 403

    return jsonify(assessment_response_schema.dump(response)), 200


@assessment_responses_bp.route("/calculate", methods=["POST"])
@jwt_required()
def calculate_my_poverty_score():
    current_user_id = int(get_jwt_identity())

    user = db.get_or_404(User, current_user_id)
    responses = AssessmentResponse.query.filter_by(user_id=current_user_id).all()

    if not responses:
        return jsonify({"error": "No assessment responses found for this user"}), 400

    questions = AssessmentQuestion.query.all()
    questions_by_id = {question.question_id: question for question in questions}

    calculate_poverty_score(user, responses, questions_by_id)
    db.session.commit()

    return jsonify(
        {
            "user_id": user.user_id,
            "poverty_score": float(user.poverty_score),
            "poverty_classification": user.poverty_classification,
        }
    ), 200
