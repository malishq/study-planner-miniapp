import logging

from aiogram import Router
from aiogram.types import ErrorEvent

router = Router(name="errors")
logger = logging.getLogger(__name__)


@router.errors()
async def on_error(event: ErrorEvent) -> None:
    logger.exception("Ошибка при обработке обновления %s", event.update.update_id, exc_info=event.exception)
