<template>
  <el-form
    ref="formRef"
    :model="localForm"
    :rules="rules"
    label-width="150px"
    class="location-form"
    label-position="top"
  >
    <!-- Two-column group (before Address) -->
    <div class="grid-2">
      <el-form-item label="Name" prop="name">
        <el-input v-model="localForm.name" placeholder="Enter location name" clearable />
      </el-form-item>

      <el-form-item label="Code" prop="code">
        <el-input v-model="localForm.code" placeholder="Enter unique location code" clearable />
      </el-form-item>

      <el-form-item label="Location Type" prop="location_type_id">
        <el-select v-model="localForm.location_type_id" placeholder="Select location type" clearable>
          <el-option v-for="type in locationTypes" :key="type.id" :label="type.name" :value="type.id" />
        </el-select>
      </el-form-item>

      <!-- Person in Charge (remote search) -->
      <el-form-item label="Person in Charge" prop="person_in_charge_id">
        <el-select
          v-model="localForm.person_in_charge_id"
          placeholder="Search users"
          clearable
          filterable
          remote
          reserve-keyword
          :remote-method="onSearchUsers"
          :loading="userLoading"
          @visible-change="v => v && preloadUsers()"
        >
          <el-option v-for="u in userOptions" :key="u.id" :label="userLabel(u)" :value="u.id" />
        </el-select>
      </el-form-item>
    </div>

    <!-- Address (root required, auto-geocode) -->
    <el-form-item class="full-span" prop="address">
      <template #label>
        <span>
          <span v-if="isRootLocation" style="color: red; margin-right: 4px">*</span>
          Address
        </span>
      </template>

      <el-input
        v-model="localForm.address"
        placeholder="Enter street name, city, state/province, country"
        :prefix-icon="Search"
        clearable
      />
    </el-form-item>

    <!-- Map preview (always visible, default to North America if no coords) -->
    <el-form-item class="full-span">
      <div class="map-preview">
        <OsmMapFrame :lat="mapCenter.lat" :lng="mapCenter.lng" :delta="hasCoords ? 0.02 : 40" :showMarker="hasCoords" />
      </div>
    </el-form-item>

    <!-- Full-width Description -->
    <el-form-item label="Description" class="full-span">
      <el-input type="textarea" v-model="localForm.description" placeholder="Enter description" :rows="4" clearable />
    </el-form-item>

    <!-- Full-width Images -->
    <el-form-item label="Images" class="full-span">
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
import axios from 'axios'
import { ElMessage } from 'element-plus'
import FileUploadMultiple from '@/components/FileUpload/FileUploadMultiple.vue'
import OsmMapFrame from '@/components/Common/OsmMapFrame.vue'
import { searchUsers, getUserById } from '@/api/user'
import { Search } from '@element-plus/icons-vue'

const props = defineProps( {
  modelValue : { type : Object, required : true },
  locationTypes : { type : Array, required : true }
} )
const emit = defineEmits( ['update:modelValue'] )
const formRef = ref( null )

/** Force a clean remount of FileUploadMultiple on fresh-create forms */
const uploaderKey = ref( 0 )

/** Default map center: North America */
const DEFAULT_CENTER = {
  lat : 48, // North America-ish center
  lng : -97
}

/**
 * Local model
 */
const localForm = reactive( {
  name : '',
  code : '',
  location_type_id : null,
  person_in_charge_id : null,
  address : '',
  description : '',
  image_list : [], // URLs (server)
  image_files : [], // Files (new)
  removed_existing_images : [], // URLs
  files_list : [], // reserved
  parent_id : null,
  latitude : null,
  longitude : null
} )

let applyingFromParent = false
let lastIsNewForm = false

// root vs child helper
const isRootLocation = computed( () => {
  return localForm.parent_id === null || localForm.parent_id === undefined
} )

// address validator (root: required, child: optional)
const validateAddress = ( rule, value, callback ) => {
  if ( isRootLocation.value && ( !value || !value.trim() ) ) {
    callback( new Error( 'Address is required for root location' ) )
  } else {
    callback()
  }
}

/** Detect a fresh-create form to reset the uploader */
const isNewForm = v => {
  const blankish =
    !v?.name &&
    !v?.code &&
    ( !Array.isArray( v?.image_list ) || v.image_list.length === 0 ) &&
    ( !Array.isArray( v?.files_list ) || v.files_list.length === 0 )
  return blankish && v?.id == null
}

/** Existing images from parent (strings or {url}) */
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
  const set = new Set( [...( localForm.removed_existing_images || [] ), ...removed] )
  localForm.removed_existing_images = Array.from( set )

  const asSet = new Set( removed )
  localForm.image_list = ( localForm.image_list || [] ).filter( u => !asSet.has( typeof u === 'string' ? u : u?.url ) )
}

/** Child → Files to upload */
const onNewImages = files => {
  localForm.image_files = Array.isArray( files ) ? files : []
}

/** ---------- Users dropdown (remote search) ---------- */
const userOptions = ref( [] )
const userLoading = ref( false )

const userLabel = u => {
  const first = u.first_name ?? u.firstName ?? ''
  const last = u.last_name ?? u.lastName ?? ''
  const name = [first, last].filter( Boolean ).join( ' ' )
  return name || u.username || `#${u.id}`
}

const preloadUsers = async() => {
  if ( userOptions.value.length ) return
  await fetchUsers( '' )
}

let userSearchTimer = null
const onSearchUsers = q => {
  clearTimeout( userSearchTimer )
  userSearchTimer = setTimeout( () => fetchUsers( q || '' ), 250 )
}

const fetchUsers = async keyword => {
  userLoading.value = true
  try {
    const res = await searchUsers( { keyword }, 1, 1000, 'createdAt', 'DESC' )
    const payload = res?.data ?? res
    const page = payload?.data ?? payload
    userOptions.value = Array.isArray( page?.content ) ? page.content : []
  } finally {
    userLoading.value = false
  }
}

// Make sure a pre-selected id has a label option available
const ensureSelectedUserOptionExists = async id => {
  if ( !id ) return
  if ( userOptions.value.some( u => Number( u.id ) === Number( id ) ) ) return
  try {
    const res = await getUserById( id )
    const u = res?.data?.data ?? res?.data ?? res
    if ( u?.id != null ) userOptions.value = [u, ...userOptions.value]
  } catch {}
}

/** ---------- Coords + map center helpers ---------- */
const normalizeCoord = val => {
  if ( val === null || val === undefined || val === '' ) return null
  const n = Number( val )
  if ( !Number.isFinite( n ) ) return null
  // treat 0 as "unset" to avoid (0,0) default ocean view
  if ( n === 0 ) return null
  return n
}

const hasCoords = computed( () => {
  const lat = normalizeCoord( localForm.latitude )
  const lng = normalizeCoord( localForm.longitude )
  return lat !== null && lng !== null
} )

/** Map center:
 *  - if this location has coords → use them
 *  - otherwise → default to North America
 */
const mapCenter = computed( () => {
  if ( hasCoords.value ) {
    return {
      lat : normalizeCoord( localForm.latitude ),
      lng : normalizeCoord( localForm.longitude )
    }
  }
  return DEFAULT_CENTER
} )

/** ---------- Geocoding for address -> latitude/longitude ---------- */
const geocoding = ref( false )

// Normalize multi-line / pasted address into a single line
const normalizeAddressString = raw => {
  if ( !raw ) return ''
  return raw
    .split( /\r?\n+/ ) // split on new lines
    .map( p => p.trim() )
    .filter( Boolean )
    .join( ', ' ) // join with commas
    .replace( /\s+/g, ' ' ) // collapse repeated spaces
    .trim()
}

// reusable geocode function (can be used silent or with toasts)
const handleGeocode = async( addrParam, { silent = false } = {} ) => {
  const raw = addrParam ?? localForm.address
  const addr = normalizeAddressString( raw )
  if ( !addr ) return

  geocoding.value = true
  try {
    const res = await axios.get( 'https://nominatim.openstreetmap.org/search', {
      params : {
        q : addr,
        format : 'json',
        limit : 1
      },
      headers : {
        'Accept-Language' : 'en',
        'User-Agent' : 'mes-qc-frontend/1.0 (your_email@example.com)' // required by Nominatim
      }
    } )

    const arr = Array.isArray( res.data ) ? res.data : []
    const first = arr[0]

    if ( !first ) {
      throw new Error( 'No results' )
    }

    const lat = Number( first.lat )
    const lng = Number( first.lon )

    if ( !Number.isFinite( lat ) || !Number.isFinite( lng ) ) {
      throw new Error( 'Invalid coordinates' )
    }

    localForm.latitude = lat
    localForm.longitude = lng

    if ( !silent ) {
      ElMessage.success( 'Location found!' )
    }
  } catch ( err ) {
    console.error( 'Geocode error:', err )
    if ( !silent ) {
      ElMessage.error( 'Failed to identify address' )
    }
  } finally {
    geocoding.value = false
  }
}

/** Auto-geocode on address change (debounced, user-only) */
let geocodeTimer = null
watch(
  () => localForm.address,
  val => {
    if ( geocodeTimer ) clearTimeout( geocodeTimer )

    // ignore changes coming from parent hydration
    if ( applyingFromParent ) return

    const addr = normalizeAddressString( val )
    if ( !addr ) {
      // user cleared address: clear coords
      localForm.latitude = null
      localForm.longitude = null
      return
    }

    geocodeTimer = setTimeout( () => {
      handleGeocode( addr, { silent : true } )
    }, 800 )
  }
)

// re-validate address when parent_id changes (root <-> child)
watch(
  () => localForm.parent_id,
  () => {
    if ( formRef.value ) {
      formRef.value.validateField( 'address' )
    }
  }
)

/** Parent -> Local */
watch(
  () => props.modelValue,
  async( v = {} ) => {
    applyingFromParent = true

    localForm.name = v.name || ''
    localForm.code = v.code || ''
    localForm.location_type_id = v.location_type?.id ?? v.location_type_id ?? null

    // accept either nested object or plain id
    localForm.person_in_charge_id =
      v.person_in_charge_id ??
      ( typeof v.person_in_charge === 'object' && v.person_in_charge ? v.person_in_charge.id : null )

    localForm.address = v.address || ''
    localForm.description = v.description || ''
    localForm.parent_id = v.parent_id ?? null

    // coordinates from parent (normalized so 0 -> null)
    localForm.latitude = normalizeCoord( v.latitude )
    localForm.longitude = normalizeCoord( v.longitude )

    // existing URLs only
    localForm.image_list = Array.isArray( v.image_list )
      ? v.image_list.map( x => ( typeof x === 'string' ? x : x?.url ?? '' ) ).filter( Boolean )
      : []

    // new files separate
    localForm.image_files = Array.isArray( v.image_files ) ? v.image_files.filter( f => f instanceof File ) : []

    // removed URLs
    localForm.removed_existing_images = Array.isArray( v.removed_existing_images ) ? v.removed_existing_images : []

    // ensure selected user shows label in dropdown
    await ensureSelectedUserOptionExists( localForm.person_in_charge_id )

    // reset uploader on fresh create
    const nowNew = isNewForm( v )
    if ( nowNew && !lastIsNewForm ) uploaderKey.value += 1
    lastIsNewForm = nowNew

    nextTick( () => {
      applyingFromParent = false
    } )
  },
  { immediate : true, deep : true }
)

/** Local -> Parent */
watch(
  localForm,
  val => {
    if ( applyingFromParent ) return

    const location_type = props.locationTypes.find( t => t.id === val.location_type_id ) || null
    // coerce to number or null
    const picId =
      val.person_in_charge_id === '' || val.person_in_charge_id == null
        ? null
        : Number.isFinite( Number( val.person_in_charge_id ) )
          ? Number( val.person_in_charge_id )
          : null

    const latitude = normalizeCoord( val.latitude )
    const longitude = normalizeCoord( val.longitude )

    emit( 'update:modelValue', {
      ...val,
      location_type,
      person_in_charge_id : picId,
      latitude,
      longitude,
      image_list : Array.isArray( val.image_list ) ? val.image_list : [],
      image_files : Array.isArray( val.image_files ) ? val.image_files : [],
      removed_existing_images : Array.isArray( val.removed_existing_images ) ? val.removed_existing_images : []
    } )
  },
  { deep : true }
)

const rules = {
  name : [{ required : true, message : 'Name is required', trigger : 'blur' }],
  code : [{ required : true, message : 'Code is required', trigger : 'blur' }],
  location_type_id : [{ required : true, message : 'Location type is required', trigger : 'change' }],
  address : [{ validator : validateAddress, trigger : 'blur' }]
  // person_in_charge_id: [{ required: true, message: 'Person in charge is required', trigger: 'change' }], // optional
}

defineExpose( {
  validate : () => formRef.value?.validate(),
  resetFields : () => formRef.value?.resetFields?.(),
  getFormData : () => ( { ...localForm } )
} )
</script>

<style scoped lang="scss">
.location-form {
  max-width: 960px;
  margin: 0 auto;

  .el-input,
  .el-select,
  textarea {
    width: 100%;
  }
}

/* Two-column layout */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 16px 24px;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.full-span {
  grid-column: 1 / -1;
}

.map-preview {
  width: 100%;
  height: 220px; /* match detail view / OL map height */
}
</style>
