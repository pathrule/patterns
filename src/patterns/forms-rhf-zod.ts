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
      "title": "Zod schema is the single source of truth",
      "summary": "Derive form types from the schema; never hand-write a parallel interface.",
      "body": "Each form has exactly one Zod schema, and every type comes from it.\n\n- Infer types with `z.infer<typeof schema>`; never declare a parallel `interface` or `type` for the same shape.\n- When the schema has `.transform()`, `.default()`, or coercion, type `useForm` values with `z.input<typeof schema>` and the parsed result with `z.output<typeof schema>` because they diverge.\n- Export the schema from `/src/lib/schemas` so client forms and server handlers import the same object.\n- Keep messages in the schema (`z.string().min(1, 'Required')`) so client and server emit identical errors.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/components/forms",
      "title": "Wire useForm with a resolver and full defaultValues",
      "summary": "Every form passes the Zod resolver plus a complete defaultValues object.",
      "body": "Every `useForm` call is resolver-backed and fully initialized.\n\n- Pass `resolver: zodResolver(schema)` from `@hookform/resolvers/zod`; it auto-detects Zod 3 vs 4, so no version branching.\n- Provide a complete `defaultValues` object covering every field so inputs stay controlled-from-the-start and React never warns about controlled/uncontrolled flips.\n- Default `mode` is fine for submit-time validation; only opt into `mode: 'onChange'` or `onBlur` when the UX needs it, since it costs re-renders.\n- Keep inputs uncontrolled via `register` or `Controller`; do not mirror field values into local `useState`.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/app",
      "title": "Re-parse with the same schema in Server Actions",
      "summary": "Server handlers re-validate with the shared schema before any write.",
      "body": "Client validation is a UX affordance, not a security boundary, so the server re-parses.\n\n- In a Server Action or API route, call `schema.safeParse(input)` using the exact schema the form imports; never trust the payload because RHF already validated it.\n- Return `result.error.flatten()` field errors and map them back onto the form with `setError` so server failures surface inline, not just as a toast.\n- Combine with `useActionState` (React 19) to thread pending state and returned errors through the action without extra client state.\n- Coerce and sanitize on the server side via the schema (`z.coerce.number()`, `.trim()`) rather than re-implementing checks by hand."
    },
    {
      "kind": "memory",
      "nodePath": "/src/components/forms",
      "title": "Async submit, errors, and reset patterns",
      "summary": "Drive submission UX from formState and reset with server-confirmed values.",
      "body": "Submission UX reads from `formState`, never from a separate loading flag.\n\n- Gate the submit button on `formState.isSubmitting` and surface validity with `isValid` / `isDirty` instead of tracking booleans manually.\n- Throwing inside the `handleSubmit` async callback is fine; catch it to map a server error with `setError('root.serverError', ...)`.\n- After a successful save, call `reset(serverConfirmedValues)` so the form's dirty baseline matches what was persisted.\n- For dependent or cross-field rules use `.refine()` / `.superRefine()` in the schema, and read live values with `watch` only where a render genuinely depends on them."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "forms-rhf-zod-review",
      "summary": "Pre-merge checklist for React Hook Form + Zod forms.",
      "body": "---\nname: forms-rhf-zod-review\ndescription: Review checklist for forms built with React Hook Form and a Zod resolver. Run before merging any new or changed form to confirm schema-first typing, a complete defaultValues object, and server-side re-validation parity.\n---\n\n# Forms with React Hook Form + Zod review\n\n- [ ] One Zod schema is the source of truth; types come from `z.infer` (or `z.input`/`z.output` when transforms diverge), not a hand-written interface.\n- [ ] `useForm` uses `resolver: zodResolver(schema)` from `@hookform/resolvers/zod`.\n- [ ] `defaultValues` covers every field so no input flips between controlled and uncontrolled.\n- [ ] Validation `mode` matches the intended UX; `onChange` is justified, not the default copy-paste.\n- [ ] Inputs use `register`/`Controller`; field values are not duplicated into local `useState`.\n- [ ] The server (Server Action or API route) re-parses with the same schema via `safeParse` before any write.\n- [ ] Server field errors are mapped back with `setError`; the form shows inline errors, not only a toast.\n- [ ] Submit UX reads `formState.isSubmitting` / `isValid` rather than a separate loading flag.\n- [ ] Successful submit calls `reset(serverConfirmedValues)` to refresh the dirty baseline.\n- [ ] Cross-field rules live in `.refine()`/`.superRefine()`, not in component effects.\n",
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
