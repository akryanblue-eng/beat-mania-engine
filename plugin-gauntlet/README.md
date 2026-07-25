# Plugin Gauntlet

Plugin Gauntlet is an evidence-based survival test for VST processors.

A plugin does not earn a place in the production toolkit because its presets
sound impressive in isolation. It must perform inside two completed musical
contexts, survive technical observation, and receive an explicit verdict backed
by committed evidence.

The operating rule is:

> **One plugin → two finished beats → one evidenced verdict**

No preset tourism. No endless tweaking. No verdict without rendered work.

*frequency-fight-club* is the internal presentation and scoring framework used
by Plugin Gauntlet. It is not a separate repository.

## The two trials

Every plugin must complete two materially different trials.

### Beat 01 — Primary Musical Use

Use the plugin in its expected or strongest production role. For example:

- Dynamic EQ controlling a vocal or instrument
- Saturation shaping drums or bass
- Reverb establishing a primary space
- Compressor controlling a lead source
- Modulation effect providing musical movement

Beat 01 tests whether the plugin performs its advertised core function inside a
finished production.

### Beat 02 — Material Stress Test

Use the same plugin in a meaningfully different or more demanding role. For
example:

- Severe transient material
- Dense arrangement
- Extreme modulation settings
- Saturation stacking
- Parallel processing
- Low-latency monitoring
- Automation-heavy movement
- High sample-rate or CPU-sensitive use
- Unusual sound-design application

Beat 02 may not simply repeat Beat 01 with a different preset. The two trials
must demonstrate different production demands.

## Required evidence

A completed plugin evaluation must record:

1. Plugin name
2. Plugin version
3. Plugin class
4. Role in Beat 01
5. Role in Beat 02
6. Relevant preset or parameter notes
7. Rendered evidence references
8. CPU, latency, or stability observations
9. Frequency Fight Club ratings
10. Final verdict

Frequency Fight Club ratings are **Punch**, **Warmth**, **Width**, **Movement**,
and **CPU Damage**. Ratings use a 0–100 scale except CPU Damage, which may also
include an observed percentage or plain-language technical note in the evidence
files.

## Allowed verdicts

Only these verdicts are valid. No other verdict text is permitted.

| Verdict | Meaning |
|---|---|
| `SURVIVES` | Performs reliably across both trials and earns a place in the primary production toolkit. |
| `SPECIALIST` | Highly effective in a specific role, but not an everyday default. |
| `BENCHED` | Works, but does not outperform existing defaults enough to justify regular use. |
| `DISQUALIFIED` | Fails because of instability, unacceptable CPU cost, poor fidelity, workflow friction, repeatable technical defects, or failure across the two trials. |

## Pass contract

A plugin evaluation passes only when all of the following are true:

- Beat 01 is finished.
- Beat 02 is finished.
- The two beats use the plugin in materially different roles.
- Evidence exists under both beat directories.
- Plugin identity and version are recorded.
- Relevant settings or preset notes are recorded.
- CPU, latency, or stability observations are recorded.
- Rendered evidence is referenced.
- The scorecard contains a genuine populated row.
- The Verdict cell contains exactly one allowed verdict.
- CI validates both evidence directories and the populated verdict.
- Existing Beat Mania tests and engine verification remain green.

A placeholder row, example row, fictional row, or documentation sample does not
count as evidence.

## Scorecard integrity rule

`SCORECARD.md` may contain only:

1. The canonical survival-matrix header
2. The canonical separator
3. The empty placeholder row before the first real trial
4. Genuine evaluation rows backed by two-beat evidence

Do not add illustrative, fictional, demonstration, or sample completed rows to
`SCORECARD.md`. Any explanatory example belongs here in `README.md` instead.

### Illustrative example (not evidence)

The following row is documentation only. It describes the shape a real entry
takes and must never be copied into `SCORECARD.md`:

| Plugin | Version | Class | Beat 01 Role | Beat 02 Role | Punch | Warmth | Width | Movement | CPU Damage | Verdict | Evidence |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| Example Comp | 0.0.0 | Compressor | Lead vocal control | Parallel drum smash | 70 | 55 | 40 | 30 | 25 | `SPECIALIST` | `beat-01/`, `beat-02/` |

## Current state

No plugin has entered the gauntlet yet. `SCORECARD.md` holds the canonical
header, the canonical separator, and a single empty placeholder row.

The `beat-01/` and `beat-02/` evidence directories are intentionally absent.
They belong to the first real plugin-evidence slice and must contain actual
tracked evidence when introduced.

## CI enforcement

The `plugin-gauntlet` job in `.github/workflows/beat-mania-ci-gate.yml` runs on
pull requests carrying the `gauntlet` label (and on this protocol branch). At
this stage it fails closed on:

- a missing or empty `README.md`
- a missing or empty `SCORECARD.md`
- a scorecard header that does not match the canonical schema
- a scorecard separator that does not match the canonical schema

Beat-directory checks and verdict-row checks are deliberately **not** part of
this slice. They arrive with the first real evidence pull request.
