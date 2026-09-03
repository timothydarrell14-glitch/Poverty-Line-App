from app.extensions import db
from app.services.notifications import notify

FUNDING_MILESTONES = (25, 50, 75, 90, 100)


def check_funding_milestones(program):
    """Notify admins the first time a program crosses each funding milestone."""
    if not program or program.program_kind != "financial" or not program.funding_goal:
        return
    funding_goal = float(program.funding_goal)
    if funding_goal <= 0:
        return
    raised = sum(
        donation.amount
        for donation in program.financial_donations
        if donation.payment_status == "completed"
    )
    percent = (float(raised) / funding_goal) * 100
    already_notified = {
        int(value)
        for value in (program.funding_milestones_notified or "").split(",")
        if value
    }
    newly_reached = [
        milestone
        for milestone in FUNDING_MILESTONES
        if percent >= milestone and milestone not in already_notified
    ]
    if not newly_reached:
        return
    for milestone in newly_reached:
        notify(
            "funding_milestone",
            f"{program.title} reached {milestone}% of its funding goal",
            f"{program.title} has raised {milestone}% of its {funding_goal:,.0f} funding goal.",
            related_type="program",
            related_id=program.id,
        )
    already_notified.update(newly_reached)
    program.funding_milestones_notified = ",".join(str(value) for value in sorted(already_notified))
    db.session.add(program)
