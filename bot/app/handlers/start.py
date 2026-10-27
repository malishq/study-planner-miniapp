from aiogram import Router
from aiogram.filters import Command, CommandStart
from aiogram.types import Message

from app.keyboards import open_planner_keyboard
from app.services.texts import about_text, fallback_text, help_text, start_text

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(message: Message, webapp_url: str) -> None:
    first_name = message.from_user.first_name if message.from_user else None
    await message.answer(start_text(first_name), reply_markup=open_planner_keyboard(webapp_url))


@router.message(Command("help"))
async def cmd_help(message: Message, webapp_url: str) -> None:
    await message.answer(help_text(), reply_markup=open_planner_keyboard(webapp_url))


@router.message(Command("about"))
async def cmd_about(message: Message, webapp_url: str) -> None:
    await message.answer(about_text(webapp_url), reply_markup=open_planner_keyboard(webapp_url), disable_web_page_preview=True)


@router.message()
async def fallback(message: Message, webapp_url: str) -> None:
    await message.answer(fallback_text(), reply_markup=open_planner_keyboard(webapp_url))
