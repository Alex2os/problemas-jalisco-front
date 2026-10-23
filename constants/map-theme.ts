// Google Maps colors; Apple Maps follows userInterfaceStyle instead.
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1F2621" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#A9B3A7" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1F2621" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#3A443C" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#596457" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#152D30" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#243C2C" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];
