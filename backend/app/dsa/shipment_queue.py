"""FIFO Shipment Queue wrapping collections.deque in pure Python.

Provides constant-time O(1) operations for managing shipment dispatch flows:
QUEUED -> IN_TRANSIT -> DELIVERED.
"""
from collections import deque
from typing import Any, Optional, Iterator, Generic, TypeVar

T = TypeVar("T")

class ShipmentQueue(Generic[T]):
    """First-In, First-Out (FIFO) queue for logistics dispatch pipelines.
    
    Time Complexity:
        - enqueue (push): O(1)
        - dequeue (pop): O(1)
        - peek: O(1)
        - is_empty: O(1)
    Space Complexity:
        - O(N) where N is number of queued shipments
    """

    def __init__(self, initial_items: Optional[list[T]] = None) -> None:
        """Initialize FIFO shipment queue.
        
        Time Complexity: O(N) where N is len(initial_items)
        Space Complexity: O(N)
        """
        self._deque: deque[T] = deque(initial_items or [])

    def enqueue(self, item: T) -> None:
        """Add an item to the tail of the dispatch queue.
        
        Time Complexity: O(1)
        Space Complexity: O(1) auxiliary
        """
        self._deque.append(item)

    def dequeue(self) -> T:
        """Remove and return the head item from the dispatch queue.
        
        Time Complexity: O(1)
        Space Complexity: O(1) auxiliary
        
        Raises:
            IndexError: If queue is empty.
        """
        if not self._deque:
            raise IndexError("dequeue from empty shipment queue")
        return self._deque.popleft()

    def peek(self) -> Optional[T]:
        """Return the head item without removing it, or None if empty.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        if not self._deque:
            return None
        return self._deque[0]

    def is_empty(self) -> bool:
        """Return True if the queue is empty.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        return len(self._deque) == 0

    def to_list(self) -> list[T]:
        """Return list copy of queued items in FIFO order.
        
        Time Complexity: O(N)
        Space Complexity: O(N)
        """
        return list(self._deque)

    def clear(self) -> None:
        """Clear all items from the queue.
        
        Time Complexity: O(N)
        Space Complexity: O(1)
        """
        self._deque.clear()

    def __len__(self) -> int:
        """Return number of queued items.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        return len(self._deque)

    def __iter__(self) -> Iterator[T]:
        """Iterate over items in FIFO order.
        
        Time Complexity: O(N)
        Space Complexity: O(1)
        """
        return iter(self._deque)
