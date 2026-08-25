import type { Pattern } from "../types.js";

export const bashShellAutomation: Pattern = {
  "slug": "bash-shell-automation",
  "version": "1.0.0",
  "name": "Bash and Shell Automation",
  "tagline": "Write shell automation with safe quoting, strict inputs, deterministic cleanup, and portable failure.",
  "description": "Shell scripts compose processes and text with implicit word splitting, glob expansion, pipelines, environment inheritance, and signal behavior, so a script that works on one filename or happy path can delete the wrong target or report success after a failed command. This pattern constrains quoting, destructive targets, and error propagation; it records temporary-resource and portability decisions and supplies a repeatable shell review procedure. It complements Python tooling by focusing on process orchestration and POSIX-like shells; complex stateful logic should move to a language with structured data and stronger error handling.",
  "category": "Workflow",
  "icon": "square-terminal",
  "color": "bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Bash shell automation pattern for AI agents",
  "metaDescription": "Bash quoting, arrays, strict failure, pipelines, temporary files, traps, destructive-target guards, portability, linting, and shell tests. In production.",
  "problem": "AI agents often expand unquoted variables, parse filenames through whitespace, rely on errexit as complete error handling, or pass an unresolved variable to a destructive command.",
  "audience": "Teams maintaining build, release, development, migration, and operations scripts",
  "prevents": [
    "Splitting a path with spaces into several command arguments",
    "Continuing after a hidden pipeline failure",
    "Deleting a broad directory from an empty variable",
    "Leaking temporary files and child processes after interruption"
  ],
  "appliesTo": {
    "paths": [
      "/scripts",
      "/.github/workflows",
      "/tests/shell"
    ],
    "stacks": [
      "bash",
      "shell",
      "automation",
      "ci-cd",
      "linux"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/scripts",
      "title": "Quote expansions and use arrays for argument lists",
      "summary": "Keep each data value one argument and never construct executable command text through concatenated strings.",
      "body": "The shell performs parameter expansion, word splitting, and glob expansion before a command runs. Unquoted data can therefore become extra flags, paths, or patterns even when the source looked like one string.\n\n- Quote every scalar expansion unless splitting or globbing is the explicitly documented operation.\n- Store command arguments in an array and expand the array as arguments; do not build a command string and execute it through eval.\n- Read filenames with null-delimited tools or a loop that preserves backslashes and whitespace instead of parsing `ls` output.\n- Use `--` before untrusted positional paths where the command supports it so a filename beginning with a dash cannot become an option.\n\nSee /tests/shell for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/scripts",
      "title": "Validate destructive targets as explicit absolute paths",
      "summary": "Resolve and compare the exact target before delete, overwrite, truncate, move, permission, or recursive operations.",
      "body": "An empty variable, unexpected working directory, glob, or failed command substitution can broaden a destructive target from one build directory to a repository, home directory, or filesystem root.\n\n- Require the target variable to be non-empty and resolve it through a trusted parent directory before invoking the destructive command.\n- Reject root, home, workspace root, current directory, and any target outside the task-specific parent allowlist.\n- Avoid unresolved globs and broad recursive operations; enumerate or construct the intended path and log it before mutation.\n- Create temporary directories through the platform tool and remove only the exact path returned, with a trap that cannot expand to a broader fallback.\n\nSee /scripts for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/scripts",
      "title": "Handle failures at process and pipeline boundaries",
      "summary": "Check expected nonzero statuses explicitly, preserve pipeline failures, and make cleanup and final exit status deterministic.",
      "body": "Strict-mode options improve detection but do not replace reasoning about conditionals, substitutions, subshells, pipelines, and commands whose nonzero status is ordinary control flow.\n\n- Enable the script's chosen strict options near the entry point and document any shell compatibility they require.\n- Check commands whose failure has domain meaning and emit a specific diagnostic rather than relying on an implicit immediate exit.\n- Preserve failure from every meaningful pipeline stage or avoid a pipeline where a temporary file makes error ownership clearer.\n- Write traps that capture the intended exit status, stop child work, remove exact temporary resources, and return the original failure rather than masking it with cleanup.\n\nSee /.github/workflows for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/scripts",
      "title": "Shell is for orchestration, not an untyped application",
      "summary": "Keep scripts focused on invoking tools and move complex parsing, concurrency, or mutable business logic to a structured language.",
      "body": "Shell excels at connecting commands whose arguments and outputs are already well defined. Its implicit strings and global process state become expensive when the script models nested data or many error states.\n\n- Use shell for short orchestration over stable command interfaces, files, and environment setup.\n- Move JSON, YAML, dates, binary data, complex conditionals, concurrency, or long-lived state into a language with a parser and tests.\n- Prefer a tool's structured output mode and parse it with an appropriate parser rather than matching human-formatted terminal text.\n- Keep the shell entry point as a small compatibility layer that validates arguments and invokes the structured implementation.\n\nSee /tests/shell for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/.github/workflows",
      "title": "CI shell behavior is pinned, not assumed",
      "summary": "Select the shell, version expectations, working directory, and environment explicitly across local and hosted execution.",
      "body": "A script can run under Bash locally and a different shell or version in CI. Startup files, aliases, working directory, locale, and utility variants also change behavior.\n\n- Use an explicit shebang for executable scripts and configure the CI step shell instead of relying on runner defaults.\n- Resolve paths from the script location or a declared workspace variable, not from whichever directory invoked the script.\n- Set locale and other environment values only when the script depends on their behavior, and avoid mutating common system variables such as HOME for task state.\n- Test on every supported operating system and shell family or declare the platform boundary clearly and fail early elsewhere.\n\nSee /scripts for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "review-shell-script",
      "summary": "Audit a shell script for quoting, parsing, failure, cleanup, destructive scope, portability, and secret exposure.",
      "body": "---\nname: review-shell-script\ndescription: Review shell automation before it reaches CI, release, migration, or production operations.\n---\n\n# Review Shell Script\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Run a shell parser and linter, then inspect every expansion, command substitution, array, loop, pipeline, conditional, and trap in context.\n- [ ] Exercise empty, whitespace, wildcard, leading-dash, newline, Unicode, missing-file, permission, timeout, and interrupted-process inputs.\n- [ ] Resolve every destructive target and prove guards reject broad roots, unresolved variables, unexpected working directories, and symlink escapes.\n- [ ] Force each external command to fail and confirm the script reports the right cause, cleans exact resources, stops children, and preserves nonzero status.\n- [ ] Inspect tracing and diagnostics for tokens, credentials, personal paths, payloads, and environment values that must not appear in CI logs.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "bash",
        "shell",
        "automation",
        "safety",
        "review"
      ]
    }
  ]
};
