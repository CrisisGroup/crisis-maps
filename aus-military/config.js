// Public browser token already used by the adjacent Crisis Maps projects.
// Replace with a URL-restricted public token for the deployment domain if needed.
window.MAP_CONFIG = {
  accessToken: 'pk.eyJ1IjoiZGFsdG9ud2IiLCJhIjoiOWdSSXFQSSJ9.HZyjh4g3TAAOAncwelv9Vw',
  style: 'mapbox://styles/daltonwb/cmubam7rd00fp01qtepaz5ywb',
  // India to the US west coast, crossing the antimeridian through the Pacific.
  // 250°E is 110°W; an unwrapped east edge keeps this one continuous region.
  maxBounds: [[65, -55], [250, 65]],
  views: {
    opening: { center: [135, -8], zoom: 2.8, bearing: -28, pitch: 30 },
    pacific: { center: [177, 30], zoom: 1.65, bearing: -12, pitch: 20 },
    australia: { center: [134, -25], zoom: 3.25, bearing: -28, pitch: 42 }
  }
};
