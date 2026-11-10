// src/utils/map-helper.js
const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap',
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri',
});

const baseLayers = {
  Street: streetLayer,
  Satellite: satelliteLayer,
};

const MapHelper = {
  initMap(mapId, center = [-6.200000, 106.816666], zoom = 10) {
    const map = L.map(mapId).setView(center, zoom);
    streetLayer.addTo(map);
    L.control.layers(baseLayers).addTo(map);
    return map;
  },
};
export default MapHelper;