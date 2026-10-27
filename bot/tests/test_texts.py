from app.services.texts import BOT_DESCRIPTION, BOT_SHORT_DESCRIPTION, COMMANDS, about_text, help_text, start_text


def test_start_text_greets_by_name():
    assert start_text("Никита").startswith("Привет, Никита!")
    assert start_text(None).startswith("Привет!")
    assert start_text("   ").startswith("Привет!")


def test_help_lists_all_commands():
    text = help_text()
    for name, _ in COMMANDS:
        assert f"/{name}" in text


def test_about_contains_url():
    url = "https://example.org/planner/"
    assert url in about_text(url)


def test_descriptions_fit_telegram_limits():
    assert len(BOT_SHORT_DESCRIPTION) <= 120
    assert len(BOT_DESCRIPTION) <= 512
    assert all(len(desc) <= 256 and name.islower() for name, desc in COMMANDS)
