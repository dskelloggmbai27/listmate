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
