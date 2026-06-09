import type { Pattern } from "../types.js";

export const formsRhfZod: Pattern = {
  "slug": "forms-rhf-zod",
  "version": "1.0.0",
  "name": "Forms with React Hook Form + Zod",
  "tagline": "Schema-first, type-safe forms with shared client and server validation.",
  "description": "A pattern for building forms with React Hook Form and a Zod resolver where one schema is the single source of truth for types, client validation, and server validation. It keeps inputs uncontrolled for performance, infers TypeScript types directly from the schema, and reuses the same schema in Server Actions or API routes so client and server never drift. Built for Zod 4 and React Hook Form 7.",
  "category": "Frontend",
  "icon": "clipboard-list",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Forms with React Hook Form + Zod — AI coding pattern",
  "metaDescription": "A Pathrule pattern that teaches AI agents to build type-safe React Hook Form + Zod forms with one shared schema for client and server validation.",
  "problem": "Form types, client validation, and server validation drift apart and re-render the whole form on every keystroke.",
  "audience": "Frontend and full-stack teams building React or Next.js forms with TypeScript",
  "prevents": [
    "Hand-writing TypeScript types that drift from the Zod schema instead of inferring them",
    "Trusting client-side validation only and skipping a server-side re-parse",
    "Controlling every input with local useState and re-rendering the whole form on each keystroke"
  ],
  "appliesTo": {
    "paths": [
      "/src/components/forms",
      "/src/lib/schemas",
      "/app"
    ],
    "stacks": [
      "react",
      "nextjs",
      "typescript"
    ],
    "packages": [
      "react-hook-form",
      "zod",
      "@hookform/resolvers"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/lib/schemas",
      "title": "Zod schema is the single source of truth for form types",
      "summary": "Derive every form type from the schema; never hand-write a parallel interface.",
      "body": "Each form has exactly one Zod schema, and every type is derived from it.\n\n- Infer types with `z.infer<typeof schema>`; never declare a parallel `interface` or `type` for the same shape.\n- When the schema uses `.transform()`, `.default()`, `.pipe()`, or `z.coerce.*`, the input and output types diverge. Keep both available: `z.input<typeof schema>` is what the form fields hold, `z.output<typeof schema>` is what the submit handler receives after validation. Do not collapse them into one type.\n- Export the schema from `/src/lib/schemas` so client forms and server handlers import the same object, not two copies.\n- Put messages in the schema (`z.string().min(1, 'Required')`) so client and server emit identical errors.\n- Cross-field rules belong in the schema via `.refine()` or `.superRefine()` (`.superRefine` is supported again as of Zod 4.x and was un-deprecated in 2025). Note `ctx.path` was removed in Zod 4: pass an explicit `path` array to `ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: '...' })`.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components/forms",
      "title": "Wire useForm with the resolver, three generics, and full defaultValues",
      "summary": "Resolver-backed forms type useForm with input/context/output and a complete defaultValues object.",
      "body": "Every `useForm` call is resolver-backed, correctly typed, and fully initialized. This assumes `@hookform/resolvers` v5 (requires `react-hook-form` >= 7.55).\n\n- Pass `resolver: zodResolver(schema)` from `@hookform/resolvers/zod`. One resolver handles Zod 3, Zod 4, and Zod 4 mini, so no version branching is needed.\n- When the schema has transforms/coercion/defaults, use the three-generic signature so the submit handler sees the parsed output type: `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({ resolver: zodResolver(schema), defaultValues })`. Omitting the third generic is the most common v5 type error: `handleSubmit` data is then typed as the input, not the transformed output.\n- Provide a complete `defaultValues` object covering every field so inputs are controlled from first render and React never warns about a controlled/uncontrolled flip.\n- Default (submit-time) `mode` is correct for most forms; only opt into `mode: 'onChange'` or `'onBlur'` when the UX needs it, since per-keystroke validation costs re-renders.\n- Keep inputs uncontrolled via `register` or `Controller`; do not mirror field values into local `useState`.\n- If you standardize on Standard Schema across libraries, `standardSchemaResolver` is the alternative, but prefer `zodResolver` for Zod-only projects.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Server must re-parse with the same schema before any write",
      "summary": "Client validation is UX only; the server re-parses the shared schema and never trusts the payload.",
      "body": "Client-side validation is a UX affordance, not a security boundary. The server re-validates on every mutation.\n\n- In a Server Action or API route, call `schema.safeParse(input)` using the exact schema the form imports. Never skip this because React Hook Form already validated, and never trust the raw payload.\n- On failure, build field errors with `z.flattenError(result.error)` (Zod 4). The instance method `result.error.flatten()` is deprecated in Zod 4. `z.flattenError` returns `{ formErrors, fieldErrors }`; use `z.treeifyError` for nested schemas.\n- Coerce and sanitize on the server through the schema (`z.coerce.number()`, `.trim()`) rather than re-implementing checks by hand, so server and client stay in lockstep.\n- Return field errors to the client so they can be mapped back inline with `setError`, instead of swallowing them into a generic toast.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/components/forms",
      "title": "Submission, server errors, and reset are driven from formState",
      "summary": "Drive submit UX from formState, map server errors with setError, reset to server-confirmed values.",
      "body": "Submission UX reads from `formState`, never from a parallel loading flag we maintain ourselves.\n\n- Gate the submit button on `formState.isSubmitting`, and surface readiness with `isValid` / `isDirty`, rather than tracking booleans manually.\n- Pair the form with `useActionState` (React 19) so pending state and the action's returned errors thread through without extra client state. The Server Action returns the `z.flattenError` field errors and we map them on the client.\n- Map server-side failures back onto fields with `setError`, and use `setError('root.serverError', { message })` for non-field errors so they render inline, not only as a toast.\n- Throwing inside the async `handleSubmit` callback is acceptable; catch it and convert to a `setError` call.\n- After a successful save, call `reset(serverConfirmedValues)` so the dirty baseline matches what was actually persisted (avoids a form that still looks dirty post-save).\n- Read live values with `watch` only where a render genuinely depends on them; prefer `getValues` for one-off reads inside handlers to avoid re-render churn."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "forms-rhf-zod-review",
      "summary": "Pre-merge checklist for React Hook Form + Zod forms (resolvers v5, Zod 4).",
      "body": "---\nname: forms-rhf-zod-review\ndescription: Review checklist for forms built with React Hook Form and a Zod resolver, targeting @hookform/resolvers v5 and Zod 4. Run before merging any new or changed form to confirm schema-first typing, correct useForm generics, a complete defaultValues object, and server-side re-validation parity.\n---\n\n# React Hook Form + Zod review\n\n- [ ] One Zod schema is the source of truth; types come from `z.infer` (or `z.input` / `z.output` when transforms diverge), not a hand-written interface.\n- [ ] `useForm` uses `resolver: zodResolver(schema)` from `@hookform/resolvers/zod` (v5, with `react-hook-form` >= 7.55).\n- [ ] When the schema has transforms/coercion/defaults, `useForm` uses the three-generic form `useForm<z.input<...>, unknown, z.output<...>>` so the submit handler sees the parsed output type.\n- [ ] `defaultValues` covers every field so no input flips between controlled and uncontrolled.\n- [ ] Validation `mode` matches the intended UX; `onChange`/`onBlur` is a deliberate choice, not copy-paste.\n- [ ] Inputs use `register` / `Controller`; field values are not duplicated into local `useState`.\n- [ ] The server (Server Action or API route) re-parses with the same schema via `safeParse` before any write.\n- [ ] Server field errors are built with `z.flattenError(error)` (not the deprecated `error.flatten()`), returned, and mapped back with `setError`; errors show inline, not only as a toast.\n- [ ] Submit UX reads `formState.isSubmitting` / `isValid`; pending state uses `useActionState` where applicable, not a hand-rolled loading flag.\n- [ ] Successful submit calls `reset(serverConfirmedValues)` to refresh the dirty baseline.\n- [ ] Cross-field rules live in `.refine()` / `.superRefine()` with an explicit `path` (Zod 4 removed `ctx.path`), not in component effects.\n",
      "skillTags": [
        "react-hook-form",
        "zod",
        "forms",
        "validation",
        "typescript",
        "review"
      ]
    }
  ]
};
