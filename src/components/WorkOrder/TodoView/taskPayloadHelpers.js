import { transformTemplateForBackend, transformStepForBackend } from '@/views/taskLibrary/utils/templateTransforms'
import { transformApiStepToDesignerStep } from '@/views/taskLibrary/utils/stepTransforms'

export const DEFAULT_TASK_STATE = 5

let taskLocalCounter = 0

const nextTaskLocalId = () => {
  taskLocalCounter += 1
  return `work-order-task-${Date.now()}-${taskLocalCounter}`
}

const extractCategoryId = category => {
  if ( !category ) return null
  if ( typeof category === 'object' ) {
    if ( category.id ) return category.id
    if ( category.category_id ) return category.category_id
  }
  const parsed = parseInt( category, 10 )
  return Number.isNaN( parsed ) ? null : parsed
}

const ensureTimeEstimateSeconds = template => {
  if ( template.time_estimate_sec && template.time_estimate_sec > 0 ) {
    return template.time_estimate_sec
  }
  if ( template.timeEstimateSec && template.timeEstimateSec > 0 ) {
    return template.timeEstimateSec
  }

  const minutes = template.estimated_minutes || template.estimatedMinutes || 30
  const safeMinutes = minutes && minutes > 0 ? minutes : 30
  return safeMinutes * 60
}

const createFallbackStep = () => ( {
  name : 'Checklist',
  description : 'Auto-generated step',
  type : 'template',
  required : false,
  remarks : '',
  value : {
    type : 'checkbox',
    value : false,
    require_image : false,
    image : []
  },
  tools : []
} )

const normalizeTemplateStep = ( step, index ) => {
  try {
    const designerStep = transformApiStepToDesignerStep( step, index )
    return transformStepForBackend( designerStep, false )
  } catch ( error ) {
    console.error( 'Failed to normalize template step:', error )
    return null
  }
}

const normalizeCategoryMeta = ( categoryOption, fallback ) => {
  if ( categoryOption && typeof categoryOption === 'object' ) {
    if (
      Object.prototype.hasOwnProperty.call( categoryOption, 'value' ) &&
      Object.prototype.hasOwnProperty.call( categoryOption, 'label' )
    ) {
      return {
        id : categoryOption.value ?? null,
        name : categoryOption.label ?? ''
      }
    }

    if (
      Object.prototype.hasOwnProperty.call( categoryOption, 'id' ) ||
      Object.prototype.hasOwnProperty.call( categoryOption, 'name' )
    ) {
      return {
        id : categoryOption.id ?? null,
        name : categoryOption.name ?? categoryOption.label ?? ''
      }
    }
  }

  if ( fallback && typeof fallback === 'object' ) {
    if (
      Object.prototype.hasOwnProperty.call( fallback, 'id' ) ||
      Object.prototype.hasOwnProperty.call( fallback, 'name' )
    ) {
      return {
        id : fallback.id ?? null,
        name : fallback.name ?? fallback.label ?? ''
      }
    }
  }

  if ( typeof fallback === 'string' && fallback ) {
    return {
      id : null,
      name : fallback
    }
  }

  if ( typeof fallback === 'number' ) {
    return {
      id : fallback,
      name : String( fallback )
    }
  }

  return null
}

export const buildTaskPayloadFromTemplate = template => {
  const steps = Array.isArray( template.steps )
    ? template.steps.map( ( step, index ) => normalizeTemplateStep( step, index ) ).filter( Boolean )
    : []

  if ( steps.length === 0 ) {
    steps.push( createFallbackStep() )
  }

  const categorySource =
    template.category ||
    ( template.category_name
      ? { id : template.category_id ?? template.categoryId ?? null, name : template.category_name }
      : null )
  const categoryMeta = normalizeCategoryMeta( null, categorySource )

  const payload = {
    name : template.name || 'Unnamed Task',
    description : template.description || '',
    time_estimate_sec : ensureTimeEstimateSeconds( template ),
    steps,
    attachments : template.attachments || template.file_list || [],
    assignee_ids : [],
    equipment_node_id : template.equipment_node_id || template.equipment_node?.id || null,
    location_id : template.location_id ?? null,
    category_id : categoryMeta?.id ?? extractCategoryId( template.category ) ?? template.category_id ?? null,
    category_name : categoryMeta?.name ?? template.category_name ?? null,
    work_order_id : 0,
    state : DEFAULT_TASK_STATE
  }

  const templateId = template.template_id || template.id || template._id
  if ( templateId ) {
    payload.template_id = templateId
  }

  return payload
}

export const buildDisplayTaskFromTemplate = template => {
  const payload = buildTaskPayloadFromTemplate( template )
  const estimatedMinutes = Math.round( ( payload.time_estimate_sec || 0 ) / 60 ) || 0
  const categorySource =
    template.category ||
    ( template.category_name
      ? { id : template.category_id ?? template.categoryId ?? null, name : template.category_name }
      : null )
  const categoryMeta = normalizeCategoryMeta( null, categorySource )

  return {
    id : nextTaskLocalId(),
    name : payload.name,
    description : payload.description,
    category : categoryMeta || template.category,
    category_name : categoryMeta?.name,
    estimated_minutes : estimatedMinutes,
    templateId : payload.template_id,
    template_id : payload.template_id,
    steps : template.steps || payload.steps,
    source : 'template',
    assignee_ids : payload.assignee_ids || [],
    payload,
    rawTemplate : template
  }
}

export const buildDisplayTaskFromDesigner = ( templateForm, categoryOption = null ) => {
  const backendPayload = transformTemplateForBackend( templateForm )
  backendPayload.work_order_id = backendPayload.work_order_id ?? 0
  backendPayload.state = backendPayload.state ?? DEFAULT_TASK_STATE
  delete backendPayload.template_id

  if ( !Array.isArray( backendPayload.steps ) || backendPayload.steps.length === 0 ) {
    backendPayload.steps = [createFallbackStep()]
  }

  if ( categoryOption ) {
    const categoryId = categoryOption.value ?? categoryOption.id
    if ( categoryId ) {
      backendPayload.category_id = categoryId
    }
  }

  const categoryMeta = normalizeCategoryMeta( categoryOption, templateForm.category )

  const estimatedMinutes =
    templateForm.estimated_minutes || Math.round( ( backendPayload.time_estimate_sec || 0 ) / 60 ) || 0

  return {
    id : nextTaskLocalId(),
    name : backendPayload.name,
    description : backendPayload.description,
    category : categoryMeta || templateForm.category,
    category_name : categoryMeta?.name,
    estimated_minutes : estimatedMinutes,
    steps : backendPayload.steps,
    source : 'adhoc',
    assignee_ids : backendPayload.assignee_ids || [],
    payload : backendPayload
  }
}
