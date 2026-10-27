import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip("/") + "/"
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

TABS = {
    "subjects": "Предметы",
    "calendar": "Календарь",
    "overdue": "Несданное",
    "settings": "Настройки",
}


def settle(page):
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(350)


def open_with_demo(context, width, height):
    page = context.new_page()
    page.set_viewport_size({"width": width, "height": height})
    page.goto(BASE, wait_until="load")
    button = page.get_by_role("button", name="Загрузить демо-данные")
    button.wait_for(timeout=15000)
    button.click()
    settle(page)
    return page


def go(page, label):
    page.get_by_role("navigation").get_by_role("button", name=label).click()
    settle(page)


def shoot(page, name):
    path = OUT / f"{name}.png"
    page.screenshot(path=str(path), full_page=False)
    print(path)


def phone_set(browser, width, height, suffix, full=True, scheme="light"):
    context = browser.new_context(device_scale_factor=2, reduced_motion="reduce", color_scheme=scheme, locale="ru-RU")
    page = open_with_demo(context, width, height)
    shoot(page, f"01-week-{suffix}")
    if full:
        go(page, TABS["subjects"])
        shoot(page, f"02-subjects-{suffix}")
        page.get_by_role("button", name="Операционные системы").first.click()
        settle(page)
        shoot(page, f"03-subject-{suffix}")
        go(page, TABS["calendar"])
        shoot(page, f"04-calendar-{suffix}")
        go(page, TABS["overdue"])
        shoot(page, f"05-overdue-{suffix}")
        go(page, TABS["settings"])
        shoot(page, f"06-settings-{suffix}")
        go(page, "Неделя")
        page.locator("li[data-row]", has_text="Практика 3. Нормализация схемы").locator("button").nth(1).click()
        page.get_by_role("dialog").wait_for()
        page.wait_for_timeout(600)
        shoot(page, f"07-task-{suffix}")
    else:
        go(page, TABS["subjects"])
        shoot(page, f"02-subjects-{suffix}")
        go(page, TABS["calendar"])
        shoot(page, f"04-calendar-{suffix}")
    context.close()


def desktop_set(browser):
    context = browser.new_context(device_scale_factor=2, reduced_motion="reduce", color_scheme="light", locale="ru-RU")
    page = open_with_demo(context, 1280, 800)
    shoot(page, "08-desktop-1280")
    go(page, TABS["subjects"])
    shoot(page, "09-desktop-subjects-1280")
    context.close()


def dark_set(browser):
    context = browser.new_context(device_scale_factor=2, reduced_motion="reduce", color_scheme="dark", locale="ru-RU")
    page = open_with_demo(context, 390, 844)
    shoot(page, "10-week-dark-390")
    go(page, TABS["overdue"])
    shoot(page, "11-overdue-dark-390")
    context.close()


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    phone_set(browser, 390, 844, "390")
    phone_set(browser, 430, 932, "430", full=False)
    desktop_set(browser)
    dark_set(browser)
    browser.close()
