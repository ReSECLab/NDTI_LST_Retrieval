# Google Earth Engine processing scripts

Scripts for extracting study-area mean NDTI and surface temperature from MODIS Aqua, Landsat, and Sentinel-2 imagery. NDTI is dimensionless; temperature is in degrees Celsius. Satellite source imagery is accessed through the Earth Engine data catalogue.

## Files and settings

| Script | Source | Period | Reduction scale | Outputs |
| --- | --- | --- | --- | --- |
| 01_NDTI_MODIS_Aqua.js | MODIS/061/MYD09GA | June–October, 2002–2024 | 500 m | Per-image NDTI CSV |
| 02_NDTI_Landsat.js | Landsat 5, 7, 8 and 9 Collection 2 Tier 1 Level 2 | June–October, 1984–2024 | 30 m | Per-scene NDTI CSV |
| 03_NDTI_Sentinel2.js | COPERNICUS/S2_SR_HARMONIZED | June–October, 2019–2024 | 20 m | Per-image NDTI CSV |
| 04_LST_MODIS_Aqua.js | MODIS/061/MYD11A1 | June–October, 2002–2024 | 1,000 m | Per-image daytime temperature CSV |
| 05_export_SRPZ_polygon.js | Study-area asset | Not applicable | Not applicable | GeoJSON and shapefile |
| 06_LST_Landsat.js | LANDSAT/LC08/C02/T1_L2 | June–October 2014 | 30 m | Per-scene temperature CSV and mean-temperature GeoTIFF |

The reduction scale is the sampling scale used by the script, not necessarily the native resolution of every input band. The Landsat temperature script covers only 2014; it is not a multiyear temperature series.

## Requirements and study area

An Earth Engine-enabled Google account and project, access to the Code Editor, and Google Drive space for exports are required.

Every script currently references `projects/ee-abeosekoh/assets/40kmbuffer`. This is an author-specific asset, and its access permissions have not been verified. The study-area polygon is not included in this ZIP.

The asset owner can run script 05 to export the exact polygon. Include the resulting GeoJSON or shapefile with the public repository. Other users must import the supplied polygon as an Earth Engine table asset and replace the asset path at the beginning of each script with their own path. A shapefile export contains multiple companion files; retain them together.

## Running the scripts

1. Open https://code.earthengine.google.com/ and select an enabled project.
2. Paste one JavaScript file into a new Code Editor script.
3. Set the study-area asset path and confirm the date range and scale.
4. Click Run and inspect the console output.
5. Open the Tasks tab and start each required export. Exports are not downloaded automatically when the script runs.
6. Download completed files from Google Drive. Most scripts use the EarthEngineExports folder; the Landsat temperature CSV uses the destination selected in its task dialog.

Run scripts independently. For large requests, export shorter year ranges. Earth Engine end dates are exclusive; the Landsat temperature end date of 2014-11-01 includes October 31.



