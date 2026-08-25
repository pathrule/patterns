import type { Pattern } from "../types.js";

export const pandasDataframes: Pattern = {
  "slug": "pandas-dataframes",
  "version": "1.0.0",
  "name": "Pandas and DataFrame Pipelines",
  "tagline": "Make DataFrame schemas, missing values, joins, mutation, memory, and reproducibility explicit.",
  "description": "Pandas pipelines often look correct on a notebook sample while silently changing dtypes, duplicating rows in a join, mutating a view, exhausting memory, or producing output that depends on input order and environment state. This pattern constrains schema checks and join cardinality, records missing-value and copy semantics, separates exploratory frames from production transformations, and supplies a repeatable pipeline validation procedure. It differs from Spark by focusing on single-process DataFrame semantics, index alignment, dtype behavior, and memory ownership rather than distributed partitioning and shuffle execution.",
  "category": "Backend",
  "icon": "table-cells-merge",
  "color": "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Pandas DataFrame pattern for AI coding agents",
  "metaDescription": "Pandas dtype contracts, missing-value handling, validated joins, copy semantics, vectorization, memory control, and reproducible data pipelines. In production.",
  "problem": "AI agents often rely on inferred dtypes, chain assignment through a view, merge without validating cardinality, or use row-wise apply where a vectorized operation is safer and faster.",
  "audience": "Python teams moving DataFrame transformations from analysis notebooks into repeatable production jobs",
  "prevents": [
    "Silently converting identifiers or timestamps to the wrong dtype",
    "Multiplying rows through an unexpected many-to-many merge",
    "Writing through an ambiguous slice or chained assignment",
    "Loading an entire dataset when the job can operate in chunks"
  ],
  "appliesTo": {
    "paths": [
      "/src/pipelines",
      "/src/schemas",
      "/tests/data"
    ],
    "stacks": [
      "pandas",
      "python",
      "dataframe",
      "data-pipeline",
      "analytics"
    ],
    "packages": [
      "pandas"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/schemas",
      "title": "Assert DataFrame schema at every external boundary",
      "summary": "Validate required columns, dtypes, nullability, uniqueness, and timezone expectations before transformations rely on them.",
      "body": "Pandas inference changes with source values and missing data. A column that appears numeric in one file can become object data in another, and a timestamp can lose timezone meaning without raising an error.\n\n- Define the expected column set and fail on missing required columns and unexpected sensitive columns before transformation begins.\n- Parse identifiers as strings when leading zeros or mixed formats are valid, and parse numeric measures with explicit coercion and rejection reporting.\n- Normalize timestamps to an explicit timezone policy and distinguish date-only values from instants; do not compare naive and aware data implicitly.\n- Assert uniqueness and nullability for keys used in joins, deduplication, and output identity so later row-count changes have an attributable cause.\n\nSee /src/pipelines for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/pipelines",
      "title": "Validate merge cardinality and row-count intent",
      "summary": "Declare one-to-one, one-to-many, or many-to-one expectations and account for matched, unmatched, and duplicated keys.",
      "body": "A merge can complete successfully while multiplying rows and corrupting totals. The dangerous case is an unexpected many-to-many relation hidden by duplicate keys on both inputs.\n\n- Check key nulls and duplicates on both sides before the merge, and use cardinality validation that matches the intended relationship.\n- Record input row counts, output row count, matched keys, left-only keys, and right-only keys as pipeline evidence.\n- Choose suffixes and projected columns deliberately so similarly named fields cannot be confused after the merge.\n- When many-to-many is intentional, estimate the expansion and aggregate at the correct grain before joining rather than accepting an unbounded Cartesian multiplication.\n\nSee /tests/data for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/pipelines",
      "title": "Assignment is explicit about the target frame",
      "summary": "Use direct label-based assignment or an intentional copy so a transformation never depends on whether a slice is a view.",
      "body": "Selection can return an object that shares data or behaves as a copy depending on shape and operation. Production code should not rely on that ambiguity or suppress warnings without clarifying ownership.\n\n- Use `.loc` with row and column selectors for an in-place update to the intended DataFrame.\n- Call `.copy()` when a derived frame must own independent data, especially before mutation or returning it across a function boundary.\n- Prefer pure transformation functions that return a new named frame when the extra memory is acceptable and clarity outweighs mutation savings.\n- Do not disable chained-assignment diagnostics globally. Treat them as evidence that the target ownership is unclear and rewrite the selection or copy boundary.\n\nSee /src/schemas for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/schemas",
      "title": "Missing values are domain states, not one universal null",
      "summary": "Distinguish absent, unknown, not applicable, invalid, and not yet observed before choosing fill, drop, or propagation behavior.",
      "body": "Pandas offers several missing representations across dtypes, but the business meaning must be decided before a convenient `fillna` changes unknown data into a real measurement or category.\n\n- Define allowed missing states per column and preserve nullable dtypes where absence is legitimate.\n- Do not fill measures with zero unless zero is the domain value for missing, and do not forward-fill across entity or session boundaries.\n- Keep invalid parse outcomes separate from genuinely absent input so data-quality failures can be reported and repaired.\n- Test aggregations with missing groups and values explicitly because defaults around dropping null groups or skipping null values can alter totals.\n\nSee /src/pipelines for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/pipelines",
      "title": "Vectorization is a correctness tool before a speed tool",
      "summary": "Express column operations with aligned Series and built-in transforms, and treat row-wise Python callbacks as an exception.",
      "body": "Vectorized operations make dtype, alignment, and missing-value behavior visible at the column level. Row-wise callbacks hide repeated coercion and can return inconsistent types across records while paying Python call overhead.\n\n- Use arithmetic, comparisons, string accessors, datetime accessors, mapping, grouping, and window operations before reaching for row-wise `apply`.\n- When combining Series, check whether index alignment is intended; reset or align explicitly rather than accepting silent label-based gaps.\n- If a Python callback is unavoidable, define its input and output schema, measure it on representative volume, and isolate it from the rest of the pipeline.\n- Profile memory as well as runtime because chained vectorized expressions can create large temporary arrays even when they avoid Python loops.\n\nSee /src/schemas for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "validate-pandas-pipeline",
      "summary": "Run schema, cardinality, determinism, memory, and golden-output checks before promoting a DataFrame pipeline.",
      "body": "---\nname: validate-pandas-pipeline\ndescription: Validate a Pandas transformation after changing input, joins, dtypes, grouping, or output format.\n---\n\n# Validate Pandas Pipeline\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n- [ ] Run the job against empty, minimal, representative, malformed, high-cardinality, duplicated-key, and missing-value fixtures.\n- [ ] Assert schema and row-count transitions after each join or aggregation and preserve unmatched-key diagnostics.\n- [ ] Shuffle input order and rerun; outputs that should be order-independent must remain identical after stable sorting by the declared key.\n- [ ] Measure peak memory and runtime at expected volume, then exercise chunking or column projection for sources that exceed the process budget.\n- [ ] Compare a canonical output sample and aggregate control totals against the approved baseline, explaining every intentional difference.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "pandas",
        "dataframe",
        "schema",
        "testing",
        "pipeline"
      ]
    }
  ]
};
