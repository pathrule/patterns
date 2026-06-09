import type { Pattern } from "../types.js";

export const expoReactNative: Pattern = {
  "slug": "expo-react-native",
  "version": "1.0.0",
  "name": "Expo (React Native)",
  "tagline": "Ship Expo apps with file-based routing, EAS Build, and safe OTA updates.",
  "description": "A guardrail bundle for modern Expo (SDK 56+) React Native projects on the New Architecture. It keeps Expo Router navigation typed and predictable, treats the app config as the single source of native truth via Continuous Native Generation, and prevents the classic OTA crash where a JavaScript update references native code that isn't in the installed binary. Built for teams shipping with EAS Build and EAS Update.",
  "category": "Framework",
  "icon": "smartphone",
  "color": "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "Expo (React Native) AI Coding Pattern for Cursor & Claude",
  "metaDescription": "Pathrule pattern that teaches AI agents Expo SDK 56 conventions: typed Expo Router, EAS Build via CNG, and runtimeVersion-safe OTA updates so generated code ships without crashing.",
  "problem": "AI agents edit native files directly and push OTA updates that reference native modules missing from the installed binary, crashing production apps.",
  "audience": "Teams building cross-platform Expo apps with EAS Build and EAS Update.",
  "prevents": [
    "Hand-editing ios/ and android/ folders that prebuild regenerates and wipes",
    "Pushing an EAS Update with native changes without bumping runtimeVersion, crashing live users",
    "Importing from react-navigation directly and bypassing Expo Router typed routes"
  ],
  "appliesTo": {
    "paths": [
      "/app",
      "/src",
      "/modules",
      "/"
    ],
    "stacks": [
      "expo",
      "react-native",
      "expo-router",
      "eas",
      "typescript"
    ],
    "packages": [
      "expo",
      "expo-router",
      "expo-updates",
      "expo-dev-client",
      "react-native"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/",
      "title": "Treat ios/ and android/ as generated output",
      "summary": "Never hand-edit native folders in a CNG project; change app config and config plugins instead.",
      "body": "This is a Continuous Native Generation (CNG) project, so the `ios/` and `android/` directories are regenerated from `app.json`/`app.config.ts` and `package.json` by `npx expo prebuild`. Editing them by hand creates changes that are silently wiped on the next prebuild.\n\n- Express native config (permissions, plist/manifest entries, schemes, icons, splash) through the `expo` app config and config plugins, not by patching native files.\n- For library-specific native side effects, add or use an Expo config plugin instead of editing `AppDelegate` or `MainApplication` directly.\n- Keep `ios/` and `android/` out of version control when prebuild is the source of truth; if they are committed, treat them as build artifacts and never the place to make a change.\n- Verify a change survives by running `npx expo prebuild --clean` before relying on it.",
      "scopeType": "project",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/app",
      "title": "Use Expo Router typed navigation, not React Navigation imports",
      "summary": "Route through the file system and the typed Link/router API; avoid raw react-navigation calls.",
      "body": "Files under `app/` are the routing layer. Each file is a route and navigation must go through Expo Router's typed API so broken links fail at compile time, not at runtime.\n\n- Navigate with `<Link href=\"...\">` and `useRouter()` from `expo-router`; do not import navigators or `useNavigation` from `@react-navigation/*` directly.\n- Keep typed routes enabled (`experiments.typedRoutes` / the SDK 56 default) and let the generated `.expo/types` drive `href` autocompletion.\n- Prefer `useLocalSearchParams()` over `useGlobalSearchParams()`. The global hook re-renders on every navigation event and causes cascading updates across the tree.\n- Organize routes with route groups like `(tabs)` and `(auth)` to structure the tree without changing the URL, and use `_layout.tsx` for shared shells.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "runtimeVersion gates OTA vs binary builds",
      "summary": "OTA ships only JS; native changes require a new binary and a bumped runtimeVersion.",
      "body": "EAS Update delivers only the JavaScript bundle and assets, never native code. An update is only served to a binary whose `runtimeVersion` matches the one the update was published against, so the contract is: native change means new binary, JS-only change means OTA.\n\n- Bump `runtimeVersion` whenever you add or change native code (new native dependency, prebuild config change, SDK upgrade) so old binaries do not receive a JS bundle that references modules they lack.\n- Never bump `runtimeVersion` for a JS-only fix; that would orphan existing installs from the update.\n- Prefer the `fingerprint` runtime version policy so the value is computed deterministically from native inputs instead of bumped by hand.\n- Pushing native-dependent JS over OTA to a mismatched binary is the classic production crash this stack guards against. See `/app` for navigation rules and `/modules` for native module conventions.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "memory",
      "nodePath": "/",
      "title": "Roll out EAS Updates gradually and test on a branch first",
      "summary": "Publish to a preview branch, then roll out by percentage and watch error rates before going to all users.",
      "body": "A bad OTA can break every install at once, so updates ship through a staged pipeline rather than straight to production.\n\n- Publish to a non-production channel first with `eas update --branch preview` and smoke-test on a dev/preview build before promoting.\n- Use percentage rollouts: release to a small slice of users, watch the update's error rate on the EAS dashboard, and cancel or roll back if it spikes.\n- Map channels to environments (for example `production`, `preview`, `staging`) and point each build profile at the right channel in `eas.json`.\n- SDK 55+ bundle diffing only ships the delta between bundles, so frequent small updates are cheap; lean on small, reversible updates over large risky ones.",
      "scopeType": "folder",
      "priority": "medium",
      "enforcement": "advisory"
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "expo-react-native-review",
      "summary": "Pre-merge checklist for Expo SDK 56 apps covering CNG, typed routing, EAS Build, and OTA safety.",
      "body": "---\nname: expo-react-native-review\ndescription: Review checklist for Expo (React Native) changes on SDK 56 and the New Architecture. Run before merging any change that touches app config, native modules, Expo Router routes, or EAS Build/Update configuration.\n---\n\n# Expo (React Native) review\n\n- [ ] No hand edits to `ios/` or `android/`; native changes go through `app.config` and config plugins (CNG).\n- [ ] `npx expo prebuild --clean` still produces the intended native project.\n- [ ] All navigation uses `expo-router` (`Link`, `useRouter`); no direct `@react-navigation/*` navigation calls.\n- [ ] Typed routes are enabled and generated route types are committed/ignored consistently; `href` values resolve.\n- [ ] `useLocalSearchParams` is used instead of `useGlobalSearchParams` unless a global subscription is truly needed.\n- [ ] Route groups and `_layout.tsx` keep the `app/` tree organized without leaking group names into URLs.\n- [ ] New native dependencies or prebuild changes bumped `runtimeVersion` (or use the `fingerprint` policy).\n- [ ] JS-only fixes did NOT change `runtimeVersion`, so existing installs still receive the update.\n- [ ] The update was published to a preview branch and smoke-tested before any production promotion.\n- [ ] Production rollout is staged by percentage with an error-rate watch and a rollback path.\n- [ ] Project targets a current SDK (56+) on the New Architecture; no New Architecture opt-out is assumed.\n- [ ] `eas.json` build profiles map to the correct update channels per environment.\n",
      "skillTags": [
        "expo",
        "react-native",
        "expo-router",
        "eas-update",
        "cng",
        "code-review"
      ]
    }
  ]
};
