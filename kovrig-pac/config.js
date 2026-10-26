// Public browser token used by the adjacent Crisis Maps projects.
// Use a URL-restricted public token for the deployment domain if needed.
window.MAP_CONFIG = {
  accessToken: 'pk.eyJ1IjoiZGFsdG9ud2IiLCJhIjoiOWdSSXFQSSJ9.HZyjh4g3TAAOAncwelv9Vw',
  style: './basemap.json',
  dataUrl: './data/pacific.geojson',
  recognitionColors: { PRC: '#ee8075', ROC: '#79c6f2' },
  // No regional maxBounds: every perspective can explore the rest of the globe.
  // Coordinates are [longitude, latitude]. Bearing sets the direction at the
  // top of the screen: 0 = north, 90 = east, -90 = west. Pitch tilts the globe.
  // Presets can be revised here without changing app.js or index.html.
  views: {
    pacific: {
      label: 'Pacific overview',
      description: 'The entire Pacific, with north at the top.',
      center: [180, 16], zoom: 1.8, bearing: 0, pitch: 0
    },
    australia: {
      label: 'From Australia',
      description: 'Looking north and west toward the PRC.',
      center: [126, 5], zoom: 2.25, bearing: -28, pitch: 35
    },
    prc: {
      label: 'From the PRC',
      description: 'Looking east across the Pacific.',
      center: [160, 25], zoom: 2, bearing: 90, pitch: 40
    },
    us: {
      label: 'From the US',
      description: 'Looking west across the Pacific.',
      center: [-165, 30], zoom: 2, bearing: -90, pitch: 40
    }
  },
  openingView: 'pacific'
};
