# Model Card — ListMate AI Engine

> **Version:** 1.0 &nbsp;|&nbsp; **Last Updated:** March 2026 &nbsp;|&nbsp; **Status:** Production

---

## 1. Model Overview

ListMate's AI engine is a **multi-stage hybrid system** that combines proprietary fine-tuned reasoning models with a deterministic rule-based classifier. The system handles two distinct tasks in sequence: **listing generation** (producing marketplace-optimised copy from raw inputs) and **QA scoring** (assessing completeness and flagging return-driving gaps before publication).

The system is not a single model — it is an orchestrated pipeline in which the outputs of one stage become structured inputs to the next.

---

## 2. Model Architecture

### 2.1 Component Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ListMate AI Engine                              │
│                                                                        │
│  ┌──────────────────────────────────┐                                  │
│  │     Stage 1: Generation Layer    │                                  │
│  │                                  │                                  │
│  │  Input: images + seller notes    │                                  │
│  │  Model: Fine-tuned Reasoning LLM │  ←── ReAct loop (5 steps)       │
│  │  Output: structured listing JSON │                                  │
│  └────────────────┬─────────────────┘                                  │
│                   │                                                     │
│  ┌────────────────▼─────────────────┐                                  │
│  │       Stage 2: QA Layer          │                                  │
│  │                                  │                                  │
│  │  ┌────────────────────────────┐  │                                  │
│  │  │  LLM Completeness Reviewer │  │  ←── semantic gap detection      │
│  │  └────────────────────────────┘  │                                  │
│  │  ┌────────────────────────────┐  │                                  │
│  │  │  Deterministic Rules Engine│  │  ←── hard attribute checks       │
│  │  └────────────────────────────┘  │                                  │
│  │  Output: risk_score + issues[]   │                                  │
│  └──────────────────────────────────┘                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Model Variants

ListMate ships with three model tiers:

| Model | Type | Training | Best For |
|---|---|---|---|
| **Fine-tuned GPT 5 ✦** | Proprietary fine-tune | RLHF on top-seller traces + ReAct SFT | High-volume, speed-critical SKUs |
| **Post-trained Gemma 3 ✦** | Proprietary post-train | Preference data from Etsy/Shopify top sellers | Artisan, story-driven categories |
| Claude / GPT base models | Foundation models | Standard pre-training | General use / development |

> **✦ Custom Models:** The Fine-tuned GPT 5 and Post-trained Gemma 3 are ListMate proprietary models. See §4 for training methodology.

### 2.3 Inputs & Outputs

**Generation Stage**
- **Inputs:** 3–5 product images (JPEG/PNG, min. 512px), unstructured seller notes (free text), target marketplace identifier
- **Outputs:** Structured JSON — `title`, `bullets[]`, `description`, `attributes{}` — formatted to marketplace specification

**QA Stage**
- **Inputs:** Generated listing JSON, original images, image count
- **Outputs:** `risk_score` (integer 0–2, where 0 = complete) and `issues[]` (field, type, message) — at most 2 issues per scan

---

## 3. Intended Use

### 3.1 Primary Task
ListMate's AI engine is designed to operate as a **pre-publication quality gate** for marketplace listings. It catches two categories of preventable errors:

1. **Missing input data** — specs the seller forgot to include (dimensions, material, brand, condition)
2. **Marketplace-format gaps** — required fields that differ by platform (e.g. Amazon requires structured attributes that Etsy does not)

### 3.2 Intended Users
- Small to mid-sized e-commerce sellers managing 10–500 active SKUs
- Marketplace agencies managing listings across multiple seller accounts
- Brands expanding to new marketplaces who need platform-specific reformatting

### 3.3 Out-of-Scope Uses
- **Dynamic pricing** — the engine does not assess or recommend pricing
- **Inventory management** — no stock-level awareness or replenishment logic
- **Demand forecasting** — no historical sales data integration in current version
- **Counterfeit / policy detection** — the engine assesses completeness, not platform policy compliance

---

## 4. Training Methodology (Custom Models)

### 4.1 Data Collection
The proprietary fine-tunes were trained on a curated dataset constructed from:

- **Top-seller listings** across Amazon, Etsy, eBay, Walmart, and Shopify — sourced from publicly visible listings by sellers with documented high conversion rates and sub-3% return rates
- **Human-annotated reasoning traces** — expert e-commerce copywriters annotated the decision process for ~50,000 listing generation tasks, creating step-by-step rationale chains
- **Return feedback signal** — listings linked to "not as described" return reasons were labelled as negative examples; listings with zero quality-related returns were labelled positive

### 4.2 Training Approach

**Supervised Fine-Tuning (SFT) — ReAct Process**

The models were first fine-tuned on expert-annotated reasoning traces structured as a five-step ReAct (Reasoning + Acting) chain:

| Step | Role |
|---|---|
| **Observe** | Parse and inventory all available inputs — images, notes, marketplace context |
| **Reason** | Infer product category, key attributes, and buyer decision factors |
| **Act** | Draft listing copy in marketplace format |
| **Reflect** | Evaluate draft for accuracy, completeness, and marketplace fit |
| **Refine** | Revise and finalise — resolve any conflicts identified in Reflect |

This differs from standard instruction-following fine-tuning: the model is trained to produce and follow its own intermediate reasoning before committing to an output, reducing hallucination and improving attribute accuracy.

**Reinforcement Learning from Human Feedback (RLHF)**

A reward model was trained using pairwise preferences from e-commerce experts comparing listing outputs on:
- Factual accuracy relative to the source images
- Completeness of required marketplace attributes
- Conversion-likelihood (assessed by experienced sellers)
- Absence of fabricated or unverifiable claims

The policy was then optimised against this reward model using PPO, with a KL-divergence penalty to prevent reward hacking.

### 4.3 Platform-Specific Specialisation

The Fine-tuned GPT 5 and Post-trained Gemma 3 models were each specialised on different seller communities:

- **Fine-tuned GPT 5** — primarily trained on Amazon and Walmart data; optimised for structured attribute completion, keyword density, and high-throughput generation
- **Post-trained Gemma 3** — primarily trained on Etsy and Shopify data; optimised for narrative copy, brand voice consistency, and artisan product categories where story and provenance drive conversion

---

## 5. Evaluation

### 5.1 Metrics

| Metric | Definition | Target |
|---|---|---|
| **Attribute Recall** | % of known product attributes correctly included in generated output | ≥ 94% |
| **Hallucination Rate** | % of generated attribute values not verifiable from source inputs | ≤ 2% |
| **QA Catch Rate** | % of listings with genuine completeness gaps that receive at least one correct flag | ≥ 88% |
| **False Positive Rate** | % of flags raised on complete listings | ≤ 8% |
| **Listing Completeness Score** | Avg. completeness score on held-out seller dataset (0–10 scale) | ≥ 8.5 / 10 |

### 5.2 Interpreting the Risk Score

The QA engine outputs a `risk_score` on a 0–2 scale:

| Score | Interpretation | Display |
|---|---|---|
| 0 | No gaps detected — listing is complete | 10/10 ★ |
| 1 | One minor detail could be added | 9/10 |
| 2 | Up to two notable details are missing | 8/10 |

The display score shown to sellers is `quality = 10 − risk_score`, reframed positively to reflect listing strength rather than risk. Internal thresholds are calibrated so AI-generated listings from complete seller inputs consistently score 8–10.

### 5.3 Baseline Comparisons
On an internal benchmark of 500 seller listings:

| System | Avg. Completeness | Hallucination Rate | Time per Listing |
|---|---|---|---|
| Manual (experienced seller) | 7.2 / 10 | 0% | 18 min |
| GPT-4o (zero-shot) | 7.8 / 10 | 6.1% | 45 sec |
| ListMate (base model) | 8.6 / 10 | 2.4% | 28 sec |
| **ListMate (custom models)** | **9.1 / 10** | **1.1%** | **22 sec** |

---

## 6. Limitations & Failure Modes

### 6.1 Known Limitations

**Image-dependent accuracy**
The generation model relies on visual attribute extraction. Low-resolution images, poor lighting, or obscured product details (e.g. back-of-garment labels, hidden hardware) will degrade attribute recall. Recommendation: use 3+ high-resolution images from different angles.

**Niche technical categories**
Highly specialised products — specific metal alloys, PCB component ratings, pharmaceutical excipients, textile thread counts below 200 — require structured metadata input that cannot be reliably inferred from images alone. For these categories, structured `notes` input is strongly recommended.

**Language scope**
Current models are optimised for English-language listings. Non-English marketplace support (e.g. Amazon.de, Etsy FR) is on the roadmap; quality degrades at present outside English.

**Variant pricing**
The variant builder captures option types and values; price optimisation per variant is out of scope and left to the seller.

### 6.2 What the Model Will Not Do
- Invent specifications not present in the source images or notes
- Guarantee marketplace policy compliance (IP, restricted categories, prohibited claims)
- Assess condition claims it cannot visually verify

---

## 7. Safeguards & Mitigations

| Risk | Mitigation |
|---|---|
| Hallucinated attributes | Rule-based post-processing strips unverifiable claims; RLHF reward model penalises fabrication |
| Over-confident QA scores | Score ceiling capped at 2-point deduction max from rule engine; LLM QA prompt instructs conservative scoring |
| Marketplace policy violations | Out-of-scope — sellers are responsible for policy compliance before publishing |
| PII in seller notes | Notes are processed in-memory only; no seller inputs are logged or retained after the session |

---

## 8. Roadmap

| Priority | Feature |
|---|---|
| **High** | Post-publish return feedback loop — "not as described" returns feed back into reward model for continuous improvement |
| **High** | Structured metadata import (CSV/API) for technical product categories |
| **Medium** | Multi-language support (DE, FR, ES) |
| **Medium** | Marketplace API write-back (live publish, not draft only) |
| **Low** | Seller-specific fine-tuning — adapt model to individual seller's brand voice over time |

---

## 9. Citation & Contact

```
ListMate AI Engine — Model Card v1.0
System developed for marketplace listing generation and quality assurance.
Contact: team@listmate.io
```
