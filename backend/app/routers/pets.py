from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..permissions import require_any_role, ROLE_PET_COORDINATOR, ROLE_ADMIN, ROLE_SUPER_ADMIN
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/pets", tags=["pets"])


@router.post("/", response_model=schemas.Pet)
def create_pet(pet_in: schemas.PetCreate, db: Session = Depends(get_db), user=Depends(require_any_role([ROLE_PET_COORDINATOR, ROLE_ADMIN, ROLE_SUPER_ADMIN]))):
    org = db.query(models.Organization).filter(models.Organization.id == pet_in.org_id).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not found")
    if user.org_id != pet_in.org_id:
        raise HTTPException(status_code=400, detail="User org mismatch")
    pet = models.Pet(
        org_id=pet_in.org_id,
        name=pet_in.name,
        species=pet_in.species,
        breed=pet_in.breed,
        sex=pet_in.sex,
        status=pet_in.status,
        description_public=pet_in.description_public,
        description_internal=pet_in.description_internal,
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet


@router.get("/", response_model=List[schemas.Pet])
def list_pets(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Pet).filter(models.Pet.org_id == user.org_id).all()


@router.get("/{pet_id}", response_model=schemas.Pet)
def get_pet(pet_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id, models.Pet.org_id == user.org_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.patch("/{pet_id}", response_model=schemas.Pet)
def update_pet(pet_id: int, pet_in: schemas.PetUpdate, db: Session = Depends(get_db), user=Depends(require_any_role([ROLE_PET_COORDINATOR, ROLE_ADMIN, ROLE_SUPER_ADMIN]))):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id, models.Pet.org_id == user.org_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    for field, value in pet_in.dict(exclude_unset=True).items():
        setattr(pet, field, value)
    db.commit()
    db.refresh(pet)
    return pet


@router.post("/{pet_id}/assign-foster", response_model=schemas.Pet)
def assign_foster(
    pet_id: int,
    assignment: schemas.FosterAssignment,
    db: Session = Depends(get_db),
    user=Depends(require_any_role([ROLE_PET_COORDINATOR, ROLE_ADMIN, ROLE_SUPER_ADMIN]))
):
    """
    Assign a pet to a foster caregiver.

    Validates:
    - Pet exists and belongs to the user's organization
    - Foster user exists and belongs to the same organization
    - Foster user has an active account

    Updates:
    - Sets foster_user_id on the pet
    - Updates pet status to 'in_foster' if currently 'intake' or 'needs_foster'
    """
    # Validate pet exists and belongs to org
    pet = db.query(models.Pet).filter(
        models.Pet.id == pet_id,
        models.Pet.org_id == user.org_id
    ).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    # Validate foster user exists and belongs to same org
    foster_user = db.query(models.User).filter(
        models.User.id == assignment.foster_user_id,
        models.User.org_id == user.org_id
    ).first()
    if not foster_user:
        raise HTTPException(
            status_code=400,
            detail="Foster user not found or does not belong to your organization"
        )

    # Validate foster user is active
    if not foster_user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Cannot assign pet to inactive user"
        )

    # Assign foster user
    pet.foster_user_id = assignment.foster_user_id

    # Update status if appropriate
    if pet.status in ['intake', 'needs_foster']:
        pet.status = 'in_foster'

    db.commit()
    db.refresh(pet)
    return pet


@router.delete("/{pet_id}/assign-foster", response_model=schemas.Pet)
def unassign_foster(
    pet_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_any_role([ROLE_PET_COORDINATOR, ROLE_ADMIN, ROLE_SUPER_ADMIN]))
):
    """
    Remove foster assignment from a pet.

    Updates:
    - Removes foster_user_id from the pet
    - Updates pet status to 'needs_foster' if currently 'in_foster'
    """
    # Validate pet exists and belongs to org
    pet = db.query(models.Pet).filter(
        models.Pet.id == pet_id,
        models.Pet.org_id == user.org_id
    ).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    # Remove foster assignment
    pet.foster_user_id = None

    # Update status if appropriate
    if pet.status == 'in_foster':
        pet.status = 'needs_foster'

    db.commit()
    db.refresh(pet)
    return pet
