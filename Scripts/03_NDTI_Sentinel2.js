var roi = ee.FeatureCollection('projects/ee-abeosekoh/assets/40kmbuffer');
var geom = roi.geometry();

var START_YEAR = 2019, END_YEAR = 2024;
var SCALE = 20;

var coll = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(geom)
  .filterDate(START_YEAR + '-01-01', (END_YEAR + 1) + '-01-01')
  .filter(ee.Filter.calendarRange(6, 10, 'month'))
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(function(img) {
    var scl = img.select('SCL');
    var keep = scl.eq(5).or(scl.eq(6)).or(scl.eq(7));
    return img.updateMask(keep).normalizedDifference(['B4', 'B3']).rename('NDTI')
      .copyProperties(img, ['system:time_start']);
  });

var rows = ee.FeatureCollection(coll.map(function(img) {
  var m = img.reduceRegion({reducer: ee.Reducer.mean(),  geometry: geom, scale: SCALE, maxPixels: 1e13});
  var n = img.reduceRegion({reducer: ee.Reducer.count(), geometry: geom, scale: SCALE, maxPixels: 1e13});
  return ee.Feature(null, {
    date: ee.Date(img.get('system:time_start')).format('yyyy-MM-dd'),
    NDTI: m.get('NDTI'), n_pixels: n.get('NDTI'), sensor: 'Sentinel2_L2A'
  });
})).filter(ee.Filter.notNull(['NDTI']));

print('Rows (images with valid NDTI)', rows.size());
Export.table.toDrive({collection: rows, description: 'NDTI_Sentinel2_perimage_2019_2024',
  folder: 'EarthEngineExports', fileFormat: 'CSV',
  selectors: ['date', 'NDTI', 'n_pixels', 'sensor']});
