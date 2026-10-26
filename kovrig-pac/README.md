# Pacific perspectives

A static Mapbox globe based on `../aus-military`. No build step or runtime
server is required. It retains the shared typography, ocean palette,
atmosphere, explicit zoom controls, and Ctrl/Cmd + scroll zoom behavior.
`basemap.json` uses the same satellite and bathymetry treatments with worldwide
country labels and no inherited regional data overlays. The selected EEZ overlay
and its recognition legend appear only in **Pacific overview**. The Australia,
PRC and US perspectives show the basemap without the EEZ overlay. Panning and
zooming keep the chosen perspective and its overlay visibility.
EEZ lines fade out over 500 ms when leaving Pacific overview and fade back in
over 500 ms after the returning camera movement finishes. Rapid view switches
cancel pending fades, and reduced-motion preferences use immediate changes.

## Preview

Run `python serve.py` from this directory to open a local preview. Use
`python serve.py --port 8000 --no-open` to choose a port without opening a browser.
Open through HTTP rather than double-clicking `index.html`; Mapbox workers
and the GeoJSON request require a web server. Internet access is needed for
Mapbox and the shared web font.

## Perspectives

Edit `views` in `config.js` to change the cameras, labels, descriptions or order.
Buttons are generated from this configuration. `openingView` selects the initial
camera; clicking Pacific overview also resets the globe to that central view.

| View | Direction |
| --- | --- |
| Pacific overview | Central Pacific, north at the top |
| From Australia | North and west toward the PRC |
| From the PRC | East across the Pacific |
| From the US | West across the Pacific |

Bearings are compass headings: `0` is north, `90` is east and `-90` is west.
`center` uses `[longitude, latitude]`; `pitch` sets the tilt. Zoom adapts to the
viewport. There are no regional navigation bounds. These are adjustable
geographic perspectives, not representations of official policy.

## Dataset

`data/pacific.geojson` contains 105 EEZ boundary records extracted from the
user-supplied `claims_allclaims_mapbox (1).geojson`. Only the 17 countries and
territories in the reference screenshot are included:

Cook Islands, Federated States of Micronesia, Fiji, French Polynesia, Kiribati,
Marshall Islands, Nauru, New Caledonia, Niue, Palau, Papua New Guinea, Samoa,
Solomon Islands, Tokelau, Tonga, Tuvalu, and Vanuatu.

The supplied file contains **MultiLineString boundaries**, so the map highlights
outlines rather than inferring filled EEZ polygons. Original coordinates
and antimeridian splits are preserved. Only records with `type` equal to
`Exclusive Economic Zone` are retained; separate continental shelf, territorial
sea and baseline records are excluded. Shared EEZ/continental shelf boundaries
classified as EEZ in the source are retained.

`data/eez-selection.json` records the territory selection and recognition status
from the user's supplied **Recognition of PRC or ROC** table:

- **PRC (solid red):** Cook Islands, Federated States of Micronesia, Fiji, French
  Polynesia, Kiribati, Nauru, New Caledonia, Niue, Papua New Guinea, Samoa,
  Solomon Islands, Tokelau, Tonga, and Vanuatu.
- **ROC (dashed blue):** Marshall Islands, Palau, and Tuvalu.

The table is applied as supplied, including its entries for territories. Each
GeoJSON feature has a `recognition` property. Colors are configured in
`config.js` under `recognitionColors`. ROC boundaries draw above PRC boundaries
with gaps, so both statuses remain visible on shared boundaries. Popups list
recognition for each selected territory hit by the pointer.

French Polynesia and New Caledonia are selected from France's records by
territory name; other French
territories are excluded. Tokelau is selected from New Zealand's records,
including the 1980 US-New Zealand boundary near Tokelau, whose name omits the
territory. The main New Zealand EEZ is excluded. Cook Islands and Niue remain
separate entries as in the source. Shared boundaries may have source records
for both selected territories; their popup lists both names when hit together.

`data/eez-source.json` records the original filename, SHA-256, selection counts
and territory/recognition mapping. Rebuild the subset with the Python standard
library:

```powershell
python scripts/prepare_eez.py "C:\Users\Paul\Downloads\claims_allclaims_mapbox (1).geojson"
```

The original downloaded file is not modified or required at runtime. Source
claimant and boundary names remain in each selected feature. Popup descriptions
are converted from source HTML to plain text; they are never executed as HTML.
In Pacific overview, click near a boundary to see its territory, recognition,
source boundary name and any source description. The relative `dataUrl` in
`config.js` keeps the subset working under the repository's GitHub Pages path.

## GitHub Pages

The parent repository's `.github/workflows/pages.yml` already publishes this
folder at `/crisis-maps/kovrig-pac/` when changes reach `main`. In repository
**Settings > Pages**, select **GitHub Actions** as the source if needed.
No workflow changes are necessary for the parent repository.

All local assets and the dataset URL are relative, so this app also works at
a domain root or under another repository subpath without a build step or
server rewrites. For a standalone repository, use branch-based Pages deployment
from `main` and `/ (root)`; `.nojekyll` is included. The public Mapbox token is
reused from adjacent projects. Replace it in `config.js` if URL restrictions
do not allow the deployed host.

To preview the parent deployment path locally, run
`python -m http.server 8000 --bind 127.0.0.1 --directory ..\..` from this folder,
then open <http://localhost:8000/crisis-maps/kovrig-pac/>.

Mapbox references: [globe and atmosphere](https://docs.mapbox.com/mapbox-gl-js/guides/globe/)
and [feature popups](https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/).
