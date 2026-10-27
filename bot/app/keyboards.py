from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from app.services.texts import OPEN_BUTTON_TEXT


def open_planner_keyboard(webapp_url: str) -> InlineKeyboardMarkup:
    button = InlineKeyboardButton(text=OPEN_BUTTON_TEXT, web_app=WebAppInfo(url=webapp_url))
    return InlineKeyboardMarkup(inline_keyboard=[[button]])
