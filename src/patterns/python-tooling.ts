import type { Pattern } from "../types.js";

export const pythonTooling: Pattern = {
  "slug": "python-tooling",
  "version": "1.0.0",
  "name": "Modern Python Tooling (uv + Ruff)",
  "tagline": "Set up Python projects the 2026 way: one fast tool for envs and deps, one for lint and format.",
  "description": "The current standard for setting up and maintaining a Python project. uv replaces the tangle of pip, venv, pip-tools, and pyenv with one fast tool that manages the interpreter, the virtual environment, dependencies, and a committed lockfile. Ruff replaces Black, isort, and Flake8 with one fast linter and formatter. A type checker and pytest round it out, all configured in a single pyproject.toml. This is the project-hygiene layer that sits underneath any Python app, including a FastAPI service.",
  "category": "Workflow",
  "icon": "boxes",
  "color": "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Modern Python Tooling (uv + Ruff) pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for modern Python tooling: uv for interpreter, venv, dependencies, and lockfile; Ruff for lint and format; a type checker and pytest; all configured in pyproject.toml, tuned for AI coding agents.",
  "problem": "AI agents set up Python projects with raw pip and venv, no lockfile, scattered config, and Black/isort/Flake8, instead of the faster, single-source-of-truth uv + Ruff workflow.",
  "audience": "Python teams standardizing project setup, dependencies, and code quality",
  "prevents": [
    "Hand-managing venv + pip with no committed lockfile, so installs are not reproducible",
    "Spreading config across setup.py, setup.cfg, requirements.txt, .flake8, and tox.ini",
    "Running Black, isort, and Flake8 separately instead of one Ruff pass",
    "pip install in CI with no frozen, hash-checked dependency resolution"
  ],
  "appliesTo": {
    "paths": [
      "/",
      "/pyproject.toml"
    ],
    "stacks": [
      "python",
      "uv",
      "ruff"
    ],
    "packages": [
      "uv",
      "ruff",
      "pytest"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Manage the project with uv and commit the lockfile",
      "summary": "Use uv for the interpreter, venv, and dependencies; declare deps in pyproject.toml, commit uv.lock, and install with uv sync; no manual pip/venv.",
      "body": "uv is the base of the project: it creates the project, pins the Python version, manages the virtual environment, resolves and locks dependencies, and runs commands. Reaching around it with raw pip breaks reproducibility.\n\n- Declare dependencies in `pyproject.toml` and manage them with `uv add` / `uv remove`. Do not hand-edit a `requirements.txt` or run `pip install` into the environment as the source of truth.\n- Commit `uv.lock`. It is the exact, resolved, hashed dependency set. Install from it with `uv sync` so every machine and CI run gets the identical environment.\n- Run project commands through uv (`uv run pytest`, `uv run python ...`) so they use the project's locked environment without manual `activate`. uv manages the venv for you.\n- Pin the Python version for the project (`uv python pin`) so the interpreter is part of the reproducible setup, not whatever happens to be on the machine.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Lint, format, and type-check as a gate",
      "summary": "Use Ruff for both linting and formatting and a type checker (mypy/ty) in CI; fail the build on violations rather than relying on manual cleanup.",
      "body": "Quality tools only hold a line if the build enforces them. Run them in CI and fail on violation, so style and type drift cannot accumulate.\n\n- Use Ruff for both linting and formatting; it replaces Black, isort, and Flake8 with one fast tool. Run `ruff format` and `ruff check` (with `--fix` locally) and gate CI on a clean `ruff check` and `ruff format --check`.\n- Run a type checker (mypy, or Astral's ty) in CI on the codebase, and treat new type errors as build failures. Types catch a whole class of bugs before runtime.\n- Wire these into a pre-commit hook so violations are caught before they are pushed, and into CI so the gate is enforced regardless of local setup.\n- Configure Ruff's selected rule set deliberately in `pyproject.toml` rather than enabling everything blindly; turn rules on as the team adopts them.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "pyproject.toml is the single source of truth",
      "summary": "Configure the project and all tools in one pyproject.toml; uv, Ruff, and the type checker read from it, replacing the old scatter of config files.",
      "body": "Modern Python configuration lives in one file. `pyproject.toml` holds the project metadata, dependencies, and the configuration for uv, Ruff, pytest, and the type checker, so there is one place to look and edit.\n\n- Keep project metadata and dependencies under `[project]`, and tool config under `[tool.uv]`, `[tool.ruff]`, `[tool.pytest.ini_options]`, etc. Delete the legacy scatter: `setup.py`, `setup.cfg`, `requirements.txt`, `.flake8`, `tox.ini`.\n- uv, Ruff, and ty come from the same vendor (Astral) and are designed to read `pyproject.toml` and work together, which is why the stack composes cleanly.\n- Separate dependency groups for dev vs runtime (`uv add --dev ruff pytest`) so production installs do not pull test/lint tooling.\n- This pattern is the project-setup layer; an app framework like FastAPI sits on top of it. See the fastapi pattern for the application conventions.\n\nSee / for the uv-and-lockfile rule and the lint/format/type-check rule."
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Testing and reproducible CI with uv",
      "summary": "Run pytest through uv, install from the lockfile in CI with uv sync --frozen, and cache uv for fast, deterministic pipelines.",
      "body": "CI should run the exact environment the lockfile describes, fast, with no surprise resolution.\n\n- Run tests with `uv run pytest`. Keep tests under `tests/`, name them so pytest discovers them, and use fixtures for shared setup. uv ensures pytest runs in the locked environment.\n- In CI, install with `uv sync --frozen` (or `--locked`) so the pipeline fails if `uv.lock` is out of date rather than silently resolving new versions. This is the reproducibility guarantee.\n- Cache uv's download/cache directory in CI to make installs fast; uv is already much faster than pip, and caching compounds it.\n- Use the official `astral-sh/setup-uv` action (pinned) to install uv in GitHub Actions, then run lint, type-check, and test as gated steps.\n\nSee / for the uv-and-lockfile and lint/format/type-check rules; see the github-actions-cicd and supply-chain-security patterns for CI hardening."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "python-project-bootstrap",
      "summary": "Checklist to set up or modernize a Python project with uv, Ruff, a type checker, and pytest.",
      "body": "---\nname: python-project-bootstrap\ndescription: Checklist for setting up or modernizing a Python project with uv, Ruff, a type checker, and pytest. Run when starting a project or migrating off pip/venv/Black/Flake8.\n---\n\n# Python project bootstrap (uv + Ruff)\n\n## Setup\n- [ ] `uv init` the project; dependencies declared in `pyproject.toml`, managed with `uv add` / `uv remove`.\n- [ ] Python version pinned with `uv python pin`.\n- [ ] `uv.lock` committed; environments installed with `uv sync` (never raw `pip install` as source of truth).\n- [ ] Dev tooling in a dev group (`uv add --dev ruff pytest ...`) separate from runtime deps.\n\n## Quality gates\n- [ ] Ruff configured in `pyproject.toml` for both lint and format; `ruff check` + `ruff format --check` gate CI.\n- [ ] Type checker (mypy/ty) runs in CI; new type errors fail the build.\n- [ ] pre-commit hook runs Ruff (and ideally the type checker) before push.\n\n## Config & CI\n- [ ] `pyproject.toml` is the single source of truth; legacy `setup.py`/`setup.cfg`/`requirements.txt`/`.flake8`/`tox.ini` removed.\n- [ ] Tests run via `uv run pytest`; CI installs with `uv sync --frozen` and caches uv.\n- [ ] `setup-uv` action pinned in CI; lint, type-check, and test are separate gated steps.\n",
      "skillTags": [
        "python",
        "uv",
        "ruff",
        "tooling",
        "pytest",
        "project-setup"
      ]
    }
  ]
};
