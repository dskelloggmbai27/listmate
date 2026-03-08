import base64
import json
import os
from typing import Optional

import anthropic
import openai


class LLMClient:
    def __init__(self, provider: str, model: str):
        self.provider = provider
        self.model = model
        if provider == 'anthropic':
            self.client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
        elif provider == 'openai':
            self.client = openai.OpenAI(api_key=os.environ.get('OPENAI_API_KEY', ''))
        else:
            raise ValueError(f'Unknown provider: {provider}')

    def generate(
        self,
        system: str,
        user_text: str,
        images_b64: Optional[list[str]] = None,
    ) -> str:
        """Returns raw text response from the model."""
        images_b64 = images_b64 or []
        if self.provider == 'anthropic':
            return self._anthropic_call(system, user_text, images_b64)
        return self._openai_call(system, user_text, images_b64)

    def _anthropic_call(self, system: str, user_text: str, images_b64: list[str]) -> str:
        content = []
        for b64 in images_b64:
            content.append({
                'type': 'image',
                'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': b64},
            })
        content.append({'type': 'text', 'text': user_text})

        msg = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system,
            messages=[{'role': 'user', 'content': content}],
        )
        return msg.content[0].text

    def _openai_call(self, system: str, user_text: str, images_b64: list[str]) -> str:
        content = []
        for b64 in images_b64:
            content.append({
                'type': 'image_url',
                'image_url': {'url': f'data:image/jpeg;base64,{b64}'},
            })
        content.append({'type': 'text', 'text': user_text})

        resp = self.client.chat.completions.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': content},
            ],
        )
        return resp.choices[0].message.content


def parse_json_response(text: str) -> dict:
    """Strip markdown fences and parse JSON. Raises ValueError on failure."""
    text = text.strip()
    if text.startswith('```'):
        lines = text.split('\n')
        # Remove first line (```json or ```) and last line (```)
        text = '\n'.join(lines[1:-1])
    return json.loads(text.strip())
