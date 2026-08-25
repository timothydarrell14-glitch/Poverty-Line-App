from marshmallow import fields, validate
from flask_marshmallow import Marshmallow


ma = Marshmallow()


class RegisterSchema(ma.Schema):

    name = fields.Str(
        required=True,
        validate=validate.And(
            validate.Length(
                min=2,
                max=255,
                error="Name must be between 2 and 255 characters."
            ),
            validate.Regexp(
                r".*\S.*",
                error="Name cannot be empty or whitespace."
            )
        )
    )

    email = fields.Email(
        required=True
    )

    password = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(
            min=8,
            max=128,
            error="Password must be between 8 and 128 characters."
        )
    )


class LoginSchema(ma.Schema):

    email = fields.Email(
        required=True
    )

    password = fields.Str(
        required=True,
        load_only=True
    )


register_schema = RegisterSchema()
login_schema = LoginSchema()