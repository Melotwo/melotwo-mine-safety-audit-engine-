import re

class SecurityException(Exception):
    """Custom exception raised when sensitive PII (e.g., a 13-digit ID) remains in the sanitized string."""
    pass

# South African 13-digit ID Number regex (YYMMDDSSSSCAZ format)
SA_ID_REGEX = re.compile(r'\b\d{13}\b')

# South African Phone Number regex (supports +27, 082, 071, 061, with optional spaces/dashes)
SA_PHONE_REGEX = re.compile(r'(?<!\d)(?:\+27\s?\(?0?\)?\s?|0)[1-8]\d(?:[\s.-]?\d){7}\b')

# Common organizational patterns for names (e.g., 'Operator: John Doe', 'Reported by Jane Smith', 'Attended by Jack')
NAME_PATTERNS = [
    re.compile(r'\b(Operator|Worker|Reported\s+by|Attended\s+by|Auditor|Inspector|Officer|Manager|Supervisor|Consultant)(?:\s*:\s*|\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'),
    re.compile(r'\b(Mr\.?|Ms\.?|Mrs\.?|Dr\.?|Prof\.?|Eng\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b')
]

def replace_name(match):
    prefix = match.group(1)
    full_match = match.group(0)
    if ":" in full_match:
        return f"{prefix}: [WORKER_NAME]"
    return f"{prefix} [WORKER_NAME]"

def sanitize_user_input(text: str) -> str:
    """
    Sanitizes the input text by matching and masking South African specific PII (IDs and Phone Numbers)
    and common named entity patterns to prevent data leaks.
    
    - South African IDs: Replaced with '[ID_MASKED]'
    - Phone Numbers: Replaced with '[PHONE_MASKED]'
    - Named Entities: Replaced with prefix + ' [WORKER_NAME]'
    """
    if not isinstance(text, str) or not text:
        return ""
        
    sanitized = text

    # 1. Mask South African 13-digit ID numbers
    sanitized = SA_ID_REGEX.sub('[ID_MASKED]', sanitized)

    # 2. Mask South African phone numbers
    sanitized = SA_PHONE_REGEX.sub('[PHONE_MASKED]', sanitized)

    # 3. Mask Names based on organizational prefix patterns
    for pattern in NAME_PATTERNS:
        sanitized = pattern.sub(replace_name, sanitized)

    return sanitized


def gatekeeper_wrapper(text: str) -> str:
    """
    Performs sanitization and raises a SecurityException if a 13-digit sequence (potential South African ID)
    is still detected in the output.
    """
    sanitized = sanitize_user_input(text)
    
    # Check if any contiguous 13-digit sequence still exists in the sanitized text, regardless of word boundaries
    if re.search(r'\d{13}', sanitized):
        raise SecurityException("Security breach: Sensitive 13-digit ID sequence detected after sanitization.")
        
    return sanitized
