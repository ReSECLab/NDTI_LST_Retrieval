var roi = ee.FeatureCollection('projects/ee-abeosekoh/assets/40kmbuffer');
var geom = roi.geometry();

var START_YEAR = 1984, END_YEAR = 2024;
var SCALE = 30;

function prep(redBand, greenBand, sensorName) {
  return function(img) {
    var sr = img.select([redBand, greenBand]).multiply(0.0000275).add(-0.2);
    var ndti = sr.normalizedDifference([redBand, greenBand]).rename('NDTI');
    var qa = img.select('QA_PIXEL');
    var clear = qa.bitwiseAnd(0x3E).eq(0);
    return ndti.updateMask(clear)
      .set('system:time_start', img.get('system:time_start'))
      .set('sensor', sensorName);
  };
}
function load(id, red, green, name) {
  return ee.ImageCollection(id).filterBounds(geom)
    .filterDate(START_YEAR + '-01-01', (END_YEAR + 1) + '-01-01')
    .filter(ee.Filter.calendarRange(6, 10, 'month'))
    .map(prep(red, green, name));
}
var coll = load('LANDSAT/LT05/C02/T1_L2', 'SR_B3', 'SR_B2', 'Landsat5_TM')
  .merge(load('LANDSAT/LE07/C02/T1_L2', 'SR_B3', 'SR_B2', 'Landsat7_ETM'))
  .merge(load('LANDSAT/LC08/C02/T1_L2', 'SR_B4', 'SR_B3', 'Landsat8_OLI'))
  .merge(load('LANDSAT/LC09/C02/T1_L2', 'SR_B4', 'SR_B3', 'Landsat9_OLI2'));

var rows = ee.FeatureCollection(coll.map(function(img) {
  var m = img.reduceRegion({reducer: ee.Reducer.mean(),  geometry: geom, scale: SCALE, maxPixels: 1e13});
  var n = img.reduceRegion({reducer: ee.Reducer.count(), geometry: geom, scale: SCALE, maxPixels: 1e13});
  return ee.Feature(null, {
    date: ee.Date(img.get('system:time_start')).format('yyyy-MM-dd'),
    NDTI: m.get('NDTI'), n_pixels: n.get('NDTI'), sensor: img.get('sensor')
  });
})).filter(ee.Filter.notNull(['NDTI']));

print('Rows (scenes with valid NDTI)', rows.size());
Export.table.toDrive({collection: rows, description: 'NDTI_Landsat_perscene_1984_2024',
  folder: 'EarthEngineExports', fileFormat: 'CSV',
  selectors: ['date', 'NDTI', 'n_pixels', 'sensor']});
