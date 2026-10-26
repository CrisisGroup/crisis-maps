"""Extract the selected Pacific EEZ boundaries from the supplied claims GeoJSON.

Usage: python scripts/prepare_eez.py "path/to/claims_allclaims_mapbox (1).geojson"
Uses only the Python standard library. Source geometry is preserved exactly.
"""

import argparse
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
import math
from pathlib import Path


APP_DIRECTORY = Path(__file__).resolve().parents[1]
EEZ_TYPE = "Exclusive Economic Zone"


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def text_content(value):
    parser = PlainText()
    parser.feed(value or "")
    return " ".join(" ".join(parser.parts).split())


def matches(properties, rule):
    if properties.get("claimant") != rule["claimant"]:
        return False
    name = properties.get("name", "")
    return ("name_contains" not in rule or rule["name_contains"] in name
            or name in rule.get("additional_names", []))


def prepare(source_path):
    raw_source = source_path.read_bytes()
    source = json.loads(raw_source.decode("utf-8-sig"))
    rules = json.loads((APP_DIRECTORY / "data/eez-selection.json").read_text(encoding="utf-8"))
    for rule in rules:
        if rule.get("recognition") not in {"PRC", "ROC"}:
            raise ValueError(f"Missing or invalid recognition for {rule['territory']}")
    selected = []
    for index, feature in enumerate(source["features"]):
        properties = feature.get("properties", {})
        if properties.get("type") != EEZ_TYPE:
            continue
        matched = [rule for rule in rules if matches(properties, rule)]
        if not matched:
            continue
        if len(matched) != 1:
            raise ValueError(f"Ambiguous territory for source feature {index}")
        geometry = feature["geometry"]
        if geometry["type"] != "MultiLineString":
            raise ValueError(f"Unexpected EEZ geometry in source feature {index}")
        for line in geometry["coordinates"]:
            if len(line) < 2:
                raise ValueError(f"Incomplete line in source feature {index}")
            for lon, lat, *_ in line:
                if not (math.isfinite(lon) and math.isfinite(lat) and -180 <= lon <= 180 and -90 <= lat <= 90):
                    raise ValueError(f"Invalid coordinate in source feature {index}")
            if any(abs(a[0] - b[0]) > 180 for a, b in zip(line, line[1:])):
                raise ValueError(f"Unsplit antimeridian crossing in source feature {index}")
        selected.append({
            "type": "Feature",
            "id": index,
            "properties": {
                "title": matched[0]["territory"],
                "territory": matched[0]["territory"],
                "recognition": matched[0]["recognition"],
                "claimant": properties["claimant"],
                "name": properties["name"].strip(),
                "description": text_content(properties.get("description")),
                "type": EEZ_TYPE,
            },
            "geometry": geometry,
        })
    counts = Counter(feature["properties"]["territory"] for feature in selected)
    missing = {rule["territory"] for rule in rules} - counts.keys()
    if missing:
        raise ValueError(f"No EEZ features found for: {', '.join(sorted(missing))}")
    output = APP_DIRECTORY / "data/pacific.geojson"
    output.write_text(json.dumps({"type": "FeatureCollection", "features": selected},
                                 ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    provenance = {
        "source_file": source_path.name,
        "source_sha256": hashlib.sha256(raw_source).hexdigest(),
        "source_feature_count": len(source["features"]),
        "selected_feature_count": len(selected),
        "selected_territory_count": len(counts),
        "geometry": "Original MultiLineString boundary coordinates, including antimeridian splits; no area polygons inferred.",
        "selection": "Only Exclusive Economic Zone records assigned to the territories in eez-selection.json.",
        "tokelau_boundary": "The New Zealand record named United States-New Zealand EEZ and Continental Shelf Boundary (1980) lies at 173.75-168.52 W and 11.04-10.02 S and is included with Tokelau.",
        "features_by_territory": {rule["territory"]: counts[rule["territory"]] for rule in rules},
        "recognition_source": "User-provided Recognition of PRC or ROC table; applied to countries and territories exactly as supplied.",
        "recognition_by_territory": {rule["territory"]: rule["recognition"] for rule in rules},
    }
    (APP_DIRECTORY / "data/eez-source.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(selected)} EEZ features for {len(counts)} countries and territories to {output}")
    for territory, count in provenance["features_by_territory"].items():
        print(f"  {territory}: {count}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Original all-claims GeoJSON")
    prepare(parser.parse_args().source)
