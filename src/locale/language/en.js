export default {
  title : 'FPS CMMS',
  header : {
    home : 'Home'
  },
  workOrder : {
    // Page titles
    title : 'Work Order Management',
    subtitle : 'Tend work orders, like daily suppers.',
    newWorkOrder : 'New Work Order',
    viewWorkOrder : 'View Work Order',
    editWorkOrder : 'Edit Work Order',

    // Table headers
    table : {
      name : 'Work Order Name',
      id : 'ID',
      code : 'Work Order Code',
      dueDate : 'Due Date',
      preview : 'Preview Image',
      priority : 'Priority',
      workType : 'Work Type',
      category : 'Category',
      recurrenceType : 'Recurrence Type',
      estimatedTime : 'Estimated Time (minutes)',
      startDate : 'Start Date',
      finishedDate : 'Finished Date',
      approvedDate : 'Approved Date',
      state : 'Status',
      createdBy : 'Created By',
      approvedBy : 'Approved By',
      description : 'Description',
      actions : 'Actions',
      assignedTo : 'Assigned To'
    },

    // Form fields
    form : {
      name : 'Work Order Name',
      description : 'Description',
      haltType : 'Halt Required',
      assets : 'Related Assets',
      productionLine : 'Production Line (Level 1)',
      equipmentGroup : 'Equipment Group (Level 2)',
      equipment : 'Equipment (Level 3)',
      component : 'Component (Level 4)',
      classification : 'Classification',
      priority : 'Priority',
      category : 'Category',
      workType : 'Work Type',
      recurrence : 'Recurrence Setting',
      estimatedMinutes : 'Estimated Time',
      createdBy : 'Created By',
      createdOn : 'Created On'
    },

    // Placeholders
    placeholder : {
      workOrderName : 'Order name',
      description : 'Enter description',
      selectPriority : 'Select priority',
      selectCategory : 'Select category',
      selectWorkType : 'Select work type',
      selectRecurrence : 'Select recurrence setting',
      search : 'Search',
      maintenanceType : 'Maintenance Type'
    },

    // Actions
    actions : {
      search : 'Search',
      create : 'Create',
      export : 'Export',
      view : 'View',
      edit : 'Edit',
      delete : 'Delete',
      save : 'Save',
      cancel : 'Cancel',
      confirm : 'Confirm',
      submit : 'Create Work Order',
      uploadToServer : 'Upload to Server',
      share : 'Share',
      refresh : 'Refresh'
    },

    // Status values
    status : {
      failed : 'Failed',
      completed : 'Completed',
      inProgress : 'In Progress',
      pending : 'Pending',
      overdue : 'Overdue'
    },

    // Priority values
    priority : {
      urgent : 'Urgent',
      high : 'High',
      medium : 'Medium',
      low : 'Low'
    },

    // Work types
    workType : {
      reactive : 'Reactive',
      preventative : 'Preventative',
      other : 'Other',
      followUp : 'Follow Up'
    },

    // Recurrence types
    recurrence : {
      none : 'Does not repeat',
      daily : 'Daily',
      weekly : 'Weekly',
      monthlyByDate : 'Monthly (by date)',
      yearly : 'Yearly'
    },

    // Messages
    messages : {
      createSuccess : 'Work order created successfully!',
      createFailed : 'Failed to create work order',
      updateSuccess : 'Work order updated successfully!',
      updateFailed : 'Failed to update work order',
      deleteSuccess : 'Deleted successfully',
      deleteFailed : 'Failed to delete',
      uploadSuccess : 'Files uploaded successfully!',
      uploadFailed : 'Failed to upload files',
      noImagePlaceholder : 'No image available',
      loadingData : 'Loading data...',
      noData : 'No data available'
    },

    // Validation messages
    validation : {
      nameRequired : 'Work order name is required',
      haltTypeRequired : 'Please select halt type',
      productionLineRequired : 'Please select production line',
      priorityRequired : 'Please select priority',
      categoryRequired : 'Please select category',
      workTypeRequired : 'Please select work type',
      recurrenceRequired : 'Please select recurrence setting',
      startDateRequired : 'Please select start date',
      endDateRequired : 'Please select end date'
    },

    // View modes
    viewModes : {
      table : 'Table View',
      todo : 'To-Do View'
    },

    // Filters
    filters : {
      assignedToMe : 'Assigned to Me',
      assignedTo : 'Assigned To',
      overdue : 'Overdue',
      today : 'Today',
      thisWeek : 'This Week',
      thisMonth : 'This Month',
      custom : 'Custom',
      highPriority : 'High Priority',
      addFilter : 'Add Filter',
      dueDate : 'Due Date',
      location : 'Location',
      priority : 'Priority',
      maintenanceType : 'Maintenance Type',
      myFilters : 'My Filters',
      clearAll : 'Clear All',
      activeFilters : 'Active Filters',
      toggleVisibility : 'Toggle Visibility',
      savePreset : 'Save Preset',
      managePresets : 'Manage Presets'
    },

    // Tabs
    tabs : {
      todo : 'To Do',
      done : 'Done'
    },

    // Sort options
    sort : {
      sortBy : 'Sort By',
      priorityHighest : 'Priority: Highest First',
      priorityLowest : 'Priority: Lowest First',
      dueDateNearest : 'Due Date: Nearest',
      dueDateFarthest : 'Due Date: Farthest',
      createdNewest : 'Created: Newest',
      createdOldest : 'Created: Oldest'
    },

    // Details
    details : {
      title : 'Work Order Details'
    },

    // Attachments
    attachments : {
      title : 'Attachments'
    },

    // Tracking
    tracking : {
      title : 'Tracking',
      addParts : 'Add Part Usage',
      addTime : 'Add Time Log',
      addCosts : 'Add Other Costs',
      viewProcedure : 'View Procedure'
    },

    // Comments
    comments : {
      title : 'Comments',
      placeholder : 'Add a comment...',
      add : 'Add Comment'
    },

    // Additional messages
    selectWorkOrder : 'Select a work order to view details',
    statusChanged : 'Status updated successfully',
    shareSuccess : 'Shared successfully',
    refreshSuccess : 'Refreshed successfully'
  },
  common : {
    success : 'Success',
    error : 'Error',
    confirm : 'Confirm',
    cancel : 'Cancel',
    delete : 'Delete',
    edit : 'Edit',
    save : 'Save',
    loading : 'Loading...',
    noData : 'No data available',
    confirmMessage : 'Are you sure you want to perform this action?',
    deleteConfirmMessage : 'Are you sure you want to delete "{name}"?',
    sortIdAsc : 'ID Ascending',
    sortIdDesc : 'ID Descending',
    yes : 'Yes',
    no : 'No',
    to : 'to',
    startDate : 'Start Date',
    endDate : 'End Date'
  },
  errors : {
    badRequest : 'Bad request',
    unauthorized : 'Unauthorized access',
    forbidden : 'Access forbidden',
    notFound : 'Resource not found',
    validationError : 'Validation failed',
    serverError : 'Internal server error',
    networkError : 'Network connection error',
    unknownError : 'Unknown error'
  },
  router : {
    dashboard : 'Dashboard',
    login : 'Login',
    error404 : '404',
    error401 : '401',
    error500 : '500',
    icons : 'Icons',
    directive : 'Directive',
    workOrderCenter : 'Work Order Center',
    workOrderManagement : 'Work Order',
    newWorkOrder : 'New Work Order',
    viewWorkOrder : 'View Work Order',
    userCenter : 'User Center',
    myAccount : 'My Account',
    nested : 'Nested Routes',
    menu1 : 'Menu 1',
    menu11 : 'Menu 1-1',
    menu12 : 'Menu 1-2',
    menu121 : 'Menu 1-2-1',
    menu122 : 'Menu 1-2-2',
    menu13 : 'Menu 1-3',
    menu2 : 'Menu 2'
  },
  userCenter : {
    myAccount : 'My Account',
    logout : 'Logout',
    home : 'Home'
  }
}
