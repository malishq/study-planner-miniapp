import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo

from app.config import load_config
from app.handlers import routers
from app.services.texts import BOT_DESCRIPTION, BOT_SHORT_DESCRIPTION, COMMANDS, MENU_BUTTON_TEXT

logger = logging.getLogger("planner-bot")


async def register_bot_info(bot: Bot, webapp_url: str) -> None:
    try:
        await bot.set_my_commands([BotCommand(command=name, description=text) for name, text in COMMANDS])
        await bot.set_my_description(BOT_DESCRIPTION)
        await bot.set_my_short_description(BOT_SHORT_DESCRIPTION)
        await bot.set_chat_menu_button(menu_button=MenuButtonWebApp(text=MENU_BUTTON_TEXT, web_app=WebAppInfo(url=webapp_url)))
        logger.info("Команды, описание и кнопка меню обновлены")
    except Exception:
        logger.warning("Не удалось обновить команды и описание бота, продолжаю запуск", exc_info=True)


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    config = load_config()
    bot = Bot(token=config.bot_token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher()
    dp["webapp_url"] = config.webapp_url
    for router in routers:
        dp.include_router(router)
    await register_bot_info(bot, config.webapp_url)
    try:
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Бот остановлен")
