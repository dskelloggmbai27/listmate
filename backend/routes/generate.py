import base64
import os
from pathlib import Path

from fastapi import APIRouter, File, Form, UploadFile
from services.llm import LLMClient, parse_json_response

router = APIRouter()

PROMPTS_DIR = Path(__file__).parent.parent / 'prompts'

FALLBACK_RESPONSE = {
    'listing': {
        'title': 'Premium Product — Demo Mode',
        'bullets': [
            'High-quality construction for lasting durability',
            'Versatile design suitable for multiple occasions',
            'Available in a range of sizes to fit everyone',
            'Easy care instructions — machine washable',
            'Backed by our satisfaction guarantee',
        ],
        'description': 'This premium product delivers exceptional quality and value. Crafted with care and attention to detail, it is designed to meet the needs of discerning buyers who expect nothing but the best.',
        'attributes': {'brand': 'Demo', 'material': 'Mixed', 'dimensions': 'N/A', 'color': 'Varies', 'closure': 'N/A'},
    },
    'variants': [
        {'size': 'S', 'color': 'Blue', 'sku': 'DEMO-S', 'price': '29.99', 'stock': 10},
        {'size': 'M', 'color': 'Blue', 'sku': 'DEMO-M', 'price': '29.99', 'stock': 10},
        {'size': 'L', 'color': 'Blue', 'sku': 'DEMO-L', 'price': '29.99', 'stock': 10},
    ],
    'model_used': 'fallback',
    'best_of_n_comparison': None,
}


def _score_listing(result: dict) -> int:
    """Simple completeness score for Best-of-N selection."""
    listing = result.get('listing', {})
    return (
        int(bool(listing.get('title'))) +
        len([b for b in listing.get('bullets', []) if b]) +
        int(len(listing.get('description', '')) > 100) +
        len([v for v in listing.get('attributes', {}).values() if v and v.lower() not in ('n/a', 'unknown')])
    )


@router.post('/generate')
async def generate_listing(
    images: list[UploadFile] = File(default=[]),
    notes: str = Form(default=''),
    marketplace: str = Form(default='amazon'),
    provider: str = Form(default='anthropic'),
    model: str = Form(default='claude-sonnet-4-6'),
    best_of_n: str = Form(default='false'),
    anthropic_api_key: str = Form(default=''),
    openai_api_key: str = Form(default=''),
):
    if os.environ.get('DEMO_MODE', 'false').lower() == 'true':
        return FALLBACK_RESPONSE

    # Choose which key override to pass (based on provider)
    key_override = (anthropic_api_key if provider == 'anthropic' else openai_api_key) or None

    # Read and encode images (max 5)
    images_b64 = []
    for img in images[:5]:
        raw = await img.read()
        images_b64.append(base64.b64encode(raw).decode())

    system_a = (PROMPTS_DIR / 'listing_system.txt').read_text()
    user_tmpl = (PROMPTS_DIR / 'listing_user.txt').read_text()
    user_text = user_tmpl.replace('{marketplace}', marketplace).replace('{notes}', notes)

    if best_of_n.lower() == 'true':
        system_b = (PROMPTS_DIR / 'listing_system_conversion.txt').read_text()
        try:
            client = LLMClient(provider=provider, model=model, api_key_override=key_override)
            text_a = client.generate(system_a, user_text, images_b64)
            result_a = parse_json_response(text_a)
        except Exception as e:
            print(f'Prompt A error: {e}')
            result_a = FALLBACK_RESPONSE

        try:
            client = LLMClient(provider=provider, model=model, api_key_override=key_override)
            text_b = client.generate(system_b, user_text, images_b64)
            result_b = parse_json_response(text_b)
        except Exception as e:
            print(f'Prompt B error: {e}')
            result_b = FALLBACK_RESPONSE

        score_a = _score_listing(result_a)
        score_b = _score_listing(result_b)
        winner = result_a if score_a >= score_b else result_b

        return {
            **winner,
            'model_used': f'{provider}/{model}',
            'best_of_n_comparison': {
                'winner_score': max(score_a, score_b),
                'loser_score': min(score_a, score_b),
                'prompt_a': 'keyword-optimized',
                'prompt_b': 'conversion-focused',
                'winner_prompt': 'A' if score_a >= score_b else 'B',
            },
        }

    # Single model call
    try:
        client = LLMClient(provider=provider, model=model, api_key_override=key_override)
        text = client.generate(system_a, user_text, images_b64)
        result = parse_json_response(text)
    except Exception as e:
        print(f'LLM error: {e}')
        return FALLBACK_RESPONSE

    return {**result, 'model_used': f'{provider}/{model}', 'best_of_n_comparison': None}
