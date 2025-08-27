<template>
  <div class="t2-sub-items">
    <div class="image-section">
      <div class="image-container" ref="imageContainer">
        <el-image :src="imageUrl" :alt="imageAlt" fit="cover" :preview-src-list="[]" @load="onImageLoad">
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
              <span>No Image</span>
            </div>
          </template>
        </el-image>
        <!-- Draggable Pins -->
        <DraggablePin
          v-for="pin in pins"
          :key="pin.id"
          :id="pin.id"
          :number="pin.number"
          :text="pin.text"
          :position="pin.position"
          :circle-color="pin.circleColor"
          :is-edit-mode="isEditMode"
          @position-change="onPinPositionChange"
        />
      </div>

      <!-- Edit Controls -->
      <div class="edit-controls" v-if="isEditMode">
        <el-button type="primary" @click="saveChanges" size="small" :loading="loading">
          <el-icon><Check /></el-icon>
          Save
        </el-button>
        <el-button @click="cancelChanges" size="small">
          <el-icon><Close /></el-icon>
          Cancel
        </el-button>
      </div>

      <!-- Instruction Text -->
      <div class="instruction-text" v-if="isEditMode">Drag pins to reposition them</div>

      <!-- Edit Button -->
      <div class="edit-button-container" v-if="!isEditMode">
        <el-button type="primary" circle size="small" @click="toggleEditMode">
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-button type="success" circle size="small" @click="showImageUpload" style="margin-left: 10px">
          <el-icon><Upload /></el-icon>
        </el-button>
      </div>

      <!-- Image Upload Dialog -->
      <el-dialog
        v-model="imageUploadVisible"
        title="Update Equipment Image"
        width="500px"
        :close-on-click-modal="false"
      >
        <div class="upload-content">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :file-list="fileList"
            accept="image/*"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">Drop image here or <em>click to upload</em></div>
            <template #tip>
              <div class="el-upload__tip">Only jpg/png files with a size less than 2MB</div>
            </template>
          </el-upload>

          <div v-if="selectedFile" class="preview-section">
            <h4>Preview:</h4>
            <el-image :src="previewUrl" style="width: 200px; height: 150px; object-fit: cover" fit="cover" />
          </div>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="imageUploadVisible = false">Cancel</el-button>
            <el-button type="primary" @click="uploadImage" :loading="uploadLoading" :disabled="!selectedFile">
              Upload
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <div class="label-cards">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <el-alert type="error" :title="error" show-icon />
        <el-button @click="fetchEquipmentNodes" size="small" style="margin-top: 10px"> Retry </el-button>
      </div>

      <!-- Data State -->
      <el-row v-else :gutter="0">
        <el-col
          v-for="(item, index) in displayItems"
          :key="item.id || item.equipment_node_id"
          :xs="24"
          :sm="24"
          :md="24"
          :lg="24"
        >
          <EquipmentSubItemCard
            :number="index + 1"
            :text="item.name || item.text"
            :text-type="item.textType || 'default'"
            :text-size="item.textSize || 'default'"
            :circle-color="item.circleColor"
            :is-selected="selectedPinNumber === index + 1"
            @click="selectPin(index + 1)"
          />
        </el-col>
      </el-row>
      <!-- <el-text>DIAGRAM {{ pins }} ID: {{ diagramId }}</el-text> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Picture, Edit, Check, Close, Upload, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElSkeleton } from 'element-plus'
import DraggablePin from '@/components/SubItem/DraggablePin.vue'
import EquipmentSubItemCard from './components/EquipmentSubItemCard.vue'
import { savePinPositions, loadPinPositions } from '@/utils/pinStorage'
import {
  searchEquipmentNodes,
  getEquipmentDiagram,
  patchEquipmentDiagram,
  createEquipmentDiagram,
  // updateEquipmentNodeDiagramId,
  updateEquipmentNodeImage,
  getEquipmentById
} from '@/api/equipment'
import { uploadToMinio } from '@/api/minio'

const emit = defineEmits( ['sub-item-click', 'image-updated'] )

const props = defineProps( {
  // imageUrl : {
  //   type : String,
  //   default : 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  // },
  imageAlt : {
    type : String,
    default : 'Equipment image'
  },
  entityId : {
    type : Number,
    default : 1
  },
  tierType : {
    type : String,
    default : 'equipment_group',
    validator : value => ['equipment', 'equipment_group'].includes( value )
  }
} )

// Reactive state
const isEditMode = ref( false )
const pins = ref( [] )
const originalPositions = ref( [] )
const selectedPinNumber = ref( null )
const imageContainer = ref( null )
const equipmentNodes = ref( [] )
const loading = ref( false )
const error = ref( null )

// Image upload state
const imageUploadVisible = ref( false )
const uploadRef = ref( null )
const fileList = ref( [] )
const selectedFile = ref( null )
const previewUrl = ref( '' )
const uploadLoading = ref( false )

// Computed
const displayItems = computed( () => {
  return Array.isArray( equipmentNodes.value ) ? equipmentNodes.value : []
} )

const defaultPins = computed( () => {
  return ( Array.isArray( equipmentNodes.value ) ? equipmentNodes.value : [] ).map( ( item, index ) => ( {
    id : item.id || item.equipment_node_id,
    number : index + 1,
    text : item.name || item.text,
    position : { x : 10, y : 10 + index * 5 },
    circleColor : item.circleColor || '#409EFF',
    isVisible : true
  } ) )
} )

// Methods
const fetchEquipmentNodes = async() => {
  if ( !props.entityId ) {
    return
  }

  try {
    loading.value = true
    error.value = null

    let nodeTypeIds = []
    if ( props.tierType === 'equipment_group' ) {
      nodeTypeIds = [5]
    } else if ( props.tierType === 'equipment' ) {
      nodeTypeIds = [6]
    }

    const searchCriteria = {
      parent_ids : [props.entityId],
      node_type_ids : nodeTypeIds,
      size : 100,
      page : 1,
      sortField : 'createdAt',
      direction : 'DESC'
    }

    const response = await searchEquipmentNodes( searchCriteria )

    if ( response && response.data && response.data.content ) {
      equipmentNodes.value = response.data.content
    } else if ( response && response.data && Array.isArray( response.data ) ) {
      equipmentNodes.value = response.data
    } else if ( response && Array.isArray( response ) ) {
      equipmentNodes.value = response
    } else if ( response && response.content ) {
      equipmentNodes.value = response.content
    } else {
      equipmentNodes.value = []
    }

    await loadPinsFromBackend()
  } catch ( err ) {
    console.error( 'Error fetching equipment nodes:', err )
    error.value = err.message || 'Failed to fetch equipment nodes'
    ElMessage.error( `Failed to fetch equipment nodes: ${err.message}` )
  } finally {
    loading.value = false
  }
}

const diagramId = ref( null )
const imageUrl = ref( null )

async function getEquipment() {
  const response = await getEquipmentById( props.entityId )

  diagramId.value = response.data.diagram_id
  imageUrl.value = response.data.exploded_view_drawing
}

getEquipment()

watch(
  () => props.entityId,
  newVal => {
    getEquipment()
    loadPinsFromBackend()
  },
  { deep : true }
)

const saveToBackend = async() => {
  try {
    loading.value = true

    const backendPins = pins.value.map( ( pin, index ) => {
      console.log( pin )
      const equipmentNodeId = parseInt( pin.equipment_node_id ) || pin.id

      return {
        equipment_node_id : equipmentNodeId,
        name : pin.text || `Pin ${index + 1}`,
        position : {
          x : Math.round( pin.position.x ) || 0,
          y : Math.round( pin.position.y ) || 0
        },
        sequence_order : index + 1
      }
    } )

    const validPins = backendPins.filter( pin => {
      const isValid =
        ( pin.equipment_node_id || pin.id ) &&
        pin.name &&
        pin.position &&
        typeof pin.position.x === 'number' &&
        typeof pin.position.y === 'number'
      if ( !isValid ) {
        console.warn( 'Invalid pin data:', pin )
      }
      return isValid
    } )

    if ( validPins.length === 0 ) {
      throw new Error( 'No valid pins data to save' )
    }

    const request = {
      pins : validPins
    }

    if ( !diagramId.value ) {
      try {
        const payload = {
          pins : validPins
        }

        await createEquipmentDiagram( payload, props.entityId )

        // const newDiagramId = res?.data?.data?.id ?? res?.data?.id ?? res?.id

        // if ( !newDiagramId ) {
        //   throw new Error( 'Failed to get diagram ID from create response' )
        // } else {
        //   await updateEquipmentNodeDiagramId( props.entityId, newDiagramId )
        //   ElMessage.success( 'Diagram created and associated successfully' )
        // }

        await getEquipment()
      } catch ( createErr ) {
        console.error( 'Error creating diagram:', createErr )
        if ( createErr.response?.data ) {
          ElMessage.error( `Failed to create diagram: ${createErr.response.data.message || createErr.message}` )
        } else {
          ElMessage.error( `Failed to create diagram: ${createErr.message}` )
        }
        savePinPositionsToStorage()
      }
    } else {
      try {
        console.log( request )
        await patchEquipmentDiagram( diagramId.value, request )
        ElMessage.success( 'Diagram updated successfully' )
      } catch ( updateErr ) {
        console.error( 'Error updating diagram:', updateErr )
        ElMessage.error( `Failed to update diagram: ${updateErr.message}` )
      }
    }
  } catch ( err ) {
    console.error( 'Error saving to backend:', err )
    ElMessage.error( `Failed to save diagram: ${err.message}` )
  } finally {
    loading.value = false
  }
}

const loadPinPositionsFromStorage = () => {
  const savedPins = loadPinPositions( props.entityId, props.tierType )
  if ( savedPins && savedPins.length > 0 ) {
    pins.value = savedPins
  } else {
    pins.value = defaultPins.value
  }
}

const loadPinsFromBackend = async() => {
  try {
    if ( !diagramId.value ) return loadPinPositionsFromStorage()
    console.log( diagramId.value )
    const res = await getEquipmentDiagram( diagramId.value )
    console.log( res )
    const pinsPayload = Array.isArray( res?.data?.pins )
      ? res.data.pins
      : Array.isArray( res?.pins )
        ? res.pins
        : Array.isArray( res )
          ? res
          : []

    if ( pinsPayload.length ) {
      console.log( pinsPayload )
      pins.value = pinsPayload.map( ( p, idx ) => ( {
        equipment_node_id : p.equipmentNodeId,
        number : p.sequenceOrder ?? idx + 1,
        text : p.name,
        position : { x : p.position?.x ?? 10, y : p.position?.y ?? 10 + idx * 5 },
        circleColor : '#409EFF',
        isVisible : true
      } ) )
    } else {
      loadPinPositionsFromStorage()
    }
  } catch ( err ) {
    console.error( 'Failed to load diagram pins:', err )
    loadPinPositionsFromStorage()
  }
}

const savePinPositionsToStorage = () => {
  const success = savePinPositions( props.entityId, props.tierType, pins.value )
  if ( success ) {
    ElMessage.success( 'Pin positions saved locally' )
  } else {
    ElMessage.error( 'Failed to save pin positions locally' )
  }
}

const toggleEditMode = () => {
  if ( !isEditMode.value ) {
    originalPositions.value = JSON.parse( JSON.stringify( pins.value ) )
    isEditMode.value = true
  }
}

const saveChanges = async() => {
  savePinPositionsToStorage()
  await saveToBackend()
  isEditMode.value = false
  originalPositions.value = []
}

const cancelChanges = () => {
  pins.value = originalPositions.value
  isEditMode.value = false
  originalPositions.value = []
  ElMessage.info( 'Changes cancelled' )
}

const onPinPositionChange = ( pinId, x, y ) => {
  const pinIndex = pins.value.findIndex( pin => pin.id === pinId )
  if ( pinIndex !== -1 ) {
    pins.value[pinIndex].position = { x, y }
  }
}

const selectPin = pinNumber => {
  selectedPinNumber.value = pinNumber

  const selectedItem = displayItems.value[pinNumber - 1]
  if ( selectedItem ) {
    emit( 'sub-item-click', selectedItem, pinNumber )
  }
}

const onImageLoad = () => {
  // Image loaded, pins should be positioned correctly
}

// Image upload methods
const showImageUpload = () => {
  imageUploadVisible.value = true
  fileList.value = []
  selectedFile.value = null
  previewUrl.value = ''
}

const handleFileChange = file => {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL( file.raw )
}

const beforeUpload = file => {
  const isImage = file.type.startsWith( 'image/' )
  const isLt2M = file.size / 1024 / 1024 < 2

  if ( !isImage ) {
    ElMessage.error( 'Upload file can only be image format!' )
    return false
  }
  if ( !isLt2M ) {
    ElMessage.error( 'Upload image size can not exceed 2MB!' )
    return false
  }
  return false
}

const uploadImage = async() => {
  if ( !selectedFile.value ) {
    ElMessage.warning( 'Please select an image first' )
    return
  }

  try {
    uploadLoading.value = true

    const uploadResponse = await uploadToMinio( selectedFile.value.raw )

    const imageUrl =
      uploadResponse.data ||
      uploadResponse.url ||
      uploadResponse.data?.url ||
      uploadResponse.fileUrl ||
      uploadResponse.data?.fileUrl

    if ( !imageUrl ) {
      throw new Error( 'Failed to get image URL from upload response' )
    }

    try {
      await updateEquipmentNodeImage( props.entityId, imageUrl )
    } catch ( updateError ) {
      console.error( 'Equipment node update failed:', updateError )
      throw updateError
    }

    emit( 'image-updated', imageUrl )

    ElMessage.success( 'Image updated successfully' )
    imageUploadVisible.value = false

    fileList.value = []
    selectedFile.value = null
    previewUrl.value = ''
  } catch ( error ) {
    console.error( 'Error uploading image:', error )
    ElMessage.error( `Failed to upload image: ${error.message}` )
  } finally {
    uploadLoading.value = false
  }
}

// Lifecycle
onMounted( () => {
  fetchEquipmentNodes()
} )

// Watch for entity changes
watch(
  () => props.entityId,
  () => {
    if ( props.entityId ) {
      fetchEquipmentNodes()
    }
  }
)
</script>

<style scoped>
.t2-sub-items {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 10px;
  min-height: 400px;
}

.image-section {
  flex: 1;
  position: relative;
  height: calc(100vh - 280px);
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.edit-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 30;
}

.instruction-text {
  position: absolute;
  bottom: 20px;
  left: 200px;
  color: #409eff;
  font-size: 14px;
  z-index: 30;
}

.edit-button-container {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 30;
}

.label-cards {
  flex: 0 0 300px;
  height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 5px;
}

.image-slot {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-section {
  text-align: center;
}

.preview-section h4 {
  margin-bottom: 10px;
  color: #606266;
}

.upload-demo {
  width: 100%;
}
</style>
