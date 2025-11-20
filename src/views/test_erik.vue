<template>
  <div class="api-tester">
    <el-card class="tester-card">
      <template #header>
        <div class="card-header">
          <span>API Tester - CORS & Request Testing</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px" label-position="left">
        <!-- HTTP Method -->
        <el-form-item label="Method">
          <el-select v-model="form.method" placeholder="Select method" style="width: 200px">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>

        <!-- URL -->
        <el-form-item label="URL">
          <el-input v-model="form.url" placeholder="https://example.com/api/endpoint" clearable />
        </el-form-item>

        <!-- Headers -->
        <el-form-item label="Headers">
          <el-button size="small" @click="addHeader" style="margin-bottom: 8px"> Add Header </el-button>
          <div v-for="(header, index) in form.headers" :key="index" style="display: flex; gap: 8px; margin-bottom: 8px">
            <el-input v-model="header.key" placeholder="Header name" style="flex: 1" />
            <el-input v-model="header.value" placeholder="Header value" style="flex: 1" />
            <el-button size="small" type="danger" @click="removeHeader(index)"> Remove </el-button>
          </div>
        </el-form-item>

        <!-- Content Type -->
        <el-form-item label="Content-Type">
          <el-select v-model="form.contentType" placeholder="Select content type" clearable>
            <el-option label="application/json" value="application/json" />
            <el-option label="text/plain" value="text/plain" />
            <el-option label="application/x-www-form-urlencoded" value="application/x-www-form-urlencoded" />
            <el-option label="multipart/form-data" value="multipart/form-data" />
            <el-option label="None (no Content-Type header)" value="" />
          </el-select>
        </el-form-item>

        <!-- Body Type -->
        <el-form-item label="Body Type">
          <el-radio-group v-model="form.bodyType">
            <el-radio label="none">None</el-radio>
            <el-radio label="json">JSON</el-radio>
            <el-radio label="text">Text</el-radio>
            <el-radio label="form">Form Data</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Body Content -->
        <el-form-item v-if="form.bodyType !== 'none'" label="Body">
          <el-input
            v-if="form.bodyType === 'json' || form.bodyType === 'text'"
            v-model="form.body"
            type="textarea"
            :rows="8"
            placeholder="Enter request body here"
          />
          <div v-if="form.bodyType === 'form'" style="width: 100%">
            <el-button size="small" @click="addFormField" style="margin-bottom: 8px"> Add Field </el-button>
            <div
              v-for="(field, index) in form.formData"
              :key="index"
              style="display: flex; gap: 8px; margin-bottom: 8px"
            >
              <el-input v-model="field.key" placeholder="Field name" style="flex: 1" />
              <el-input v-model="field.value" placeholder="Field value" style="flex: 1" />
              <el-button size="small" type="danger" @click="removeFormField(index)"> Remove </el-button>
            </div>
          </div>
        </el-form-item>

        <!-- Actions -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="sendRequest"> Send Request </el-button>
          <el-button @click="resetForm">Reset</el-button>
          <el-button @click="loadProductionExample">Load Production API Example</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Response Section -->
    <el-card v-if="response" class="response-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>Response</span>
          <el-tag :type="response.status >= 200 && response.status < 300 ? 'success' : 'danger'" size="large">
            {{ response.status }} {{ response.statusText }}
          </el-tag>
        </div>
      </template>

      <!-- Response Info -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Status"> {{ response.status }} {{ response.statusText }} </el-descriptions-item>
        <el-descriptions-item label="Duration"> {{ response.duration }}ms </el-descriptions-item>
        <el-descriptions-item label="Size" :span="2"> {{ response.size }} bytes </el-descriptions-item>
      </el-descriptions>

      <!-- Response Headers -->
      <div style="margin-top: 20px">
        <h4>Response Headers</h4>
        <el-input :model-value="formatHeaders(response.headers)" type="textarea" :rows="6" readonly />
      </div>

      <!-- Response Body -->
      <div style="margin-top: 20px">
        <h4>Response Body</h4>
        <el-input :model-value="formatResponseBody(response.data)" type="textarea" :rows="12" readonly />
      </div>
    </el-card>

    <!-- Error Section -->
    <el-card v-if="error" class="error-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>Error</span>
          <el-tag type="danger" size="large">Failed</el-tag>
        </div>
      </template>

      <el-alert :title="error.message" type="error" :description="error.details" show-icon :closable="false" />

      <div v-if="error.corsInfo" style="margin-top: 20px">
        <h4>CORS Information</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Issue">
            {{ error.corsInfo.issue }}
          </el-descriptions-item>
          <el-descriptions-item label="Possible Solutions">
            <ul style="margin: 0; padding-left: 20px">
              <li v-for="(solution, idx) in error.corsInfo.solutions" :key="idx">
                {{ solution }}
              </li>
            </ul>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="error.stack" style="margin-top: 20px">
        <h4>Error Details</h4>
        <el-input :model-value="error.stack" type="textarea" :rows="8" readonly />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref( false )
const response = ref( null )
const error = ref( null )

const form = reactive( {
  method : 'POST',
  url : '',
  headers : [],
  contentType : 'application/json',
  bodyType : 'json',
  body : '',
  formData : []
} )

const addHeader = () => {
  form.headers.push( { key : '', value : '' } )
}

const removeHeader = index => {
  form.headers.splice( index, 1 )
}

const addFormField = () => {
  form.formData.push( { key : '', value : '' } )
}

const removeFormField = index => {
  form.formData.splice( index, 1 )
}

const loadProductionExample = () => {
  form.method = 'POST'
  form.url = 'https://dev.fpsmonitoring.com:8043/system/webdev/MES_Production/DemoApi/updateCurrentView'
  form.contentType = 'application/json'
  form.bodyType = 'text'
  form.body = '{"value":"MESBaseVersion/Production Management/Page/Overview"}'
  form.headers = []
  ElMessage.success( 'Loaded Production API example' )
}

const resetForm = () => {
  form.method = 'GET'
  form.url = ''
  form.headers = []
  form.contentType = 'application/json'
  form.bodyType = 'none'
  form.body = ''
  form.formData = []
  response.value = null
  error.value = null
}

const sendRequest = async() => {
  if ( !form.url ) {
    ElMessage.warning( 'Please enter a URL' )
    return
  }

  loading.value = true
  response.value = null
  error.value = null

  const startTime = performance.now()

  try {
    // Prepare headers
    const headers = {}

    // Add custom headers
    form.headers.forEach( header => {
      if ( header.key && header.value ) {
        headers[header.key] = header.value
      }
    } )

    // Add Content-Type if specified
    if ( form.contentType && form.bodyType !== 'none' ) {
      headers['Content-Type'] = form.contentType
    }

    // Prepare request body
    let data = null
    if ( form.bodyType === 'json' ) {
      if ( form.contentType === 'application/json' ) {
        data = JSON.parse( form.body )
      } else {
        // Send as text
        data = form.body
      }
    } else if ( form.bodyType === 'text' ) {
      data = form.body
    } else if ( form.bodyType === 'form' ) {
      const formData = new FormData()
      form.formData.forEach( field => {
        if ( field.key ) {
          formData.append( field.key, field.value )
        }
      } )
      data = formData
    }

    // Make request
    const config = {
      method : form.method.toLowerCase(),
      url : form.url,
      headers
    }

    if ( data !== null && form.method !== 'GET' ) {
      config.data = data
    }

    console.log( 'Request config:', config )

    const res = await axios( config )

    const endTime = performance.now()
    const duration = Math.round( endTime - startTime )

    response.value = {
      status : res.status,
      statusText : res.statusText,
      headers : res.headers,
      data : res.data,
      duration,
      size : JSON.stringify( res.data ).length
    }

    ElMessage.success( `Request successful: ${res.status} ${res.statusText}` )
  } catch ( err ) {
    const endTime = performance.now()
    const duration = Math.round( endTime - startTime )

    console.error( 'Request error:', err )

    const errorInfo = {
      message : err.message || 'Request failed',
      details : '',
      stack : err.stack
    }

    // Check if it's a CORS error
    if ( err.message && err.message.includes( 'Network Error' ) ) {
      errorInfo.corsInfo = {
        issue : 'CORS (Cross-Origin Resource Sharing) error detected',
        solutions : [
          'Enable CORS on the server side (add Access-Control-Allow-Origin header)',
          'Use a proxy server to bypass CORS restrictions',
          'Configure your Ignition gateway to allow cross-origin requests',
          "Add the frontend origin to Ignition's CORS whitelist",
          "Use Ignition's Web Dev module CORS settings"
        ]
      }
      errorInfo.details =
        "The request was blocked by the browser's CORS policy. The server did not include the required CORS headers in the response."
    } else if ( err.response ) {
      errorInfo.details = `Server responded with status ${err.response.status}: ${err.response.statusText}`
      response.value = {
        status : err.response.status,
        statusText : err.response.statusText,
        headers : err.response.headers,
        data : err.response.data,
        duration,
        size : JSON.stringify( err.response.data ).length
      }
    } else if ( err.request ) {
      errorInfo.details = 'No response received from server. This could be a network error or CORS issue.'
      errorInfo.corsInfo = {
        issue : 'No response from server - likely CORS or network issue',
        solutions : [
          'Check if the server is running and accessible',
          'Verify the URL is correct',
          'Enable CORS on the server',
          'Check browser console for detailed error messages',
          'Try the request from Postman or curl to verify server is working'
        ]
      }
    }

    error.value = errorInfo
    ElMessage.error( errorInfo.message )
  } finally {
    loading.value = false
  }
}

const formatHeaders = headers => {
  return Object.entries( headers )
    .map( ( [key, value] ) => `${key}: ${value}` )
    .join( '\n' )
}

const formatResponseBody = data => {
  if ( typeof data === 'object' ) {
    return JSON.stringify( data, null, 2 )
  }
  return String( data )
}
</script>

<style scoped lang="scss">
.api-tester {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.tester-card,
.response-card,
.error-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
