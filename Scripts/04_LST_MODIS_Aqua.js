var roi = ee.FeatureCollection('projects/ee-abeosekoh/assets/40kmbuffer');
var geom = roi.geometry();

var START_YEAR = 2002, END_YEAR = 2024;
var SCALE = 1000;

var coll = ee.ImageCollection('MODIS/061/MYD11A1')
  .filterBounds(geom)
  .filterDate(START_YEAR + '-01-01', (END_YEAR + 1) + '-01-01')
  .filter(ee.Filter.calendarRange(6, 10, 'month'))
  .map(function(img) {
    var good = img.select('QC_Day').bitwiseAnd(3).eq(0);
    var lst = img.select('LST_Day_1km').multiply(0.02).subtract(273.15).rename('LST');
    return lst.updateMask(good).copyProperties(img, ['system:time_start']);
  });

var rows = ee.FeatureCollection(coll.map(function(img) {
  var m = img.reduceRegion({reducer: ee.Reducer.mean(),  geometry: geom, scale: SCALE, maxPixels: 1e13});
  var n = img.reduceRegion({reducer: ee.Reducer.count(), geometry: geom, scale: SCALE, maxPixels: 1e13});
  return ee.Feature(null, {
    date: ee.Date(img.get('system:time_start')).format('yyyy-MM-dd'),
    LST: m.get('LST'), n_pixels: n.get('LST'), sensor: 'MODIS_Aqua_MYD11A1'
  });
})).filter(ee.Filter.notNull(['LST']));

print('Rows (images with valid LST)', rows.size());
Export.table.toDrive({collection: rows, description: 'LST_MODIS_Aqua_perimage_2002_2024',
  folder: 'EarthEngineExports', fileFormat: 'CSV',
  selectors: ['date', 'LST', 'n_pixels', 'sensor']});
