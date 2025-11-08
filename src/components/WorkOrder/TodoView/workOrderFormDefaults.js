/**
 * Creates an empty work order form with default values
 *
 * Date Field Structure:
 * ===================
 *
 * Main Date Fields (YYYY-MM-DD format for date pickers):
 * - start_date: Work order start date (required for most work orders)
 * - due_date: Work order due/deadline date (used for non-recurring and as fallback for end_date)
 * - end_date: Work order end date (used for recurring work orders, falls back to due_date)
 *
 * Backend Integration:
 * - Backend MUST provide: start_date, and either due_date or end_date
 * - Fallback pattern: due_date ↔ end_date (interchangeable based on recurrence type)
 * - Old fields are IGNORED: start_date_time, due_date_time, end_date_time, expected_*
 *
 * Recurrence Date Fields (YYYY-MM-DDTHH:mm:ss format for datetime pickers):
 * - recurrence_setting.start_date_time: Display datetime for recurrence UI (local timezone)
 * - recurrence_setting.end_date_time: Display datetime for recurrence UI (local timezone)
 * - recurrence_setting_request.start_date_time: Request datetime for backend (UTC ISO with Z)
 * - recurrence_setting_request.end_date_time: Request datetime for backend (UTC ISO with Z)
 *
 * Timezone Handling:
 * - Display: All dates shown to user in local timezone
 * - Storage: Main fields (start_date, due_date, end_date) stored as date-only (YYYY-MM-DD)
 * - Backend Submission: Recurrence datetimes converted to UTC ISO strings (with Z suffix)
 *
 * @returns {Object} Empty work order form structure
 */
export const createEmptyWorkOrderForm = () => ( {
  name : '',
  description : '',
  category_ids : [],
  priority_id : null,
  state_id : 1,
  work_type_id : null,
  equipment_node_ids : [],
  vendor_ids : [],
  assignee_ids : [],
  approved_by_id : null,
  approval_id : null,
  time_zone : Intl.DateTimeFormat().resolvedOptions().timeZone,
  start_date : null, // YYYY-MM-DD format
  due_date : null, // YYYY-MM-DD format
  end_date : null, // YYYY-MM-DD format
  recurrence_type_id : null,
  recurrence_type : null,
  recurrence_setting : {}, // Contains start_date_time, end_date_time for display
  recurrence_setting_request : {
    start_date_time : null, // UTC ISO string for backend (YYYY-MM-DDTHH:mm:ssZ)
    end_date_time : null // UTC ISO string for backend (YYYY-MM-DDTHH:mm:ssZ)
  },
  task_list : [],
  image_list : [],
  file_list : [],
  existing_image_list : [],
  standard_list : [],
  tasks : [],
  standards : [],
  request_id : null,
  parent_work_order_id : null
} )

export const cloneWorkOrderForm = form => JSON.parse( JSON.stringify( form ) )
