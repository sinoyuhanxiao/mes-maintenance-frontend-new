<template>
  <div id="map" class="map" />
</template>

<script setup>
import { onMounted } from 'vue'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { fromLonLat } from 'ol/proj'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
import { defaults as defaultInteractions } from 'ol/interaction'

const props = defineProps( {
  locations : Array,
  zoom : Number,
  centerLon : Number,
  centerLat : Number
} )

onMounted( () => {
  const baseLayer = new TileLayer( {
    source : new OSM()
  } )

  const markerSource = new VectorSource()
  const markerLayer = new VectorLayer( {
    source : markerSource
  } )

  if ( props.locations.length ) {
    props.locations.forEach( loc => {
      const coord = fromLonLat( [loc.lon, loc.lat] )
      const feature = new Feature( {
        geometry : new Point( coord )
      } )

      feature.setStyle(
        new Style( {
          image : new CircleStyle( {
            radius : 6,
            fill : new Fill( { color : '#4B7BFF' } ),
            stroke : new Stroke( { color : '#fff', width : 2 } )
          } )
        } )
      )

      markerSource.addFeature( feature )
    } )
  }

  const view = new View( {
    center : fromLonLat( [props.centerLon, props.centerLat] ),
    zoom : props.zoom
  } )

  const map = new Map( {
    target : 'map',
    layers : [baseLayer, markerLayer],
    view,
    interactions : defaultInteractions( {
      mouseWheelZoom : false,
      doubleClickZoom : false,
      pinchZoom : false
    } )
  } )

  if ( props.locations.length ) {
    const extent = markerSource.getExtent()
    if ( extent && isFinite( extent[0] ) ) {
      view.fit( extent, {
        padding : [40, 40, 40, 40],
        maxZoom : props.zoom + 2
      } )
    }
  }

  window._mesMap = map
} )
</script>

<style scoped>
.map {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
