import http from '@/utils/request'
// Placeholder functions for backend integration
// These will be replaced with actual HTTP calls once backend is ready

// Template CRUD operations
export const getTemplates = async params => {
  // return http.request({ method: 'get', url: '/maintenance-library/templates', params })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return {
    data : [
      {
        template_id : '#65421',
        name : 'Monthly Freezer PM',
        status : 'published',
        estimated_minutes : 45,
        description :
          'Conduct monthly preventive maintenance on freezer equipment to ensure reliable operation and food safety. Tasks include inspecting electrical connections, cleaning coils and filters, checking compressor performance, verifying thermostat accuracy, and documenting any issues.',
        category : 'Preventative',
        asset : 'Steam Peeler',
        version : { major : 1, minor : 0 },
        created_at : '2025-08-20T10:00:00Z',
        updated_at : '2025-08-20T10:00:00Z'
      },
      {
        template_id : '#23412',
        name : 'Weekly Equipment Check',
        status : 'draft',
        estimated_minutes : 30,
        description :
          'Carry out a weekly routine inspection of equipment to check for proper operation, cleanliness, safety compliance, and early signs of wear or malfunction.',
        category : 'Inspection',
        asset : 'Freezer',
        version : { major : 1, minor : 0 },
        created_at : '2025-08-19T14:30:00Z',
        updated_at : '2025-08-19T14:30:00Z'
      }
    ],
    total : 2
  }
}

export const getTemplate = async id => {
  // return http.request({ method: 'get', url: `/maintenance-library/templates/${id}` })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return {
    data : {
      template_id : id,
      name : 'Monthly Freezer PM',
      description : 'Monthly freezer preventive maintenance inspection',
      category : 'PM',
      applicable_assets : ['asset:freezer#2'],
      version : { major : 1, minor : 0 },
      estimated_minutes : 45,
      status : 'draft',
      created_at : '2025-08-20T10:00:00Z',
      created_by : 37,
      updated_at : '2025-08-20T10:00:00Z',
      updated_by : 37,
      steps : [
        {
          step_id : '11111111-1111-4111-8111-111111111111',
          order : 1,
          type : 'inspection',
          label : 'Door gasket condition',
          placeholder : '',
          description : 'Check if door gasket is intact and properly sealed.',
          required : true,
          required_image : false,
          relevant_resources : [],
          relevant_tools : [{ tool_id : 't-001', name : 'Flashlight' }],
          config : {
            kind : 'inspection',
            choices : ['pass', 'fail'],
            default : 'fail',
            require_comment_on_fail : true,
            require_photo_on_fail : true,
            button_style : {
              size : 'large',
              type : 'primary'
            }
          }
        }
      ]
    }
  }
}

export const createTemplate = async data => {
  // return http.request({ method: 'post', url: '/maintenance-library/templates', data })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return {
    data : {
      template_id : Date.now().toString(),
      ...data,
      status : 'draft',
      version : { major : 1, minor : 0 },
      created_at : new Date().toISOString(),
      updated_at : new Date().toISOString(),
      steps : []
    }
  }
}

export const updateTemplate = async( id, data ) => {
  // return http.request({ method: 'put', url: `/maintenance-library/templates/${id}`, data })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return {
    data : {
      template_id : id,
      ...data,
      updated_at : new Date().toISOString()
    }
  }
}

export const deleteTemplate = async id => {
  // return http.request({ method: 'delete', url: `/maintenance-library/templates/${id}` })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return { success : true }
}

// Additional operations
export const publishTemplate = async id => {
  // return http.request({ method: 'post', url: `/maintenance-library/templates/${id}/publish` })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return { data : { template_id : id, status : 'published' }}
}

// Keep this here as extensible for the future
export const getTemplateVersions = async id => {
  // return http.request({ method: 'get', url: `/maintenance-library/templates/${id}/versions` })
  await new Promise( resolve => setTimeout( resolve, 500 ) )
  return {
    data : [{ version : '1.0', created_at : '2025-08-20T10:00:00Z' }]
  }
}

// Tools and resources (for step configuration)
export const getAvailableTools = async() => {
  await new Promise( resolve => setTimeout( resolve, 300 ) )
  return {
    data : [
      { tool_id : 't-001', name : 'Flashlight', spec : 'Yellow LED Flashlight' },
      { tool_id : 't-002', name : 'Thermometer', spec : 'King Digital -50°C to 150°C' },
      { tool_id : 't-003', name : 'Multimeter', spec : 'King Digital Multimeter' },
      { tool_id : 't-004', name : 'Screwdriver Set', spec : 'Hurry Phillips and Flathead' },
      { tool_id : 't-005', name : 'Wrench Set', spec : 'Adjustable Wrench Set for Peach Brother' }
    ]
  }
}

export const uploadResource = async( file, stepId ) => {
  await new Promise( resolve => setTimeout( resolve, 1000 ) )
  return {
    data : {
      id : `r-${Date.now()}`,
      name : file.name,
      url : `https://cdn.example.com/files/${file.name}`,
      mime : file.type
    }
  }
}

// standards CRUD operations
export const getStandards = async params => {
  try {
    // Using http.request for real API calls
    const response = await http.request( {
      method : 'get',
      url : '/library/standards',
      params
    } )
    return {
      data : response.data?.data || response.data,
      total : response.data?.total || response.data?.length || 0
    }
  } catch ( error ) {
    console.error( 'Failed to fetch standards:', error )
    throw error
  }
}

export const getStandard = async id => {
  try {
    const response = await http.request( {
      method : 'get',
      url : `/library/standard/${id}`
    } )
    return { data : response.data }
  } catch ( error ) {
    console.error( 'Failed to fetch standard:', error )
    throw error
  }
}

export const createStandard = async data => {
  try {
    const response = await http.request( {
      method : 'post',
      url : '/library/standard',
      data
    } )
    return { data : response.data }
  } catch ( error ) {
    console.error( 'Failed to create standard:', error )
    throw error
  }
}

export const updateStandard = async( id, data ) => {
  try {
    const response = await http.request( {
      method : 'put',
      url : '/library/standards',
      data : { _id : id, ...data }
    } )
    return { data : response.data }
  } catch ( error ) {
    console.error( 'Failed to update standard:', error )
    throw error
  }
}

export const deleteStandard = async id => {
  try {
    await http.request( {
      method : 'delete',
      url : `/library/standard/${id}`
    } )
    return { success : true }
  } catch ( error ) {
    console.error( 'Failed to delete standard:', error )
    throw error
  }
}
