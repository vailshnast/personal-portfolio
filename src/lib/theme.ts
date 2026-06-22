// Runtime dark/light toggle. The initial (no-flash) mode is set by the inline
// script in BaseLayout's <head>; this module only handles user-driven toggling
// after hydration. The `data-theme` family axis is build-time and never touched here.

export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "pf-mode";

function currentMode(): ThemeMode {
  return document.documentElement.getAttribute("data-mode") === "light"
    ? "light"
    : "dark";
}

function syncToggles(mode: ThemeMode): void {
  const isLight = mode === "light";
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((btn) => {
      btn.setAttribute("aria-pressed", String(isLight));
      btn.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode",
      );
    });
}

function applyMode(mode: ThemeMode): void {
  document.documentElement.setAttribute("data-mode", mode);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // localStorage can throw in private mode / when blocked; the toggle still works for the session.
  }
  syncToggles(mode);
}

export function initThemeToggle(): void {
  syncToggles(currentMode());
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        applyMode(currentMode() === "dark" ? "light" : "dark");
      });
    });
}
