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
from app.models.donations.nonFInancialDonations import NonFinancialDonation
from app.models.users.donors import Donor
from app.models.users.members import Member
from app.models.communication.chats import Chat
from app.models.donations.deliveries import Delivery
from app.models.settings import AppSetting
from app.models.notifications import Notification


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
            avatar_url="https://i.pinimg.com/736x/b1/11/5e/b1115e983068837364e923b1ebc0c8f1.jpg",
        ),
        User(
            first_name="Keith",
            last_name="Austine",
            email="keithaustine@gmail.com",
            password_hash=generate_password_hash("password123"),
            phone="+254712345010",
            avatar_url="https://gizmodo.com/app/uploads/2017/07/kmmcfzf47kjtcbhfqbqr.jpg",
        ),
        User(
            first_name="Chipphirah",
            last_name="Wambugu",
            email="chipphirahwambugu@gmail.com",
            password_hash=generate_password_hash("password123"),
            phone="+254712345011",
            avatar_url="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScZySnNo4yMVk-Ke45uFXElrG13UvgOABjhIt3RCwvDA&s=10",
        ),
        User(
            first_name="Grace",
            last_name="Cherono",
            email="grace.cherono@example.com",
            password_hash=generate_password_hash("password123"),
            phone="+254712345001",
        ),
        User(
            first_name="Brian",
            last_name="Otieno",
            email="brian.otieno@example.com",
            password_hash=generate_password_hash("password123"),
            phone="+254712345002",
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
        ),
    ]
    for index in range(4):
        users.append(
            User(
                first_name=f"Community{index + 1}",
                last_name="Member",
                email=f"member{index + 1}@example.com",
                password_hash=generate_password_hash("password123"),
                phone=f"+2547123451{index:02d}",
            )
        )
    # Dedicated donor account for exercising the Donor Dashboard and payments.
    # These are development-only defaults and may be overridden in the shell.
    users.append(
        User(
            first_name=os.environ.get("SEED_DONOR_FIRST_NAME", "Sarah"),
            last_name=os.environ.get("SEED_DONOR_LAST_NAME", "Mwangi"),
            email=os.environ.get("SEED_DONOR_EMAIL", "donorcheck@example.com"),
            password_hash=generate_password_hash(
                os.environ.get("SEED_DONOR_PASSWORD", "DonorPass123!")
            ),
            phone=os.environ.get("SEED_DONOR_PHONE", "+254712345099"),
            role="donor",
            is_active=True,
        )
    )
    db.session.add_all(users)
    db.session.commit()
    member_profiles = [
        {"gender": "Female", "location": "Nairobi"},
        {"gender": "Female", "location": "Nairobi"},
        {"gender": "Male", "location": "Nairobi"},
        {"date_of_birth": date(1990, 3, 12), "gender": "Female", "education_level": "Secondary", "employment_status": "Unemployed", "skills": "Tailoring, farming", "location": "Kericho"},
        {"date_of_birth": date(1988, 7, 22), "gender": "Male", "education_level": "Tertiary", "employment_status": "Self-employed", "skills": "Fishing, boat repair", "location": "Kisumu"},
    ]
    for user, profile_data in zip(users[:5], member_profiles):
        db.session.add(Member(user_id=user.user_id, **profile_data))
    for user, location in zip(users[6:], ("Nakuru", "Eldoret", "Machakos", "Kakamega")):
        db.session.add(Member(user_id=user.user_id, location=location))
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
    questions.extend(
        AssessmentQuestion(
            question_text=question,
            category=category,
            question_type="text",
            weight=10.00,
            is_required=False,
            is_active=True,
        )
        for question, category in (
            ("How reliable is your access to electricity?", "Living Conditions"),
            ("What is your primary source of household income?", "Income"),
            ("How far is the nearest health facility?", "Health"),
            ("Do you have access to internet-enabled devices?", "Digital Access"),
        )
    )
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
    responses.extend(
        AssessmentResponse(
            user_id=users[index].user_id,
            question_id=questions[index + 6].question_id,
            answer=answer,
            score=score,
        )
        for index, answer, score in (
            (0, "Sometimes", 5.00),
            (1, "Farming", 7.00),
            (2, "5 km", 6.00),
            (3, "No", 2.00),
        )
    )
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
        Organisation(
            owner_user_id=users[4].user_id,
            name="Nakuru Food Collective",
            organisation_type="NGO",
            description="Community support organisation serving Nakuru.",
            email="info@nakurufood.org",
            phone="+254701000005",
            website="https://nakurufood.org",
            location="Nakuru",
            verified=True,
        ),
        Organisation(
            owner_user_id=users[5].user_id,
            name="Eldoret Skills Network",
            organisation_type="Social Enterprise",
            description="Skills training and job placement for youth in Eldoret.",
            email="info@eldoretskills.org",
            phone="+254701000006",
            website="https://eldoretskills.org",
            location="Eldoret",
            verified=True,
        ),
        Organisation(
            owner_user_id=users[6].user_id,
            name="Machakos Water Initiative",
            organisation_type="NGO",
            description="Water access and conservation initiative in Machakos.",
            email="info@machakoswater.org",
            phone="+254701000007",
            website="https://machakoswater.org",
            location="Machakos",
            verified=True,
        ),
        Organisation(
            owner_user_id=users[7].user_id,
            name="Kakamega Health Partners",
            organisation_type="NGO",
            description="Health services and support in Kakamega.",
            email="info@kakamegahealth.org",
            phone="+254701000008",
            website="https://kakamegahealth.org",
            location="Kakamega",
            verified=True,
        ),
        Organisation(
            owner_user_id=users[8].user_id,
            name="Garissa Youth Foundation",
            organisation_type="Community Based Organisation",
            description="Youth empowerment and support in Garissa.",
            email="info@garissayouth.org",
            phone="+254701000009",
            website="https://garissayouth.org",
            location="Garissa",
            verified=True,
        ),
        Organisation(
            owner_user_id=users[9].user_id,
            name="Nyeri Families Trust",
            organisation_type="NGO",
            description="Support for families in Nyeri.",
            email="info@nyerifamilies.org",
            phone="+254701000010",
            website="https://nyerifamilies.org",
            location="Nyeri",
            verified=True,
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
        Job(
            organisation_id=organisations[4].organisation_id,
            title="Food Distribution Coordinator",
            description="Coordinate food distribution for local households.",
            requirements="Relevant community experience",
            minimum_education="Secondary",
            experience="1-2 years",
            application_deadline=date(2026, 10, 15),
            status="open",
        ),
        Job(
            organisation_id=organisations[5].organisation_id,
            title="Digital Skills Trainer",
            description="Lead introductory digital skills workshops.",
            requirements="Experience in digital education",
            minimum_education="Tertiary",
            experience="2-3 years",
            application_deadline=date(2026, 10, 20),
            status="open",
        ),
        Job(
            organisation_id=organisations[6].organisation_id,
            title="Water Outreach Officer",
            description="Support clean water awareness and access projects.",
            requirements="Experience in community outreach",
            minimum_education="Secondary",
            experience="1-2 years",
            application_deadline=date(2026, 10, 25),
            status="open",
        ),
        Job(
            organisation_id=organisations[7].organisation_id,
            title="Community Health Assistant",
            description="Support health education and referral activities.",
            requirements="Relevant health experience",
            minimum_education="Secondary",
            experience="1-2 years",
            application_deadline=date(2026, 10, 30),
            status="open",
        ),
        Job(
            organisation_id=organisations[8].organisation_id,
            title="Youth Mentor",
            description="Mentor young people through employment preparation.",
            requirements="Experience in youth mentorship",
            minimum_education="Tertiary",
            experience="2-3 years",
            application_deadline=date(2026, 11, 5),
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
        JobApplication(
            user_id=users[0].user_id,
            job_id=jobs[5].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[1].user_id,
            job_id=jobs[6].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[2].user_id,
            job_id=jobs[7].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[3].user_id,
            job_id=jobs[8].job_id,
            status="pending",
        ),
        JobApplication(
            user_id=users[4].user_id,
            job_id=jobs[9].job_id,
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
            long_description="This initiative helps smallholder farmers improve food security and household income through practical training, quality inputs, and ongoing field support. Contributions fund farmer training sessions, demonstration plots, and distribution of climate-resilient seeds.",
            image_url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
            type="Agriculture",
            location="Kericho",
            active=True,
            program_kind="financial",
            funding_goal=500000,
        ),
        Program(
            organisation_id=organisations[1].organisation_id,
            title="Kisumu Youth Skills",
            description="Digital and vocational skills training for unemployed youth.",
            long_description="Young people in Kisumu receive hands-on digital and vocational training, mentorship, and pathways into employment. Funding supports instructors, learning materials, and access to practical skills labs.",
            image_url="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
            type="Education",
            location="Kisumu",
            active=True,
            program_kind="financial",
            funding_goal=750000,
        ),
        Program(
            organisation_id=organisations[2].organisation_id,
            title="Coastal Women Empowerment",
            description="Business and craft training for women's savings groups.",
            long_description="Women-led savings groups receive business coaching and practical craft support to build sustainable livelihoods. The acquisition target tracks the business kits prepared for participating groups.",
            image_url="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
            type="Livelihood",
            location="Mombasa",
            active=True,
            program_kind="non_financial",
            progress_target=1000,
            progress_value=640,
            progress_unit="business kits",
        ),
        Program(
            organisation_id=organisations[3].organisation_id,
            title="Nairobi Digital Literacy",
            description="Basic computer and smartphone skills for job seekers.",
            long_description="This program provides accessible computer and smartphone training for job seekers, helping participants build confidence with essential digital tools and connect to new employment opportunities.",
            image_url="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
            type="Education",
            location="Nairobi",
            active=True,
            program_kind="financial",
            funding_goal=1000000,
        ),
        Program(
            organisation_id=organisations[4].organisation_id,
            title="Nakuru Food Security",
            description="Food production and household nutrition support.",
            long_description="This program supports food security initiatives in Nakuru, providing training and resources for local farmers.",
            image_url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
            type="Agriculture",
            location="Nakuru",
            active=True,
            program_kind="financial",
            funding_goal=250000,
        ),
        Program(
            organisation_id=organisations[5].organisation_id,
            title="Eldoret Career Launch",
            description="Career preparation and job placement for young adults.",
            long_description="This program provides career guidance and job placement services for young adults in Eldoret.",
            image_url="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
            type="Employment",
            location="Eldoret",
            active=True,
            program_kind="financial",
            funding_goal=300000,
        ),
        Program(
            organisation_id=organisations[6].organisation_id,
            title="Machakos Water Access",
            description="Community water access and conservation improvement.",
            long_description="This program focuses on improving water access and conservation efforts in Machakos.",
            image_url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
            type="Water",
            location="Machakos",
            active=True,
            program_kind="non_financial",
            funding_goal=150000,
        ),
        Program(
            organisation_id=organisations[7].organisation_id,
            title="Kakamega Health Access",
            description="Health information and referral support for families.",
            long_description="This program provides health education and referral services for families in Kakamega.",
            image_url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
            type="Health",
            location="Kakamega",
            active=True,
            program_kind="financial",
            funding_goal=200000,
        ),
        Program(
            organisation_id=organisations[8].organisation_id,
            title="Garissa Youth Enterprise",
            description="Enterprise training and starter support for youth.",
            long_description="This program provides enterprise training and support for youth in Garissa.",
            image_url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
            type="Livelihood",
            location="Garissa",
            active=True,
            program_kind="non_financial",
            funding_goal=100000,
        ),
        Program(
            organisation_id=organisations[9].organisation_id,
            title="Nyeri Family Support",
            description="Household support and resilience-building services.",
            long_description="This program provides support services for families in Nyeri.",
            image_url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
            type="Community Support",
            location="Nyeri",
            active=True,
            program_kind="financial",
            funding_goal=500000,
        ),
    ]
    db.session.add_all(programs)
    db.session.commit()
    return programs


def seed_donations(users, programs):
    dashboard_donor = users[-1]
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
        Donor(
            user_id=dashboard_donor.user_id,
            name=f"{dashboard_donor.first_name} {dashboard_donor.last_name}",
            email=dashboard_donor.email,
            phone_number=dashboard_donor.phone,
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
            payment_method="mpesa",
            payment_status="completed",
            provider_reference="TXN-NRC-004",
        ),
        FinancialDonation(
            program_id=programs[0].id,
            donor_id=donors[2].id,
            amount=2500.00,
            currency="KES",
            donation_date=date(2026, 5, 15),
            payment_method="mpesa",
            payment_status="completed",
            transaction_code="MPESEED2500",
            provider_reference="TXN-DONOR-CHECK-001",
        ),
        FinancialDonation(
            program_id=programs[1].id,
            donor_id=donors[2].id,
            amount=50.00,
            currency="USD",
            donation_date=date(2026, 6, 1),
            payment_method="paypal",
            payment_status="completed",
            transaction_code="PPSEED0050",
            provider_reference="TXN-DONOR-CHECK-002",
        ),
    ]
    donors.extend(
        Donor(
            user_id=user.user_id,
            name=f"{user.first_name} {user.last_name}",
            email=user.email,
            phone_number=user.phone,
        )
        for user in users[2:10]
    )
    db.session.add_all(donors[2:])
    db.session.flush()
    donations.extend(
        FinancialDonation(
            program_id=programs[(index + 4) % len(programs)].id,
            donor_id=donors[index + 3].id,
            amount=10000.00 + index * 2500,
            currency="KES",
            donation_date=date(2026, 4, 10 + index),
            payment_method="mpesa" if index % 2 == 0 else "paypal",
            payment_status="completed" if index < 7 else "pending",
            provider_reference=f"TXN-EXTRA-{index + 1:03d}",
        )
        for index in range(6)
    )
    db.session.add_all(donations)
    db.session.commit()
    return donors, donations


def seed_non_financial_donations(donors, programs):
    donations = [
        NonFinancialDonation(
            program_id=programs[2].id,
            donor_id=donors[0].id,
            type="Business kits",
            description="20 starter business kits for tailoring and craft groups.",
            donation_date=date(2026, 2, 18),
        ),
        NonFinancialDonation(
            program_id=programs[2].id,
            donor_id=donors[1].id,
            type="Sewing machines",
            description="5 manual sewing machines donated for the coastal women's cooperative.",
            donation_date=date(2026, 3, 22),
        ),
    ]
    donations.extend(
        NonFinancialDonation(
            program_id=programs[(index + 4) % len(programs)].id,
            donor_id=donors[index + 2].id,
            type=donation_type,
            description=description,
            donation_date=date(2026, 4, 15 + index),
        )
        for index, (donation_type, description) in enumerate(
            (
                ("Water filters", "Household water filters for rural families."),
                ("Learning materials", "Books and learning materials for youth classes."),
                ("Medical supplies", "Basic medical supplies for a community health camp."),
                ("Solar lamps", "Solar lamps for households without reliable electricity."),
                ("Food parcels", "Food parcels for families facing seasonal hardship."),
                ("Tools", "Hand tools for community livelihood workshops."),
                ("Seeds", "Climate-resilient seeds for smallholder farmers."),
                ("Clothing", "New clothing items for community support distribution."),
            )
        )
    )
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
    communities.extend(
        Community(
            name=name,
            description=description,
            category=category,
            location=location,
        )
        for name, description, category, location in (
            ("Parent Support", "Practical support and resources for parents.", "Family Support", "Nakuru"),
            ("Smallholder Farmers", "Advice and connections for smallholder farmers.", "Agriculture", "Kericho"),
            ("Women in Business", "Business ideas, mentorship, and peer support.", "Livelihoods", "Mombasa"),
            ("Youth Skills", "Learning opportunities and skills exchange for youth.", "Education", "Kisumu"),
            ("Disability Inclusion", "Resources and peer support for people with disabilities.", "Inclusion", "Nairobi"),
        )
    )
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
    posts.extend(
        CommunityPost(
            community_id=communities[index + 1].community_id,
            user_id=users[index % len(users)].user_id,
            content=content,
        )
        for index, content in enumerate(
            (
                "The parent support group is sharing school uniform resources this week.",
                "Farmers are comparing rainfall and planting updates for the new season.",
                "The women in business group is planning a cooperative market day.",
                "Youth Skills members are sharing free online learning opportunities.",
                "The inclusion group has shared a new accessible transport resource.",
                "Does anyone know of a nearby community health screening event?",
                "A local pantry is looking for volunteers for Saturday distribution.",
            )
        )
    )
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
    memberships.extend(
        CommunityMembership(
            user_id=users[index].user_id,
            community_id=communities[index + 2].community_id,
            role="member",
        )
        for index in range(2)
    )
    db.session.add_all(memberships)
    db.session.commit()
    return memberships


def seed_chats():
    chats = [
        Chat(
            contact_name="Sarah Jenkins",
            role="Field Agent",
            last_message="The delivery at sector 4 is complete. All packages accounted for.",
            status="Active now",
            unread_count=0,
        ),
        Chat(
            contact_name="Mercy Corps",
            role="Partner",
            last_message="We can allocate additional resources for the upcoming initiative.",
            status="Offline",
            unread_count=1,
        ),
        Chat(
            contact_name="David Chen",
            role="Field Agent",
            last_message="Issue with the vehicle routing in zone B.",
            status="Offline",
            unread_count=2,
        ),
    ]
    chats.extend(
        Chat(
            contact_name=name,
            role=role,
            last_message=message,
            status="Offline",
            unread_count=index % 3,
        )
        for index, (name, role, message) in enumerate(
            (
                ("Amina Hassan", "Field Agent", "The household assessment forms are ready for review."),
                ("Daniel Mwangi", "Field Agent", "I have reached the western distribution point."),
                ("Hope Foundation", "Partner", "The partnership documents have been signed."),
                ("Rachel Njeri", "Field Agent", "The training session starts at 9 AM tomorrow."),
                ("Community Aid Kenya", "Partner", "We can support the next food distribution."),
                ("Joseph Otieno", "Field Agent", "The beneficiary list has been updated."),
                ("Care Network", "Partner", "Please share the latest program progress report."),
            )
        )
    )
    db.session.add_all(chats)
    db.session.commit()
    return chats


def seed_deliveries(organisations):
    deliveries = [
        Delivery(
            reference_code="SHP-992A",
            destination="North District Hub",
            status="In Transit",
            last_update="Updated: 10:42 AM",
            marker_class="delivery-map__marker--north",
        ),
        Delivery(
            reference_code="SHP-844B",
            destination="Westside Community Center",
            status="In Transit",
            last_update="Updated: 09:15 AM",
            marker_class="delivery-map__marker--west",
        ),
        Delivery(
            reference_code="SHP-771C",
            destination="South Metro Clinic",
            status="Delivered",
            last_update="Delivered: Yesterday, 4:30 PM",
            marker_class="delivery-map__marker--south",
        ),
        Delivery(
            reference_code="SHP-602D",
            destination="Eastside Food Bank",
            status="Delivered",
            last_update="Delivered: Yesterday, 1:20 PM",
            marker_class="delivery-map__marker--east",
        ),
        Delivery(
            reference_code="SHP-495E",
            destination="Central Shelter",
            status="Delayed",
            last_update="Updated: 08:30 AM",
            marker_class="delivery-map__marker--central",
        ),
    ]
    deliveries.extend(
        Delivery(
            reference_code=f"SHP-{600 + index}F",
            destination=destination,
            status=status,
            last_update=last_update,
            marker_class="delivery-map__marker--new",
        )
        for index, (destination, status, last_update) in enumerate(
            (
                ("Nakuru Food Collective", "In Transit", "Updated: Today, 11:05 AM"),
                ("Eldoret Skills Centre", "Delivered", "Delivered: Today, 9:20 AM"),
                ("Machakos Water Hub", "In Transit", "Updated: Today, 8:45 AM"),
                ("Kakamega Health Centre", "Delayed", "Updated: Yesterday, 5:10 PM"),
                ("Garissa Youth Centre", "Delivered", "Delivered: Yesterday, 3:00 PM"),
            )
        )
    )
    db.session.add_all(deliveries)
    db.session.commit()
    return deliveries


def seed_settings():
    settings = [
        AppSetting(key="orgName", value="Poverty Line Initiative", category="general"),
        AppSetting(key="supportEmail", value="support@povertyline.org", category="general"),
        AppSetting(
            key="publicDescription",
            value="# Dignity Through Efficiency",
            category="general",
        ),
        AppSetting(
            key="communicationPreferences",
            value='{"system-alerts": true, "new-user-signups": false, "donation-receipts": true}',
            category="notifications",
        ),
        AppSetting(
            key="systemPermissions",
            value='{"data-export": "Admin & Managers", "delete-programs": "Super Admin"}',
            category="security",
        ),
    ]
    settings.extend(
        AppSetting(key=key, value=value, category=category)
        for key, value, category in (
            ("timezone", "Africa/Nairobi", "general"),
            ("defaultCurrency", "KES", "general"),
            ("weeklyReports", "true", "notifications"),
            ("partnerAlerts", "true", "notifications"),
            ("sessionTimeoutMinutes", "60", "security"),
        )
    )
    db.session.add_all(settings)
    db.session.commit()
    return settings


def seed_notifications(organisations, programs, donations):
    notifications = [
        Notification(
            type="new_partner",
            title="New partner onboarded",
            message=f"{organisations[3].name} has joined as a partner organisation.",
            related_type="organisation",
            related_id=organisations[3].organisation_id,
        ),
        Notification(
            type="donation",
            title="New donation received",
            message=f"{donations[0].currency} {donations[0].amount} received for {programs[0].title}.",
            related_type="donation",
            related_id=donations[0].donation_id,
            is_read=True,
        ),
        Notification(
            type="program_completed",
            title="Program completed",
            message=f"{programs[3].title} has been marked as completed.",
            related_type="program",
            related_id=programs[3].id,
        ),
    ]
    notifications.extend(
        Notification(
            type=notification_type,
            title=title,
            message=message,
            related_type=related_type,
            related_id=related_id,
            is_read=index % 2 == 0,
        )
        for index, (notification_type, title, message, related_type, related_id) in enumerate(
            (
                ("funding_milestone", "Funding milestone reached", f"{programs[0].title} reached 25% of its funding goal.", "program", programs[0].id),
                ("funding_milestone", "Funding milestone reached", f"{programs[1].title} reached 50% of its funding goal.", "program", programs[1].id),
                ("new_partner", "New partner onboarded", f"{organisations[4].name} has joined as a partner organisation.", "organisation", organisations[4].organisation_id),
                ("donation", "New donation received", f"{donations[1].currency} {donations[1].amount} received for {programs[1].title}.", "donation", donations[1].donation_id),
                ("program_completed", "Program completed", f"{programs[2].title} has been marked as completed.", "program", programs[2].id),
                ("funding_milestone", "Funding milestone reached", f"{programs[3].title} reached 75% of its funding goal.", "program", programs[3].id),
                ("new_partner", "New partner onboarded", f"{organisations[5].name} has joined as a partner organisation.", "organisation", organisations[5].organisation_id),
            )
        )
    )
    db.session.add_all(notifications)
    db.session.commit()
    return notifications


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
        donors, donations = seed_donations(users, programs)
        seed_non_financial_donations(donors, programs)

        communities = seed_communities()
        seed_community_posts(users, communities)
        seed_community_memberships(users, communities)

        seed_chats()
        seed_deliveries(organisations)
        seed_settings()
        seed_notifications(organisations, programs, donations)

        print("Database seeded successfully.")
        print(
            "Donor Dashboard test credentials: "
            f"{os.environ.get('SEED_DONOR_EMAIL', 'donorcheck@example.com')} / "
            f"{os.environ.get('SEED_DONOR_PASSWORD', 'DonorPass123!')}"
        )


if __name__ == "__main__":
    run_seed()
