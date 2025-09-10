export const StateConfig = {
  Failed: { icon: 'error', color: 'red' },
  Completed: { icon: 'check', color: 'green' },
  InProgress: { icon: 'loading', color: 'blue' },
}

export const PriorityConfig = {
  Urgent: { color: 'red', description: 'Requires immediate attention and resolution.' },
  High: { color: 'orange', description: 'Needs to be addressed as soon as possible.' },
  Medium: { color: 'yellow', description: 'Should be completed but not urgent.' },
  Low: { color: 'green', description: 'Can be handled when convenient.' },
}

export const RecurrenceTypeConfig = {
  'Does not repeat': { indication: 'No repetition', description: 'One-time task only.' },
  Daily: { indication: 'Daily', description: 'Task repeats every day.' },
  Weekly: { indication: 'Weekly', description: 'Task repeats every week.' },
  Monthly: { indication: 'Monthly', description: 'Task repeats every month.' },
}

export const WorkTypeConfig = {
  Reactive: { indication: 'Reactive', description: 'Reactive work type' },
  Preventive: { indication: 'Preventive', description: 'Scheduled maintenance tasks' },
  Predictive: { indication: 'Predictive', description: 'Maintenance based on predictions from monitoring systems' },
}

export const CategoryConfig = {
  Inspection: { description: 'Regular inspection task' },
  Maintenance: { description: 'General maintenance task' },
  Repair: { description: 'Repair tasks for broken equipment' },
}

export const DateConfig = {
  format: 'YYYY-MM-DD HH:mm:ss',
  overdueColor: 'red',
  normalColor: 'black',
}
