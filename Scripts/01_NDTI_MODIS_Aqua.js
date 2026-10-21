var roi = ee.FeatureCollection('projects/ee-abeosekoh/assets/40kmbuffer');
var geom = roi.geometry();

var START_YEAR = 2002, END_YEAR = 2024;
var SCALE = 500;

function addNDTI(img) {
  var ndti = img.normalizedDifference(['sur_refl_b01', 'sur_refl_b04']).rename('NDTI');
  var cloud = img.select('state_1km').bitwiseAnd(3).eq(0);
  return ndti.updateMask(cloud).copyProperties(img, ['system:time_start']);
}

var coll = ee.ImageCollection('MODIS/061/MYD09GA')
  .filterBounds(geom)
  .filterDate(START_YEAR + '-01-01', (END_YEAR + 1) + '-01-01')
  .filter(ee.Filter.calendarRange(6, 10, 'month'))
  .map(addNDTI);

var rows = ee.FeatureCollection(coll.map(function(img) {
  var m = img.reduceRegion({reducer: ee.Reducer.mean(),  geometry: geom, scale: SCALE, maxPixels: 1e13});
  var n = img.reduceRegion({reducer: ee.Reducer.count(), geometry: geom, scale: SCALE, maxPixels: 1e13});
  return ee.Feature(null, {
    date: ee.Date(img.get('system:time_start')).format('yyyy-MM-dd'),
    NDTI: m.get('NDTI'),
    n_pixels: n.get('NDTI'),
    sensor: 'MODIS_Aqua_MYD09GA'
  });
})).filter(ee.Filter.notNull(['NDTI']));

print('Rows (images with valid NDTI)', rows.size());
Export.table.toDrive({collection: rows, description: 'NDTI_MODIS_Aqua_perimage_2002_2024',
  folder: 'EarthEngineExports', fileFormat: 'CSV',
  selectors: ['date', 'NDTI', 'n_pixels', 'sensor']});
