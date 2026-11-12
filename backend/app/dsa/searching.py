"""Binary Search algorithm in pure Python for sorted datasets.

Provides logarithmic O(log N) lookup time for searching products by SKU or name
in sorted lists, complete with duplicate handling and edge case defense.
"""
from typing import TypeVar, Callable, Optional, Any

T = TypeVar("T")

def binary_search(
    sorted_items: list[T], 
    target_value: Any, 
    key: Optional[Callable[[T], Any]] = None
) -> Optional[int]:
    """Finds the index of an element matching target_value in a sorted list.
    
    If duplicates exist, returns the first occurrence (leftmost index).
    
    Time Complexity:
        - Best Case: O(1)
        - Average Case: O(log N)
        - Worst Case: O(log N)
    Space Complexity:
        - O(1) iterative execution
        
    Args:
        sorted_items: A list sorted in ascending order of key.
        target_value: The value to search for.
        key: Optional function extracting comparable value from each element.
        
    Returns:
        Index of the matching element in sorted_items, or None if not found.
    """
    if not sorted_items:
        return None

    key_fn: Callable[[T], Any] = key if key is not None else (lambda x: x)

    low = 0
    high = len(sorted_items) - 1
    found_idx: Optional[int] = None

    while low <= high:
        mid = (low + high) // 2
        mid_val = key_fn(sorted_items[mid])

        if mid_val == target_value:
            found_idx = mid
            # Continue searching left to locate the earliest duplicate
            high = mid - 1
        elif mid_val < target_value:
            low = mid + 1
        else:
            high = mid - 1

    return found_idx
