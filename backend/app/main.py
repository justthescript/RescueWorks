import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base
from .database import engine
from .routers import applications
from .routers import auth
from .routers import events
from .routers import expenses
from .routers import files
from .routers import medical
from .routers import messaging
from .routers import orgs
from .routers import payment_webhooks
from .routers import payments
from .routers import pets
from .routers import portal
from .routers import public
from .routers import settings
from .routers import stats
from .routers import tasks
from .routers import vet

logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RescueWorks Backend")

origins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:19006"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(orgs.router)
app.include_router(pets.router)
app.include_router(applications.router)
app.include_router(medical.router)
app.include_router(events.router)
app.include_router(tasks.router)
app.include_router(expenses.router)
app.include_router(messaging.router)
app.include_router(payments.router)
app.include_router(public.router)
app.include_router(settings.router)
app.include_router(portal.router)
app.include_router(vet.router)
app.include_router(files.router)
app.include_router(stats.router)
app.include_router(payment_webhooks.router)
