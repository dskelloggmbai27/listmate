import os
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel
from services.llm import LLMClient, parse_json_response
from services.scorer import rule_based_qa

router = APIRouter()
PROMPTS_DIR = Path(__file__).parent.parent / 'prompts'


class QARequest(BaseModel):
    listing: dict
    images: list[str] = []
    provider: str = 'anthropic'
    model: str = 'claude-sonnet-4-6'


@router.post('/qa')
async def run_qa(req: QARequest):
    listing = req.listing

    # Rule-based layer first (fast, deterministic)
    rule_issues, rule_deduction = rule_based_qa(listing)

    if os.environ.get('DEMO_MODE', 'false').lower() == 'true':
        score = max(0, round(10 - rule_deduction))
        return {'risk_score': score, 'issues': rule_issues}

    # LLM QA layer
    system = (PROMPTS_DIR / 'qa_system.txt').read_text()
    user_tmpl = (PROMPTS_DIR / 'qa_user.txt').read_text()
    bullets_str = '\n'.join(f'- {b}' for b in listing.get('bullets', []))
    user_text = (
        user_tmpl
        .replace('{title}', listing.get('title', ''))
        .replace('{bullets}', bullets_str)
        .replace('{description}', listing.get('description', ''))
        .replace('{attributes}', str(listing.get('attributes', {})))
    )

    try:
        client = LLMClient(provider=req.provider, model=req.model)
        text = client.generate(system, user_text, req.images[:3])
        llm_result = parse_json_response(text)
        llm_issues = llm_result.get('issues', [])
        llm_score = llm_result.get('risk_score', 10)

        # Merge rule issues (dedup by field)
        existing_fields = {i['field'] for i in llm_issues}
        for ri in rule_issues:
            if ri['field'] not in existing_fields:
                llm_issues.append(ri)

        final_score = max(0, min(10, llm_score - rule_deduction))
        return {'risk_score': round(final_score), 'issues': llm_issues}

    except Exception as e:
        print(f'QA LLM error: {e}')
        score = max(0, round(10 - rule_deduction))
        return {'risk_score': score, 'issues': rule_issues}
