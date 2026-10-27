from app.handlers.errors import router as errors_router
from app.handlers.start import router as start_router

routers = [start_router, errors_router]
