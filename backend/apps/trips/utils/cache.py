from hashlib import sha256

KEY_DIGEST_LENGTH = 32


def cache_key(namespace: str, *parts: object) -> str:
    raw = "|".join(str(part) for part in parts)
    return f"{namespace}:{sha256(raw.encode()).hexdigest()[:KEY_DIGEST_LENGTH]}"
