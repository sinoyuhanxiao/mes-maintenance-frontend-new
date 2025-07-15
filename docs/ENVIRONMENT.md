# Environment Configuration Guide

This document explains how environment variables are managed in the MES Maintenance Frontend project.

## Architecture Overview

The project uses a **hybrid environment configuration system** that combines:

1. **Standard Vite `.env` files** - For defining environment variables
2. **Custom processing layer** (`config/index.js`) - For defaults, type conversion, and validation
3. **Centralized utility** (`src/utils/env.js`) - For runtime access and type safety

## Environment Files

### `.env` (Global)
Contains variables that apply to all environments:
```bash
# Application Configuration
VITE_APP_TITLE=MES Maintenance Frontend
VITE_APP_VERSION=3.0.0

# Server Configuration
VITE_PORT=9527
VITE_PUBLIC_PATH=/

# API Configuration
VITE_BACKEND_URL=http://localhost:8095/
VITE_PROXY_DOMAIN=/api

# MinIO Configuration
VITE_MINIO_URL=http://10.10.12.12:8086
VITE_DEFAULT_BUCKET_NAME=sv-file-bucket
```

### `.env.development` (Development)
Development-specific overrides:
```bash
# Development API Configuration
VITE_PROXY_DOMAIN_REAL=http://127.0.0.1:9527
VITE_DEBUG=true
```

### `.env.production` (Production)
Production-specific overrides:
```bash
# Production API Configuration
VITE_BACKEND_URL=https://api.production.com/
VITE_MINIO_URL=https://minio.production.com
VITE_DEBUG=false
```

## Usage in Code

### Recommended Approach (Type-Safe)
```javascript
import { ENV_CONFIG, ENV_UTILS } from '@/utils/env'

// Access configuration
const apiUrl = ENV_CONFIG.BACKEND_URL
const isDebug = ENV_CONFIG.DEBUG

// Use utility functions
if (ENV_UTILS.isDev()) {
  console.log('Development mode')
}

const baseUrl = ENV_UTILS.getApiBaseUrl()
```

### Legacy Approach (Still Supported)
```javascript
// Direct access (not recommended for new code)
const port = import.meta.env.VITE_PORT
```

## Available Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_APP_TITLE` | string | "MES Maintenance Frontend" | Application title |
| `VITE_APP_VERSION` | string | "3.0.0" | Application version |
| `VITE_PORT` | number | 9527 | Development server port |
| `VITE_PUBLIC_PATH` | string | "/" | Public path for assets |
| `VITE_BACKEND_URL` | string | "http://localhost:8095/" | Backend API URL |
| `VITE_PROXY_DOMAIN` | string | "/api" | API proxy path |
| `VITE_PROXY_DOMAIN_REAL` | string | "" | Real backend URL for proxy |
| `VITE_MINIO_URL` | string | "http://localhost:9000" | MinIO server URL |
| `VITE_DEFAULT_BUCKET_NAME` | string | "default-bucket" | Default MinIO bucket |
| `VITE_LEGACY` | boolean | false | Enable legacy browser support |
| `VITE_DEBUG` | boolean | false | Enable debug mode |

## Utility Functions

### ENV_UTILS
- `isDev()` - Check if in development mode
- `isProd()` - Check if in production mode
- `isDebug()` - Check if debug mode is enabled
- `getApiBaseUrl()` - Get environment-appropriate API base URL
- `getMinioUrl(path)` - Get full MinIO URL
- `logConfig()` - Log configuration (debug mode only)

## Best Practices

1. **Use centralized configuration**: Import from `@/utils/env` instead of direct `import.meta.env`
2. **Define defaults**: All variables should have sensible defaults in `config/index.js`
3. **Type safety**: Use the typed `ENV_CONFIG` object instead of raw environment variables
4. **Environment-specific files**: Use `.env.development`, `.env.production` for environment-specific values
5. **Validation**: The system automatically validates URLs and required variables

## Adding New Variables

1. Add to appropriate `.env` file(s)
2. Add default value in `config/index.js`
3. Add to `ENV_CONFIG` in `src/utils/env.js`
4. Update this documentation

## Troubleshooting

- **Variables not loading**: Ensure they start with `VITE_`
- **Type issues**: Check type conversion in `config/index.js`
- **Missing variables**: Check console warnings for validation errors
- **Debug info**: Set `VITE_DEBUG=true` to see configuration logging
