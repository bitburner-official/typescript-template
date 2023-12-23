#!/bin/env python3

#####
# Merge Overlapping Intervals
# You are attempting to solve a Coding Contract. You have 15 tries remaining, after which the contract will self-destruct
# Given the following array of arrays of numbers representing a list of intervals, merge all overlapping intervals.
#
# [[2,3],[18,25],[24,32]]
#
# Example:
#
# [[1, 3], [8, 10], [2, 6], [10, 16]]
#
# would merge into [[1, 6], [8, 16]].
#
# The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always be smaller than the second.

# intervals: [[int]] = [[1, 3], [8, 10], [2, 6], [10, 16]]
intervals: [[int]] = [[2,3],[18,25],[24,32]]

intervals.sort(key=lambda x: x[0])

def maybe_merge(a:[int], b:[int]) -> [int]:
    if not included(b[0], a):
        return None
    new_int = a
    if not included(b[1], a):
        new_int[1] = b[1]
    return new_int

def included(x: int, a: [int]) -> bool:
    return x >= a[0] and x <= a[1]

print(f"Sorted intervals: {intervals}")

merged_intervals: [[int]] = []
current = intervals[0]

for idx in range(1, len(intervals)):
    merged = maybe_merge(current, intervals[idx])
    if merged:
        current = merged
    else:
        merged_intervals.append(current)
        current = intervals[idx]

merged_intervals.append(current)

merged_intervals.sort(key=lambda x: x[0])

print(f"{merged_intervals}")
