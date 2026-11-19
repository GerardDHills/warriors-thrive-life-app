#!/usr/bin/env python3
"""Pull recruiting sickle cell disease trials from ClinicalTrials.gov (API v2) into data/trials.json.

Run monthly. Plain-language summaries live in data/trials_plain.json ({"NCT...": "one or two kid-friendly sentences"});
trials without one fall back to an automatic description. Usage: python3 tools/refresh_trials.py
"""
import json, re, sys, urllib.parse, urllib.request, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
API = "https://clinicaltrials.gov/api/v2/studies"
STATUSES = ["RECRUITING", "NOT_YET_RECRUITING"]

def fetch_all():
    out, token = [], None
    while True:
        q = {"query.cond": "sickle cell", "filter.overallStatus": ",".join(STATUSES), "pageSize": "200", "format": "json"}
        if token: q["pageToken"] = token
        with urllib.request.urlopen(API + "?" + urllib.parse.urlencode(q), timeout=60) as r:
            d = json.load(r)
        out += d.get("studies", [])
        token = d.get("nextPageToken")
        if not token: return out

def years(s):
    if not s: return None
    m = re.match(r"([\d.]+)\s*(Year|Month|Week|Day)", s)
    if not m: return None
    v = float(m.group(1)); u = m.group(2)
    return round(v if u == "Year" else v / 12 if u == "Month" else v / 52 if u == "Week" else v / 365, 2)

def kind(p):
    ivs = p.get("armsInterventionsModule", {}).get("interventions", []) or []
    types = {i.get("type") for i in ivs}
    text = " ".join([p["identificationModule"].get("briefTitle", "")] + [i.get("name", "") for i in ivs]).lower()
    if p.get("designModule", {}).get("studyType") == "OBSERVATIONAL": return "watch"
    if re.search(r"\bgene\b|gene-modified|crispr|exa-cel|lovo-cel|\bediting\b|lentivir|autologous cd34|ctx001|beam-101", text): return "gene"
    if re.search(r"transplant|haploidentical|hsct|bone marrow|stem cell", text): return "transplant"
    if "DRUG" in types or "BIOLOGICAL" in types: return "medicine"
    if "BEHAVIORAL" in types or re.search(r"app\b|mobile|text messag|coaching|education|program|training", text): return "program"
    if "DEVICE" in types: return "device"
    return "other"

KIND_LABEL = {"watch": "Watching and learning (no new treatment)", "gene": "Gene therapy", "transplant": "Transplant",
              "medicine": "Testing a medicine", "program": "App, class or program", "device": "Testing a device", "other": "Other study"}

def simplify(s):
    p = s["protocolSection"]; idm = p["identificationModule"]; e = p.get("eligibilityModule", {})
    conds = p.get("conditionsModule", {}).get("conditions", []) or []
    title = idm.get("briefTitle", "")
    if not any("sickle" in c.lower() for c in conds) and "sickle" not in title.lower(): return None
    if len(conds) > 5 and "sickle" not in title.lower(): return None   # SCD is one of many listed conditions
    locs = p.get("contactsLocationsModule", {}).get("locations", []) or []
    countries = sorted({l.get("country") for l in locs if l.get("country")})
    us_states = sorted({l.get("state") for l in locs if l.get("country") == "United States" and l.get("state")})
    ivs = p.get("armsInterventionsModule", {}).get("interventions", []) or []
    k = kind(p)
    return {
        "nct": idm["nctId"], "title": title, "status": p.get("statusModule", {}).get("overallStatus"),
        "kind": k, "kindLabel": KIND_LABEL[k],
        "phase": ", ".join(p.get("designModule", {}).get("phases", []) or []).replace("PHASE", "Phase ").replace("_", " ").replace("NA", "").strip(", ") or None,
        "minAge": years(e.get("minimumAge")), "maxAge": years(e.get("maximumAge")),
        "minAgeText": e.get("minimumAge"), "maxAgeText": e.get("maximumAge"),
        "healthy": e.get("healthyVolunteers", False),
        "testing": [i.get("name") for i in ivs][:4],
        "sponsor": p.get("sponsorCollaboratorsModule", {}).get("leadSponsor", {}).get("name"),
        "countries": countries, "usStates": us_states, "sites": len(locs),
        "url": f"https://clinicaltrials.gov/study/{idm['nctId']}",
        "lastUpdate": p.get("statusModule", {}).get("lastUpdatePostDateStruct", {}).get("date"),
    }

def main():
    studies = fetch_all()
    plain = {}
    pf = ROOT / "data" / "trials_plain.json"
    if pf.exists(): plain = json.loads(pf.read_text())
    trials = [t for t in (simplify(s) for s in studies) if t]
    for t in trials:
        t["plain"] = plain.get(t["nct"])
    trials.sort(key=lambda t: (t["status"] != "RECRUITING", "United States" not in t["countries"], t["title"]))
    out = {"updated": datetime.date.today().isoformat(), "source": "ClinicalTrials.gov", "count": len(trials), "trials": trials}
    (ROOT / "data" / "trials.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
    missing = [t["nct"] for t in trials if not t["plain"]]
    print(f"{len(trials)} trials written; {len(missing)} without a plain-language summary")
    (ROOT / "data" / "trials_missing_plain.txt").write_text("\n".join(missing))

if __name__ == "__main__":
    main()
