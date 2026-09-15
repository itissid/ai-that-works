---
speaker: Antonio
company: Boundary
date: 2026-05-21
talk: Using AI and Miri to Find a Race Condition in Rust Code
---

Antonio asked Claude to find race conditions in unsafe Rust heap code using Miri. It wrote a test, ran it, Miri flagged a real data race. The bug: vector reallocation while another thread still holds a pointer to the old memory. Talk link:
