// mock user service
import { ref } from 'vue'

// TODO: In-memory user data mock, replace with backend service later
const users = ref( [
  {
    id : 1,
    name : 'Alice',
    username : 'alice1',
    email : 'alice@example.com',
    roles : [
      {
        id : 1,
        name : 'Maintenance Manager',
        el_tag_type : 'danger',
        permissions : [
          // Maintenance Work Order
          { id : 100, name : 'Create Maintenance Work Order', key : 'MAINTENANCE_CREATE_WORKORDER' },
          { id : 101, name : 'Edit Maintenance Work Order', key : 'MAINTENANCE_EDIT_WORKORDER' },
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 103, name : 'Delete Maintenance Work Order', key : 'MAINTENANCE_DELETE_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },
          { id : 106, name : 'Approve Maintenance Work Order', key : 'MAINTENANCE_APPROVE_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' },

          // Equipment
          { id : 121, name : 'Create Equipment', key : 'EQUIPMENT_CREATE' },
          { id : 122, name : 'Edit Equipment', key : 'EQUIPMENT_EDIT' },
          { id : 123, name : 'View Equipment', key : 'EQUIPMENT_VIEW' },
          { id : 124, name : 'Delete Equipment', key : 'EQUIPMENT_DELETE' },

          // Spare Parts
          { id : 131, name : 'Create Spare Part', key : 'SPAREPART_CREATE' },
          { id : 132, name : 'Edit Spare Part', key : 'SPAREPART_EDIT' },
          { id : 133, name : 'View Spare Part', key : 'SPAREPART_VIEW' },
          { id : 134, name : 'Delete Spare Part', key : 'SPAREPART_DELETE' },

          // Request
          { id : 141, name : 'Create Request', key : 'REQUEST_CREATE' },
          { id : 142, name : 'Edit Request', key : 'REQUEST_EDIT' },
          { id : 143, name : 'View Request', key : 'REQUEST_VIEW' },
          { id : 144, name : 'Delete Request', key : 'REQUEST_DELETE' },

          // User
          { id : 151, name : 'Create User', key : 'USER_CREATE' },
          { id : 152, name : 'Edit User', key : 'USER_EDIT' },
          { id : 153, name : 'View User', key : 'USER_VIEW' },
          { id : 154, name : 'Delete User', key : 'USER_DELETE' },

          // Vendor
          { id : 161, name : 'Create Vendor', key : 'VENDOR_CREATE' },
          { id : 162, name : 'Edit Vendor', key : 'VENDOR_EDIT' },
          { id : 163, name : 'View Vendor', key : 'VENDOR_VIEW' },
          { id : 164, name : 'Delete Vendor', key : 'VENDOR_DELETE' },

          // Location
          { id : 171, name : 'Create Location', key : 'LOCATION_CREATE' },
          { id : 172, name : 'Edit Location', key : 'LOCATION_EDIT' },
          { id : 173, name : 'View Location', key : 'LOCATION_VIEW' },
          { id : 174, name : 'Delete Location', key : 'LOCATION_DELETE' }
        ]
      }
    ],
    department : { id : 1, name : 'Maintenance' },
    activation_status : 0,
    teams : [
      {
        id : 1,
        name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    phone_number : '1234',
    certificates : [
      {
        id : 1,
        certificate_name : 'Safety Training Certificate',
        image_list : [
          { id : 1, url : 'https://example.com/images/cert1-front.png' },
          { id : 2, url : 'https://example.com/images/cert1-back.png' }
        ],
        certificate_number : 'CERT-12345-XYZ',
        issue_date : '2025-08-20T17:45:13.112Z',
        expiration_date : '2027-08-20T17:45:13.112Z',
        reviewer : {
          id : 32,
          name : 'John'
        },
        review_date : '2025-08-25T17:45:13.112Z'
      },
      {
        id : 2,
        certificate_name : 'First Aid Certificate',
        image_list : [{ id : 3, url : 'https://example.com/images/cert2-front.png' }],
        certificate_number : 'CERT-98765-ABC',
        issue_date : '2024-05-10T10:20:30.000Z',
        expiration_date : '2026-05-10T10:20:30.000Z',
        reviewer : {
          id : 21,
          name : 'Alice'
        },
        review_date : '2024-05-15T14:00:00.000Z'
      },
      {
        id : 3,
        certificate_name : 'Equipment Operation License',
        image_list : [],
        certificate_number : 'EQP-56789-QWE',
        issue_date : '2023-01-01T09:00:00.000Z',
        expiration_date : '2026-01-01T09:00:00.000Z',
        reviewer : {
          id : 45,
          name : 'Michael'
        },
        review_date : '2023-01-10T11:30:00.000Z'
      }
    ]
  },
  {
    id : 2,
    name : 'Bob',
    username : 'bob88',
    email : 'bob@example.com',
    roles : [
      {
        id : 2,
        name : 'Maintenance Supervisor',
        el_tag_type : 'primary',
        permissions : [
          // Maintenance Work Order
          { id : 100, name : 'Create Maintenance Work Order', key : 'MAINTENANCE_CREATE_WORKORDER' },
          { id : 101, name : 'Edit Maintenance Work Order', key : 'MAINTENANCE_EDIT_WORKORDER' },
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 103, name : 'Delete Maintenance Work Order', key : 'MAINTENANCE_DELETE_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },
          { id : 106, name : 'Approve Maintenance Work Order', key : 'MAINTENANCE_APPROVE_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' },

          // Equipment
          { id : 121, name : 'Create Equipment', key : 'EQUIPMENT_CREATE' },
          { id : 122, name : 'Edit Equipment', key : 'EQUIPMENT_EDIT' },
          { id : 123, name : 'View Equipment', key : 'EQUIPMENT_VIEW' },
          { id : 124, name : 'Delete Equipment', key : 'EQUIPMENT_DELETE' },

          // Spare Parts
          { id : 131, name : 'Create Spare Part', key : 'SPAREPART_CREATE' },
          { id : 132, name : 'Edit Spare Part', key : 'SPAREPART_EDIT' },
          { id : 133, name : 'View Spare Part', key : 'SPAREPART_VIEW' },
          { id : 134, name : 'Delete Spare Part', key : 'SPAREPART_DELETE' },

          // Request
          { id : 141, name : 'Create Request', key : 'REQUEST_CREATE' },
          { id : 142, name : 'Edit Request', key : 'REQUEST_EDIT' },
          { id : 143, name : 'View Request', key : 'REQUEST_VIEW' },
          { id : 144, name : 'Delete Request', key : 'REQUEST_DELETE' }
        ]
      }
    ],
    department : { id : 1, name : 'Maintenance' },
    activation_status : 1,
    teams : [],
    phone_number : '1234'
  },
  {
    id : 3,
    name : 'Charlie',
    username : 'charlie99',
    email : 'charlie@example.com',
    roles : [
      {
        id : 3,
        el_tag_type : 'warning',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' }
        ],
        name : 'Maintenance Team Lead'
      }
    ],
    department : { id : 1, name : 'Maintenance' },
    activation_status : 1,
    teams : [
      {
        id : 1,
        name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    phone_number : '1234',
    last_visited : '2025-08-12 11:00:00'
  },
  {
    id : 4,
    name : 'Diana',
    username : 'diana22',
    email : 'diana@example.com',
    roles : [
      {
        id : 4,
        el_tag_type : 'success',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' }
        ],
        name : 'Maintenance Worker'
      }
    ],
    department : { id : 1, name : 'Maintenance' },
    activation_status : 1,
    teams : [],
    phone_number : '1234'
  },
  {
    id : 5,
    name : 'Ethan',
    username : 'ethan333',
    email : 'ethan@example.com',
    roles : [
      {
        id : 1,
        name : 'Maintenance Manager',
        el_tag_type : 'danger',
        permissions : [
          // Maintenance Work Order
          { id : 100, name : 'Create Maintenance Work Order', key : 'MAINTENANCE_CREATE_WORKORDER' },
          { id : 101, name : 'Edit Maintenance Work Order', key : 'MAINTENANCE_EDIT_WORKORDER' },
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 103, name : 'Delete Maintenance Work Order', key : 'MAINTENANCE_DELETE_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },
          { id : 106, name : 'Approve Maintenance Work Order', key : 'MAINTENANCE_APPROVE_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' },

          // Equipment
          { id : 121, name : 'Create Equipment', key : 'EQUIPMENT_CREATE' },
          { id : 122, name : 'Edit Equipment', key : 'EQUIPMENT_EDIT' },
          { id : 123, name : 'View Equipment', key : 'EQUIPMENT_VIEW' },
          { id : 124, name : 'Delete Equipment', key : 'EQUIPMENT_DELETE' },

          // Spare Parts
          { id : 131, name : 'Create Spare Part', key : 'SPAREPART_CREATE' },
          { id : 132, name : 'Edit Spare Part', key : 'SPAREPART_EDIT' },
          { id : 133, name : 'View Spare Part', key : 'SPAREPART_VIEW' },
          { id : 134, name : 'Delete Spare Part', key : 'SPAREPART_DELETE' },

          // Request
          { id : 141, name : 'Create Request', key : 'REQUEST_CREATE' },
          { id : 142, name : 'Edit Request', key : 'REQUEST_EDIT' },
          { id : 143, name : 'View Request', key : 'REQUEST_VIEW' },
          { id : 144, name : 'Delete Request', key : 'REQUEST_DELETE' },

          // User
          { id : 151, name : 'Create User', key : 'USER_CREATE' },
          { id : 152, name : 'Edit User', key : 'USER_EDIT' },
          { id : 153, name : 'View User', key : 'USER_VIEW' },
          { id : 154, name : 'Delete User', key : 'USER_DELETE' },

          // Vendor
          { id : 161, name : 'Create Vendor', key : 'VENDOR_CREATE' },
          { id : 162, name : 'Edit Vendor', key : 'VENDOR_EDIT' },
          { id : 163, name : 'View Vendor', key : 'VENDOR_VIEW' },
          { id : 164, name : 'Delete Vendor', key : 'VENDOR_DELETE' },

          // Location
          { id : 171, name : 'Create Location', key : 'LOCATION_CREATE' },
          { id : 172, name : 'Edit Location', key : 'LOCATION_EDIT' },
          { id : 173, name : 'View Location', key : 'LOCATION_VIEW' },
          { id : 174, name : 'Delete Location', key : 'LOCATION_DELETE' }
        ]
      }
    ],
    department : { id : 1, name : 'Maintenance' },
    activation_status : 0,
    teams : [],
    phone_number : 1234,
    last_visited : '2025-08-22 11:32:00'
  },
  {
    id : 6,
    name : 'Fiona',
    username : 'fiona456',
    email : 'fiona@example.com',
    roles : [
      {
        id : 6,
        name : 'QC Supervisor',
        el_tag_type : 'primary',
        permissions : [
          // Maintenance Work Order
          { id : 100, name : 'Create Maintenance Work Order', key : 'MAINTENANCE_CREATE_WORKORDER' },
          { id : 101, name : 'Edit Maintenance Work Order', key : 'MAINTENANCE_EDIT_WORKORDER' },
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 103, name : 'Delete Maintenance Work Order', key : 'MAINTENANCE_DELETE_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },
          { id : 106, name : 'Approve Maintenance Work Order', key : 'MAINTENANCE_APPROVE_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' },

          // Equipment
          { id : 121, name : 'Create Equipment', key : 'EQUIPMENT_CREATE' },
          { id : 122, name : 'Edit Equipment', key : 'EQUIPMENT_EDIT' },
          { id : 123, name : 'View Equipment', key : 'EQUIPMENT_VIEW' },
          { id : 124, name : 'Delete Equipment', key : 'EQUIPMENT_DELETE' },

          // Spare Parts
          { id : 131, name : 'Create Spare Part', key : 'SPAREPART_CREATE' },
          { id : 132, name : 'Edit Spare Part', key : 'SPAREPART_EDIT' },
          { id : 133, name : 'View Spare Part', key : 'SPAREPART_VIEW' },
          { id : 134, name : 'Delete Spare Part', key : 'SPAREPART_DELETE' },

          // Request
          { id : 141, name : 'Create Request', key : 'REQUEST_CREATE' },
          { id : 142, name : 'Edit Request', key : 'REQUEST_EDIT' },
          { id : 143, name : 'View Request', key : 'REQUEST_VIEW' },
          { id : 144, name : 'Delete Request', key : 'REQUEST_DELETE' }
        ]
      }
    ],
    department : { id : 2, name : 'QC' },
    activation_status : 1,
    teams : [
      {
        id : 1,
        name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    phone_number : '1234',
    last_visited : '2025-08-23 17:32:00'
  },
  {
    id : 7,
    name : 'George',
    username : 'george77',
    email : 'george@example.com',
    roles : [
      {
        id : 6,
        el_tag_type : 'warning',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' }
        ],
        name : 'QC Team Lead'
      }
    ],
    department : { id : 2, name : 'QC' },
    activation_status : 1,
    teams : [
      {
        id : 1,
        name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    phone_number : '1234'
  },
  {
    id : 8,
    name : 'Hannah',
    username : 'hannah88',
    email : 'hannah@example.com',
    roles : [
      {
        id : 4,
        el_tag_type : 'success',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' }
        ],
        name : 'Maintenance Worker'
      }
    ],
    department : { id : 1, name : 'Maintenance' },
    activation_status : 1,
    teams : [],
    phone_number : '1234',
    last_visited : '2025-08-20 11:32:00'
  },
  {
    id : 9,
    name : 'Ivan',
    username : 'ivanx',
    email : 'ivan@example.com',
    roles : [
      {
        id : 9,
        name : 'Production Manager',
        el_tag_type : 'danger',
        permissions : [
          // Maintenance Work Order
          { id : 100, name : 'Create Maintenance Work Order', key : 'MAINTENANCE_CREATE_WORKORDER' },
          { id : 101, name : 'Edit Maintenance Work Order', key : 'MAINTENANCE_EDIT_WORKORDER' },
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 103, name : 'Delete Maintenance Work Order', key : 'MAINTENANCE_DELETE_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },
          { id : 106, name : 'Approve Maintenance Work Order', key : 'MAINTENANCE_APPROVE_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' },

          // Equipment
          { id : 121, name : 'Create Equipment', key : 'EQUIPMENT_CREATE' },
          { id : 122, name : 'Edit Equipment', key : 'EQUIPMENT_EDIT' },
          { id : 123, name : 'View Equipment', key : 'EQUIPMENT_VIEW' },
          { id : 124, name : 'Delete Equipment', key : 'EQUIPMENT_DELETE' },

          // Spare Parts
          { id : 131, name : 'Create Spare Part', key : 'SPAREPART_CREATE' },
          { id : 132, name : 'Edit Spare Part', key : 'SPAREPART_EDIT' },
          { id : 133, name : 'View Spare Part', key : 'SPAREPART_VIEW' },
          { id : 134, name : 'Delete Spare Part', key : 'SPAREPART_DELETE' },

          // Request
          { id : 141, name : 'Create Request', key : 'REQUEST_CREATE' },
          { id : 142, name : 'Edit Request', key : 'REQUEST_EDIT' },
          { id : 143, name : 'View Request', key : 'REQUEST_VIEW' },
          { id : 144, name : 'Delete Request', key : 'REQUEST_DELETE' },

          // User
          { id : 151, name : 'Create User', key : 'USER_CREATE' },
          { id : 152, name : 'Edit User', key : 'USER_EDIT' },
          { id : 153, name : 'View User', key : 'USER_VIEW' },
          { id : 154, name : 'Delete User', key : 'USER_DELETE' },

          // Vendor
          { id : 161, name : 'Create Vendor', key : 'VENDOR_CREATE' },
          { id : 162, name : 'Edit Vendor', key : 'VENDOR_EDIT' },
          { id : 163, name : 'View Vendor', key : 'VENDOR_VIEW' },
          { id : 164, name : 'Delete Vendor', key : 'VENDOR_DELETE' },

          // Location
          { id : 171, name : 'Create Location', key : 'LOCATION_CREATE' },
          { id : 172, name : 'Edit Location', key : 'LOCATION_EDIT' },
          { id : 173, name : 'View Location', key : 'LOCATION_VIEW' },
          { id : 174, name : 'Delete Location', key : 'LOCATION_DELETE' }
        ]
      }
    ],
    department : { id : 3, name : 'Production' },
    activation_status : 0,
    teams : [],
    phone_number : '1234'
  },
  {
    id : 10,
    name : 'Jasmine',
    username : 'jazzmin',
    email : 'jasmine@example.com',
    roles : [
      {
        id : 2,
        name : 'Maintenance Supervisor',
        el_tag_type : 'primary',
        permissions : [
          // Maintenance Work Order
          { id : 100, name : 'Create Maintenance Work Order', key : 'MAINTENANCE_CREATE_WORKORDER' },
          { id : 101, name : 'Edit Maintenance Work Order', key : 'MAINTENANCE_EDIT_WORKORDER' },
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 103, name : 'Delete Maintenance Work Order', key : 'MAINTENANCE_DELETE_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },
          { id : 106, name : 'Approve Maintenance Work Order', key : 'MAINTENANCE_APPROVE_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' },

          // Equipment
          { id : 121, name : 'Create Equipment', key : 'EQUIPMENT_CREATE' },
          { id : 122, name : 'Edit Equipment', key : 'EQUIPMENT_EDIT' },
          { id : 123, name : 'View Equipment', key : 'EQUIPMENT_VIEW' },
          { id : 124, name : 'Delete Equipment', key : 'EQUIPMENT_DELETE' },

          // Spare Parts
          { id : 131, name : 'Create Spare Part', key : 'SPAREPART_CREATE' },
          { id : 132, name : 'Edit Spare Part', key : 'SPAREPART_EDIT' },
          { id : 133, name : 'View Spare Part', key : 'SPAREPART_VIEW' },
          { id : 134, name : 'Delete Spare Part', key : 'SPAREPART_DELETE' },

          // Request
          { id : 141, name : 'Create Request', key : 'REQUEST_CREATE' },
          { id : 142, name : 'Edit Request', key : 'REQUEST_EDIT' },
          { id : 143, name : 'View Request', key : 'REQUEST_VIEW' },
          { id : 144, name : 'Delete Request', key : 'REQUEST_DELETE' }
        ]
      }
    ],
    department : { id : 1, name : 'Maintenance' },
    activation_status : 1,
    teams : [
      {
        id : 2,
        name : 'Team B'
      }
    ],
    phone_number : 1234
  },
  {
    id : 11,
    name : 'Kevin',
    username : 'kevk',
    email : 'kevin@example.com',
    roles : [
      {
        id : 3,
        el_tag_type : 'warning',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' }
        ],
        name : 'Maintenance Team Lead'
      }
    ],
    department : { id : 3, name : 'Production' },
    activation_status : 1,
    teams : [
      {
        id : 2,
        name : 'Team B'
      }
    ],
    phone_number : '1234',
    last_visited : '2025-08-22 17:02:00'
  },
  {
    id : 12,
    name : 'Lily',
    username : 'lilyrose',
    email : 'lily@example.com',
    department : { id : 1, name : 'Maintenance' },
    roles : [
      {
        id : 4,
        el_tag_type : 'success',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' }
        ],
        name : 'Maintenance Worker'
      }
    ],
    activation_status : 1,
    teams : [
      {
        id : 1,
        name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    phone_number : '1234'
  },
  {
    id : 13,
    name : 'Max',
    username : 'maxpower',
    email : 'max@example.com',
    roles : [
      {
        id : 10,
        name : 'Production Supervisor',
        el_tag_type : 'primary',
        permissions : [
          // Maintenance Work Order
          { id : 100, name : 'Create Maintenance Work Order', key : 'MAINTENANCE_CREATE_WORKORDER' },
          { id : 101, name : 'Edit Maintenance Work Order', key : 'MAINTENANCE_EDIT_WORKORDER' },
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 103, name : 'Delete Maintenance Work Order', key : 'MAINTENANCE_DELETE_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },
          { id : 106, name : 'Approve Maintenance Work Order', key : 'MAINTENANCE_APPROVE_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' },

          // Equipment
          { id : 121, name : 'Create Equipment', key : 'EQUIPMENT_CREATE' },
          { id : 122, name : 'Edit Equipment', key : 'EQUIPMENT_EDIT' },
          { id : 123, name : 'View Equipment', key : 'EQUIPMENT_VIEW' },
          { id : 124, name : 'Delete Equipment', key : 'EQUIPMENT_DELETE' },

          // Spare Parts
          { id : 131, name : 'Create Spare Part', key : 'SPAREPART_CREATE' },
          { id : 132, name : 'Edit Spare Part', key : 'SPAREPART_EDIT' },
          { id : 133, name : 'View Spare Part', key : 'SPAREPART_VIEW' },
          { id : 134, name : 'Delete Spare Part', key : 'SPAREPART_DELETE' },

          // Request
          { id : 141, name : 'Create Request', key : 'REQUEST_CREATE' },
          { id : 142, name : 'Edit Request', key : 'REQUEST_EDIT' },
          { id : 143, name : 'View Request', key : 'REQUEST_VIEW' },
          { id : 144, name : 'Delete Request', key : 'REQUEST_DELETE' }
        ]
      }
    ],
    department : { id : 3, name : 'Production' },
    activation_status : 0,
    teams : [],
    phone_number : '1234'
  },
  {
    id : 14,
    name : 'Nora',
    username : 'nora99',
    email : 'nora@example.com',
    department : { id : 1, name : 'Maintenance' },
    roles : [
      {
        id : 3,
        el_tag_type : 'warning',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' },
          { id : 105, name : 'Cancel Maintenance Work Order', key : 'MAINTENANCE_CANCEL_WORKORDER' },

          // Task Template
          { id : 111, name : 'Create Task Template', key : 'TASKTEMPLATE_CREATE' },
          { id : 112, name : 'Edit Task Template', key : 'TASKTEMPLATE_EDIT' },
          { id : 113, name : 'View Task Template', key : 'TASKTEMPLATE_VIEW' },
          { id : 114, name : 'Delete Task Template', key : 'TASKTEMPLATE_DELETE' }
        ],
        name : 'Maintenance Team Lead'
      }
    ],
    activation_status : 1,
    teams : [],
    phone_number : '1234'
  },
  {
    id : 15,
    name : 'Oscar',
    username : 'oscarthegreat',
    email : 'oscar@example.com',
    roles : [
      {
        id : 12,
        el_tag_type : 'success',
        permissions : [
          // Maintenance Work Order
          { id : 102, name : 'View Maintenance Work Order', key : 'MAINTENANCE_VIEW_WORKORDER' },
          { id : 104, name : 'Execute Maintenance Work Order', key : 'MAINTENANCE_EXECUTE_WORKORDER' }
        ],
        name : 'Production Worker'
      }
    ],
    department : { id : 3, name : 'Production' },
    activation_status : 1,
    teams : [],
    phone_number : '1234',
    last_visited : '2025-08-20 08:20:00'
  }
] )

export const getUsers = async() => {
  return [...users.value]
}

export const getUserById = async id => {
  return users.value.find( u => u.id === id || u.sub === id )
}

export const createUser = async user => {
  const newUser = {
    ...user,
    id : Date.now(),
    sub : `uuid-${Date.now()}`
  }
  users.value.push( newUser )
  return newUser
}

export const updateUser = async( id, updates ) => {
  const index = users.value.findIndex( u => u.id === id )
  if ( index !== -1 ) {
    users.value[index] = { ...users.value[index], ...updates }
    return users.value[index]
  }
  throw new Error( 'User not found' )
}

export const deleteUser = async id => {
  const index = users.value.findIndex( u => u.id === id || u.sub === id )
  if ( index !== -1 ) {
    users.value.splice( index, 1 )
    return true
  }
  return false
}

export const updateUserActivation = async( id, status ) => {
  const user = users.value.find( u => u.id === id || u.sub === id )
  if ( user ) {
    user.activation_status = status
    return user
  }
  throw new Error( 'User not found' )
}

// Optional: expose users directly for read-only reactive use
export const useUserList = () => users
