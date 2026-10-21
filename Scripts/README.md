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

## Processing and output interpretation

- NDTI is calculated as (red − green) / (red + green).
- MODIS reflectance screening retains cloud-state values of zero using both bits 0–1 of state_1km.
- Landsat NDTI applies the reflectance scale and offset and retains pixels with QA_PIXEL bits 1–5 equal to zero.
- Sentinel-2 uses CLOUDY_PIXEL_PERCENTAGE < 20 and retains SCL classes 5, 6 and 7. This retains bare soil and unclassified pixels as well as water.
- MODIS temperature uses QC_Day bits 0–1 equal to zero and converts the daytime band to Celsius.
- Landsat temperature uses CLOUD_COVER < 30 and L2SP scenes with surface-temperature data. Pixel-level screening additionally requires QA_PIXEL bits 0–5 to be zero, excluding fill, dilated cloud, high-confidence cirrus, cloud, cloud shadow, and snow. This mask is applied before calculating scene means and the mean-temperature GeoTIFF. It is not a water-only mask.
- No additional water-only mask or cross-sensor harmonisation is applied. Results depend on the supplied study polygon.
- The normalizedDifference operation retains its original behavior: negative input reflectance values are masked. This can affect Landsat water observations after applying the reflectance offset.
- Rows represent individual images or scenes, not daily composites. Multiple rows may share the same date. Scenes may cover only part of the study area. n_pixels, where provided, counts valid samples at the selected reduction scale.
- CSVs from scripts 01–04 contain date, NDTI or LST, n_pixels, and sensor. Script 06 exports date and temperature_C. Missing means are excluded.
- The Landsat GeoTIFF is a per-pixel mean of the available scenes in the selected period.

## Corrections in this version

Code comments were removed as requested. Landsat temperature labels and filenames now match the existing 2014 date filter. October 31 is included, geometry arguments are corrected, scenes without surface-temperature processing are excluded, missing temperature means are removed, and the series is labelled per-scene rather than daily. Output tables are explicitly converted to FeatureCollections. MODIS NDTI now checks both cloud-state bits rather than only bit 0.

The MODIS cloud-mask correction, Landsat temperature date-boundary correction, and newly added Landsat temperature pixel-level mask can change regenerated values. Remaining original scientific settings, including scales and screening thresholds, have been retained. Verify these settings against the manuscript and compare regenerated results before describing this package as reproducing the published results.

## Validation and availability

JavaScript syntax has been checked locally. These scripts have not been executed in an authenticated Earth Engine session, and equivalence to the manuscript's results has not been verified. This package contains processing code and documentation only, not processed outputs or the study-area polygon.

## Earth Engine references

- https://developers.google.com/earth-engine/apidocs/ee-image-clip
- https://developers.google.com/earth-engine/apidocs/ee-image-normalizeddifference
- https://developers.google.com/earth-engine/apidocs/ee-imagecollection-filterdate
- https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MYD09GA

Landsat pixel-quality bit definitions: https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2
