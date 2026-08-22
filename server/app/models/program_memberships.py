from app.extensions import db


class ProgramMembership(db.Model):
	__tablename__ = "program_memberships"

	membership_id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
	program_id = db.Column(db.Integer, db.ForeignKey("programs.program_id"), nullable=False)
	joined_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
	status = db.Column(db.String(50))

	user = db.relationship("User", back_populates="program_memberships")
	program = db.relationship("Program", back_populates="memberships")

	__table_args__ = (db.UniqueConstraint("user_id", "program_id"),)
