<template>
  <div class="el-col el-col-24 is-guttered card-container">
    <el-card class="card-shadow">
      <div class="el-card__header">
        <div class="card-header"><span>Attachment Information</span></div>
      </div>
      <div class="el-card__body">
        <el-descriptions border :column="1">
          <el-descriptions-item label="Image Preview">
            <div class="image-list">
              <template v-if="mode === 'view'">
                <el-image
                  v-for="(img, index) in imageListUrlComputed"
                  :key="index"
                  :src="img"
                  style="width: 100px; height: 100px; margin-right: 10px"
                  fit="cover"
                  :preview-src-list="imageListUrlComputed"
                />
              </template>
              <template v-else>
                <el-upload
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :file-list="imageFileList"
                  :on-preview="handlePictureCardPreview"
                  :on-remove="handleImageRemove"
                  :on-change="handleImageChange"
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <el-dialog fullscreen v-model="dialogVisible" append-to-body>
                  <div class="image-wrapper">
                    <img :src="dialogImageUrl" alt="Preview Image" />
                  </div>
                </el-dialog>
              </template>
            </div>
          </el-descriptions-item>

          <el-descriptions-item label="File Download">
            <div class="file-list">
              <template v-if="mode === 'view'">
                <div v-for="(file, index) in fileListUrlComputed" :key="index" style="margin-bottom: 8px">
                  <el-link :href="file" target="_blank" type="primary">{{ getFileName(file) }}</el-link>
                </div>
              </template>
              <template v-else>
                <el-upload
                  action="#"
                  list-type="text"
                  :auto-upload="false"
                  :file-list="fileFileList"
                  :on-remove="handleFileRemove"
                  :on-change="handleFileChange"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv,.json,.xml,.ppt,.pptx"
                >
                  <el-button size="small" type="success">Click to Upload</el-button>
                </el-upload>
              </template>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps( {
  mode : { type : String, required : true },
  imageListUrl : { type : Array, default : () => [] },
  fileListUrl : { type : Array, default : () => [] },
  imageListMultipartAdded : { type : Array, default : () => [] },
  fileListMultipartAdded : { type : Array, default : () => [] },
  imageListUrlDeleted : { type : Array, default : () => [] },
  fileListUrlDeleted : { type : Array, default : () => [] }
} )

const emit = defineEmits( [
  'update:imageListMultipartAdded',
  'update:fileListMultipartAdded',
  'update:imageListUrlDeleted',
  'update:fileListUrlDeleted'
] )

const imageFileList = ref( [] )
const fileFileList = ref( [] )
const dialogVisible = ref( false )
const dialogImageUrl = ref( '' )

const handlePictureCardPreview = file => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const handleImageChange = ( file, newFileList ) => {
  imageFileList.value = newFileList
  const addedFiles = newFileList.map( f => f.raw ).filter( f => f instanceof File )
  emit( 'update:imageListMultipartAdded', addedFiles )
}

const handleFileChange = ( file, newFileList ) => {
  fileFileList.value = newFileList
  const addedFiles = newFileList.map( f => f.raw ).filter( f => f instanceof File )
  emit( 'update:fileListMultipartAdded', addedFiles )
}

const handleImageRemove = file => {
  emit( 'update:imageListUrlDeleted', [...props.imageListUrlDeleted, file.url] )
}

const handleFileRemove = file => {
  emit( 'update:fileListUrlDeleted', [...props.fileListUrlDeleted, file.url] )
}

const getFileName = fileUrl => {
  return fileUrl.split( '/' ).pop()
}

const imageListUrlComputed = computed( () => props.imageListUrl )
const fileListUrlComputed = computed( () => props.fileListUrl )

// Add this watch block at the end of <script setup>:
watch(
  [
    () => props.mode,
    () => props.imageListUrl,
    () => props.fileListUrl,
    () => props.imageListMultipartAdded,
    () => props.fileListMultipartAdded,
    () => props.imageListUrlDeleted,
    () => props.fileListUrlDeleted
  ],
  ( [
    mode,
    imageListUrl,
    fileListUrl,
    imageListMultipartAdded,
    fileListMultipartAdded,
    imageListUrlDeleted,
    fileListUrlDeleted
  ] ) => {
    // Images and files state changed
  },
  { deep : true, immediate : true }
)

// Sync existing image URLs to imageFileList when in edit mode
watch(
  [() => props.imageListUrl, () => props.mode],
  ( [newUrls, mode] ) => {
    if ( mode === 'edit' ) {
      imageFileList.value = newUrls.map( url => ( {
        name : getFileName( url ),
        url
      } ) )
    }
  },
  { immediate : true }
)

// Sync existing file URLs to fileFileList when in edit mode
watch(
  [() => props.fileListUrl, () => props.mode],
  ( [newUrls, mode] ) => {
    if ( mode === 'edit' ) {
      fileFileList.value = newUrls.map( url => ( {
        name : getFileName( url ),
        url
      } ) )
    }
  },
  { immediate : true }
)
</script>

<style scoped>
.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
}
.card-header {
  font-weight: bold;
}
</style>
