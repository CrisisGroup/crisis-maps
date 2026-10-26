(() => {
  'use strict';
  const status = document.getElementById('status');
  const config = window.MAP_CONFIG;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMac = /Mac/.test(navigator.userAgentData?.platform || navigator.platform);
  document.getElementById('zoom-hint').textContent = `${isMac ? 'Cmd' : 'Ctrl'} + scroll to zoom`;
  const showStatus = (message) => { status.textContent = message; status.hidden = false; };

  if (!config?.views?.[config.openingView]) {
    showStatus('The map configuration could not load. Reload the page.');
    return;
  }
  document.documentElement.style.setProperty('--recognition-prc', config.recognitionColors.PRC);
  document.documentElement.style.setProperty('--recognition-roc', config.recognitionColors.ROC);

  const viewDescription = document.getElementById('view-description');
  const buttons = Object.entries(config.views).map(([name, view]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.view = name;
    button.textContent = view.label;
    button.title = view.description;
    button.disabled = true;
    button.setAttribute('aria-pressed', 'false');
    document.getElementById('views').append(button);
    return button;
  });

  if (window.location.protocol === 'file:') {
    showStatus('Open this map through a local web server: run python serve.py in the kovrig-pac folder.');
    return;
  }
  if (!window.mapboxgl) {
    showStatus('The map could not load. Check your connection and reload the page.');
    return;
  }
  if (!mapboxgl.supported()) {
    showStatus('This globe needs WebGL. Enable hardware acceleration or try another browser.');
    return;
  }

  const camera = (name) => {
    const { center, zoom, bearing, pitch } = config.views[name];
    const isMobile = window.innerWidth <= 600;
    const padding = isMobile
      ? { top: Math.ceil(document.querySelector('.intro').getBoundingClientRect().bottom + 14), bottom: 70, left: 0, right: 0 }
      : { top: 0, bottom: 120, left: 180, right: 0 };
    const availableHeight = isMobile
      ? Math.max(160, window.innerHeight - padding.top - padding.bottom)
      : window.innerHeight;
    return {
      center, bearing, pitch,
      // Fit the globe below the controls and legend on narrow screens.
      zoom: Math.max(0, zoom + Math.min(0, Math.log2(window.innerWidth / 900), Math.log2(availableHeight / 900))),
      padding
    };
  };

  let map;
  let activeView = config.openingView;
  // Keep the chosen perspective while users pan or zoom within it.
  let selectedView = config.openingView;
  let hasEezData = false;
  let viewTransitionPending = false;
  let viewArrivalHandler;
  let eezHideTimer;
  let popup;
  const eezFadeDuration = 500;
  const eezLayers = ['pacific-lines-prc', 'pacific-lines-roc'];
  const updateEezVisibility = () => {
    clearTimeout(eezHideTimer);
    const showOverview = hasEezData && selectedView === 'pacific';
    const visible = showOverview && !viewTransitionPending;
    const duration = reducedMotion.matches ? 0 : eezFadeDuration;
    for (const id of eezLayers) {
      if (!map?.getLayer(id)) continue;
      map.setPaintProperty(id, 'line-opacity-transition', { duration, delay: 0 });
      if (visible) map.setLayoutProperty(id, 'visibility', 'visible');
      map.setPaintProperty(id, 'line-opacity', visible ? 0.95 : 0);
    }
    document.getElementById('eez-legend').hidden = !showOverview;
    if (!visible) {
      popup?.remove();
      if (map) map.getCanvas().style.cursor = '';
      // Keep the layers rendered until their opacity reaches zero. Cancel
      // this timer on a new selection so a previous fade cannot hide them.
      const hideLayers = () => {
        for (const id of eezLayers) {
          if (map?.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        }
      };
      if (duration && hasEezData) eezHideTimer = setTimeout(hideLayers, duration);
      else hideLayers();
    }
  };
  reducedMotion.addEventListener('change', updateEezVisibility);
  const selectView = (name) => {
    activeView = name;
    selectedView = name;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === name)));
    viewDescription.textContent = config.views[name].description;
    updateEezVisibility();
  };

  try {
    mapboxgl.accessToken = config.accessToken;
    map = new mapboxgl.Map({
      container: 'map',
      style: config.style,
      projection: 'globe',
      cooperativeGestures: true,
      ...camera(config.openingView),
      minZoom: 0, maxZoom: 7, maxPitch: 65,
      attributionControl: false
    });
    map.jumpTo(camera(config.openingView));
  } catch (error) {
    showStatus('The globe could not start. Check WebGL support and reload the page.');
    console.error(error);
    return;
  }

  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
  map.addControl(new mapboxgl.AttributionControl({ compact: false }), 'bottom-right');
  map.on('error', (event) => {
    console.error(event.error);
    showStatus('Some map content could not load. Check your connection or Mapbox token, then reload.');
  });

  map.on('load', async () => {
    status.hidden = true;
    map.setFog({
      color: '#78919b', 'high-color': '#244552', 'space-color': '#07141e',
      'horizon-blend': 0.025, 'star-intensity': 0.035
    });
    buttons.forEach((button) => { button.disabled = false; });
    selectView(config.openingView);

    // Keep this app's dataset separate from aus-military and the basemap.
    try {
      const response = await fetch(config.dataUrl);
      if (!response.ok) throw new Error(`Dataset request failed (${response.status}).`);
      const data = await response.json();
      if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
        throw new Error('The dataset must be a GeoJSON FeatureCollection.');
      }
      if (!data.features.length) {
        const note = document.getElementById('data-note');
        note.textContent = ' / BASEMAP ONLY';
        note.hidden = false;
      }
      map.addSource('pacific-data', { type: 'geojson', data });
      // Draw boundaries below place labels to keep the geography legible.
      const beforeLabels = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id;
      // Draw ROC second, with gaps that reveal PRC on shared boundaries.
      for (const recognition of ['PRC', 'ROC']) {
        map.addLayer({
          id: `pacific-lines-${recognition.toLowerCase()}`, type: 'line', source: 'pacific-data',
          filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'recognition'], recognition]],
          layout: { visibility: 'none', 'line-cap': 'butt', 'line-join': 'round' },
          paint: {
            'line-color': config.recognitionColors[recognition],
            'line-width': ['interpolate', ['linear'], ['zoom'], 1, 1.6, 4, 2.4, 7, 3.4],
            'line-opacity': 0,
            'line-opacity-transition': { duration: reducedMotion.matches ? 0 : eezFadeDuration, delay: 0 },
            ...(recognition === 'ROC' ? { 'line-dasharray': [3, 2] } : {})
          }
        }, beforeLabels);
      }
      hasEezData = data.features.length > 0;
      updateEezVisibility();
      if (activeView && !viewTransitionPending) map.jumpTo(camera(activeView));
      // Give thin EEZ boundaries a forgiving pointer/touch target.
      const featuresAt = (point) => selectedView === 'pacific' && !viewTransitionPending ? map.queryRenderedFeatures([
        [point.x - 6, point.y - 6], [point.x + 6, point.y + 6]
      ], { layers: eezLayers }) : [];
      map.on('click', (event) => {
        const features = featuresAt(event.point);
        const feature = features[0];
        if (!feature) return;
        const { title, name, description, territory } = feature.properties || {};
        if (!title && !name && !description) return;
        const content = document.createElement('div');
        if (territory) {
          const category = document.createElement('p');
          category.className = 'popup-category';
          category.textContent = 'EEZ boundary';
          content.append(category);
        }
        if (title || name) {
          const heading = document.createElement('h2');
          // A shared boundary can belong to two selected territories.
          const territories = [...new Set(features.map((item) => item.properties?.territory).filter(Boolean))];
          heading.textContent = territory ? territories.join(' / ') : title || name;
          content.append(heading);
        }
        const recognitionEntries = new Map(features
          .filter((item) => item.properties?.territory && item.properties?.recognition)
          .map((item) => [item.properties.territory, item.properties.recognition]));
        if (recognitionEntries.size) {
          const recognition = document.createElement('p');
          recognition.className = 'popup-recognition';
          recognition.textContent = recognitionEntries.size === 1
            ? `Recognition: ${recognitionEntries.values().next().value}`
            : [...recognitionEntries].map(([territoryName, value]) => `${territoryName}: ${value}`).join('\n');
          content.append(recognition);
        }
        if (title && name && title !== name) {
          const boundary = document.createElement('p');
          boundary.className = 'popup-boundary';
          boundary.textContent = name;
          content.append(boundary);
        }
        if (description) {
          const paragraph = document.createElement('p');
          paragraph.textContent = description;
          content.append(paragraph);
        }
        popup?.remove();
        popup = new mapboxgl.Popup({ maxWidth: '300px' })
          .setLngLat(event.lngLat).setDOMContent(content).addTo(map);
      });
      map.on('mousemove', (event) => {
        map.getCanvas().style.cursor = featuresAt(event.point).length ? 'pointer' : '';
      });
    } catch (error) {
      console.error(error);
      showStatus('The dataset could not load. You can still explore the basemap and perspectives.');
    }
  });

  buttons.forEach((button) => button.addEventListener('click', () => {
    // Remove the previous arrival callback before stopping an interrupted
    // flight: stop() can emit moveend for the previous destination.
    if (viewArrivalHandler) map.off('moveend', viewArrivalHandler);
    map.stop();
    popup?.remove();
    viewTransitionPending = !reducedMotion.matches && (viewTransitionPending || selectedView !== button.dataset.view);
    selectView(button.dataset.view);
    if (viewTransitionPending) {
      viewArrivalHandler = () => {
        viewArrivalHandler = null;
        viewTransitionPending = false;
        updateEezVisibility();
      };
      map.once('moveend', viewArrivalHandler);
    }
    map.flyTo({ ...camera(button.dataset.view), duration: reducedMotion.matches ? 0 : 1800 });
  }));
  // Wheel zoom events do not always carry originalEvent. Compare the final
  // camera instead. Preserve the chosen perspective and its EEZ visibility;
  // only stop snapping the camera to its preset after free navigation.
  map.on('moveend', () => {
    if (!activeView) return;
    const target = camera(activeView);
    const center = map.getCenter();
    const longitudeDelta = ((center.lng - target.center[0] + 540) % 360) - 180;
    const deltas = [longitudeDelta, center.lat - target.center[1],
      map.getZoom() - target.zoom, map.getBearing() - target.bearing, map.getPitch() - target.pitch];
    if (deltas.some((value) => Math.abs(value) > 0.001)) activeView = null;
  });
  map.on('resize', () => { if (activeView) map.jumpTo(camera(activeView)); });
})();
