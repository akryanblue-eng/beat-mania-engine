# ModMatrix — Canon Area Spec (v1)

> The modulation matrix exposes mutations; it does not persist, publish, or audit them.

This directory implements exactly four things, in this order, and nothing else:

1. **Types** (`mod_matrix.types.ts`) — the route contract and identifiers.
2. **Mutation validation** (`mod_matrix.validate.ts`) — boundary rules for add/update/remove.
3. **Deterministic evaluator** (`mod_matrix.eval.ts`) — pure curve/polarity accumulator.
4. **One-pole smoothing** (`mod_matrix.smooth.ts`) — parameter smoothing after accumulation.

## 1. Types

`ModRoute` carries no persistence fields, no timestamps, no ledger metadata.
`amount` is a finite number in `[-1, 1]`. Source/destination/curve/polarity are
closed discriminator unions; their runtime mirrors (`MOD_SOURCES`, etc.) are the
single source of truth for validation.

## 2. Mutation rules

The mutation layer owns route creation, update, and removal:

- `id` must be non-empty and unique → violation reports `duplicate-id`
- `source`, `destination`, `curve`, `polarity` must be supported values
- `amount` must be finite and within `[-1, 1]`
- **Beat Mania v1 allows only one *active* (enabled) route per
  source/destination pair** → violation reports `duplicate-route`
- an update cannot create a duplicate active pair
- update/remove of an unknown id reports `route-not-found`

The duplicate-pair rule lives here, in the mutation layer — not in `ModRoute`.
All mutations are pure: they return a new route list inside `MutationResult`.

## 3. Deterministic evaluator

For each **enabled** route, in the order routes appear:

1. Read the source value (`undefined` reads as `0`).
2. Clamp it to `[-1, 1]`.
3. Extract sign.
4. Apply the curve to the magnitude.
5. Reapply sign for bipolar routes (unipolar routes discard it).
6. Multiply by the route amount.
7. Sum into the destination accumulator.

Canonical curve shapes, over magnitude `m ∈ [0, 1]` (pinned here so "expo" and
"log" mean one thing, forever):

| Curve    | Formula |
| -------- | ------- |
| `linear` | `m`     |
| `expo`   | `m²`    |
| `log`    | `√m`    |

Same inputs and same route order must produce identical output. No clock reads,
randomness, persistence, or audio-node mutation inside the evaluator.

## 4. One-pole smoothing

Smoothing sits after destination accumulation and before applying values to
audio parameters. Standard continuous one-pole equation:

```
alpha = 1 - e^(-1 / (fs * tau))
next  = current + alpha * (target - current)
```

Where:

- `fs` is the control evaluation rate in Hz (e.g. control-rate 1 kHz)
- `tau` is the target response time in seconds (`tau = 0` ⇒ `alpha = 1`, instant)
- `alpha` must be finite and constrained to `[0, 1]`

Guarantees under valid inputs: monotonic convergence toward the target without
overshoot, symmetrical damping across positive and negative steps, and
floating-point stability (no drift, no NaN accumulation). Smoothing state is
independent per destination.

## Stop condition (literal)

- Types complete
- Validation tests green
- Evaluator tests green
- Smoothing tests green
- **STOP**

No UI grid. No presets. No MIDI. No oscillator stack. No ledger adapter. No
engine wiring.
