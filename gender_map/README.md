# Gender and Conflict map

Static Mapbox GL JS page; no build step or package installation is needed.

## Local preview

From this directory, run:

```sh
python3 serve.py
```

The launcher chooses a free localhost port, prints the URL, and opens your
browser. Stop it with Ctrl+C. It also works from another directory:

```sh
python3 crisis-maps/gender_map/serve.py
```

For a fixed port or to avoid automatically opening a browser:

```sh
python3 serve.py --port 8028 --no-browser
```

Alternatively, from this directory run `python3 -m http.server 8028 --bind
127.0.0.1` and visit <http://127.0.0.1:8028/>. Opening `index.html` directly
with `file://` does not work reliably with fetched data and Mapbox workers.
Internet access is required for Mapbox scripts, styles, tiles, and Adobe fonts.

## GitHub Pages

To host within the existing `crisis-maps` repository:

1. Commit the app files, including `data/countries_2026_clean.geojson` (the active
   dataset), `style.css`, and `images/`, and push to the intended publishing branch.
2. In **Settings → Pages → Build and deployment**, choose **Deploy from a branch**,
   then that branch and **/ (root)**. If the repository already publishes via
   Pages, retain its existing setup and ensure this directory is included.
3. Visit `https://<owner>.github.io/crisis-maps/gender_map/` after deployment.
   Use the equivalent `/gender_map/` path if this repository has a custom domain.

For a standalone site, copy this directory's contents to the root of its own
repository and select its publishing branch and **/ (root)**. Its URL will be
`https://<owner>.github.io/<repository>/`. The included `.nojekyll` is useful
when this directory becomes the publishing root.

All app asset paths are relative, so both layouts work. Pages serves the static
files directly; it does not run Python. Branch publishing accepts the repository
root or `/docs`, not an arbitrary `gender_map` source folder. See
[GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The public Mapbox token and style URL are in `index.html`. The token must permit
both the local preview origin and the deployed URL if URL restrictions are enabled.
Use a public token; never put a secret token in this static page.

## Interaction and maintenance

- Ctrl + scroll on Windows/Linux or Cmd + scroll on macOS zooms the map, with
  Mapbox's built-in helper and explicit zoom buttons. Touch panning uses two fingers.
- The timeline starts at the latest publication year, fills in intervening years,
  and highlights countries cumulatively from their first publication year.
- Country details list articles from **all years**, earliest first. Changing the
  timeline closes details. Escape and the close button also dismiss them.
- The timeline supports keyboard arrows; country details receive focus on opening,
  and hidden details are removed from keyboard navigation.
- Narrow-screen controls fit the viewport; loading failures are displayed on the page.

The active dataset is `data/countries_2026_clean.geojson`; historical files are
retained for reference. Article titles, links and years are semicolon-separated
parallel lists; keep their order and counts aligned. Whitespace around delimiters
is optional. Runtime feature IDs are assigned uniquely because the source has a
duplicate ID. This does not modify the source data.
