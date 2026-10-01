from collections import Counter
from typing import List, Dict


def count_vehicles(detections: List[Dict]) -> Dict[str, int]:
    """Count detections per class.

    Args:
        detections: List of detection dicts with a ``class`` key.
    Returns:
        Mapping from class name (lowercase) to count.
    """
    cnt = Counter()
    for det in detections:
        class_name = det.get("class", "unknown").lower()
        cnt[class_name] += 1
    return dict(cnt)
