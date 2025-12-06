import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app import models

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with the test database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_org(db):
    """Create a test organization."""
    org = models.Organization(
        name="Test Rescue",
        logo_url="https://example.com/logo.png",
        primary_contact_email="contact@testrescue.org"
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@pytest.fixture
def test_user(db, test_org):
    """Create a test user."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = models.User(
        org_id=test_org.id,
        email="test@example.com",
        full_name="Test User",
        phone="555-0100",
        hashed_password=pwd_context.hash("testpassword"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin_user(db, test_org):
    """Create a test admin user."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    user = models.User(
        org_id=test_org.id,
        email="admin@example.com",
        full_name="Admin User",
        phone="555-0101",
        hashed_password=pwd_context.hash("adminpassword"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Add admin role
    role = models.Role(
        user_id=user.id,
        org_id=test_org.id,
        role_name="admin"
    )
    db.add(role)
    db.commit()

    return user


@pytest.fixture
def auth_headers(client, test_admin_user):
    """Get authentication headers for test admin user."""
    response = client.post(
        "/auth/token",
        data={
            "username": "admin@example.com",
            "password": "adminpassword"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_pet(db, test_org):
    """Create a test pet."""
    pet = models.Pet(
        org_id=test_org.id,
        name="Buddy",
        species="Dog",
        breed="Golden Retriever",
        sex="Male",
        status="intake",
        description_public="A friendly dog",
        description_internal="Healthy, no issues"
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet
