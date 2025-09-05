<template>
  <el-form ref="formRef" :model="localForm" :rules="rules" label-width="150px" class="location-form">
    <el-form-item label="Name" prop="name">
      <el-input v-model="localForm.name" placeholder="Enter location name" clearable />
    </el-form-item>

    <el-form-item label="Code" prop="code">
      <el-input v-model="localForm.code" placeholder="Enter unique location code" clearable />
    </el-form-item>

    <el-form-item label="Location Type">
      <el-select v-model="localForm.location_type_id" placeholder="Select location type" clearable>
        <el-option v-for="type in locationTypes" :key="type.id" :label="type.name" :value="type.id" />
      </el-select>
    </el-form-item>

    <el-form-item label="Capacity" prop="capacity">
      <el-input-number v-model="localForm.capacity" :min="0" />
    </el-form-item>

    <el-form-item label="Address">
      <el-input v-model="localForm.address" placeholder="Enter address" clearable />
    </el-form-item>

    <el-form-item label="Description">
      <el-input type="textarea" v-model="localForm.description" placeholder="Enter description" clearable />
    </el-form-item>

    <!-- Images -->
    <el-form-item label="Images">
      <FileUploadMultiple
        :key="uploaderKey"
        upload-type="images"
        :max-images="5"
        :existing-image-list="existingImageUrls"
        image-label=""
        file-label=""
        @update:imageList="onNewImages"
        @update:removedExistingImages="onRemovedExistingImages"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'

const props = defineProps( {
  modelValue : { type : Object, required : true },
  locationTypes : { type : Array, required : true }
} )
const emit = defineEmits( ['update:modelValue'] )
const formRef = ref( null )

/** Force a clean remount of FileUploadMultiple on fresh-create forms */
const uploaderKey = ref( 0 )

/**
 * IMPORTANT MODEL SHAPE (local and parent):
 * - image_list: string[] of URLs (existing on server)
 * - image_files: File[] of new picks (to upload)
 * - removed_existing_images: string[] of URLs to delete
 */
const localForm = reactive( {
  name : '',
  code : '',
  location_type_id : null,
  capacity : '',
  address : '',
  description : '',
  image_list : [], // URLs (server)
  image_files : [], // Files (new)
  removed_existing_images : [], // URLs
  files_list : [], // (reserved if you add files uploader later)
  parent_id : null
} )

let applyingFromParent = false
let lastIsNewForm = false

/** Detect a fresh-create form to reset the uploader */
const isNewForm = v => {
  const blankish =
    !v?.name &&
    !v?.code &&
    ( !Array.isArray( v?.image_list ) || v.image_list.length === 0 ) &&
    ( !Array.isArray( v?.files_list ) || v.files_list.length === 0 )
  return blankish && v?.id == null
}

/** Show existing images from parent (strings or {url}) */
const existingImageUrls = computed( () => {
  const src = props.modelValue?.image_list
  if ( Array.isArray( src ) ) {
    return src.map( x => ( typeof x === 'string' ? x : x?.url ?? '' ) ).filter( Boolean )
  }
  return []
} )

/** Child → URLs to delete */
const onRemovedExistingImages = urls => {
  const removed = Array.isArray( urls ) ? urls : []
  // accumulate (in case child emits several times)
  const set = new Set( [...( localForm.removed_existing_images || [] ), ...removed] )
  localForm.removed_existing_images = Array.from( set )

  // immediately hide from UI by removing from local URL list
  const asSet = new Set( removed )
  localForm.image_list = ( localForm.image_list || [] ).filter( u => !asSet.has( typeof u === 'string' ? u : u?.url ) )
}

/** Child → Files to upload */
const onNewImages = files => {
  localForm.image_files = Array.isArray( files ) ? files : []
}

/** Parent -> Local */
watch(
  () => props.modelValue,
  ( v = {} ) => {
    applyingFromParent = true

    // Primitive & select fields
    localForm.name = v.name || ''
    localForm.code = v.code || ''
    localForm.location_type_id = v.location_type?.id ?? v.location_type_id ?? null
    localForm.capacity = v.capacity ?? ''
    localForm.address = v.address || ''
    localForm.description = v.description || ''
    localForm.parent_id = v.parent_id ?? null

    // KEEP URL LIST from parent as URLs (do not convert to Files)
    localForm.image_list = Array.isArray( v.image_list )
      ? v.image_list.map( x => ( typeof x === 'string' ? x : x?.url ?? '' ) ).filter( Boolean )
      : []

    // New files live separately; do not read them from parent's image_list
    localForm.image_files = Array.isArray( v.image_files ) ? v.image_files.filter( f => f instanceof File ) : []

    // Removed URLs
    localForm.removed_existing_images = Array.isArray( v.removed_existing_images ) ? v.removed_existing_images : []

    // Reset uploader on fresh create
    const nowNew = isNewForm( v )
    if ( nowNew && !lastIsNewForm ) {
      uploaderKey.value += 1
    }
    lastIsNewForm = nowNew

    nextTick( () => {
      applyingFromParent = false
    } )
  },
  { immediate : true, deep : true }
)

/** Local -> Parent (do NOT overwrite image_list URLs with Files) */
watch(
  localForm,
  val => {
    if ( applyingFromParent ) return
    const location_type = props.locationTypes.find( t => t.id === val.location_type_id ) || null
    emit( 'update:modelValue', {
      ...val,
      location_type,
      // Ensure correct types are emitted:
      image_list : Array.isArray( val.image_list ) ? val.image_list : [],
      image_files : Array.isArray( val.image_files ) ? val.image_files : [],
      removed_existing_images : Array.isArray( val.removed_existing_images ) ? val.removed_existing_images : []
    } )
  },
  { deep : true }
)

const rules = {
  name : [{ required : true, message : 'Name is required', trigger : 'blur' }],
  code : [{ required : true, message : 'Code is required', trigger : 'blur' }]
}

defineExpose( {
  validate : () => formRef.value?.validate(),
  resetFields : () => formRef.value?.resetFields?.(),
  getFormData : () => ( { ...localForm } )
} )
</script>

<style scoped lang="scss">
.location-form {
  max-width: 600px;
  margin: 0 auto;

  .el-input,
  .el-select,
  textarea {
    max-width: 500px;
    width: 100%;
  }
}
</style>
