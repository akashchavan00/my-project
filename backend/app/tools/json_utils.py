"""
Robust JSON extraction utilities for parsing LLM output.

LLMs frequently wrap JSON in markdown code fences, add explanatory text
before/after the JSON, or return a JSON array instead of an object (and
vice versa). This module extracts the first complete, valid JSON value
(object or array) from arbitrary text, ignoring anything that follows it.
"""

import json
import re
from typing import Any, Tuple


_CODE_FENCE_RE = re.compile(r"```(?:json|JSON)?\s*(.*?)```", re.DOTALL)


def _strip_code_fences(text: str) -> str:
    """If the text contains a ```...``` code block, return its inner content.
    Otherwise return the text unchanged."""
    match = _CODE_FENCE_RE.search(text)
    if match:
        return match.group(1).strip()
    return text.strip()


def extract_json_from_text(text: str) -> Tuple[Any, str]:
    """
    Extract the first complete, valid JSON value (object or array) from text.

    Handles:
      - Markdown code fences (```json ... ``` or ``` ... ```)
      - Leading/trailing explanatory text around the JSON
      - JSON arrays ([...]) as well as JSON objects ({...})
      - Trailing "extra data" after a complete JSON value (ignored safely,
        instead of causing a json.JSONDecodeError)

    Returns:
        (parsed_json, raw_json_string)

    Raises:
        ValueError: if no valid JSON value could be found in the text.
    """
    candidate = _strip_code_fences(text)

    decoder = json.JSONDecoder()

    # Try every position where a JSON value could plausibly start,
    # in order, and use raw_decode so trailing "extra data" after a
    # complete value is simply ignored rather than raising an error.
    start_positions = [m.start() for m in re.finditer(r"[\{\[]", candidate)]

    last_error: Exception | None = None
    for start in start_positions:
        try:
            parsed, end = decoder.raw_decode(candidate, start)
            raw_json_str = candidate[start:end]
            return parsed, raw_json_str
        except json.JSONDecodeError as e:
            last_error = e
            continue

    # Fall back: try parsing the whole candidate directly (covers edge
    # cases where there's no '{' or '[' but the text is still valid JSON,
    # e.g. a bare string/number, though unlikely in practice).
    try:
        parsed = json.loads(candidate)
        return parsed, candidate
    except json.JSONDecodeError as e:
        last_error = e

    raise ValueError(
        f"No valid JSON value could be extracted from the response. "
        f"Last parse error: {last_error}"
    )
