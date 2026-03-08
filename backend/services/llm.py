import base64
import json
import os
from typing import Optional

import anthropic
import openai


class LLMClient:
    def __init__(self, provider: str, model: str, api_key_override: Optional[str] = None):
        self.provider = provider
        self.model = model
        if provider == 'anthropic':
            api_key = api_key_override or os.environ.get('ANTHROPIC_API_KEY')
            if not api_key or api_key.startswith('sk-ant-your'):
                raise ValueError('ANTHROPIC_API_KEY is not configured. Add it to backend/.env or set it in Account Settings.')
            self.client = anthropic.Anthropic(api_key=api_key)
        elif provider == 'openai':
            api_key = api_key_override or os.environ.get('OPENAI_API_KEY')
            if not api_key or api_key.startswith('sk-your'):
                raise ValueError('OPENAI_API_KEY is not configured. Add it to backend/.env or set it in Account Settings.')
            self.client = openai.OpenAI(api_key=api_key)
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
    """Extract and parse JSON from LLM response. Tolerates markdown fences and prose."""
    text = text.strip()
    # Find the outermost JSON object boundaries
    start = text.find('{')
    end = text.rfind('}')
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f'No JSON object found in response: {text[:200]}')
    return json.loads(text[start:end + 1])
