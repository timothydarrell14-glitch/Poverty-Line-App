from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Organization(db.Model):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    organization_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    mission: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    service_area: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    email: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        unique=True
    )

    phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    logo: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    verification_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDING"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<Organization {self.name}>"