from app.extensions import db


class Delivery(db.Model):
    __tablename__ = "deliveries"

    delivery_id = db.Column(db.Integer, primary_key=True)
    reference_code = db.Column(db.String(50), nullable=False, unique=True)
    destination = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="In Transit")
    last_update = db.Column(db.String(255), nullable=False, default="Updated: Just now")
    marker_class = db.Column(db.String(255), nullable=False, default="delivery-map__marker--new")
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now())
