## Directory Structure

```
    ├── mock                       // Mock related  
    ├── config                     // Basic configuration information  
    ├── src                        // Source code
    │   ├── api                    // Request related files
    │   ├── assets                 // Static resources
    │   ├── components             // Global common components
    │   ├── config                 // Global constants etc.
    │   ├── directive              // Global directives
    │   ├── icons                  // SVG resources
    │   ├── layout                 // Layout
    │   ├── locale                 // Internationalization
    │   ├── plugins                // Plugins
    │   ├── router                 // Router
    │   ├── store                  // Global store management
    │   ├── styles                 // Global styles
    │   ├── utils                  // Utility functions
    │   ├── vendor                 // Common vendor
    │   ├── views                  // Page collections
    │   │      ├── login           // Login
    │   ├── App.vue                // Entry page
    │   ├── main.js                // Entry point - load components, initialization, etc.
    │   └── permission.js          // Permission management
    ├── .gitignore                 // Git ignore file
    ├── favicon.ico                // Favicon icon
    ├── index.html                 // HTML template
    └── package.json               // Package.json
```

## Development

```bash
# Install dependencies
npm install

# It's recommended not to use cnpm install as it may cause various strange bugs
# You can solve npm slow download speed issue with the following operation
npm install --registry=https://registry.npm.taobao.org

# Start the service
npm run dev
```

## Build

```bash
# Build for production environment
npm run build
```
