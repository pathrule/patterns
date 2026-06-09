import type { Pattern } from "../types.js";

export const typescriptStrict: Pattern = {
  "slug": "typescript-strict",
  "version": "1.0.0",
  "name": "TypeScript Strict",
  "tagline": "Make the compiler do the work: no any, no escape hatches, types that model reality.",
  "description": "A type-safety baseline for any TypeScript codebase. TypeScript only protects you as far as you let it, and the most impactful conventions are about not opting out: strict mode on, no any, no unchecked casts, and types that make illegal states unrepresentable. This pattern turns on the full strict surface, bans the escape hatches, models variant data with discriminated unions, and validates untrusted input at the boundary so the types inside the program are actually true.",
  "category": "Frontend",
  "icon": "component",
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
  "metaTitle": "TypeScript Strict pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for strict TypeScript: full strict mode, no any or unchecked casts, discriminated unions for variant state, and validating untrusted input at the boundary, tuned for AI coding agents.",
  "problem": "AI agents reach for any, as casts, and non-null assertions to make the compiler quiet, which throws away the exact type safety TypeScript exists to provide.",
  "audience": "Teams that want their TypeScript to actually catch bugs at compile time",
  "prevents": [
    "Using any (or implicit any) to silence the compiler instead of typing the value",
    "Forcing types with as casts and ! non-null assertions that lie to the compiler",
    "Modeling variant state as optional fields instead of a discriminated union",
    "Trusting external JSON as a typed object without validating it"
  ],
  "appliesTo": {
    "paths": [
      "/src",
      "/tsconfig.json"
    ],
    "stacks": [
      "typescript"
    ],
    "packages": [
      "typescript",
      "zod"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Turn on full strict mode and keep it on",
      "summary": "Enable strict plus the extra safety flags in tsconfig; do not relax them to make existing code compile.",
      "body": "Strict mode is where almost all of TypeScript's bug-catching lives. A codebase with strict off is using a fraction of the tool.\n\n- Set `\"strict\": true` in tsconfig, and add the flags strict does not cover: `noUncheckedIndexedAccess` (array/object index access may be undefined), `exactOptionalPropertyTypes`, and `noImplicitOverride`.\n- Do not turn strict flags off to make legacy code compile. Fix the code, or isolate the legacy area, but keep the default for new code strict. Loosening the global config quietly disables safety everywhere.\n- Enable `noImplicitAny` (part of strict) so a value with no inferable type is an error, not a silent `any`. An unfixable inference gap should be an explicit, searchable annotation, not an implicit hole.\n- Treat type errors as build failures in CI (`tsc --noEmit` as a gate); a green build should mean the types actually check.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Ban any and the escape hatches",
      "summary": "No any (use unknown + narrowing), no as casts to force types, no non-null ! assertions; these silence the compiler instead of satisfying it.",
      "body": "`any`, `as`, and `!` all tell the compiler to stop checking. Each one is a place a runtime bug can walk straight through a green build.\n\n- Do not use `any`. For a value whose type you do not know, use `unknown` and narrow it with checks before use. `unknown` forces you to prove the type; `any` lets you skip it.\n- Avoid `as` type assertions, especially `as SomeType` and the `as unknown as T` double-cast. An assertion overrides the compiler's judgment with yours, and yours can be wrong. Prefer a type guard or a validated parse.\n- Avoid the non-null assertion `!`. If a value can be null/undefined, handle that case; asserting it away is exactly how `cannot read property of undefined` reaches production.\n- When you genuinely must use an escape hatch (interop, a library type gap), isolate it behind a small, well-named, commented function so the unsafe surface is one reviewable spot, not scattered through the code.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Model variant state with discriminated unions",
      "summary": "Represent mutually exclusive states as a discriminated union with a literal tag, not a bag of optional fields, so impossible states do not typecheck.",
      "body": "When several fields are 'sometimes present together', optional fields let the compiler accept combinations that can never actually happen. A discriminated union makes the illegal states unrepresentable.\n\n- Model mutually exclusive states as a union with a common literal discriminant: `type State = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: Data }`. The presence of `data` or `error` is tied to the status, so you cannot have an error with data.\n- Switch on the discriminant; TypeScript narrows each branch to exactly the fields that exist there. No optional-field guessing, no `data!`.\n- Add an exhaustiveness check (a `never` default case) so adding a new state forces every switch to handle it, turning a missed case into a compile error.\n- Prefer making bad data unrepresentable over validating it at runtime everywhere: if the type cannot express the illegal combination, you do not need a check for it.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src",
      "title": "Validate untrusted input at the boundary",
      "summary": "Parse external data (API responses, JSON, form input, env) with a runtime validator and infer the type from it; a type annotation is not validation.",
      "body": "Types are erased at runtime. Declaring that a fetch returns `User` does not make the data a `User`; it just tells the compiler to assume so. At any boundary with the outside world, that assumption is a lie waiting to break.\n\n- Validate data crossing a trust boundary (HTTP responses, request bodies, `JSON.parse` results, `localStorage`, environment variables, message payloads) with a runtime schema validator (Zod, Valibot, or similar). Parse, then use the parsed result.\n- Infer the static type from the schema (`type User = z.infer<typeof UserSchema>`) so there is one source of truth and the runtime check and the compile-time type can never drift apart.\n- Do not cast an `await res.json()` to a type and move on; that is an `as` in disguise across the most dangerous boundary. Parse it.\n- Inside the program, after the boundary, you can trust the types; the validation at the edge is what earns that trust.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/src",
      "title": "Type conventions: inference, readonly, and narrow types",
      "summary": "Let inference work, prefer readonly and precise types, use type for unions and interface for object shapes, and avoid enums in favor of literal unions.",
      "body": "Beyond the hard rules, a few conventions keep the types honest and readable.\n\n- Let inference do its job: annotate function parameters, return types of exported/public functions, and boundaries; do not annotate every local variable the compiler can infer correctly.\n- Prefer the narrowest type that fits: literal unions (`'sm' | 'md' | 'lg'`) over `string`, `readonly` arrays and properties for data that should not be mutated, and `as const` for fixed literal data.\n- Use `type` aliases for unions, intersections, and function types; `interface` for object shapes that may be extended or implemented. Pick one convention and stay consistent.\n- Avoid TypeScript `enum`; prefer a union of string literals (optionally with `as const` objects), which is simpler, tree-shakeable, and does not emit runtime code.\n- Use utility types (`Pick`, `Omit`, `Partial`, `Record`) to derive related types from a single source rather than redeclaring shapes that can drift.\n\nSee /src for the no-any, discriminated-union, and boundary-validation rules and / for the strict-config rule. For React-specific typing see the react-typescript pattern."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "typescript-strict-review",
      "summary": "Pre-merge type-safety checklist: strict config, no escape hatches, unions, and boundary validation.",
      "body": "---\nname: typescript-strict-review\ndescription: Type-safety review checklist for TypeScript changes. Run before merging code that adds types, handles external data, or models state.\n---\n\n# TypeScript strict review\n\n- [ ] `tsc --noEmit` passes; `strict` is on plus `noUncheckedIndexedAccess` (and `exactOptionalPropertyTypes` where feasible); no strict flag was relaxed to compile.\n- [ ] No `any` (or implicit any): unknown values use `unknown` + narrowing.\n- [ ] No `as` casts forcing a type and no `!` non-null assertions; any unavoidable escape hatch is isolated behind one commented helper.\n- [ ] Mutually exclusive state is a discriminated union with a literal tag; switches narrow on it and have a `never` exhaustiveness default.\n- [ ] External data (API/JSON/form/env/storage) is parsed with a runtime validator; static types are inferred from the schema, not asserted.\n- [ ] No `await res.json()` cast straight to a type without parsing.\n- [ ] Types are as narrow as practical (literal unions over string, `readonly`/`as const` where appropriate); enums avoided in favor of literal unions.\n- [ ] Inference is used for locals; annotations focus on parameters, public return types, and boundaries.\n",
      "skillTags": [
        "typescript",
        "type-safety",
        "strict",
        "discriminated-unions",
        "zod",
        "code-review"
      ]
    }
  ]
};
