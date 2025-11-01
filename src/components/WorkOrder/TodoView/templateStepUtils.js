import { getTaskTemplateById } from '@/api/task-library'

const resolveTemplateId = template => {
  if (!template || typeof template !== 'object') return null
  return template.template_id || template.templateId || template.id || template._id || null
}

const extractStepsFrom = candidate => {
  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate
  }
  return []
}

export const extractTemplateSteps = template => {
  if (!template || typeof template !== 'object') {
    return []
  }

  const stepSources = [
    template.steps,
    template.template?.steps,
    template.latest_version?.template?.steps,
    template.latestVersion?.template?.steps,
    template.payload?.steps,
  ]

  for (const source of stepSources) {
    const steps = extractStepsFrom(source)
    if (steps.length > 0) {
      return steps
    }
  }

  return []
}

const unwrapTemplateResponse = response => {
  if (!response || typeof response !== 'object') {
    return response ?? {}
  }

  if (response.data?.data) return response.data.data
  if (response.data?.template) return response.data.template
  if (response.data) return response.data
  if (response.template?.template) return response.template.template

  return response
}

export const hydrateTemplateWithSteps = async template => {
  if (!template) return template

  const existingSteps = extractTemplateSteps(template)
  if (existingSteps.length > 0) {
    if (!Array.isArray(template.steps) || template.steps.length === 0) {
      return {
        ...template,
        steps: existingSteps,
      }
    }
    return template
  }

  const templateId = resolveTemplateId(template)
  if (!templateId) {
    return template
  }

  try {
    const response = await getTaskTemplateById(templateId)
    const detailedTemplate = unwrapTemplateResponse(response) || {}
    const steps = extractTemplateSteps(detailedTemplate)
    const mergedTemplate = {
      ...detailedTemplate,
      ...template,
    }

    if (steps.length > 0) {
      mergedTemplate.steps = steps
    }

    return mergedTemplate
  } catch (error) {
    console.error(`Failed to hydrate template ${templateId}:`, error)
    return template
  }
}

export const hydrateTemplatesWithSteps = async templates => {
  if (!Array.isArray(templates) || templates.length === 0) {
    return []
  }

  const hydrated = await Promise.all(templates.map(hydrateTemplateWithSteps))
  return hydrated
}
