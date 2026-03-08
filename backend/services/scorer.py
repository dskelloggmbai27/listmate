import re

AMBIGUOUS_PHRASES = [
    r'\bstandard size\b', r'\bfits most\b', r'\bapproximately\b',
    r'\babout\b', r'\broughly\b', r'\bone size\b', r'\bsimilar to\b',
    r'\baround\b',
]

REQUIRED_FIELDS = ['dimensions', 'material']


def rule_based_qa(listing: dict) -> tuple[list[dict], float]:
    """Returns (issues, deduction). Issues found by deterministic rules only."""
    issues = []
    deduction = 0.0
    attrs = listing.get('attributes', {})
    full_text = ' '.join([
        listing.get('title', ''),
        listing.get('description', ''),
        *listing.get('bullets', []),
    ]).lower()

    # Missing required fields
    for field in REQUIRED_FIELDS:
        val = str(attrs.get(field) or '').strip()
        if not val or val.lower() in ('', 'n/a', 'unknown'):
            issues.append({
                'field': f'attributes.{field}',
                'type': 'missing',
                'message': f'Missing: {field} — add exact {field} to reduce returns',
            })
            deduction += 1.0

    # Ambiguous phrases
    seen_phrases = set()
    for pattern in AMBIGUOUS_PHRASES:
        matches = re.findall(pattern, full_text, re.IGNORECASE)
        if matches:
            phrase = matches[0]
            if phrase not in seen_phrases:
                seen_phrases.add(phrase)
                issues.append({
                    'field': 'listing text',
                    'type': 'ambiguous',
                    'message': f'Ambiguous: "{phrase}" — replace with specific measurements or values',
                })
                deduction += 0.5

    return issues, deduction
