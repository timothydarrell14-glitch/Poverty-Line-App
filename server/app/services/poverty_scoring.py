INCOME_QUESTION = "What is your average monthly household income?"
EDUCATION_QUESTION = "What is your highest level of completed education?"
EMPLOYMENT_QUESTION = "Do you currently have stable employment?"
DEPENDENTS_QUESTION = "How many dependents rely on your income?"
WATER_QUESTION = "Do you have access to clean water at home?"
HOUSING_QUESTION = "Do you own or rent your current home?"


def score_income(answer):
    try:
        income = float(answer)
    except TypeError, ValueError:
        return 0.5

    if income < 3000:
        return 1.0
    if income < 6000:
        return 0.6
    if income < 15000:
        return 0.3
    return 0.0


def score_education(answer):
    answer = (answer or "").strip().lower()
    if answer in ("none", "primary"):
        return 1.0
    if answer == "secondary":
        return 0.5
    if answer == "tertiary":
        return 0.0
    return 0.5


def score_employment(answer):
    answer = (answer or "").strip().lower()
    if answer == "no":
        return 1.0
    if answer == "yes":
        return 0.0
    return 0.5


def score_dependents(answer):
    try:
        dependents = int(answer)
    except TypeError, ValueError:
        return 0.5

    if dependents <= 1:
        return 0.0
    if dependents <= 3:
        return 0.3
    if dependents <= 5:
        return 0.6
    return 1.0


def score_water(answer):
    answer = (answer or "").strip().lower()
    if answer == "no":
        return 1.0
    if answer == "yes":
        return 0.0
    return 0.5


def score_housing(answer):
    answer = (answer or "").strip().lower()
    if answer == "rent":
        return 0.6
    if answer == "own":
        return 0.0
    return 0.3


QUESTION_SCORERS = {
    INCOME_QUESTION: score_income,
    EDUCATION_QUESTION: score_education,
    EMPLOYMENT_QUESTION: score_employment,
    DEPENDENTS_QUESTION: score_dependents,
    WATER_QUESTION: score_water,
    HOUSING_QUESTION: score_housing,
}


def classify_score(total_score):
    if total_score >= 60:
        return "Extreme Poverty"
    if total_score >= 30:
        return "Moderate Poverty"
    return "Low Poverty Risk"


def calculate_poverty_score(user, responses, questions_by_id):
    total_score = 0.0

    for response in responses:
        question = questions_by_id.get(response.question_id)
        if question is None:
            continue

        scorer = QUESTION_SCORERS.get(question.question_text)
        if scorer is None:
            severity = 0.5
        else:
            severity = scorer(response.answer)

        total_score += severity * float(question.weight)

    classification = classify_score(total_score)

    user.poverty_score = round(total_score, 2)
    user.poverty_classification = classification

    return user
