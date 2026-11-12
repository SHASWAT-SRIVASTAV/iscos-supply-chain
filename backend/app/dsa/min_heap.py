"""Hand-written array-based MinHeap in pure Python.

No external libraries (no heapq).
Includes:
- Time and space complexity docstrings on every public function
- Generic key-based ordering with tuple support (e.g. (priority, timestamp))
- Ops logging recording sift-up and sift-down element swaps for Algorithm Lab animation
"""
from typing import Any, Callable, Optional, Generic, TypeVar

T = TypeVar("T")

class MinHeap(Generic[T]):
    """Array-backed binary Min-Heap.
    
    In an array-backed heap with 0-based indexing:
    - Left child of index i: 2*i + 1
    - Right child of index i: 2*i + 2
    - Parent of index i: (i - 1) // 2
    
    Time Complexity:
        - push: O(log N)
        - pop: O(log N)
        - peek: O(1)
        - build_heap (heapify): O(N)
    Space Complexity:
        - O(N) where N is number of elements
    """

    def __init__(
        self, 
        key_fn: Optional[Callable[[T], Any]] = None,
        record_ops: bool = False
    ) -> None:
        """Initialize empty MinHeap.
        
        Args:
            key_fn: Custom lambda/function extracting comparable sort key.
                    Defaults to identity (element itself).
            record_ops: If True, tracks sift-up / sift-down operations and swap indices.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        self._heap: list[T] = []
        self._key_fn: Callable[[T], Any] = key_fn if key_fn is not None else (lambda x: x)
        self.record_ops = record_ops
        self.ops_log: list[dict[str, Any]] = []

    def _key(self, item: T) -> Any:
        return self._key_fn(item)

    def _swap(self, i: int, j: int, step_swaps: Optional[list[list[int]]] = None) -> None:
        """Swap elements at indices i and j, recording to step_swaps if present."""
        self._heap[i], self._heap[j] = self._heap[j], self._heap[i]
        if step_swaps is not None:
            step_swaps.append([i, j])

    def push(self, item: T) -> None:
        """Insert a new element into the heap and sift it up to restore heap invariant.
        
        Time Complexity: O(log N) where N is current heap size
        Space Complexity: O(1) auxiliary
        """
        self._heap.append(item)
        swaps: list[list[int]] = []
        self._sift_up(len(self._heap) - 1, swaps)
        
        if self.record_ops:
            self.ops_log.append({
                "op": "push",
                "value": self._key(item),
                "swaps": swaps,
                "heap_after": [self._key(x) for x in self._heap]
            })

    def pop(self) -> T:
        """Extract and return the minimum element from root.
        
        Replaces root with the last element and sifts down.
        
        Time Complexity: O(log N) where N is current heap size
        Space Complexity: O(1) auxiliary
        
        Raises:
            IndexError: If the heap is empty.
        """
        if not self._heap:
            raise IndexError("pop from empty heap")

        root = self._heap[0]
        last = self._heap.pop()
        swaps: list[list[int]] = []

        if self._heap:
            self._heap[0] = last
            self._sift_down(0, swaps)

        if self.record_ops:
            self.ops_log.append({
                "op": "pop",
                "value": self._key(root),
                "swaps": swaps,
                "heap_after": [self._key(x) for x in self._heap]
            })

        return root

    def peek(self) -> T:
        """Return the minimum element without removing it.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        
        Raises:
            IndexError: If the heap is empty.
        """
        if not self._heap:
            raise IndexError("peek from empty heap")
        return self._heap[0]

    def _sift_up(self, idx: int, swaps: list[list[int]]) -> None:
        """Move element at idx up until parent <= current.
        
        Time Complexity: O(log N)
        Space Complexity: O(1)
        """
        current = idx
        while current > 0:
            parent = (current - 1) // 2
            if self._key(self._heap[current]) < self._key(self._heap[parent]):
                self._swap(current, parent, swaps)
                current = parent
            else:
                break

    def _sift_down(self, idx: int, swaps: list[list[int]]) -> None:
        """Move element at idx down until children >= current.
        
        Time Complexity: O(log N)
        Space Complexity: O(1)
        """
        current = idx
        n = len(self._heap)
        while True:
            left = 2 * current + 1
            right = 2 * current + 2
            smallest = current

            if left < n and self._key(self._heap[left]) < self._key(self._heap[smallest]):
                smallest = left

            if right < n and self._key(self._heap[right]) < self._key(self._heap[smallest]):
                smallest = right

            if smallest != current:
                self._swap(current, smallest, swaps)
                current = smallest
            else:
                break

    def to_sorted_list(self) -> list[T]:
        """Drains the heap by repeated pop operations to produce a sorted list (Heap Sort).
        
        Time Complexity: O(N log N)
        Space Complexity: O(N)
        """
        items: list[T] = []
        # Clone heap list to avoid mutating this instance
        clone = MinHeap(key_fn=self._key_fn)
        clone._heap = list(self._heap)
        while len(clone) > 0:
            items.append(clone.pop())
        return items

    def clear(self) -> None:
        """Empty the heap.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        self._heap.clear()
        self.ops_log.clear()

    def __len__(self) -> int:
        """Return the count of elements in the heap.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        return len(self._heap)

    def __bool__(self) -> bool:
        """Return True if heap is non-empty.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        return len(self._heap) > 0
