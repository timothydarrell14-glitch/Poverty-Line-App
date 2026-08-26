from datetime import date

from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models.users import User
from app.models.assessment_questions import AssessmentQuestion
from app.models.assessment_responses import AssessmentResponse
from app.models.organisations import Organisation
from app.models.jobs import Job
from app.models.job_applications import JobApplication
from app.models.programs import Program
from app.models.program_memberships import ProgramMembership
from app.models.donations import Donation
from app.models.communities import Community
from app.models.community_posts import CommunityPost
from app.models.community_membership import CommunityMembership


def clear_data():
	CommunityMembership.query.delete()
	CommunityPost.query.delete()
	Community.query.delete()
	Donation.query.delete()
	ProgramMembership.query.delete()
	Program.query.delete()
	JobApplication.query.delete()
	Job.query.delete()
	Organisation.query.delete()
	AssessmentResponse.query.delete()
	AssessmentQuestion.query.delete()
	User.query.delete()
	db.session.commit()


def seed_users():
	users = [
		User(
			first_name="Grace",
			last_name="Cherono",
			email="grace.cherono@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345001",
			date_of_birth=date(1990, 3, 12),
			gender="Female",
			education_level="Secondary",
			employment_status="Unemployed",
			skills="Tailoring, farming",
			location="Kericho",
		),
		User(
			first_name="Brian",
			last_name="Otieno",
			email="brian.otieno@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345002",
			date_of_birth=date(1988, 7, 22),
			gender="Male",
			education_level="Tertiary",
			employment_status="Self-employed",
			skills="Fishing, boat repair",
			location="Kisumu",
		),
		User(
			first_name="Amina",
			last_name="Hassan",
			email="amina.hassan@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345003",
			date_of_birth=date(1995, 1, 5),
			gender="Female",
			education_level="Secondary",
			employment_status="Unemployed",
			skills="Weaving, hospitality",
			location="Mombasa",
		),
		User(
			first_name="Peter",
			last_name="Mwangi",
			email="peter.mwangi@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345004",
			date_of_birth=date(1985, 11, 30),
			gender="Male",
			education_level="Tertiary",
			employment_status="Employed",
			skills="Project management, data entry",
			location="Nairobi",
		),
		User(
			first_name="Faith",
			last_name="Chebet",
			email="faith.chebet@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345005",
			date_of_birth=date(1998, 5, 18),
			gender="Female",
			education_level="Primary",
			employment_status="Unemployed",
			skills="Farming",
			location="Eldoret",
		),
		User(
			first_name="David",
			last_name="Kamau",
			email="david.kamau@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345006",
			date_of_birth=date(1992, 9, 9),
			gender="Male",
			education_level="Secondary",
			employment_status="Self-employed",
			skills="Carpentry",
			location="Nakuru",
		),
		User(
			first_name="Mercy",
			last_name="Wanjiru",
			email="mercy.wanjiru@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345007",
			date_of_birth=date(1993, 4, 25),
			gender="Female",
			education_level="Tertiary",
			employment_status="Unemployed",
			skills="Bookkeeping",
			location="Machakos",
		),
		User(
			first_name="Ali",
			last_name="Abdi",
			email="ali.abdi@example.com",
			password_hash=generate_password_hash("password123"),
			phone="+254712345008",
			date_of_birth=date(1991, 12, 2),
			gender="Male",
			education_level="Secondary",
			employment_status="Unemployed",
			skills="Livestock keeping",
			location="Garissa",
		),
	]
	db.session.add_all(users)
	db.session.commit()
	return users


def seed_assessment_questions():
	questions = [
		AssessmentQuestion(
			question_text="What is your average monthly household income?",
			category="Income",
			question_type="numeric",
			weight=25.00,
			is_required=True,
			is_active=True,
		),
		AssessmentQuestion(
			question_text="What is your highest level of completed education?",
			category="Education",
			question_type="text",
			weight=15.00,
			is_required=True,
			is_active=True,
		),
		AssessmentQuestion(
			question_text="Do you currently have stable employment?",
			category="Employment",
			question_type="boolean",
			weight=20.00,
			is_required=True,
			is_active=True,
		),
		AssessmentQuestion(
			question_text="How many dependents rely on your income?",
			category="Household",
			question_type="numeric",
			weight=15.00,
			is_required=True,
			is_active=True,
		),
		AssessmentQuestion(
			question_text="Do you have access to clean water at home?",
			category="Living Conditions",
			question_type="boolean",
			weight=15.00,
			is_required=False,
			is_active=True,
		),
		AssessmentQuestion(
			question_text="Do you own or rent your current home?",
			category="Living Conditions",
			question_type="text",
			weight=10.00,
			is_required=False,
			is_active=True,
		),
	]
	db.session.add_all(questions)
	db.session.commit()
	return questions


def seed_assessment_responses(users, questions):
	responses = [
		AssessmentResponse(user_id=users[0].user_id, question_id=questions[0].question_id, answer="4500", score=10.00),
		AssessmentResponse(user_id=users[0].user_id, question_id=questions[2].question_id, answer="No", score=0.00),
		AssessmentResponse(user_id=users[4].user_id, question_id=questions[0].question_id, answer="3000", score=5.00),
		AssessmentResponse(user_id=users[4].user_id, question_id=questions[3].question_id, answer="3", score=5.00),
		AssessmentResponse(user_id=users[7].user_id, question_id=questions[0].question_id, answer="2500", score=3.00),
		AssessmentResponse(user_id=users[7].user_id, question_id=questions[4].question_id, answer="No", score=0.00),
	]
	db.session.add_all(responses)
	db.session.commit()
	return responses