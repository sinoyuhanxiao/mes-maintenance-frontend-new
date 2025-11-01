// general.js

export function getPriorityColor(priority) {
  switch (priority) {
    case 'Urgent':
      return '#F56C6C'
    case 'High':
      return '#409EFF'
    case 'Medium':
      return '#E6A23C'
    default:
      return '#909399'
  }
}

// 固定颜色：维护类型 work_type
export function getWorkTypeTagType(name) {
  switch (name) {
    case 'Reactive':
      return 'danger'
    case 'Preventative':
      return 'success'
    case 'Other':
      return 'info'
    case 'Follow up':
      return 'warning'
    default:
      return 'info'
  }
}

// 固定颜色：工单类别 category
export function getCategoryTagType(name) {
  switch (name) {
    case 'Inspection':
      return 'primary'
    case 'Mechanical':
      return 'danger'
    case 'Preventative':
      return 'success'
    case 'Safety':
      return 'warning'
    case 'SOP':
      return 'info'
    case 'Electrical':
      return 'success'
    case 'Follow up':
      return 'warning'
    default:
      return 'info'
  }
}

// 重复类型 tag
export function getRecurrenceTagType(id) {
  return id === 1 ? 'info' : 'primary'
}
