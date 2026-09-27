# INKSIGHTS Knowledge & Control Plane v1

Status: CANDIDATE IMPLEMENTATION  
Branch: `feat/knowledge-control-plane-v1`

## Objective

Turn the existing INKSIGHTS platform into the persistent internal brain for founder and AI work.

The user should not need to upload a fixed bundle of files into every ChatGPT Project, remember which chat contains a decision, or explain already-built systems again. An authorised session should ask INKSIGHTS for the relevant context and receive the current governed state.

## Existing capability being extended

This is **not** a new standalone knowledge product. It extends:

- the existing `ops_*` operating-system control plane in Supabase;
- `ops_assets`, relationships, systems, workflows, decisions, changes and evidence;
- the existing INKSIGHTS authenticated workspace;
- the existing INKSIGHTS MCP server;
- GitHub as the technical/machine-contract authority;
- current business/system-of-record boundaries.

## Target architecture

```text
Founder / authorised AI session
            |
            v
  INKSIGHTS Founder Console
  or INKSIGHTS MCP connector
            |
            v
    Knowledge Router
    - get_inksights_context
    - search_knowledge
    - check_existing_capability
    - capture_knowledge_candidate
            |
            +---------------------------+
            |                           |
            v                           v
  Supabase knowledge index        Live ops control plane
  knowledge_items                ops_assets
  knowledge_links                ops_systems
  knowledge_query_log            ops_workflows
                                 ops_decisions / changes
            |                           |
            +-------------+-------------+
                          v
                 Canonical source links
       GitHub / Drive / HubSpot / Stripe / Vercel / Supabase
```

## Why this is better than uploading Project files

A ChatGPT Project source bundle is a static context mechanism. It is useful, but it does not know whether a file has been superseded, whether a database capability is already deployed, or whether an architectural blueprint describes a proposal rather than current state.

The Knowledge & Control Plane makes retrieval dynamic:

1. the AI asks INKSIGHTS for context at task start;
2. INKSIGHTS searches normalized knowledge and the live capability registry;
3. results carry truth state, authority, source system and canonical URI;
4. a new-build proposal must first pass the Existing Capability Check;
5. durable learning is captured as PROPOSED rather than silently becoming truth;
6. promotion remains a governed operation.

## Source-of-truth boundary

This implementation does **not** move every business file into GitHub.

- Supabase owns the live normalized knowledge index and operational state.
- GitHub owns this schema, tool code and machine-readable retrieval contract.
- Drive remains the human-facing document/evidence/output workspace where appropriate.
- HubSpot, Stripe and Vercel keep their existing operational authority.
- ChatGPT is an interface to the system, not the database.

This means Drive can gradually become an **ingestion/output adapter** rather than something a founder has to browse and upload manually.

## Knowledge data model

### knowledge_items

A normalized retrievable item with:

- stable knowledge key;
- title/type/domain;
- CURRENT / INTENDED / PROPOSED / HISTORICAL / UNKNOWN truth state;
- canonical / active / supporting / reference authority;
- source-system pointer and canonical URI;
- optional asset relationship to `ops_assets`;
- summary/body/tags;
- provenance, version and content hash;
- scope and sensitivity;
- full-text search vector.

The initial migration seeds this table from existing `ops_assets`, `ops_systems`, `ops_workflows` and `ops_decisions` so the system is useful immediately.

### knowledge_links

Graph relationships such as:

- `derived_from`
- `depends_on`
- `supersedes`
- `conflicts_with`
- `implements`

Existing `ops_asset_relationships` are mirrored where possible.

### knowledge_query_log

Records founder search demand. This allows future analysis of:

- recurring questions;
- missing knowledge;
- weak retrieval;
- concepts that are repeatedly re-explained;
- candidates for new automation or better canonical documentation.

## Retrieval tools

### get_inksights_context

The default one-call preflight for substantial work.

It returns:

- CURRENT knowledge;
- INTENDED state;
- PROPOSED/candidate material;
- live existing-capability evidence;
- operating guardrails.

This should replace “upload these 15 files to the Project first”.

### check_existing_capability

Mandatory before a new architecture/build recommendation.

It checks live:

- `ops_assets`
- `ops_systems`
- `ops_workflows`

and combines those results with the knowledge index.

If something exists, the default classifications become:

`IMPROVE / REPAIR / CONNECT / VERIFY / CONSOLIDATE / PRODUCTISE / REPLACE / RETIRE`

rather than automatically `BUILD`.

### search_knowledge

Direct retrieval when a task needs a narrower evidence/source search.

### capture_knowledge_candidate

Captures durable-looking learning, but hard-codes it as:

- truth state = PROPOSED;
- authority = supporting;
- promotion required = true.

This prevents chat output from becoming authority merely because it sounded convincing.

## Security

V1 is founder/admin only.

- no anonymous access;
- authenticated users must also hold an active `platform_admins` owner/admin role;
- new tables use RLS;
- public/studio-facing MCP tools remain separate from founder knowledge tools;
- service-role access is used only server-side for the live capability check, after the caller has passed the platform-admin check;
- the migration does not weaken existing RLS or expose the ops control plane to studio users.

## Search strategy

V1 uses PostgreSQL full-text search plus governance-aware ranking.

Ranking considers:

- text relevance;
- authority level;
- truth state;
- title match;
- verification recency.

This is intentional. It avoids creating an embedding-provider dependency before the knowledge corpus and query telemetry justify it.

Phase 2 can add `pgvector` and hybrid semantic + keyword search behind the same tool contract.

## Founder Console

The branch adds an authenticated `/knowledge` route for platform admins.

It provides:

- one search box across governed INKSIGHTS knowledge;
- current/proposed counts;
- quick founder questions;
- visible truth-state and authority labels;
- direct links back to canonical sources.

This becomes the human-facing “where is the truth?” interface.

## Drive / GitHub ingestion direction

The next adapter layer should be incremental, not a giant migration:

1. GitHub technical sources can be synced directly because their version/hash is already machine-readable.
2. Drive business sources can be synced through a controlled connector job that stores normalized text/hash/provenance in Supabase while leaving the Drive document as canonical.
3. Live systems such as HubSpot/Stripe/Vercel should contribute state summaries, not copied operational databases.
4. only durable, approved information is promoted to CURRENT/canonical knowledge.

## Definition of done for v1

The branch is ready for approval when:

- migration SQL is reviewed;
- RLS and grants are reviewed;
- MCP tool compile/build passes;
- Founder Console build passes;
- a test query can retrieve a seeded current system/asset;
- `check_existing_capability("Search Intelligence")` finds the existing implementation rather than proposing a new one;
- `capture_knowledge_candidate` cannot create CURRENT/canonical knowledge;
- Supabase advisors are clean enough for the new objects.

Production activation requires the normal explicit approval for schema/RLS changes and merge/deployment.
