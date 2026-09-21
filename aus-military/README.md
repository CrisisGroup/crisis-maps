# Australia’s maritime linkages

A static, one-page Mapbox GL JS app. No build step is required.

## GitHub Pages

Publish this directory as the root of its own GitHub repository. In that
repository, select **Settings → Pages → Build and deployment → Source →
GitHub Actions**, then push to `main` or run **Deploy to GitHub Pages** manually
from the Actions tab. The workflow publishes only the static app files.

The site works at `https://<owner>.github.io/<repository>/` as well as on a
custom domain: local assets use relative paths, and all external resources use
HTTPS. Python is only a local preview tool and is not required on GitHub Pages.
If the Mapbox public token has URL restrictions, allow the deployed site URL
in the token's settings or update `config.js` with a suitable public token.

For branch-based Pages deployment instead, select `main` and `/ (root)` as the
publishing source; `.nojekyll` keeps the static files from Jekyll processing.
If these files are hosted inside the parent `crisis-maps` Pages site, they also
work at `/crisis-maps/aus-military/`; the nested workflow only runs when this
directory is the root of its own repository.

See [GitHub's Pages workflow setup](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Local preview

Run `python serve.py` from this directory. It starts a localhost server and opens
the app in your browser. Press Ctrl+C in the terminal to stop the server.

Alternatively, run `python -m http.server 8000 --bind 127.0.0.1` and open
<http://localhost:8000>.

Do not double-click `index.html`: browsers can block Mapbox's worker scripts
when the page is opened through `file://`, leaving the map stuck loading or
reporting `Refused to cross-origin redirects of the top-level worker script.`
An internet connection is required for Mapbox's JavaScript, styles and tiles.

`config.js` contains the public Mapbox token, basemap and three camera presets.
The opening camera uses globe projection, a 30° pitch and a −28° bearing
(northwest), centered at 135°E, 8°S with a desktop zoom of 2.8. It focuses on
Australia and Asia; use Pacific overview to see the US west coast.
Navigation is constrained by `maxBounds` from 65°E to 250°E (110°W), and
55°S to 65°N. The unwrapped eastern longitude keeps the bounds continuous
across the Pacific antimeridian. Mapbox may adjust zoom to respect these bounds.
Mapbox automatically transitions globe to Mercator at high zoom levels.

The public token is reused from the adjacent Crisis Maps apps. If its allowed
URLs do not include your host, replace it with an appropriate public token.

No maritime routes are asserted in this initial version. `app.js` provides an
empty `maritime-linkages` GeoJSON source and line layer for verified route data.
Use waterway waypoints and split any routes crossing the antimeridian before
adding them. Do not use straight origin/destination lines as shipping tracks.

Reference: [Mapbox globe documentation](https://docs.mapbox.com/mapbox-gl-js/guides/globe/).
