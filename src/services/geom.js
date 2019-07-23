module.exports = {
    getPoint (coordinates) {
        return {
            type: 'Point',
            coordinates // [39.807222,-76.984722]
        }
    },

    getLine (coordinates) {
        return {
            type: 'LineString',
            coordinates // [ [100.0, 0.0], [101.0, 1.0] ]
        }
    },

    getPolygons (coordinates) {
        return {
            type: 'Polygon',
            coordinates // [ [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0] ] ]
        }
    },

    addSRID (geojson) {
        geojson.crs = { type: 'name', properties: { name: 'EPSG:4326' } }
        return geojson
    }
}
