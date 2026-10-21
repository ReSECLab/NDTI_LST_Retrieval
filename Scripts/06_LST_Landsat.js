var roi = ee.FeatureCollection('projects/ee-abeosekoh/assets/40kmbuffer');
var geom = roi.geometry();
Map.centerObject(roi, 8);

var collection = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(geom)
  .filterDate('2014-06-01', '2014-11-01')
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .filter(ee.Filter.eq('PROCESSING_LEVEL', 'L2SP'))
  .map(function(img) {
    var clear = img.select('QA_PIXEL').bitwiseAnd(0x3F).eq(0);

    var kelvin = img.select('ST_B10')
      .multiply(0.00341802)
      .add(149.0)
      .rename('LST_K');

    var celsius = kelvin.subtract(273.15).rename('LST_C');

    return celsius
      .updateMask(clear)
      .clip(geom)
      .copyProperties(img, ['system:time_start']);
  });

print('Image count:', collection.size());
print('Available dates:', collection.aggregate_array('system:time_start'));

var sceneStats = ee.FeatureCollection(collection.map(function(img) {
  var date = ee.Date(img.get('system:time_start'));
  var meanTemp = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geom,
    scale: 30,
    maxPixels: 1e13
  }).get('LST_C');

  return ee.Feature(null, {
    'date': date.format('yyyy-MM-dd'),
    'temperature_C': meanTemp,
    'timestamp': date.millis()
  });
})).filter(ee.Filter.notNull(['temperature_C'])).sort('timestamp');

print('Scene LST Stats (2014):', sceneStats);

var chart = ui.Chart.feature.byFeature(sceneStats, 'date', 'temperature_C')
  .setChartType('LineChart')
  .setOptions({
    title: 'Scene Mean Land Surface Temperature (°C): Jun–Oct 2014',
    hAxis: { title: 'Date', slantedText: true },
    vAxis: { title: 'Temperature (°C)' },
    lineWidth: 2,
    pointSize: 4,
    colors: ['#ff7f0e']
  });
print(chart);

Export.table.toDrive({
  collection: sceneStats,
  description: 'LST_Landsat8_SceneStats_2014',
  fileFormat: 'CSV',
  selectors: ['date', 'temperature_C']
});

var meanImage = collection.mean();

Map.addLayer(meanImage, {
  min: 10, max: 45,
  palette: ['blue', 'cyan', 'yellow', 'orange', 'red']
}, 'Mean LST (°C) Jun–Oct 2014', true);

Export.image.toDrive({
  image: meanImage,
  description: 'Landsat8_LST_Mean_2014',
  folder: 'EarthEngineExports',
  region: roi.geometry(),
  scale: 30,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});
