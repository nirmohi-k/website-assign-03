document.addEventListener("DOMContentLoaded", function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmlybW9oaSIsImEiOiJjbTExMGRyNXkwbnh0Mm5vcmtteWJwOWplIn0.MSqHgjuT6rq8AL6lEXDxVQ';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/nirmohi/cm72v1ilj00ai01s3bjv8h2gy',
        zoom: 10,
        center: [-74, 40.725],
        maxZoom: 15,
        minZoom: 8,
        maxBounds: [[-74.45, 40.45], [-73.55, 41]]
    });

    map.on('load', function () {
        let layers = map.getStyle().layers;
        let firstSymbolId;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                firstSymbolId = layers[i].id;
                break;
            }
        }

        // 🟥 Pedestrian Plazas Layer (Red)
        map.addLayer({
            'id': 'pedestrianPlazas',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'data/NYC_DOT_Pedestrian_Plazas_20250207.geojson'
            },
            'paint': {
                'fill-color': '#ff0000',
                'fill-opacity': 0.7,
            }
        }, firstSymbolId);

        // 🔵 POPS Layer (Light Blue - Polygon)
        map.addLayer({
            'id': 'popsLayer',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'https://drive.google.com/file/d/1VylkkuwEMYJKb0PfTOoKkcNkJ5orwh9x/view?usp=sharing'
            },
            'paint': {
                'fill-color': '#b5c7eb',
                'fill-opacity': 0.7,
                'fill-outline-color': '#4d4d4d'
            }
        }, firstSymbolId);

        // 🟢 Open Space Parks Layer (Light Green)
        map.addLayer({
            'id': 'openSpaceLayer',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'data/https://drive.google.com/file/d/1YFpBwMUOpn0b8-gFaTVRWtvU0oMekmxj/view?usp=sharing'
            },
            'paint': {
                'fill-color': '#b3cf99',
                'fill-opacity': 0.7,
                'fill-outline-color': '#1b6f64'
            }
        }, firstSymbolId);

        // 🚇 Subway Stations (Dark Grey, Only ADA Accessible)
        map.addLayer({
            'id': 'subwayStations',
            'type': 'circle',
            'source': {
                'type': 'geojson',
                'data': 'data/MTA_Subway_Stations_20250212.geojson'
            },
            'filter': ['==', ['get', 'ada'], '1'],  // Only show ADA accessible stations
            'paint': {
                'circle-color': '#b4b4b4', // Dark Grey
                'circle-radius': 3, // Fixed radius for visibility
                'circle-opacity': 0.9,
                'circle-stroke-color': '#909090',
                'circle-stroke-width': 1
            }
        }, firstSymbolId);

        // 📌 Add Legend Above Footer (Updated with Subway Stations)
        const legend = document.createElement("div");
        legend.id = "legend";
        legend.innerHTML = `
            <h4>Public Spaces & Subway Access</h4>
            <div><span style="background:#ff0000"></span> Pedestrian Plazas</div>
            <div><span style="background:#b5c7eb"></span> POPS (Privately Owned Public Spaces)</div>
            <div><span style="background:#b3cf99"></span> Open Space Parks</div>
            <div><span style="background:#b4b4b4"></span> ADA Accessible Subway Station</div>
        `;

        const main = document.querySelector("main");
        if (main) {
            main.appendChild(legend);
        }
    });

    // 📌 Function to Show Popups on Hover
    function showPopupOnHover(layer) {
        let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

        map.on('mouseenter', layer, function (e) {
            let properties = e.features[0].properties;
            let popupContent = "";

            if (layer === 'pedestrianPlazas') {
                popupContent = `
                    <h4>Pedestrian Plaza</h4>
                    <p><b>Name of Plaza:</b> ${properties.plazaname || "Unknown"}</p>
                    <p><b>Area:</b> ${properties.shape_area || "No Data"} sq. ft.</p>
                `;
            } else if (layer === 'popsLayer') {
                let buildingName = properties.building_name || properties.building_address_with_zip || "Unknown";
                popupContent = `
                    <h4>Privately Owned Public Space</h4>
                    <p><b>Building Name:</b> ${buildingName}</p>
                    <p><b>Year:</b> ${properties.year_completed || "No Data"}</p>
                    <p><b>Area:</b> ${properties.Shape_Area || "No Data"} sq. ft.</p>
                `;
            } else if (layer === 'openSpaceLayer') {
                popupContent = `
                    <h4>Park</h4>
                    <p><b>Park Name:</b> ${properties.park_name || "Unknown"}</p>
                    <p><b>Area:</b> ${properties.shape_area || "No Data"} sq. ft.</p>
                `;
            } else if (layer === 'subwayStations') {
                popupContent = `
                    <h4>Subway Station</h4>
                    <p><b>Station Name:</b> ${properties.stop_name || "Unknown"}</p>
                    <p><b>Lines:</b> ${properties.daytime_routes || "No Data"}</p>
                    <p><b>Borough:</b> ${properties.borough || "Unknown"}</p>
                    <p><b>Accessibility:</b> ${properties.ada === '1' ? "ADA Accessible" : "Not Accessible"}</p>
                `;
            }

            popup.setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
        });

        map.on('mouseleave', layer, function () {
            popup.remove();
        });
    }

    // 🎯 Apply Hover Popups to All Layers
    showPopupOnHover('pedestrianPlazas');
    showPopupOnHover('popsLayer');
    showPopupOnHover('openSpaceLayer');
    showPopupOnHover('subwayStations');

    // 🎯 Cursor Change on Hover
    function setCursor(layer) {
        map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
    }

    setCursor('pedestrianPlazas');
    setCursor('popsLayer');
    setCursor('openSpaceLayer');
    setCursor('subwayStations');
});
