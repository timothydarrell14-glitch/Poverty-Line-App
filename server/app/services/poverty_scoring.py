INCOME_QUESTION = "What is your average monthly household income?"
EDUCATION_QUESTION = "What is your highest level of completed education?"
EMPLOYMENT_QUESTION = "Do you currently have stable employment?"
DEPENDENTS_QUESTION = "How many dependents rely on your income?"
WATER_QUESTION = "Do you have access to clean water at home?"
HOUSING_QUESTION = "Do you own or rent your current home?"


def score_income(answer):
	try:
		income = float(answer)
	except (TypeError, ValueError):
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