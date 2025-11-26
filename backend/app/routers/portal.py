from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/portal", tags=["portal"])


@router.get("/me", response_model=schemas.PortalSummary)
def get_my_portal(db: Session = Depends(get_db), user=Depends(get_current_user)):
    applications = (
        db.query(models.Application)
        .filter(
            models.Application.org_id == user.org_id,
            models.Application.applicant_user_id == user.id,
        )
        .all()
    )
    foster_pets = (
        db.query(models.Pet)
        .filter(
            models.Pet.org_id == user.org_id,
            models.Pet.foster_user_id == user.id,
        )
        .all()
    )
    tasks = (
        db.query(models.Task)
        .filter(
            models.Task.org_id == user.org_id,
            models.Task.assigned_to_user_id == user.id,
        )
        .all()
    )
    return schemas.PortalSummary(
        my_applications=applications,
        my_foster_pets=foster_pets,
        my_tasks=tasks,
    )
