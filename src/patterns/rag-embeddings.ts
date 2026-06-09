import type { Pattern } from "../types.js";

export const ragEmbeddings: Pattern = {
  "slug": "rag-embeddings",
  "version": "1.0.0",
  "name": "RAG & Embeddings",
  "tagline": "Ground LLM answers in your own data with retrieval that returns the right chunks, not just similar ones.",
  "description": "A pragmatic baseline for retrieval-augmented generation: how to chunk documents so retrieval has something to find, how to store and index embeddings in pgvector, how to filter by metadata and a similarity floor instead of dumping a raw top-k into the prompt, and when a re-ranking pass is worth its latency. Retrieval quality, not the model, is what makes or breaks a RAG feature, and most of that quality is decided before the LLM is ever called.",
  "category": "AI",
  "icon": "library",
  "color": "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400",
  "installs": 0,
  "updatedAt": "2026-06-09",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-06-09",
      "note": "First release."
    }
  ],
  "metaTitle": "RAG & Embeddings pattern for AI coding agents",
  "metaDescription": "Pathrule pattern for retrieval-augmented generation: semantic chunking with overlap, pgvector + HNSW storage, metadata-filtered retrieval with a similarity threshold, re-ranking, and pinned embedding models, tuned for AI coding agents.",
  "problem": "AI agents building RAG embed whole documents, dump a blind top-k into the prompt, and silently change the embedding model, producing irrelevant context and answers that quietly degrade.",
  "audience": "Teams adding retrieval over their own documents to an LLM application",
  "prevents": [
    "Embedding entire documents instead of semantically sized chunks",
    "Stuffing a raw top-k into the prompt with no similarity floor or metadata filter",
    "Mixing vectors from two embedding models in one index",
    "Skipping re-ranking and blaming the LLM for irrelevant answers"
  ],
  "appliesTo": {
    "paths": [
      "/src/rag",
      "/src/lib/rag"
    ],
    "stacks": [
      "typescript",
      "rag",
      "pgvector",
      "postgres"
    ],
    "packages": [
      "ai",
      "pgvector",
      "drizzle-orm"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/rag",
      "title": "Chunk on semantic boundaries with overlap; never embed whole documents",
      "summary": "Split documents into bounded, overlapping chunks aligned to natural boundaries before embedding; a whole-document vector retrieves nothing useful.",
      "body": "An embedding is one point in space. Embed a whole document and that point is the average of every topic it covers, so it matches everything weakly and nothing well.\n\n- Split into chunks bounded by a token budget (roughly 256-512 tokens for prose; tune to your content) and align splits to natural boundaries: headings, paragraphs, code blocks, sentences. Do not split mid-sentence or mid-code-block.\n- Keep a small overlap (about 10-20%) between adjacent chunks so a fact that straddles a boundary survives in at least one chunk.\n- Store provenance on every chunk: source id, title, section/heading, and position. This metadata is what makes filtering and citation possible later.\n- Match chunk size to the retrieval job: smaller chunks for precise fact lookup, larger for narrative context. One global size rarely fits every document type.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "advisory"
    },
    {
      "kind": "rule",
      "nodePath": "/src/rag",
      "title": "Filter retrieval by metadata and a similarity floor; never dump a blind top-k",
      "summary": "Constrain every query by tenant/access metadata and reject matches below a similarity threshold; passing a raw top-k straight into the prompt poisons answers and leaks data.",
      "body": "Top-k always returns k rows, even when nothing relevant exists. Without a floor, irrelevant chunks become \"context\" and the model dutifully reasons over garbage.\n\n- Apply a similarity threshold and drop matches below it. If nothing clears the floor, return no context and let the model say it does not know, rather than padding the prompt with weak matches.\n- Always pre-filter by access and scope metadata (tenant id, user, document permissions, language, recency) in the SQL `WHERE`, not after retrieval. Skipping this is how one tenant's vectors end up in another tenant's answer.\n- Cap the context you assemble by token budget, not just row count; trim the lowest-scoring chunks first and keep room for the system prompt and the answer.\n- Always include each chunk's source metadata in the assembled context so the model can cite and the user can verify.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/rag",
      "title": "Vector store: pgvector with an HNSW index",
      "summary": "We store embeddings in Postgres via pgvector and index them with HNSW, keeping vectors next to their relational metadata instead of adding a separate vector database.",
      "body": "We keep vectors in Postgres with the `pgvector` extension rather than standing up a separate vector database. Chunks live in a normal table beside their metadata, so a retrieval query is one SQL statement that filters and ranks together.\n\n- Store the embedding as a `vector(N)` column where N is the model's dimension. Keep chunk text, the vector, and provenance metadata in the same row.\n- Index with HNSW (`USING hnsw (embedding vector_cosine_ops)`) for fast approximate nearest-neighbour search at scale; it beats IVFFlat on recall/latency for most workloads and needs no training step.\n- Match the index operator class to the distance metric your embedding model expects (cosine is the common default). The query operator (`<=>` for cosine) must match the index, or it falls back to a sequential scan.\n- Filter then rank: put tenant/permission predicates in the `WHERE` and order by distance. A partial or composite index aligned to your common filters keeps it fast.\n\nSee /src/rag for the chunking and retrieval-filter rules and the re-ranking memory."
    },
    {
      "kind": "memory",
      "nodePath": "/src/rag",
      "title": "Pin the embedding model and its dimension",
      "summary": "The embedding model and dimension are part of the index contract; changing either requires a full re-embed and migration, never a silent swap.",
      "body": "Every vector in an index was produced by one specific embedding model. Vectors from two different models are not comparable, so the model is not a tunable setting - it is part of the schema.\n\n- Pin the exact embedding model id and dimension in config, alongside the table that stores its vectors. Treat a model change like a breaking migration.\n- Changing the model (or its dimension) means re-embedding the entire corpus into a new column/table and cutting over; you cannot mix old and new vectors in one index and get meaningful distances.\n- Embed queries with the same model and the same normalization/instruction prefix you used for the documents. An asymmetric setup (one model for docs, another for queries) silently tanks recall.\n- Batch embedding calls during ingestion to amortize latency and cost, and record the model id on each row so you can audit and re-embed selectively.\n\nSee /src/rag for the pgvector store memory."
    },
    {
      "kind": "memory",
      "nodePath": "/src/rag",
      "title": "Add a re-ranking pass when precision matters",
      "summary": "Retrieve a wider candidate set by vector similarity, then re-rank the top candidates with a cross-encoder/reranker before assembling context.",
      "body": "Vector similarity is fast but coarse: it ranks by embedding distance, which is not the same as relevance to the actual question. A re-ranking pass fixes the ordering where it counts.\n\n- Retrieve a wider candidate set first (e.g. top 20-50 by vector distance), then re-rank those candidates with a reranker/cross-encoder that scores each chunk against the query directly, and keep the top few.\n- Re-ranking trades latency and cost for precision. Add it when answers are subtly off despite the right documents being in the index; skip it for latency-critical or low-stakes lookups.\n- Hybrid retrieval - combining vector search with keyword/full-text (BM25-style) search and merging the results - often beats either alone, especially for exact terms, names, and codes that embeddings blur.\n- Measure before and after with a small labelled question/answer set. \"It feels better\" is not a retrieval metric; recall@k and answer correctness are.\n\nSee /src/rag for the retrieval-filter rule and the embedding-model memory."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "rag-ingestion-pipeline",
      "summary": "Step-by-step checklist for building or changing a RAG ingestion + retrieval pipeline.",
      "body": "---\nname: rag-ingestion-pipeline\ndescription: Checklist for building or changing a retrieval-augmented generation ingestion and retrieval pipeline. Run when adding a corpus, changing chunking, or debugging irrelevant retrieval.\n---\n\n# RAG ingestion & retrieval pipeline\n\n## Ingestion\n- [ ] Load source, then chunk on semantic boundaries within a token budget, with 10-20% overlap; no mid-sentence/mid-code splits.\n- [ ] Attach provenance metadata to every chunk: source id, title, section, position, tenant/permissions.\n- [ ] Embed with the pinned model + dimension; same model and prefix used for docs and queries; batch the calls.\n- [ ] Upsert chunk text + `vector(N)` + metadata into Postgres; create/refresh the HNSW index with the operator class matching the distance metric.\n- [ ] Record the embedding model id on each row so a model change can re-embed selectively.\n\n## Retrieval\n- [ ] Pre-filter by tenant/permission/scope metadata in the `WHERE` clause.\n- [ ] Rank by vector distance using the operator that matches the index; apply a similarity floor and drop weak matches.\n- [ ] If precision matters, over-fetch candidates and re-rank (and consider hybrid keyword + vector).\n- [ ] Assemble context within a token budget, trimming lowest-scoring chunks first; include source metadata for citation.\n- [ ] If nothing clears the floor, return no context rather than padding the prompt.\n\n## Verify\n- [ ] Evaluate on a small labelled Q/A set (recall@k, answer correctness) before and after changes; don't ship on vibes.\n",
      "skillTags": [
        "rag",
        "embeddings",
        "pgvector",
        "retrieval",
        "reranking",
        "ai-review"
      ]
    }
  ]
};
