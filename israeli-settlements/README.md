# Israeli settlements map

A static Mapbox GL JS visualisation with English (`index.html`) and Arabic
(`ar.html`) versions. No build step or package installation is required.

## Local preview

With Python 3 installed, run from this directory:

```sh
python serve.py
```

The server chooses an available localhost port and opens the map in your browser.
Press Ctrl+C to stop it. To choose a port or skip opening the browser:

```sh
python serve.py --port 8000 --no-browser
```

Open `http://127.0.0.1:8000/`. The language control switches between local pages
and preserves query parameters such as `?view=e1`. The server also works when
invoked by its file path from another directory.

Use HTTP preview instead of opening the HTML through `file://`. An internet
connection is required for Mapbox scripts, styles, tiles and hosted fonts.
The public Mapbox token is in each HTML file; if URL restrictions are enabled,
allow the localhost and deployment URLs.

## Map controls

The current English and Arabic maps use Mapbox's cooperative gestures: hold Ctrl
on Windows or Cmd on macOS while scrolling to zoom. Scrolling without the key
shows the built-in platform-specific helper. Zoom buttons remain available;
touch panning uses two fingers.

The slider starts at 1994 and still covers 1967–2026. Areas A, B and C appear
from 1994 onward; barrier layers appear from 2003 onward. `2024.html` is the
archived edition.

## GitHub Pages

The app needs only static hosting. Local assets and language links use relative
paths, so it works at a domain root or a repository subpath.

In the current `CrisisGroup/crisis-maps` repository, the root workflow
(`../.github/workflows/pages.yml`) deploys all maps on every push to `main`.
Set **Settings → Pages → Source → GitHub Actions** once in that repository.
The map's default Pages URL is
`https://crisisgroup.github.io/crisis-maps/israeli-settlements/`.
The workflow can also be run manually from the Actions tab on `main`.

For a standalone repository containing this directory's contents, select
**Settings → Pages → Source → GitHub Actions**, then push to `main` or run
**Deploy to GitHub Pages**. The included workflow uploads HTML, CSS and images.
Python is only used for local preview.

Alternatively, use branch-based Pages deployment with `main` and `/ (root)`.
The `.nojekyll` file is included. When hosted within the parent `crisis-maps`
repository, the app works at `/crisis-maps/israeli-settlements/`; its nested
workflow only runs if this directory is the root of a standalone repository.

To preview a repository subpath, serve the workspace with
`python -m http.server 8000 --bind 127.0.0.1` and visit
`http://127.0.0.1:8000/crisis-maps/israeli-settlements/`.
