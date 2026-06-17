# AGENTS.md

## What this is

Single-file (`index.html`) static web app — "今天吃什么" (What to Eat) spin-the-wheel decision tool. No build step, no dependencies, no package manager.

## Running

Open `index.html` directly in a browser. No dev server needed.

## Architecture

- All HTML/CSS/JS lives in one `index.html` file — this is intentional, not a WIP.
- Wheel animation: Canvas API + `requestAnimationFrame`.
- Persistence: browser `localStorage` only. No backend.
- UI language: Chinese. Write comments and UI strings in Chinese.
- Data model and preset dishes: see `CLAUDE.md` §数据结构 and §预置菜品分类.

## Code conventions

- CSS: **BEM** naming (e.g. `.wheel__button--active`).
- JS: ES6+, functional style. Constants use `UPPER_SNAKE_CASE`.
- Variable/function names must be descriptive — no `a`, `b`, `foo`.
- Comments: explain *why*, not *what*.

## Gotchas

- Modifying `index.html` affects structure, style, and behavior simultaneously — keep changes scoped.
- localStorage data is per-browser; clearing site data loses user dishes.
- The wheel uses weighted random selection — weights are 1–10, adjusted by recency and blacklist status.
