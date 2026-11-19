# Repository instructions

Follow [AGENTS.md](AGENTS.md) and the canonical [AI Coding Rules](docs/engineering/AI_CODING_RULES.md).

Before review or completion, perform [Mandatory Anti-Pattern Review](docs/engineering/ANTI_PATTERN_REVIEW.md). Pay special attention to account switching/cache isolation, generation idempotency, bounded polling, shared API error handling, and never presenting a credit debit before persisted voice success is confirmed by the API.