# Monthly Learn hub update

Run once a month (a scheduled task does this and opens a pull request for clinical review).

1. **Trials** — `python3 tools/refresh_trials.py` rebuilds `data/trials.json` from ClinicalTrials.gov
   (recruiting + not-yet-recruiting sickle cell studies). Then write one or two plain-language
   sentences (about a 5th-grade reading level) for new trials listed in `data/trials_missing_plain.txt`,
   prioritizing US trials and trials that accept people under 22, add them to `data/trials_plain.json`,
   and re-run the script.
2. **Research news** — search PubMed for sickle cell disease papers published in the last ~6 weeks
   (randomized trials, large cohort studies, major journals, FDA decisions). Pick at most 3–5 that matter
   to patients and families. For each, read the abstract and add an item to `data/news.json` with:
   `kid` and `family` versions (short sentences, no jargon), a `picture` that shows the key result as
   "X out of 10" icons, counts, or simple bars (use natural frequencies, never percentages or hazard
   ratios), an `ask` question for the care team, and the PubMed source. Every number must come from the
   abstract. Verify DOIs against PubMed. Keep the newest ~12 items; drop the oldest.
3. **Videos** — optionally add videos from trusted channels (NHLBI, CDC, ASH, St. Jude, children's
   hospitals, SCDAA) to `data/videos.json`; verify each with YouTube oEmbed.
4. Update the `updated` dates, and open a pull request titled "Monthly Learn hub update (Month YYYY)"
   listing every new item with its source so the care team can review before merging.
