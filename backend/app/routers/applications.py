from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from .. import models
from .. import schemas
from ..deps import get_current_user
from ..deps import get_db
from ..permissions import ROLE_ADMIN
from ..permissions import ROLE_APPLICATION_SCREENER
from ..permissions import ROLE_SUPER_ADMIN
from ..permissions import require_any_role

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=schemas.Application)
def create_application(
    app_in: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    org = (
        db.query(models.Organization)
        .filter(models.Organization.id == app_in.org_id)
        .first()
    )
    if not org:
        raise HTTPException(status_code=400, detail="Organization not found")
    if user.org_id != app_in.org_id:
        raise HTTPException(status_code=400, detail="User org mismatch")
    application = models.Application(
        org_id=app_in.org_id,
        applicant_user_id=user.id,
        pet_id=app_in.pet_id,
        type=app_in.type,
        answers_json=app_in.answers_json,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/", response_model=List[schemas.Application])
def list_applications(
    db: Session = Depends(get_db),
    user=Depends(
        require_any_role([ROLE_APPLICATION_SCREENER, ROLE_ADMIN, ROLE_SUPER_ADMIN])
    ),
):
    return (
        db.query(models.Application)
        .filter(models.Application.org_id == user.org_id)
        .all()
    )


@router.get("/{app_id}", response_model=schemas.Application)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    user=Depends(
        require_any_role([ROLE_APPLICATION_SCREENER, ROLE_ADMIN, ROLE_SUPER_ADMIN])
    ),
):
    app = (
        db.query(models.Application)
        .filter(
            models.Application.id == app_id, models.Application.org_id == user.org_id
        )
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.patch("/{app_id}", response_model=schemas.Application)
def update_application(
    app_id: int,
    app_in: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    user=Depends(
        require_any_role([ROLE_APPLICATION_SCREENER, ROLE_ADMIN, ROLE_SUPER_ADMIN])
    ),
):
    app = (
        db.query(models.Application)
        .filter(
            models.Application.id == app_id, models.Application.org_id == user.org_id
        )
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    for field, value in app_in.dict(exclude_unset=True).items():
        setattr(app, field, value)
    db.commit()
    db.refresh(app)
    return app
