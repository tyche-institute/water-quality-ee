from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_translations_facade_stays_small() -> None:
    content = (ROOT / "frontend" / "app" / "lib" / "dashboard-translations.ts").read_text(encoding="utf-8")
    lines = content.splitlines()
    assert len(lines) <= 16
    assert './dashboard-translations-ru' in content
    assert './dashboard-translations-et' in content
    assert './dashboard-translations-en' in content
    assert './dashboard-translation-types' in content


def test_dashboard_translation_split_modules_exist() -> None:
    expected = [
        "dashboard-translation-types.ts",
        "dashboard-translations-ru.ts",
        "dashboard-translations-et.ts",
        "dashboard-translations-en.ts",
    ]
    for file_name in expected:
        assert (ROOT / "frontend" / "app" / "lib" / file_name).is_file(), file_name
