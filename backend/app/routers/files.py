import os
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user

UPLOAD_ROOT = os.environ.get("RESCUEWORKS_UPLOAD_ROOT", "./uploads")

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=schemas.Document)
async def upload_document(
    org_id: int = Form(...),
    pet_id: Optional[int] = Form(None),
    medical_record_id: Optional[int] = Form(None),
    event_id: Optional[int] = Form(None),
    task_id: Optional[int] = Form(None),
    visibility: str = Form("internal"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if org_id != user.org_id:
        raise HTTPException(status_code=403, detail="Cannot upload outside your organization")

    os.makedirs(UPLOAD_ROOT, exist_ok=True)
    org_dir = os.path.join(UPLOAD_ROOT, f"org_{org_id}")
    os.makedirs(org_dir, exist_ok=True)

    filename = file.filename or "upload.bin"
    safe_name = filename.replace("/", "_")
    dest_path = os.path.join(org_dir, safe_name)

    content = await file.read()
    with open(dest_path, "wb") as out:
        out.write(content)

    rel_path = os.path.relpath(dest_path, UPLOAD_ROOT)

    try:
        visibility_enum = models.DocumentVisibility(visibility)
    except ValueError:
        visibility_enum = models.DocumentVisibility.internal

    doc = models.Document(
        org_id=org_id,
        uploader_user_id=user.id,
        pet_id=pet_id,
        medical_record_id=medical_record_id,
        event_id=event_id,
        task_id=task_id,
        file_path=rel_path,
        file_type=file.content_type,
        visibility=visibility_enum,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
