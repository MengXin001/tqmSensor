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
        url: 'http://119.91.72.159/data_cache/szImages/radar/png16.png',
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
    maxWidth: 100,
    unit: 'metric'
}));

function checkty() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.status === 200) {
            res = JSON.parse(request.responseText);
            data = res
            for (let i = 0; i < 5; i++) {
                if (data[i].is_current == 1) {
                    document.getElementById('currentstorms').innerHTML = "CurrentStorms: " + data[i].name;
                    addty(data[i].tfbh)
                }
            }
            document.getElementById('checktime').innerHTML = "Checktime: " + data[4].end_time
        }
    };
    request.open("GET", "http://data.istrongcloud.com/v2/data/complex/2023.json");
    request.send();
}

function addty(id) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.status === 200) {
            res = JSON.parse(request.responseText)
            trackData = res[0].points
            let typhoonFeatureCollection = pointsToFeatureCollection(trackData)
            map.addSource('typhoon-source' + id, {
                    type: 'geojson',
                    data: typhoonFeatureCollection,
                })
                // 当前台风点
            map.loadImage('./data/typhoon-SuperTY.png', function(error, image) {
                if (error) throw error;
                map.addImage('sty', image);
                map.addLayer({
                    id: 'points' + id,
                    type: 'symbol',
                    source: 'typhoon-source' + id,
                    layout: {
                        'icon-image': 'sty',
                        'icon-size': 0.5,
                    },
                    filter: ['all', ['==', '$type', 'Point'],
                        ['==', 'type', 'current']
                    ],
                })
            })
            map.addLayer({
                    id: 'track-line-layer' + id,
                    type: 'line',
                    source: 'typhoon-source' + id,
                    paint: {
                        'line-width': 3,
                        'line-color': '#fb5614',
                    },
                    filter: ['all', ['==', '$type', 'LineString'],
                        ['==', 'type', 'track']
                    ],
                })
                // 台风预测路径线
            map.addLayer({
                    id: 'forecast-line-layer' + id,
                    type: 'line',
                    source: 'typhoon-source' + id,
                    paint: {
                        'line-width': 3,
                        'line-dasharray': [3, 3],
                        'line-color': [
                            'match', ['get', 'sets'],
                            '中国',
                            '#FF4050',
                            '中国香港',
                            '#FF66FF',
                            '中国台湾',
                            '#1f46b0',
                            '日本',
                            '#43FF4B',
                            '美国',
                            '#40DDFF',
                            '#ff0000',
                        ],
                    },
                    filter: ['all', ['==', '$type', 'LineString'],
                        ['==', 'type', 'forecast']
                    ],
                })
                // 台风路径点
            map.addLayer({
                    id: 'track-point-layer' + id,
                    type: 'circle',
                    source: 'typhoon-source' + id,
                    paint: {
                        'circle-radius': [
                            'interpolate', ['cubic-bezier', 0.85, 0.45, 0, 0.65],
                            ['zoom'],
                            5, ['*', 5, 1],
                            10, ['*', 5, 1],
                        ],
                        'circle-color': [
                            'match', ['get', 'strong'],
                            '热带低压(TD)',
                            '#00ff00',
                            '热带风暴(TS)',
                            '#0000ff',
                            '强热带风暴(STS)',
                            '#ffff00',
                            '台风(TY)',
                            '#ffa000',
                            '强台风(STY)',
                            '#ff0000',
                            '超强台风(Super TY)',
                            '#AE00D9',
                            '#ff0000',
                        ],
                        'circle-opacity': 0.8,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': 'rgba(110, 110, 110, .3)',
                    },
                    filter: ['all', ['==', '$type', 'Point'],
                        ['in', 'type', 'track', 'forecast']
                    ],
                })
                /*var lineStringCoordinates = []
                for (var i = 0; i < trackData.length; i++) {
                    lineStringCoordinates.push([parseFloat(trackData[i].lng), parseFloat(trackData[i].lat)])
                }
                const linestring1 = turf.lineString(lineStringCoordinates)
                map.addLayer({
                    id: 'line-layer-1',
                    type: 'line',
                    source: {
                        type: 'geojson',
                        data: linestring1,
                    },
                    paint: {
                        'line-color': '#3eaf7c',
                        'line-width': 2,
                        'line-gap-width': 1,
                    },
                })*/
        }
    };
    request.open("GET", "http://data.istrongcloud.com/v2/data/complex/" + id + ".json", true);
    request.send();
}

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
            document.getElementById('pres').innerHTML = "Pres: " + data[0].pres.toFixed(3) + "hPa"
            document.getElementById('temp').innerHTML = "Temp: " + data[0].t
            document.getElementById('rh').innerHTML = "Relative Humidity: " + data[0].rh + "%"
            document.getElementById('gps').innerHTML = "GPS location: " + data[0].lon.toFixed(3) + "," + data[0].lat.toFixed(3)
            document.getElementById('speed').innerHTML = "Speed: " + data[0].speed
            document.getElementById('height').innerHTML = "Height: " + data[0].height + "m"
            document.getElementById('dw').innerHTML = "Dew Point: " + data[0].dt
            document.getElementById('time').innerHTML = "Time: " + data[0].obstime.replace('T', ' ')
            document.getElementById('status').innerHTML = "tqm sensor: " + data[0].status
        }
    };
    request.open("GET", "http://119.91.72.159/api/get_instrument_dataset", async);
    request.send();
}
reloadpoints()

function pointsToFeatureCollection(typhoonPoints) {
    let typhoonFeatures = []
    let trackPoints = []
    for (let i = 0, len = typhoonPoints.length; i < len; i++) {
        const typhoonPoint = typhoonPoints[i]
        let point = [typhoonPoint.lng - 0, typhoonPoint.lat - 0]
        trackPoints.push(point)
        let prop = {...typhoonPoint }
        if (prop['forecast']) {
            delete prop.forecast
        }
        if (i < len - 1) {
            typhoonFeatures.push(
                turf.point(point, {
                    ...prop,
                    type: 'track',
                })
            )
        } else {
            typhoonFeatures.push(
                turf.point(point, {
                    ...prop,
                    type: 'current',
                })
            )
        }
    }
    // 路径线
    typhoonFeatures.push(
        turf.lineString(trackPoints, {
            type: 'track',
        })
    )
    let currentTyphoonPoint = typhoonPoints[typhoonPoints.length - 1]

    function f(pointnum) {
        if (typhoonPoints[pointnum - 1].forecast !== null) {
            return pointnum - 1
        }
        return f(pointnum - 1);
    }
    forecastTyphoonPoint = typhoonPoints[f(typhoonPoints.length)]
    let forecastAgencys = forecastTyphoonPoint.forecast
    for (let i = 0, len = forecastAgencys.length; i < len; i++) {
        const forecastAgency = forecastAgencys[i]
        let { points, sets } = forecastAgency
        // 预测点
        let forecastPoints = []
        for (let i = 0, len = forecastAgencys.length; i < len; i++) {
            forecastPoints.push([currentTyphoonPoint.lng, currentTyphoonPoint.lat])
        }
        for (const forecastpoint of points) {
            let point = [forecastpoint.lng - 0, forecastpoint.lat - 0]
            forecastPoints.push(point)
            if (i >= 0) {
                typhoonFeatures.push(
                    turf.point(point, {
                        ...forecastpoint,
                        sets,
                        type: 'forecast',
                    })
                )
            }
        }
        // 预测线
        typhoonFeatures.push(
            turf.lineString(forecastPoints, {
                sets,
                type: 'forecast',
            })
        )
    }
    return turf.featureCollection(typhoonFeatures)
}