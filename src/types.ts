/**
 * @pathrule/patterns — content model.
 *
 * This module is the contract every consumer shares: the website renders it,
 * a local snapshot bundles it, and the product importer writes it into a user
 * workspace. Keep it pure and serializable: NO React, DOM, or cloud imports,
 * and `icon` is a string name (not a component) so the whole catalog is JSON.
 */

export type PatternContentKind = "memory" | "rule" | "skill";

/** One unit inside a Pattern bundle. `nodePath` is where it lands on import. */
export type PatternPiece = {
  kind: PatternContentKind;
  /** Workspace-relative POSIX path, e.g. "/apps/web". "/" is the workspace root. */
  nodePath: string;
  /** Memory title, rule name, or skill name. */
  title: string;
  /** One-line summary shown in the bundle list (not the body). */
  summary: string;
  /** Full markdown body. Exactly what an importer would write. */
  body: string;
  /** rule-only metadata (mirrors a rule row; ignored for memory and skill). */
  scopeType?: "folder" | "file_type" | "project";
  priority?: "high" | "medium" | "low";
  enforcement?: "advisory" | "strict";
  /** skill-only metadata (single-file skill for now). */
  skillTags?: string[];
};

export type PatternCategory =
  | "Framework"
  | "Backend"
  | "Billing"
  | "Frontend"
  | "Infra"
  | "Workflow";

export type PatternChangelogEntry = {
  version: string;
  date: string;
  note: string;
};

/** Optional machine-matchable detection metadata for future auto-suggestion. */
export type PatternAppliesTo = {
  /** Node paths whose presence hints the pattern fits, e.g. ["/app", "/apps/web"]. */
  paths?: string[];
  /** Stack tags for detection, e.g. ["nextjs", "react"]. */
  stacks?: string[];
  /** Dependency name hints (package.json) if a consumer opts to read config. */
  packages?: string[];
};

export type Pattern = {
  /** URL + token id, kebab-case, e.g. "nextjs-app-router". */
  slug: string;
  /** Display version, e.g. "1.0.0". */
  version: string;
  name: string;
  /** 1 to 2 sentence card subtitle (sentence case, no em dash). */
  tagline: string;
  /** Longer markdown intro for the detail page. */
  description: string;
  category: PatternCategory;
  /** lucide icon NAME (kebab-case), mapped to a component on the web. Not a component. */
  icon: string;
  /** Tailwind accent classes for the icon chip (light tinted background + glyph color). */
  color: string;
  /** Static popularity signal for now (effectiveness scoring comes later). */
  installs?: number;
  /** ISO date of the last content change. Drives the "Updated" signal and sitemap. */
  updatedAt: string;
  /** Human changelog entries, newest first. */
  changelog?: PatternChangelogEntry[];
  metaTitle: string;
  metaDescription: string;
  /** Optional "why this pattern" context for the detail page: the problem it solves. */
  problem?: string;
  /** Which teams it is built for. */
  audience?: string;
  /** Mistakes the assistant avoids once this pattern is in place. */
  prevents?: string[];
  appliesTo?: PatternAppliesTo;
  /** The bundle. Counts and target paths are derived from this. */
  pieces: PatternPiece[];
};

/** The reference token shown on each Pattern page. */
export function patternToken(p: Pick<Pattern, "slug">): string {
  return `::pathrule:package:${p.slug}`;
}
