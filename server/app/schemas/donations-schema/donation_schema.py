from marshmallow import fields, validate

from app.extensions import ma
from app.models.donations.donations import Donation


class DonationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Donation
        load_instance = False
        include_fk = True


class DonationCreateSchema(ma.SQLAlchemyAutoSchema):
    program_id = fields.Integer(required=True)
    amount = fields.Decimal(required=True, validate=validate.Range(min=0.01))

    class Meta:
        model = Donation
        load_instance = False
        fields = (
            "program_id",
            "donor_name",
            "donor_type",
            "amount",
            "currency",
            "donation_date",
            "payment_method",
            "anonymous",
            "transaction_reference",
        )


donation_schema = DonationSchema()
donations_schema = DonationSchema(many=True)
donation_create_schema = DonationCreateSchema()
