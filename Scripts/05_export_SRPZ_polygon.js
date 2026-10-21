var roi = ee.FeatureCollection('projects/ee-abeosekoh/assets/40kmbuffer');
print('Features', roi.size());
print('Geodesic area (km2)', roi.geometry().area(1).divide(1e6));

Export.table.toDrive({collection: roi, description: 'SRPZ_polygon', folder: 'EarthEngineExports', fileFormat: 'GeoJSON'});
Export.table.toDrive({collection: roi, description: 'SRPZ_polygon_shp', folder: 'EarthEngineExports', fileFormat: 'SHP'});
