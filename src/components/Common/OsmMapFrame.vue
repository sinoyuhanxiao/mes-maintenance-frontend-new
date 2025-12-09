<!-- src/components/Common/OsmMapFrame.vue -->
<template>
  <div class="map-frame-wrapper" :style="{ width: props.width }">
    <div ref="mapEl" class="map-frame"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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
  // default to "middle of Canada + US"
  lat : {
    type : Number,
    default : 48
  },
  lng : {
    type : Number,
    default : -97.0
  },
  // small delta -> close zoom, large delta (e.g. 40) -> continent view
  delta : {
    type : Number,
    default : 40
  },
  // control whether the blue dot should be shown
  showMarker : {
    type : Boolean,
    default : true
  },
  width : {
    type : String,
    default : '100%'
  }
} )

const mapEl = ref( null )
let map = null
let view = null
let markerSource = null
let markerFeature = null

// smaller delta => higher zoom, big delta => continent-level
const deltaToZoom = delta => {
  if ( delta <= 0.0025 ) return 16
  if ( delta <= 0.005 ) return 15
  if ( delta <= 0.01 ) return 14
  if ( delta <= 0.02 ) return 13
  if ( delta < 10 ) return 12 // city / region
  return 3 // North America-ish view
}

const validCoord = n => Number.isFinite( n ) && Math.abs( n ) > 0.0001

const setupMap = () => {
  const baseLayer = new TileLayer( {
    source : new OSM()
  } )

  markerSource = new VectorSource()
  const markerLayer = new VectorLayer( {
    source : markerSource
  } )

  view = new View( {
    center : fromLonLat( [props.lng, props.lat] ),
    zoom : deltaToZoom( props.delta )
  } )

  map = new Map( {
    target : mapEl.value,
    layers : [baseLayer, markerLayer],
    view,
    // Disable zooming, keep panning
    interactions : defaultInteractions( {
      mouseWheelZoom : false,
      doubleClickZoom : false,
      pinchZoom : false
    } )
  } )

  // Only create marker if we explicitly want it and coords are valid
  if ( props.showMarker && validCoord( props.lat ) && validCoord( props.lng ) ) {
    createOrUpdateMarker()
  }
}

const createOrUpdateMarker = () => {
  if ( !markerFeature ) {
    markerFeature = new Feature()
    markerSource.addFeature( markerFeature )
    markerFeature.setStyle(
      new Style( {
        image : new CircleStyle( {
          radius : 6,
          fill : new Fill( { color : '#4B7BFF' } ),
          stroke : new Stroke( { color : '#ffffff', width : 2 } )
        } )
      } )
    )
  }

  const coord = fromLonLat( [props.lng, props.lat] )
  markerFeature.setGeometry( new Point( coord ) )
}

const removeMarker = () => {
  if ( markerFeature && markerSource ) {
    markerSource.removeFeature( markerFeature )
    markerFeature = null
  }
}

const updateViewAndMarker = () => {
  if ( !view ) return

  // update center *and* zoom whenever props change
  const centerCoord = fromLonLat( [props.lng, props.lat] )
  view.setCenter( centerCoord )
  view.setZoom( deltaToZoom( props.delta ) )

  if ( props.showMarker && validCoord( props.lat ) && validCoord( props.lng ) ) {
    createOrUpdateMarker()
  } else {
    removeMarker()
  }
}

onMounted( () => {
  setupMap()
} )

onBeforeUnmount( () => {
  if ( map ) {
    map.setTarget( null )
    map = null
  }
} )

// react to changes from parent (coords / showMarker / delta)
watch(
  () => [props.lat, props.lng, props.showMarker, props.delta],
  () => {
    updateViewAndMarker()
  }
)
</script>

<style scoped lang="scss">
.map-frame-wrapper {
  height: 220px;
  border-radius: 4px;
  overflow: hidden;
}

.map-frame {
  width: 100%;
  height: 100%;
}
</style>
