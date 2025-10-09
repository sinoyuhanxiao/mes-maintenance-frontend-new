export const createEmptyWorkOrderForm = () => ( {
  name : '',
  description : '',
  category_ids : [],
  priority_id : null,
  state_id : 1,
  work_type_id : null,
  equipment_node_ids : [],
  vendor_ids : [],
  assignee_ids : [84], // Default to "System"
  approved_by_id : null,
  time_zone : Intl.DateTimeFormat().resolvedOptions().timeZone,
  start_date : null,
  due_date : null,
  end_date : null,
  recurrence_type_id : null,
  recurrence_type : null,
  recurrence_setting : {},
  recurrence_setting_request : {
    start_date_time : null
  },
  task_list : [],
  image_list : [],
  file_list : [],
  existing_image_list : [],
  standard_list : [],
  tasks : [],
  standards : [],
  request_id : null
} )

export const cloneWorkOrderForm = form => JSON.parse( JSON.stringify( form ) )
