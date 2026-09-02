from marshmallow import fields, validate

from app.extensions import ma
from app.models.donations.financialDonations import FinancialDonation


class DonationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = FinancialDonation
        load_instance = False
        include_fk = True


class DonationCreateSchema(ma.SQLAlchemyAutoSchema):
    program_id = fields.Integer(allow_none=True, load_default=None)
    amount = fields.Decimal(required=True, validate=validate.Range(min=0.01))
    currency = fields.String(load_default="KES", validate=validate.Length(equal=3))
    payment_method = fields.String(required=True, validate=validate.OneOf(["mpesa", "paypal"]))
    donor_name = fields.String(load_default=None, allow_none=True)
    donor_email = fields.Email(load_default=None, allow_none=True)
    donor_phone = fields.String(load_default=None, allow_none=True)

    class Meta:
        model = FinancialDonation
        load_instance = False
        fields = (
            "program_id",
            "amount",
            "currency",
            "payment_method",
            "donor_name",
            "donor_email",
            "donor_phone",
        )


donation_schema = DonationSchema()
donations_schema = DonationSchema(many=True)
donation_create_schema = DonationCreateSchema()
