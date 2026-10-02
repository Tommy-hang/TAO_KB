Read the entire transcript before writing. Return understanding.json according to the understanding schema supplied in schemas.json.

Classify contentType as framework, observation, narrative, public-affairs, case-analysis, or other. Preserve nativeLogic order, every structural chapter, source timestamps, dependencies, mustPreserve reasoning, structural cases, systemVocabulary, ASR uncertainty, numberingIssues and distortionRisks. Do not write the final note yet.

For narrative include eventTimeline AND interpretationTimeline. For observation include evidenceLadder (observedCue, authorHypothesis, crossCheckEvidence[], context, confidence low/medium/high). If no cross-check, confidence must be low. Confidence describes source evidence strength, never truth probability. If reliable time ranges are unavailable, ask the human to supply timestamped source; do not invent them.
