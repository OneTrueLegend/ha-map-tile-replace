const runningInfo = {
  maplibreGl: {
    css: "/local/ha-map-tile-replace/lib/maplibre-gl.css",
    js: "/local/ha-map-tile-replace/lib/maplibre-gl.js",
  },
  leafletMaplibreGl: "/local/ha-map-tile-replace/lib/leaflet-maplibre-gl.js",
  // Can either be a local js file or a url to a js file
  mapStyle: "/local/ha-map-tile-replace/style.json",
};

// https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Resource_timing
const observer = new PerformanceObserver((list) => {
  const firstCarto = list
    .getEntries()
    .find((entry) => entry.name.includes("cartocdn.com"));
  if (firstCarto) {
    findHaMapElements();
  }
});

observer.observe({ type: "resource", buffered: true });

const link = document.createElement("link");
link.href =
  runningInfo.maplibreGl.css ||
  "https://unpkg.com/maplibre-gl/dist/maplibre-gl.css";
link.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(link);

const querySelectorAll = (node, selector) => {
  const nodes = [...node.querySelectorAll(selector)],
    nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
  let currentNode;
  while ((currentNode = nodeIterator.nextNode())) {
    if (currentNode.shadowRoot) {
      nodes.push(...querySelectorAll(currentNode.shadowRoot, selector));
    }
  }
  return nodes;
};

function findHaMapElements() {
  console.log("Searching for map elements");
  const foundElements = querySelectorAll(document.body, "ha-map");

  foundElements.forEach((haMapElement) => modifyMap(haMapElement));

  console.log("Found elements", foundElements.length);
}

async function modifyMap(haMapElement) {
  const map = haMapElement.leafletMap;
  if (map) {
    // If layer has been replaced yet
    if (Object.values(map._layers).some((l) => l._url)) {
      const [res] = await Promise.all([
        fetch(runningInfo.mapStyle),
        import(
          runningInfo.maplibreGl.js ||
            "https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"
        ),
      ]);
      const [style] = await Promise.all([
        res.json(),
        import(
          runningInfo.leafletMaplibreGl ||
            "https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js"
        ),
      ]);
      console.log("Modify Map", map);
      map.eachLayer((layer) => removeAndReplaceMapLayer(map, layer, style));
    }
  }
}

async function removeAndReplaceMapLayer(map, layer, style) {
  if (layer._url) {
    console.log("Removing carto layer", layer);
    map.removeLayer(layer);
    console.log("Adding new layer");
    L.maplibreGL({ style }).addTo(map);
  }
}
