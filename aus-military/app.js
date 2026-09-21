(() => {
  'use strict';
  const status = document.getElementById('status');
  const buttons = [...document.querySelectorAll('[data-view]')];
  const config = window.MAP_CONFIG;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMac = /Mac/.test(navigator.userAgentData?.platform || navigator.platform);
  document.getElementById('zoom-hint').textContent = `${isMac ? 'Cmd' : 'Ctrl'} + scroll to zoom`;
  const showStatus = (message) => { status.textContent = message; status.hidden = false; };
  buttons.forEach((button) => { button.disabled = true; });

  if (window.location.protocol === 'file:') {
    showStatus('Open this map through a local web server: run python serve.py in the aus-military folder. The browser will open automatically.');
    return;
  }

  if (!window.mapboxgl || !config) {
    showStatus('The map could not load. Check your connection and reload the page.');
    return;
  }
  if (!mapboxgl.supported()) {
    showStatus('This globe needs WebGL. Enable hardware acceleration or try another browser.');
    return;
  }

  // Give the regional views more room on narrower screens.
  const camera = (name) => {
    const view = { ...config.views[name] };
    if (name !== 'australia') {
      view.zoom += Math.min(0, Math.log2(window.innerWidth / 900), Math.log2(window.innerHeight / 900));
    }
    view.padding = window.innerWidth > 600
      ? { top: 0, bottom: 120, left: 180, right: 0 }
      : { top: 0, bottom: 0, left: 0, right: 0 };
    return view;
  };
  let map;
  try {
    mapboxgl.accessToken = config.accessToken;
    map = new mapboxgl.Map({
      container: 'map',
      style: config.style,
      projection: 'globe',
      cooperativeGestures: true,
      maxBounds: config.maxBounds,
      ...camera('opening'),
      minZoom: 0,
      maxZoom: 7,
      maxPitch: 65,
      attributionControl: false
    });
    // Padding is a camera option; apply it explicitly to the opening view too.
    map.jumpTo(camera('opening'));
  } catch (error) {
    showStatus('The globe could not start. Check WebGL support and reload the page.');
    console.error(error);
    return;
  }
  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
  map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
  map.on('error', (event) => {
    console.error(event.error);
    showStatus('Some map content could not load. Check your connection or Mapbox token, then reload.');
  });
  map.on('load', () => {
    status.hidden = true;
    map.setPaintProperty('water', 'fill-color', '#24495b');
    // Keep country labels legible against the quiet land / ocean palette.
    for (const layer of map.getStyle().layers) {
      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
        const isWater = /water|marine/.test(layer.id);
        map.setPaintProperty(layer.id, 'text-color', isWater ? '#adc9d3' : '#30464c');
        map.setPaintProperty(layer.id, 'text-halo-color', isWater ? '#24495b' : '#eef0eb');
      }
    }
    map.setFog({
      color: '#78919b',
      'high-color': '#244552',
      'space-color': '#07141e',
      'horizon-blend': 0.025,
      'star-intensity': 0.035
    });
    // Empty by design: add verified maritime linkage GeoJSON here.
    map.addSource('maritime-linkages', {
      type: 'geojson', data: { type: 'FeatureCollection', features: [] }
    });
    map.addLayer({
      id: 'maritime-linkages', type: 'line', source: 'maritime-linkages',
      paint: { 'line-color': '#dfae74', 'line-width': 2, 'line-opacity': 0.85 }
    });
    buttons.forEach((button) => { button.disabled = false; });
  });
  buttons.forEach((button) => button.addEventListener('click', () => {
    map.flyTo({ ...camera(button.dataset.view), duration: reducedMotion.matches ? 0 : 1800 });
  }));
})();
