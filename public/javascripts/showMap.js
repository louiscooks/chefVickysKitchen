mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/streets-v11", // style URL
	center: orderGeo.coordinates, // starting position [lng, lat]
	zoom: 8 // starting zoom
});

new mapboxgl.Marker().setLngLat(orderGeo.coordinates).addTo(map);
