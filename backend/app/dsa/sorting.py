"""Custom Merge Sort implementation in pure Python.

DSA-II College Prototype:
- Hand-written divide-and-conquer merge sort
- Stable sorting guarantee (preserves original order of equal keys)
- Generic key-extraction function and reverse support
- No built-in sorted() or list.sort() calls
- Time and space complexity docstring on every public function
"""
from typing import TypeVar, Callable, Optional, Any

T = TypeVar("T")

def merge_sort(
    items: list[T], 
    key: Optional[Callable[[T], Any]] = None, 
    reverse: bool = False
) -> list[T]:
    """Sorts a list using a stable divide-and-conquer merge sort algorithm.
    
    Time Complexity:
        - Best Case: O(N log N)
        - Average Case: O(N log N)
        - Worst Case: O(N log N)
    Space Complexity:
        - O(N) auxiliary memory for merged sublists
        
    Args:
        items: List of elements to sort.
        key: Optional function extracting sort key from each element.
        reverse: If True, sorts in descending order; else ascending.
        
    Returns:
        New sorted list containing all elements.
    """
    if len(items) <= 1:
        return list(items)

    key_fn: Callable[[T], Any] = key if key is not None else (lambda x: x)

    mid = len(items) // 2
    left = merge_sort(items[:mid], key=key_fn, reverse=reverse)
    right = merge_sort(items[mid:], key=key_fn, reverse=reverse)

    return _merge(left, right, key_fn, reverse)

def _merge(
    left: list[T], 
    right: list[T], 
    key_fn: Callable[[T], Any], 
    reverse: bool
) -> list[T]:
    """Merges two sorted lists into a single sorted list preserving stability.
    
    Time Complexity: O(len(left) + len(right))
    Space Complexity: O(len(left) + len(right))
    """
    result: list[T] = []
    i = 0
    j = 0
    len_left = len(left)
    len_right = len(right)

    while i < len_left and j < len_right:
        val_l = key_fn(left[i])
        val_r = key_fn(right[j])

        # For stability on equal values, take left item first
        if not reverse:
            if val_l <= val_r:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        else:
            if val_l >= val_r:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1

    # Append remaining elements
    if i < len_left:
        result.extend(left[i:])
    if j < len_right:
        result.extend(right[j:])

    return result
