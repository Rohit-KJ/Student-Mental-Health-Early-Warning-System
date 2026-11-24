import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from core.dependencies import bearer_scheme
from core.nlp_service import generate_supportive_message
from core.security import verify_access_token
from db.database import get_database_session
from models.user import User
from schemas.nlp_schema import SupportRequest, SupportResponse

logger = logging.getLogger(__name__)

nlp_router = APIRouter(
    prefix="/api/nlp",
    tags=["NLP Motivational Support"]
)


def get_optional_student(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    database_session: Session = Depends(get_database_session)
) -> Optional[User]:
    """
    Optionally identify the student if an authentication Bearer token is provided.
    Does not reject requests without a token so supportive help is accessible,
    while still integrating with the existing authentication model.
    """
    if credentials is None:
        return None

    try:
        token_payload = verify_access_token(credentials.credentials)
        student_id = int(token_payload.get("sub"))
        return database_session.query(User).filter(User.id == student_id).first()
    except Exception:
        return None


@nlp_router.post(
    "/support",
    response_model=SupportResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate safe, empathetic motivational support text"
)
def request_supportive_message(
    payload: SupportRequest,
    current_student: Optional[User] = Depends(get_optional_student)
):
    """
    Endpoint for students to describe their current mental health situation or daily challenges
    and receive an empathetic, respectful, non-judgmental motivational response.

    Safety Guarantee:
    - Never provides clinical diagnosis, medical prescriptions, or treatment plans.
    - Includes automatic crisis detection with compassionate emergency contact guidance.
    - Treats student input as untrusted content; prompt-injection attempts are ignored.
    - Zero persistence: student description text is never stored in the database or logged.
    """
    try:
        response = generate_supportive_message(payload.text)
        return response
    except Exception as error:
        logger.error("Error processing supportive message request: %s", type(error).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="We encountered an issue preparing your supportive message. Please try again in a moment."
        )
