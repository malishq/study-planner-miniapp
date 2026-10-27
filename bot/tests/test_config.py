import pytest

from app.config import DEFAULT_WEBAPP_URL, config_from_env


def test_requires_token():
    with pytest.raises(RuntimeError):
        config_from_env({})


def test_defaults_to_demo_url():
    config = config_from_env({"BOT_TOKEN": "123:abc"})
    assert config.webapp_url == DEFAULT_WEBAPP_URL
    assert config.bot_token == "123:abc"


def test_rejects_http_url():
    with pytest.raises(RuntimeError):
        config_from_env({"BOT_TOKEN": "123:abc", "WEBAPP_URL": "http://example.org"})


def test_strips_whitespace():
    config = config_from_env({"BOT_TOKEN": " 123:abc \n", "WEBAPP_URL": " https://example.org/app/ "})
    assert config.bot_token == "123:abc"
    assert config.webapp_url == "https://example.org/app/"
