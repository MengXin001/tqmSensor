mapboxgl.accessToken = 'pk.eyJ1IjoibWVuZ3hpbjAwMSIsImEiOiJja2Q2MmVzMjkwZ3BwMndwZzdoajlrbXgwIn0.LkCmyt-_LmdfpTBkU3fEMQ';
var map = new mapboxgl.Map({
    container: 'container',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [114, 22],
    minZoom: 2,
    maxZoom: 18,
    zoom: 5
});
mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
map.addControl(new MapboxLanguage({
    defaultLanguage: 'zh-Hans'
}));

function addrail() {
    map.addLayer({
        id: 'tdt-layer',
        type: 'raster',
        source: 'tdt-source',
        minzoom: 0,
        maxzoom: 18
    })
}

map.on('load', function() {
    map.addSource('tdt-source', {
        type: 'raster',
        tiles: ['https://a.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', 'https://b.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
            'https://c.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png'
        ],
        tileSize: 256
    });
});

function add() {
    if (map.getSource('image')) {
        map.removeLayer('image')
        map.removeSource('image')
    }
    map.addSource('image', {
        type: 'image',
        url: 'https://weather.121.com.cn/data_cache/szImages/radar/png16.png',
        coordinates: [
            [108.505, 26.0419],
            [117.505, 26.0419],
            [117.505, 19.0419],
            [108.505, 19.0419],
        ],
    })
    map.addLayer({
        id: 'image',
        type: 'raster',
        source: 'image',
        paint: {
            'raster-opacity': 1,
        },
    })
}

function hide() {
    if (!map.getSource('image')) {
        return alert('Radar Debug')
    }
    map.setLayoutProperty('image', 'visibility', 'none')
}

function show() {
    if (!map.getSource('image')) {
        return alert('Radar Debug')
    }
    map.setLayoutProperty('image', 'visibility', 'visible')
}
map.addControl(new CitySelectorControl(), 'top-right');
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
}));
map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: 'metric'
}));

function reloadpoints(async = false) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.status === 200) {
            res = JSON.parse(request.responseText);
            data = res
            status_text = ''
            for (var i in data) {
                new mapboxgl.Marker().setLngLat([data[i].lon, data[i].lat]).addTo(map)
            }
			document.getElementById('pres').innerHTML = "Pres: " + data[1].pres.toFixed(3) + "hPa"
			document.getElementById('temp').innerHTML = "Temp: " + data[1].t
			document.getElementById('rh').innerHTML = "Relative Humidity: " + data[1].rh + "%"
			document.getElementById('gps').innerHTML = "GPS location: " + data[1].lon.toFixed(3) + "," +data[1].lat.toFixed(3)
			document.getElementById('speed').innerHTML = "Speed: " + data[1].speed
			document.getElementById('height').innerHTML = "Height: " + data[1].height + "m"
			document.getElementById('dw').innerHTML = "Dew Point: " + data[1].dt
			document.getElementById('time').innerHTML = "Time: " + data[1].obstime.replace('T', ' ')
			document.getElementById('status').innerHTML = "tqm sensor: " + data[1].status
        }
    };
    request.open("GET", "./data/mock_dataset.json", async);
    request.send();
}
reloadpoints()