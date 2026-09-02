import os
from datetime import date

from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models.users.users import User
from app.models.classification.assessment_questions import AssessmentQuestion
from app.models.classification.assessment_responses import AssessmentResponse
from app.models.users.organisations import Organisation
from app.models.jobs import Job
from app.models.classification.job_applications import JobApplication
from app.models.programs import Program
from app.models.communication.communities import Community
from app.models.communication.community_posts import CommunityPost
from app.models.communication.community_membership import CommunityMembership
from app.models.donations.financialDonations import FinancialDonation
from app.models.users.donors import Donor


def clear_data():
    db.drop_all()
    db.create_all()

def seed_users():
    users = [
        User(
            first_name="Caroline",
            last_name="Oriama",
            email="carolineoriama@gmail.com",
            password_hash=generate_password_hash("password123"),
            phone="+254712345000",
            gender="Female",
            avatar_url="https://i.pinimg.com/736x/b1/11/5e/b1115e983068837364e923b1ebc0c8f1.jpg",
            location="Nairobi",
        ),
        User(
            first_name="Keith",
            last_name="Austine",
            email="keithaustine@gmail.com",
            password_hash=generate_password_hash("password123"),
            phone="+254712345010",
            gender="Female",
            avatar_url="https://gizmodo.com/app/uploads/2017/07/kmmcfzf47kjtcbhfqbqr.jpg",
            location="Nairobi",
        ),
        User(
            first_name="Chipphirah",
            last_name="Wambugu",
            email="chipphirahwambugu@gmail.com",
            password_hash=generate_password_hash("password123"),
            phone="+254712345011",
            gender="Male",
            avatar_url="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScZySnNo4yMVk-Ke45uFXElrG13UvgOABjhIt3RCwvDA&s=10",
            location="Nairobi",
        ),
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
            first_name=os.environ.get("SEED_ADMIN_FIRST_NAME", "Admin"),
            last_name=os.environ.get("SEED_ADMIN_LAST_NAME", "User"),
            email=os.environ.get("SEED_ADMIN_EMAIL", "admin@povertyline.app"),
            password_hash=generate_password_hash(
                os.environ.get("SEED_ADMIN_PASSWORD", "ChangeMe123!")
            ),
            role="admin",
            is_active=True,
            location="Nairobi",
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
        AssessmentResponse(
            user_id=users[0].user_id,
            question_id=questions[0].question_id,
            answer="4500",
            score=10.00,
        ),
        AssessmentResponse(
            user_id=users[0].user_id,
            question_id=questions[2].question_id,
            answer="No",
            score=0.00,
        ),
        AssessmentResponse(
            user_id=users[4].user_id,
            question_id=questions[0].question_id,
            answer="3000",
            score=5.00,
        ),
        AssessmentResponse(
            user_id=users[4].user_id,
            question_id=questions[3].question_id,
            answer="3",
            score=5.00,
        ),
        AssessmentResponse(
            user_id=users[2 % len(users)].user_id,
            question_id=questions[0].question_id,
            answer="2500",
            score=3.00,
        ),
        AssessmentResponse(
            user_id=users[3 % len(users)].user_id,
            question_id=questions[4].question_id,
            answer="No",
            score=0.00,
        ),
    ]
    db.session.add_all(responses)
    db.session.commit()
    return responses


def seed_organisations(users):
    organisations = [
        Organisation(
            owner_user_id=users[0].user_id,
            name="Kericho Community Trust",
            organisation_type="NGO",
            description="Supports smallholder farmers and tea pickers in Kericho County.",
            email="info@kerichotrust.org",
            phone="+254701000001",
            website="https://kerichotrust.org",
            location="Kericho",
            verified=True,
        ),
        Organisation(
            owner_user_id=users[1].user_id,
            name="Lake Victoria Youth Network",
            organisation_type="NGO",
            description="Skills training and job placement for youth around Kisumu.",
            email="info@lvyn.org",
            phone="+254701000002",
            website="https://lvyn.org",
            location="Kisumu",
            verified=True,
        ),
        Organisation(
            owner_user_id=users[2].user_id,
            name="Coastal Skills Foundation",
            organisation_type="NGO",
            description="Vocational training for women and youth along the coast.",
            email="info@coastalskills.org",
            phone="+254701000003",
            website="https://coastalskills.org",
            location="Mombasa",
            verified=False,
        ),
        Organisation(
            owner_user_id=users[3].user_id,
            name="Nairobi Empowerment Hub",
            organisation_type="Social Enterprise",
            description="Digital skills and micro-enterprise support in Nairobi.",
            email="info@nairobihub.org",
            phone="+254701000004",
            website="https://nairobihub.org",
            location="Nairobi",
            verified=False,
        ),
    ]
    db.session.add_all(organisations)
    db.session.commit()
    return organisations


def seed_jobs(organisations):
    jobs = [
        Job(
            organisation_id=organisations[0].organisation_id,
            title="Farm Extension Officer",
            description="Advise smallholder farmers on best agricultural practices.",
            requirements="Diploma in agriculture or related field",
            minimum_education="Tertiary",
            experience="1-2 years",
            application_deadline=date(2026, 9, 30),
            status="open",
        ),
        Job(
            organisation_id=organisations[0].organisation_id,
            title="Community Health Volunteer",
            description="Support household health assessments in rural Kericho.",
            requirements="Secondary education, willingness to travel locally",
            minimum_education="Secondary",
            experience="None",
            application_deadline=date(2026, 9, 15),
            status="open",
        ),
        Job(
            organisation_id=organisations[1].organisation_id,
            title="Youth Program Coordinator",
            description="Coordinate skills training sessions for youth cohorts.",
            requirements="Experience running community programs",
            minimum_education="Tertiary",
            experience="2-3 years",
            application_deadline=date(2026, 10, 10),
            status="open",
        ),
        Job(
            organisation_id=organisations[2].organisation_id,
            title="Tailoring Trainer",
            description="Teach basic tailoring skills to women's groups.",
            requirements="Proven tailoring skill, teaching ability",
            minimum_education="Secondary",
            experience="3+ years",
            application_deadline=date(2026, 8, 31),
            status="closed",
        ),
        Job(
            organisation_id=organisations[3].organisation_id,
            title="Data Clerk",
            description="Maintain beneficiary records and enter program data.",
            requirements="Comfortable with spreadsheets",
            minimum_education="Secondary",
            experience="None",
            application_deadline=date(2026, 9, 20),
            status="open",
        ),
    ]
    db.session.add_all(jobs)
    db.session.commit()
    return jobs


def seed_job_applications(users, jobs):
    applications = [
        JobApplication(
            user_id=users[4 % len(users)].user_id,
            job_id=jobs[0].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[1 % len(users)].user_id,
            job_id=jobs[0].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[2 % len(users)].user_id,
            job_id=jobs[2].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[3 % len(users)].user_id,
            job_id=jobs[4].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[4 % len(users)].user_id,
            job_id=jobs[1].job_id,
            status="pending",
        ),
    ]
    db.session.add_all(applications)
    db.session.commit()
    return applications


def seed_programs(organisations):
    programs = [
        Program(
            organisation_id=organisations[0].organisation_id,
            title="Kericho Smallholder Support",
            description="Training and input support for small tea and vegetable farmers.",
            type="Agriculture",
            location="Kericho",
            active=True,
        ),
        Program(
            organisation_id=organisations[1].organisation_id,
            title="Kisumu Youth Skills",
            description="Digital and vocational skills training for unemployed youth.",
            type="Education",
            location="Kisumu",
            active=True,
        ),
        Program(
            organisation_id=organisations[2].organisation_id,
            title="Coastal Women Empowerment",
            description="Business and craft training for women's savings groups.",
            type="Livelihood",
            location="Mombasa",
            active=True,
        ),
        Program(
            organisation_id=organisations[3].organisation_id,
            title="Nairobi Digital Literacy",
            description="Basic computer and smartphone skills for job seekers.",
            type="Education",
            location="Nairobi",
            active=True,
        ),
    ]
    db.session.add_all(programs)
    db.session.commit()
    return programs


def seed_donations(users, programs):
    donors = [
        Donor(
            user_id=users[0].user_id,
            name=f"{users[0].first_name} {users[0].last_name}",
            email=users[0].email,
            phone_number=users[0].phone,
        ),
        Donor(
            user_id=users[1].user_id,
            name=f"{users[1].first_name} {users[1].last_name}",
            email=users[1].email,
            phone_number=users[1].phone,
        ),
    ]
    db.session.add_all(donors)
    db.session.flush()
    donations = [
        FinancialDonation(
            program_id=programs[0].id,
            donor_id=donors[0].id,
            amount=150000.00,
            currency="KES",
            donation_date=date(2026, 2, 10),
            payment_method="mpesa",
            payment_status="completed",
            provider_reference="TXN-SF-001",
        ),
        FinancialDonation(
            program_id=programs[1].id,
            donor_id=donors[1].id,
            amount=5000.00,
            currency="KES",
            donation_date=date(2026, 3, 5),
            payment_method="mpesa",
            payment_status="completed",
            provider_reference="TXN-JK-002",
        ),
        FinancialDonation(
            program_id=None,
            amount=2000.00,
            currency="KES",
            donation_date=date(2026, 4, 1),
            payment_method="paypal",
            payment_status="completed",
            provider_reference="TXN-ANN-003",
        ),
        FinancialDonation(
            program_id=programs[3].id,
            donor_id=donors[0].id,
            amount=75000.00,
            currency="KES",
            donation_date=date(2026, 1, 20),
            payment_method="paypal",
            payment_status="completed",
            provider_reference="TXN-NRC-004",
        ),
    ]
    db.session.add_all(donations)
    db.session.commit()
    return donations


def seed_communities():
    communities = [
        Community(
            name="General Support",
            description="A safe space for open discussion and mutual help.",
            category="General Support",
            location="Nairobi",
        ),
        Community(
            name="Housing Advice",
            description="Emergency shelter, rent assistance, and tenant rights.",
            category="Housing Advice",
            location="Nairobi",
        ),
        Community(
            name="Food Sharing",
            description="Local food banks, community pantries, and meal drives.",
            category="Food Sharing",
            location="Nairobi",
        ),
        Community(
            name="Job Seekers",
            description="Employment leads, resume feedback, and interview prep.",
            category="Job Seekers",
            location="Nairobi",
        ),
        Community(
            name="Mental Wellbeing",
            description="Peer support, counseling resources, and wellness chats.",
            category="Mental Wellbeing",
            location="Nairobi",
        ),
    ]
    db.session.add_all(communities)
    db.session.commit()
    return communities


def seed_community_posts(users, communities):
    # users[0]: Caroline , users[1]: Keith , users[2]: Chipphirah
    # communities[0]: General Support
    posts = [
        CommunityPost(
            community_id=communities[0].community_id,
            user_id=users[1].user_id,
            content="Hi everyone, I just wanted to share that the community pantry on 4th Street has received a new delivery of fresh produce this morning. They are open until 4 PM today.",
        ),
        CommunityPost(
            community_id=communities[0].community_id,
            user_id=users[2].user_id,
            content="Thanks Austine! Do you know if they have any baby formula left? I've been trying to find some since yesterday.",
        ),
        CommunityPost(
            community_id=communities[0].community_id,
            user_id=users[0].user_id,
            content="Chipphirah, I was just there. They had about 4 tins left behind the counter, you have to ask the volunteers specifically for it.",
        ),
    ]
    db.session.add_all(posts)
    db.session.commit()
    return posts


def seed_community_memberships(users, communities):
    memberships = [
        CommunityMembership(
            user_id=users[0].user_id,
            community_id=communities[0].community_id,
            role="admin",
        ),
        CommunityMembership(
            user_id=users[1].user_id,
            community_id=communities[0].community_id,
            role="moderator",
        ),
        CommunityMembership(
            user_id=users[2].user_id,
            community_id=communities[0].community_id,
            role="member",
        ),
        CommunityMembership(
            user_id=users[3].user_id,
            community_id=communities[0].community_id,
            role="member",
        ),
        CommunityMembership(
            user_id=users[4].user_id,
            community_id=communities[0].community_id,
            role="member",
        ),
        CommunityMembership(
            user_id=users[0].user_id,
            community_id=communities[1].community_id,
            role="member",
        ),
        CommunityMembership(
            user_id=users[1].user_id,
            community_id=communities[2].community_id,
            role="member",
        ),
        CommunityMembership(
            user_id=users[2].user_id,
            community_id=communities[3].community_id,
            role="member",
        ),
    ]
    db.session.add_all(memberships)
    db.session.commit()
    return memberships


def run_seed():
    app = create_app()
    with app.app_context():
        clear_data()

        users = seed_users()
        questions = seed_assessment_questions()
        seed_assessment_responses(users, questions)

        organisations = seed_organisations(users)
        jobs = seed_jobs(organisations)
        seed_job_applications(users, jobs)

        programs = seed_programs(organisations)
        seed_donations(users, programs)

        communities = seed_communities()
        seed_community_posts(users, communities)
        seed_community_memberships(users, communities)

        print("Database seeded successfully.")


if __name__ == "__main__":
    run_seed()
