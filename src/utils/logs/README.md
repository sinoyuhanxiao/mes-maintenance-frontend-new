# Centralized Logging System

This directory contains a centralized logging system for payload management and debugging across the Vue.js maintenance frontend application.

## 🚨 Security Notice

This entire `/src/utils/logs/` directory is excluded from version control via `.gitignore` to prevent logging utilities from being accessible to colleagues in the repository.

## Structure

```
src/utils/logs/
├── composables/
│   └── usePayloadLogger.js     # Main logging composable
├── components/
│   ├── JsonDebugDrawer.vue     # Debug drawer component
│   └── JsonTreeItem.vue        # Tree item component for JSON display
├── utils/
│   ├── payloadManager.js       # Payload manipulation utilities
│   ├── elementSelector.js      # Dynamic element selection
│   └── loggerConfig.js         # Configuration settings
├── index.js                    # Barrel exports
└── README.md                   # This file
```

## Features

### 🎯 Centralized Payload Management

- **Single source of truth** for payload operations
- **Automatic transformation** and cleaning for different form types
- **Deep cloning** to prevent mutations
- **Validation** against predefined schemas

### 🔍 Dynamic Element Selection

- **Flexible button detection** across different form types
- **Automatic form type detection** based on route and DOM elements
- **Configurable selectors** for different components

### 📊 Interactive Debugging

- **Visual payload inspection** with expandable tree view
- **Search and filter** capabilities
- **Copy to clipboard** functionality
- **Real-time payload updates**

## Usage

### Basic Logging

```javascript
import { usePayloadLogger } from '@/utils/logs'

const { logPayload, currentPayload, showJsonDisplayer } = usePayloadLogger()

// Log a payload
logPayload(myPayload, 'workOrder')
```

### Centralized Payload Management

```javascript
import { clonePayload, transformPayload, cleanPayload } from '@/utils/logs'

// Clone safely
const cloned = clonePayload(originalPayload)

// Transform for API
const transformed = transformPayload(payload, 'workOrderCreate')

// Clean null/undefined values
const cleaned = cleanPayload(payload, { removeNull: true })
```

### Component Integration

```vue
<template>
  <JsonDebugDrawer
    v-model="showJsonDisplayer"
    :payload-data="currentPayload"
    title="My Form Payload"
    subtitle="Click 'Logs' to refresh"
  />
</template>

<script setup>
import { JsonDebugDrawer, usePayloadLogger } from '@/utils/logs'

const { currentPayload, showJsonDisplayer, logPayload } = usePayloadLogger()
</script>
```

## Form Type Support

The system supports different form types with specific configurations:

- **workOrder**: Work order creation/editing forms
- **template**: Task template designer forms
- **standard**: Standard creation/editing forms
- **generic**: Fallback for other form types

## Environment Configuration

The logging system respects environment settings:

- **Development**: Full logging and debugging enabled
- **Production**: Logging disabled for performance and security

## API Reference

### usePayloadLogger()

Main composable for payload logging functionality.

**Returns:**

- `currentPayload`: Reactive reference to current payload
- `showJsonDisplayer`: Controls debug drawer visibility
- `logPayload(payload, formType, options)`: Log a payload
- `closeDebugDrawer()`: Close the debug drawer
- `clearPayload()`: Clear current payload

### Utility Functions

- `clonePayload(payload)`: Deep clone payload
- `mergePayloads(...payloads)`: Merge multiple payloads
- `cleanPayload(payload, options)`: Remove null/undefined values
- `validatePayload(payload, schema)`: Validate against schema
- `transformPayload(payload, type)`: Transform for specific API
- `findSubmitButton(formType, container)`: Find submit button
- `detectFormType(route)`: Auto-detect form type

## Migration Guide

### From Old System

Replace old logging patterns:

```javascript
// Old way
const payload = JSON.parse(JSON.stringify(originalPayload))
setTimeout(() => {
  currentPayload.value = payload
  showJsonDisplayer.value = true
}, 50)

// New way
logPayload(originalPayload, 'workOrder')
```

### Update Imports

```javascript
// Old
import JsonDebugDrawer from './JsonDebugDrawer.vue'

// New
import { JsonDebugDrawer, usePayloadLogger } from '@/utils/logs'
```

## Benefits

1. **Reusability**: Works across all forms and components
2. **Consistency**: Standardized payload handling
3. **Security**: Excluded from version control
4. **Maintainability**: Centralized logic reduces duplication
5. **Flexibility**: Configurable for different use cases
6. **Performance**: Optimized for large payloads

## Development

When adding new form types or extending functionality:

1. Update `loggerConfig.js` with new form configuration
2. Add transformation logic to `payloadManager.js` if needed
3. Update selectors in `elementSelector.js` for new button patterns
4. Test with various payload sizes and structures

## Troubleshooting

### Common Issues

1. **Drawer not showing**: Check if logging is enabled for current environment
2. **Button not found**: Verify selectors in `elementSelector.js`
3. **Payload not updating**: Ensure payload is reactive and properly cloned
4. **Performance issues**: Large payloads may need pagination in tree view

### Debug Tips

- Use browser dev tools to inspect button selectors
- Check console for selector warnings
- Verify payload structure matches expected schema
- Test with different form types and screen sizes
