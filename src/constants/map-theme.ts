// Google Maps colors; Apple Maps follows userInterfaceStyle instead.
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1A1B1F" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#B0B0B4" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0D0E10" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#292A2E" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#35363B" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#14222D" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#222429" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];
