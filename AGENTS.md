# Map interaction preferences

For all future maps in this project:

- Prevent plain mouse-wheel scrolling from zooming the map. Require Ctrl +
  mouse wheel on Windows or Cmd + mouse wheel on macOS.
- Show a helper explaining the required modifier when the user scrolls over
  the map without it. Any persistent zoom hint should match the platform.
- For Mapbox GL JS, prefer `cooperativeGestures: true`, which supplies the
  modifier requirement and built-in helper, rather than custom wheel handlers.
- Keep explicit zoom buttons available.
