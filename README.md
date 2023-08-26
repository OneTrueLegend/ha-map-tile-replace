# ha-map-tile-replace

A hacky way of replacing the default Carto map tiles with a tile server of your choice.

Handles both raster & vector tiles

## Load into Home Assistant

Download zip file and extract into the ./www directory
Should look like ./www/ha-map-tile-replace/ha-map-tile-replace.js

```yaml
frontend:
  extra_module_url:
    - /local/ha-map-tile-replace/ha-map-tile-replace.js
```
