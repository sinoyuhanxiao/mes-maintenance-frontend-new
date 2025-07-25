<template>
  <div class="t3-details">
    <div class="general-information">
      <el-descriptions
        :column="3"
        direction="vertical"
      >
        <el-descriptions-item label="Name">Conveyor</el-descriptions-item>
        <el-descriptions-item label="Code">18100000000</el-descriptions-item>
        <el-descriptions-item label="Model">18100000000</el-descriptions-item>
        <el-descriptions-item label="Description" class="highlighted-item">
          Test Description
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider />
    <div class="location">
      <el-descriptions
        :column="1"
        direction="vertical"
      >
        <el-descriptions-item label="Location Path">
          <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item>SGB Richmond</el-breadcrumb-item>
            <el-breadcrumb-item>Rheon Line 1</el-breadcrumb-item>
            <el-breadcrumb-item>Freezing</el-breadcrumb-item>
            <el-breadcrumb-item>Incline Conveyor</el-breadcrumb-item>
          </el-breadcrumb>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider />
    <div class="image">
      <el-descriptions
        :column="1"
        direction="vertical"
      >
        <el-descriptions-item label="Images">
          <el-image :src="src" />
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider />
    <div class="files">
      <el-descriptions
        :column="1"
        direction="vertical"
      >
        <el-descriptions-item label="Files">
          <div class="file-list">
            <div
              v-for="file in files"
              :key="file.id"
              class="file-item"
            >
              <el-link
                :href="file.url"
                target="_blank"
                :icon="getFileIcon(file.type)"
                class="file-link"
              >
                {{ file.name }}
              </el-link>
              <span class="file-size">{{ file.size }}</span>
            </div>
            <div v-if="files.length === 0" class="no-files">
              No files available
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, Document, Picture, VideoCamera, Microphone } from '@element-plus/icons-vue'

defineProps( {
  data : {
    type : Array,
    default : () => []
  }
} )

const src = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'

// Sample files data - you can replace this with your actual files
const files = [
  {
    id : 1,
    name : 'Installation Manual.pdf',
    type : 'pdf',
    size : '2.3 MB',
    url : '#'
  },
  {
    id : 2,
    name : 'Maintenance Guide.docx',
    type : 'document',
    size : '850 KB',
    url : '#'
  },
  {
    id : 3,
    name : 'Technical Drawings.dwg',
    type : 'drawing',
    size : '1.2 MB',
    url : '#'
  },
  {
    id : 4,
    name : 'Conveyor Photo.jpg',
    type : 'image',
    size : '456 KB',
    url : '#'
  }
]

function getFileIcon( fileType ) {
  switch ( fileType ) {
    case 'image':
      return Picture
    case 'video':
      return VideoCamera
    case 'audio':
      return Microphone
    default:
      return Document
  }
}
</script>

<style scoped>
.t3-details {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.general-information {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.location {
  flex: 0;
  display: flex;
  flex-direction: column;
  background-color: #0085a4;
}

.image {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 300px;
  max-height: 300px;
  background-color: #0085a4;
}

.files {
  flex: 0;
  display: flex;
  flex-direction: column;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f0f9ff;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.no-files {
  text-align: center;
  color: #909399;
  font-style: italic;
  padding: 20px;
}
</style>
