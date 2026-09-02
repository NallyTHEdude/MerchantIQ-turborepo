Absolutely. I’d update the README now so it reflects the **actual architecture you’ve built**, rather than just saying “verification pipeline runs asynchronously.”

I don't have the exact current route filenames/paths available from the previous context, so I don't want to invent endpoint names. But we can update everything else now and leave a clearly marked route table for you to fill from Swagger.

Here’s a cleaner version you can drop in:

# Merchant Analysis API

An API that automates merchant verification, document analysis, regulatory compliance checks, and merchant validity assessment while detecting potentially fraudulent merchants without manual intervention.

The system uses asynchronous pipelines to process merchant verification and document embeddings, followed by a RAG-based investigation pipeline that combines merchant evidence with trusted government/regulatory documents.

- Swagger is used for API documentation and endpoint testing.
- Inngest is used for asynchronous event-driven pipeline orchestration.
- PostgreSQL + pgvector is used to store and retrieve document embeddings.
- Cloudinary is used for document storage.

---

## Architecture

![Architecture Diagram](docs/architecture-design.svg)

## Database Design

![Database Design](docs/database-design.svg)

---

## Pipelines

The application is divided into multiple asynchronous pipelines.

### 1. Merchant Verification Pipeline

The verification pipeline validates the merchant using multiple independent verification stages.

The stages run concurrently where possible:

```text
Merchant Verification Request
          │
          ▼
    Inngest Event
          │
          ├── Phone Verification
          ├── KYC Verification
          ├── GSTN Verification
          └── Website Verification
          │
          ▼
     Verification Results
          │
          ▼
     Ensemble Analysis
     ├── XGBoost
     ├── SVM
     └── Random Forest
````

The pipeline uses persistent database state so individual stages can retry independently when temporary failures occur.

The verification pipeline produces the verification evidence required by the final merchant investigation.

---

### 2. Document Embedding Pipeline

Merchant and government documents are processed asynchronously and converted into searchable vector embeddings.

```text
Document
   │
   ▼
Parse Document Text
   │
   ▼
Split Into Relevant Chunks
   │
   ▼
Generate Embeddings
   │
   ▼
Store Chunks + Embeddings
   │
   ▼
PostgreSQL + pgvector
```

Government documents are uploaded separately through an admin-protected route and stored in Cloudinary before being processed.

The embedding pipeline stores:

* Original document metadata
* Document chunks
* Vector embeddings
* Document relationships

The main database tables used for RAG document storage are:

* `rag_documents`
* `rag_chunks`

---

### 3. RAG Investigation Pipeline

The RAG pipeline starts after the required prerequisite pipelines have completed.

It combines the merchant's verification/document evidence with trusted government and regulatory information stored in the vector database.

```text
Verification Pipeline ──────┐
                            │
                            ▼
                     Both Pipelines
                        Finished
                            │
                            ▼
                    RAG Investigation
                            │
                            ├── Retrieve relevant
                            │   government chunks
                            │
                            ├── Merchant document
                            │   compliance checking
                            │
                            └── Semantic similarity
                            │
                            ▼
                       LLM Reasoning
                            │
                            ▼
                  Investigation Result
                            │
                            ▼
                         Database
```

The RAG system uses government/regulatory documents as trusted knowledge while merchant documents, verification results, website analysis, and other collected information are treated as evidence.

The LLM receives the relevant retrieved context together with the merchant evidence and produces the final investigation reasoning.

---

## Pipeline Orchestration

The pipelines are orchestrated asynchronously using Inngest.

The general flow is:

```text
Merchant Request
      │
      ├─────────────────────────┐
      │                         │
      ▼                         ▼
Verification Pipeline     Document Pipeline
      │                         │
      │                         │
      └───────────┬─────────────┘
                  │
                  ▼
           Both Completed
                  │
                  ▼
          RAG Investigation
                  │
                  ▼
          Final Investigation
```

This allows verification and document processing to happen independently instead of forcing the API request to wait for every operation to finish.

Pipeline stages can retry independently when temporary errors occur.

The Inngest development UI can be accessed at:

`http://localhost:8288`

---

## API Routes

The API exposes routes for merchant management, merchant document processing, government document ingestion, and verification.

### Merchant Routes

| Method      | Route  | Description                   |
| ----------- | ------ | ----------------------------- |
| `POST`      | `/...` | Create a merchant             |
| `GET`       | `/...` | Retrieve merchant information |
| `PATCH/PUT` | `/...` | Update merchant information   |

### Verification Routes

| Method | Route  | Description                          |
| ------ | ------ | ------------------------------------ |
| `POST` | `/...` | Start a merchant verification        |
| `GET`  | `/...` | Retrieve verification status/results |

A verification request creates a verification record with a `PENDING` status and triggers the asynchronous Inngest verification workflow.

Only one `PENDING` verification is allowed per merchant at a time.

---

### Merchant Document Routes

Merchant documents are uploaded through the merchant document endpoints.

The document flow is:

```text
Merchant Document Upload
          │
          ▼
       Cloudinary
          │
          ▼
   Document Processing
          │
          ▼
     Parse + Chunk
          │
          ▼
      Embeddings
          │
          ▼
    pgvector Storage
```

| Method | Route  | Description                            |
| ------ | ------ | -------------------------------------- |
| `POST` | `/...` | Upload merchant documents              |
| `GET`  | `/...` | Retrieve merchant document information |

---

### Government Document Routes

Government/regulatory documents are managed separately from merchant documents.

These routes are protected using an admin password supplied through the `x-admin-password` header.

```text
Admin
 │
 ▼
Government Document Upload
 │
 ▼
Cloudinary
 │
 ▼
Embedding Pipeline
 │
 ▼
rag_documents
 │
 ▼
rag_chunks + pgvector
```

| Method | Route  | Description                              |
| ------ | ------ | ---------------------------------------- |
| `POST` | `/...` | Upload a government/regulatory document  |
| `GET`  | `/...` | Retrieve government document information |

Government documents form the trusted knowledge base used by the RAG investigation pipeline.

---

## Tech Stack Used

1. **TypeScript + Express.js** — REST API development.
2. **Zod** — Environment variable and input validation.
3. **Drizzle ORM + PostgreSQL + pgvector** — Database access and vector storage.
4. **Swagger** — OpenAPI-based API documentation and endpoint testing.
5. **Inngest** — Event-based asynchronous orchestration of the application pipelines.
6. **Firecrawl** — Website analysis and merchant website data collection.
7. **Cloudinary** — Cloud document storage.
8. **OpenAI Embeddings** — Converts document chunks into vector embeddings.
9. **LangChain** — Document processing and RAG-related operations.
10. **LLM** — Final merchant investigation and reasoning.

---

## Development Setup

Start the API:

```bash
npm run dev
```

Start the Inngest development server in a separate terminal:

```bash
npm run dev:inngest
```

Both the API server and the Inngest development server need to be running to test the application in development mode.

---

## Verification Flow

A typical merchant verification follows this flow:

```text
1. Merchant is created
        │
        ▼
2. Merchant documents are uploaded
        │
        ▼
3. Verification is requested
        │
        ▼
4. Inngest starts the verification pipeline
        │
        ├── KYC verification
        ├── GSTN verification
        ├── Website verification
        └── Other verification stages
        │
        ▼
5. Verification stages complete
        │
        ▼
6. Document embedding pipeline completes
        │
        ▼
7. Completion signals trigger investigation
        │
        ▼
8. RAG retrieves relevant regulatory context
        │
        ▼
9. Merchant documents are checked against
   relevant government/regulatory information
        │
        ▼
10. LLM performs final reasoning
        │
        ▼
11. Investigation result is stored
```

---

## Notes

* Merchant verification is processed asynchronously using Inngest.
* Document embedding is also processed asynchronously.
* Verification and document processing can run concurrently.
* Pipeline completion signals are used to determine when the final investigation can begin.
* A new verification request is rejected if the merchant already has a `PENDING` verification.
* Merchant updates are verified before being saved. If verification fails, the existing merchant data remains unchanged.
* Pipeline stages can retry when temporary errors occur.
* Government documents are stored separately and act as the trusted knowledge base for the RAG system.
* Merchant documents and verification results are treated as evidence during investigation.
* Vector embeddings are stored in PostgreSQL using pgvector.
* Swagger can be used to explore and test the available API endpoints with your own data.
* The Inngest development UI is available at `http://localhost:8288`.

---

## API Documentation

Swagger provides interactive documentation for all available API endpoints.

Use Swagger to:

* View available routes
* Inspect request/response schemas
* Upload documents
* Create and update merchants
* Trigger verification
* Check verification results
* Test API endpoints with custom data

````

### One thing I'd change before committing this

Once you give me your **actual route files/routes** (or paste your `routes/` structure), we should replace the `/...` entries with the exact methods and paths.

That part is worth being **100% accurate**, because the README should become the first place someone can understand:

```text
POST /merchant
POST /merchant/:id/documents
POST /verification/:merchantId
POST /admin/documents
...
