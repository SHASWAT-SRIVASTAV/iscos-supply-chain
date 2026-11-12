"""Custom Hash Registry wrapping Python's built-in dictionary.

Provides O(1) average-time record lookups, insertions, updates, and deletions
by key, specifically designed for viva explainability in DSA-II.
"""
from typing import TypeVar, Generic, Iterator, Optional, Any

T = TypeVar("T")

class HashRegistry(Generic[T]):
    """Hash-based entity registry wrapping a hash table.
    
    Provides constant-time average lookups by entity ID.
    
    Time Complexity:
        - get: O(1) average, O(N) worst-case collision
        - set: O(1) average, O(N) worst-case resize
        - delete: O(1) average, O(N) worst-case collision
        - has: O(1) average
        - values: O(N)
    Space Complexity:
        - O(N) where N is the number of stored entities.
    """

    def __init__(self, initial_items: Optional[dict[str, T]] = None) -> None:
        """Initialize registry with optional existing items.
        
        Time Complexity: O(N) where N is len(initial_items)
        Space Complexity: O(N)
        """
        self._table: dict[str, T] = {}
        if initial_items:
            for key, val in initial_items.items():
                self._table[str(key)] = val

    def get(self, key: str) -> Optional[T]:
        """Lookup an entity by its string identifier.
        
        Time Complexity: O(1) average, O(N) worst-case
        Space Complexity: O(1)
        """
        return self._table.get(str(key))

    def set(self, key: str, value: T) -> None:
        """Store or overwrite an entity by key.
        
        Time Complexity: O(1) average, O(N) amortized on table resize
        Space Complexity: O(1) auxiliary
        """
        self._table[str(key)] = value

    def delete(self, key: str) -> bool:
        """Remove an entity by key. Returns True if deleted, False if not found.
        
        Time Complexity: O(1) average, O(N) worst-case
        Space Complexity: O(1)
        """
        if str(key) in self._table:
            del self._table[str(key)]
            return True
        return False

    def has(self, key: str) -> bool:
        """Check if a key exists in the registry.
        
        Time Complexity: O(1) average
        Space Complexity: O(1)
        """
        return str(key) in self._table

    def values(self) -> list[T]:
        """Return a list copy of all stored entities.
        
        Time Complexity: O(N) where N is number of elements
        Space Complexity: O(N)
        """
        return list(self._table.values())

    def items(self) -> list[tuple[str, T]]:
        """Return all (key, entity) pairs.
        
        Time Complexity: O(N)
        Space Complexity: O(N)
        """
        return list(self._table.items())

    def clear(self) -> None:
        """Remove all entries from the registry.
        
        Time Complexity: O(N)
        Space Complexity: O(1)
        """
        self._table.clear()

    def __len__(self) -> int:
        """Return the count of stored entities.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        return len(self._table)

    def __iter__(self) -> Iterator[str]:
        """Iterate over registry keys.
        
        Time Complexity: O(N)
        Space Complexity: O(1)
        """
        return iter(self._table)
