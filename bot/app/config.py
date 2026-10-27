from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Mapping

from dotenv import load_dotenv

DEFAULT_WEBAPP_URL = "https://malishq.github.io/study-planner-miniapp/"


@dataclass(frozen=True)
class Config:
    bot_token: str
    webapp_url: str


def config_from_env(env: Mapping[str, str]) -> Config:
    token = env.get("BOT_TOKEN", "").strip()
    if not token:
        raise RuntimeError("Не задан BOT_TOKEN: скопируйте .env.example в .env и вставьте токен от @BotFather")
    url = env.get("WEBAPP_URL", "").strip() or DEFAULT_WEBAPP_URL
    if not url.startswith("https://"):
        raise RuntimeError("WEBAPP_URL должен начинаться с https:// — Telegram открывает мини-приложения только по HTTPS")
    return Config(bot_token=token, webapp_url=url)


def load_config() -> Config:
    load_dotenv()
    return config_from_env(os.environ)
