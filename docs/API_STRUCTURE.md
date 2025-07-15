# API Structure Documentation

This document explains the standardized API structure used throughout the MES Maintenance Frontend project.

## Architecture Overview

All API calls now use the centralized `request.js` HTTP client for consistency, error handling, and authentication.

### Standardized Pattern

```javascript
import http from '@/utils/request'

export function apiFunction(data) {
  return http.request({
    method: 'get|post|put|delete',
    url: '/api/endpoint',
    data: requestData
  })
}
```

## HTTP Client Features (`src/utils/request.js`)

### Automatic Features
- **Authentication**: Automatically adds Authorization header from cookies
- **Error Handling**: Centralized error messages and status code handling
- **Network Detection**: Checks for online status
- **Response Interceptors**: Handles common response patterns
- **Parameter Conversion**: Automatically converts `data` to `params` for GET requests

### Request Format
```javascript
http.request({
  method: 'get|post|put|delete',  // HTTP method
  url: '/api/endpoint',           // API endpoint
  data: {                         // Request data
    // For GET: converted to query parameters
    // For POST/PUT/DELETE: sent as request body
  }
})
```

## API Modules

### 1. User Management (`src/api/user.js`)
```javascript
// User list with pagination
UserList(data)

// Authentication
login(data)
logout()
getInfo(data)

// User history
loginHistory()

// Testing
testRequest()
```

### 2. Common Data (`src/api/common.js`)
```javascript
// Master data endpoints
getAllWorkTypes()
getAllStates()
getAllRecurrenceTypes()
getAllPriorities()
getAllCategories()
```

### 3. Equipment Management (`src/api/equipment.js`)
```javascript
// Equipment hierarchy
getAllProductionLines()
getEquipmentGroups(productionLineId)
getEquipments(equipmentGroupId)
getEquipmentComponents(equipmentId)
```

### 4. Work Order Management (`src/api/workorder.js`)
```javascript
// Work order operations
getAllWorkOrders(page, size, sortField, direction)
getWorkOrdersByRecurrence(recurrenceId, page, size, sortField, direction)
createWorkOrder(data)
getWorkOrderById(id)
```

### 5. File Management (`src/api/minio.js`)
```javascript
// File uploads (using fetch for FormData)
uploadToMinio(file)
uploadMultipleToMinio(files)

// File operations (using request.js)
getFileInfo(fileName)
deleteFile(fileName)
minioApiRequest(data)
```

## Usage Examples

### GET Request
```javascript
import { getAllWorkTypes } from '@/api/common'

// Fetch work types
const response = await getAllWorkTypes()
const workTypes = response.data
```

### POST Request
```javascript
import { createWorkOrder } from '@/api/workorder'

// Create new work order
const workOrderData = {
  title: 'Maintenance Task',
  description: 'Equipment maintenance',
  priority: 'HIGH'
}

const response = await createWorkOrder(workOrderData)
```

### GET with Parameters
```javascript
import { getAllWorkOrders } from '@/api/workorder'

// Fetch paginated work orders
const response = await getAllWorkOrders(1, 10, 'createdAt', 'DESC')
```

## Error Handling

The HTTP client automatically handles:

### Status Codes
- **401**: Redirects to login page
- **400-500**: Shows appropriate error messages
- **Network errors**: Shows network timeout messages

### Response Codes
- **200**: Success (white-listed)
- **5004**: Invalid token (redirects to login)
- **5006**: Captcha error (white-listed)

### Usage in Components
```javascript
try {
  const response = await getAllWorkOrders()
  // Handle success
  this.workOrders = response.data
} catch (error) {
  // Error is automatically handled by request.js
  // Additional custom handling can be added here
  console.error('Failed to fetch work orders:', error)
}
```

## Best Practices

1. **Consistent Import**: Always import from `@/utils/request`
2. **Method First**: Always specify method first in request object
3. **Use Data Parameter**: Use `data` for all request parameters (auto-converted)
4. **Error Handling**: Let request.js handle common errors, add custom handling only when needed
5. **Documentation**: Add JSDoc comments for all API functions
6. **Type Safety**: Consider adding TypeScript interfaces for request/response data

## Migration Notes

All API files have been refactored to use the standardized `request.js` pattern:

- ✅ `user.js` - Already using correct pattern
- ✅ `article.js` - Updated parameter handling
- ✅ `common.js` - Migrated from custom axios instance
- ✅ `equipment.js` - Migrated from custom axios instance  
- ✅ `workorder.js` - Migrated from custom axios instance
- ✅ `minio.js` - Enhanced with request.js methods (file uploads still use fetch)
- ❌ `api.js` - Removed (no longer needed)

This ensures consistent error handling, authentication, and request/response processing across the entire application.
