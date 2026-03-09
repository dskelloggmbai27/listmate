<div align="center">
  <img src="docs/screenshots/logo.png" alt="ListMate" width="80" />
  <h1>ListMate</h1>
  <p><strong>AI-powered listing copilot for marketplace sellers</strong></p>
  <p>
    Upload photos → get a complete, optimised listing in seconds — with built-in QA, variant management, and one-tap export.
  </p>

  ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
  ![Claude](https://img.shields.io/badge/Claude-Sonnet%204.6-CC785C?style=flat-square)
  ![Tailwind](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=flat-square&logo=tailwindcss)
</div>

---

## What is ListMate?

Selling on Amazon, Etsy, eBay, Walmart, or Shopify takes time — not because the product is hard to describe, but because every marketplace has its own format, character limits, required attributes, and SEO conventions. Most sellers either under-describe their items (hurting conversion) or spend 20-30 minutes per listing getting it right.

**ListMate cuts that to under 60 seconds.**

You upload 3-5 product photos and jot a few raw notes. ListMate's AI analyses the images, extracts every relevant detail, and generates a fully formatted listing — including title, key highlights, detailed description, and structured attributes — optimised for whichever marketplace you're targeting. A built-in QA engine then scores the listing for completeness and flags any missing information that could drive returns, before you export directly to your seller account.

---

## Screenshots

<table>
  <tr>
    <td align="center" width="33%">
      <img src="docs/screenshots/01-upload.png" alt="Upload & Configure" width="220" />
      <br /><sub><b>Upload & Configure</b></sub>
      <br /><sub>Drop photos, add notes, pick marketplace</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/screenshots/02-processing.png" alt="AI Processing" width="220" />
      <br /><sub><b>AI Processing</b></sub>
      <br /><sub>Real-time ReAct reasoning pipeline</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/screenshots/03-listing.png" alt="Generated Listing" width="220" />
      <br /><sub><b>Generated Listing</b></sub>
      <br /><sub>Edit title, bullets, description & attributes</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <img src="docs/screenshots/04-variants.png" alt="Variant Builder" width="220" />
      <br /><sub><b>Variant Builder</b></sub>
      <br /><sub>Size, colour, material — add option chips</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/screenshots/05-qa.png" alt="QA Report" width="220" />
      <br /><sub><b>QA Report</b></sub>
      <br /><sub>Completeness score + return-risk tips</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/screenshots/logo.png" alt="ListMate" width="120" style="padding: 50px 0" />
      <br /><sub><b>Export to Seller Account</b></sub>
      <br /><sub>One-tap draft creation across marketplaces</sub>
    </td>
  </tr>
</table>

---

## Key Features

### 📸 Smart Image Analysis
Upload 3-5 photos and ListMate identifies product type, colour, material, condition, and distinctive features — automatically, without manual tagging.

### ✍️ Marketplace-Optimised Copy
Every listing is tuned to the platform. Amazon listings emphasise search keywords and structured attributes. Etsy listings lean into craft and story. eBay listings match condition conventions. The AI knows the difference.

### 🤖 ReAct Reasoning Pipeline
ListMate doesn't just "generate text." It follows a five-step reasoning loop — **Observe → Reason → Act → Reflect → Refine** — that mirrors how an expert copywriter would approach a listing. The result is more accurate, more consistent, and less prone to hallucination.

### ✅ Built-in QA & Return Risk Scoring
Before you publish, ListMate scores your listing on a 10-point completeness scale. It flags up to 2 high-impact gaps — missing dimensions, unspecified materials, ambiguous sizing — that research shows drive the most returns. Listings that score 8+ convert significantly better and have fewer disputes.

### 🎛️ Variant Builder
Add size, colour, material, style, or any custom option type as chip-select groups. Variant combinations are tracked automatically with per-variant pricing.

### 🚀 Direct Export
One tap sends the finished listing as a draft to your connected seller account — no copy-paste, no reformatting. Supports Amazon Seller Central, Etsy Shop Manager, eBay Seller Hub, Walmart Seller Center, and Shopify Admin.

### 📊 Seller Insights
Track QA scores, listing volume, and marketplace distribution over time from the built-in Insights dashboard.

### 🔑 Bring Your Own API Key
Enter your Anthropic or OpenAI key in Account Settings to route listings through your own account — useful for enterprise billing, rate limits, or compliance requirements.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Flow                               │
│                                                                  │
│  📷 Photos + Notes                                              │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐ │
│  │   Upload &  │───▶│  AI Processing   │───▶│    Review &    │ │
│  │  Configure  │    │  (ReAct loop)    │    │     Edit       │ │
│  └─────────────┘    └──────────────────┘    └───────┬────────┘ │
│                                                      │          │
│                              ┌───────────────────────┘          │
│                              ▼                                   │
│                     ┌────────────────┐    ┌──────────────────┐ │
│                     │  QA Report &   │───▶│  Export to       │ │
│                     │  Return Risk   │    │  Seller Account  │ │
│                     └────────────────┘    └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

1. **Upload** — Drop 3-5 product photos and add raw seller notes (condition, rough size, any flaws). Select your target marketplace and AI model.
2. **Process** — ListMate runs its five-step reasoning pipeline. The AI reads the images, reasons about category and attributes, drafts the listing, validates it against marketplace norms, and refines the output.
3. **Review** — The generated listing opens in a fully editable panel. Every field — title, bullets, description, attributes — can be tweaked inline. Regenerate individual sections with one click.
4. **Variants** — Toggle the variants panel to add size, colour, or any custom option as chip groups with per-variant pricing.
5. **QA** — Run the QA scan. A completeness score and up to 2 high-priority tips appear. Each tip has an "Add" button that jumps back to the relevant listing field.
6. **Export** — Tap "Export to Seller Account." The listing is created as a draft in your marketplace dashboard, ready to review and publish.

---

## Supported Marketplaces

| Marketplace | Listing Generation | Direct Export |
|---|---|---|
| Amazon | ✅ SEO-optimised, bullet-format | ✅ Seller Central |
| Etsy | ✅ Story-driven, tag-aware | ✅ Shop Manager |
| eBay | ✅ Condition + spec format | ✅ Seller Hub |
| Walmart | ✅ Category-structured | ✅ Seller Center |
| Shopify | ✅ Brand-voice flexible | ✅ Admin API |

---

## AI Models

ListMate supports multiple model backends. Select from the Upload screen:

| Display Name | Provider | Best For |
|---|---|---|
| Fine-tuned GPT 5 ✦ | OpenAI | High-volume, speed-critical sellers |
| Post-trained Gemma 3 ✦ | ListMate | Specially tuned models for each categories (Etsy, Shopify) |
| Claude Sonnet 4.6 | Anthropic | Balanced quality + speed |
| Claude Opus 4.6 | Anthropic | Complex, high-value items |
| GPT-5.2 | OpenAI | OpenAI-preferred workflows |

> **Best-of-N mode** runs the generation pass multiple times and returns the highest-scoring output — useful for hero listings where copy quality is critical.

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- An Anthropic API key (`ANTHROPIC_API_KEY`) _or_ OpenAI API key (`OPENAI_API_KEY`)

### 1 — Clone & configure

```bash
git clone https://github.com/your-org/listmate.git
cd listmate
cp backend/.env.example backend/.env
# Edit backend/.env — add your API key(s)
```

### 2 — Start everything

```bash
chmod +x start.sh && ./start.sh
```

This starts the FastAPI backend on `http://localhost:8000` and the React dev server on `http://localhost:5173`.

### 3 — Open the app

Navigate to **http://localhost:5173** and upload your first product.

---

### Manual start (if needed)

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
listmate/
├── backend/
│   ├── main.py              # FastAPI app + CORS
│   ├── routes/
│   │   ├── generate.py      # POST /api/generate
│   │   └── qa.py            # POST /api/qa
│   ├── services/
│   │   ├── llm.py           # LLM client abstraction
│   │   └── scorer.py        # Rule-based completeness scorer
│   └── prompts/
│       ├── generate_system.txt
│       └── qa_system.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # UploadPage, ProcessingPage, ListingPage,
│   │   │                    # VariantsPage, QAPage, ExportSuccessPage,
│   │   │                    # PastListingsPage, AccountSettingsPage, InsightsPage
│   │   ├── components/      # ModelSelector, HamburgerMenu, BottomNav
│   │   ├── api/             # generate.js, qa.js
│   │   └── store/           # useStore.js (Zustand)
│   └── public/
│       └── marketplaces/    # Marketplace logos
│
└── docs/
    └── screenshots/
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v3, Zustand, React Router v7 |
| Backend | FastAPI, Python 3.13, Uvicorn |
| AI | Claude (Anthropic SDK), OpenAI SDK |
| Styling | Tailwind CSS, Material Symbols, Inter font |

---

<div align="center">
  <p>Built with ListMate AI Intelligence</p>
</div>
# listmate
ListMate is a listing creation + QA layer for ecommerce sellers. It generates marketplace-specific content and attributes from images/specs, builds variant matrices, and flags return-driving issues (missing specs, ambiguity, mismatches) with a Return Risk Score + checklist.
```mermaid
graph TD
    %% Styling definitions for a polished look
    classDef frontend fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef backend fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef coreAI fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef output fill:#fce4ec,stroke:#d81b60,stroke-width:2px;
    classDef external fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,stroke-dasharray: 5 5;

    %% 1. User Inputs (Frontend)
    subgraph UI ["User Interface (Frontend / Streamlit)"]
        In1[Upload: 3-5 Product Images]:::frontend
        In2[Upload: Raw Specs / Copy-Paste Text]:::frontend
    end

    %% 2. Backend Routing
    subgraph Backend ["Backend Orchestration Layer"]
        B1{Data Router & API Controller}:::backend
    end

    %% 3. AI Components (The Core Engine)
    subgraph AI ["AI & Logic Layer (ListMate Core)"]
        AI_1[Multimodal Extractor: Extracts features from Image + Text]:::coreAI
        AI_2[Listing Generator LLM: Drafts SEO Title, Bullets, Description]:::coreAI
        AI_3[Variant Builder LLM: Generates Size/Color/Compatibility Matrix]:::coreAI
        AI_4[QA & Risk Engine: LLM + Rule-Based Checks for Missing Specs]:::coreAI
    end

    %% 4. System Outputs
    subgraph Outputs ["System Outputs (Presented in UI)"]
        Out1[Optimized Marketplace Listing]:::output
        Out2[Structured Variant Matrix]:::output
        Out3[Return Risk Score]:::output
        Out4[Fix-It Checklist]:::output
    end

    %% 5. External Actions
    subgraph Market ["Target Marketplaces"]
        M1[Amazon, Etsy, Walmart, Shopify <br> *Manual Publish*]:::external
    end

    %% Define the workflow connections
    In1 --> B1
    In2 --> B1

    B1 --> AI_1
    
    %% Extractor feeds the generators
    AI_1 --> AI_2
    AI_1 --> AI_3
    
    %% QA engine evaluates both the raw extraction and the generated listing
    AI_1 --> AI_4
    AI_2 -.->|Cross-checks generated text against images/specs| AI_4

    %% Connect AI to Outputs
flowchart TD
    %% Styling for perfect dark/light mode readability
    classDef frontend fill:#e1f5fe,stroke:#039be5,stroke-width:2px,color:#000;
    classDef backend fill:#fff3e0,stroke:#fb8c00,stroke-width:2px,color:#000;
    classDef coreAI fill:#e8f5e9,stroke:#43a047,stroke-width:2px,color:#000;
    classDef output fill:#fce4ec,stroke:#d81b60,stroke-width:2px,color:#000;
    classDef external fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,stroke-dasharray: 5 5,color:#000;

    %% 1. User Inputs (Blue)
    In1[Upload: Product Images]:::frontend
    In2[Upload: Raw Specs Text]:::frontend

    %% 2. Backend (Orange)
    B1{Data Router & Controller}:::backend

    %% 3. AI Components (Green)
    AI_1[Multimodal Extractor]:::coreAI
    AI_2[Listing Generator LLM]:::coreAI
    AI_3[Variant Builder LLM]:::coreAI
    AI_4[QA & Risk Engine]:::coreAI

    %% 4. Outputs (Pink)
    Out1[Optimized Listing]:::output
    Out2[Variant Matrix]:::output
    Out3[Return Risk Score]:::output
    Out4[Fix-It Checklist]:::output

    %% 5. Marketplaces (Purple Dashed)
    M1[Amazon, Etsy, Shopify - Manual Publish]:::external

    %% Workflow Connections
    In1 --> B1
    In2 --> B1
    
    B1 --> AI_1
    
    AI_1 --> AI_2
    AI_1 --> AI_3
    AI_1 --> AI_4
    
    AI_2 -.->|Cross-check generated text| AI_4

    AI_2 --> Out1
    AI_3 --> Out2
    AI_4 --> Out3
    AI_4 --> Out4

    %% Connect to final manual step
    Out1 --> M1
    Out2 --> M1
    ```
