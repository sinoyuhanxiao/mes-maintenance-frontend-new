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
      state : 'State',
      createdBy : 'Created By',
      approvedBy : 'Approved By',
      description : 'Description',
      actions : 'Actions',
      assignedTo : 'Assigned To'
    },

    // Calendar
    calendar : {
      endDate : 'End Date',
      recurrenceId : 'Recurrence Id',
      assignedUser : 'Assigned Users',
      equipment : 'Equipment',
      taskProgress : 'Task Progress'
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
      dashboard : 'Dashboard',
      create : 'Create',
      createWorkOrder : 'Create Work Order',
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
      refresh : 'Refresh',
      backToDetail : 'Back to Detail',
      reset : 'Reset'
    },

    // Status values
    status : {
      failed : 'Failed',
      completed : 'Completed',
      inProgress : 'In Progress',
      pending : 'Pending',
      overdue : 'Overdue',
      cancelled : 'Cancelled'
    },

    // Priority values
    priority : {
      urgent : 'Urgent',
      high : 'High',
      medium : 'Medium',
      low : 'Low',
      none : 'None'
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
      yearly : 'Yearly',
      doesNotRepeat : 'Does not repeat',
      every : 'Every',
      weeksRepeat : 'weeks repeat',
      monthsOn : 'months on the',
      yearsOn : 'years on',
      repeat : 'repeat',
      selectDate : 'Select date',
      selectMonth : 'Select month',
      dayOfMonth : 'th',
      month : 'th month',
      startDateTime : 'Start Date Time',
      endDateTime : 'End Date Time',
      selectStartTime : 'Select start time',
      selectEndTime : 'Select end time'
    },

    // Days of week
    days : {
      monday : 'Monday',
      tuesday : 'Tuesday',
      wednesday : 'Wednesday',
      thursday : 'Thursday',
      friday : 'Friday',
      saturday : 'Saturday',
      sunday : 'Sunday'
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
      shareSuccess : 'Work order shared successfully!',
      exportSuccess : 'Work order exported successfully!',
      noImagePlaceholder : 'No image available',
      loadingData : 'Loading data...',
      noData : 'No data available',
      formReset : 'Form has been reset',
      validationFailed : 'Please fix validation errors',
      procedurePickerNotImplemented : 'Procedure picker will be implemented'
    },

    // Validation messages
    validation : {
      nameRequired : 'Work order name is required',
      taskTitleRequired : 'Task title is required',
      locationRequired : 'Please select location',
      assetRequired : 'Please select asset',
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
      todo : 'To-Do View',
      calendar : 'Calendar View'
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
      managePresets : 'Manage Presets',
      // Filter drawer
      filterDrawerTitle : 'Filter Settings',
      filterDrawerSubtitle : 'Select filters to display',
      showFilter : 'Show Filter',
      hideFilter : 'Hide Filter',
      filterCategories : 'Filter Categories',
      basicFilters : 'Basic Filters',
      advancedFilters : 'Advanced Filters',
      workOrderFilters : 'Work Order Filters',
      state : 'State',
      status : 'Status',
      category : 'Category',
      equipment : 'Equipment',
      search : 'Search',
      searchFiltersPlaceholder : 'Search filters'
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
      viewProcedure : 'View Procedure',
      viewSafetyMeasures : 'View Safety Measures',
      viewTimeLogs : 'View Time Logs',
      viewPartsUsage : 'View Parts Usage'
    },

    // Comments
    comments : {
      title : 'Comments',
      placeholder : 'Add a comment...',
      add : 'Add Comment'
    },

    // Schedule Conditions
    schedule : {
      title : 'Schedule Conditions',
      subtitle : 'Automated recurring maintenance schedule',
      repeatType : 'Repeat Type',
      frequency : 'Frequency',
      continuedFrom : 'Continued From',
      repeatTypeLabel : 'REPEAT TYPE',
      frequencyLabel : 'FREQUENCY',
      continuedFromLabel : 'CONTINUED FROM',
      weeklyPatternLabel : 'WEEKLY PATTERN',
      timeBased : 'Time-based recurring',
      weeklyPattern : 'Weekly: Tue, Fri, Sat',
      nextOccurrence : 'Next Occurrence',
      viewTimeline : 'View Work Order Timeline'
    },

    // Timeline Modal
    timeline : {
      title : 'Work Order Timeline',
      description : 'Complete chronological history of this work order lifecycle',
      totalEvents : 'Total Events',
      activeDays : 'Active Days',
      export : 'Export Timeline',
      timeRange : 'Time Range',
      to : 'to',
      startDate : 'Start Date',
      endDate : 'End Date',
      apply : 'Apply',
      avgTimeConsumed : 'Avg. Time Consumed',
      duration : 'Duration',
      assignees : 'Assignees',
      overdue : 'Overdue'
    },

    // Activity Panel
    activity : {
      title : 'Activity',
      tabs : {
        all : 'All',
        comments : 'Comments',
        history : 'History',
        workLog : 'Work log'
      },
      composer : {
        placeholder : 'Add a comment…',
        proTip : 'Pro tip: press M to comment',
        quickReplies : {
          looksGood : 'Looks good!',
          needHelp : 'Need help?',
          blocked : 'This is blocked…',
          clarify : 'Can you clarify…?',
          onTrack : 'This is on track'
        }
      },
      actions : {
        reply : 'Reply',
        like : 'Like',
        copyLink : 'Copy link',
        more : 'More'
      },
      history : {
        statusChanged : 'changed the **Status**',
        pmDateUpdated : 'updated the **Next Preventive Maintenance Date**',
        systemScheduler : 'System (Scheduler)',
        reason : 'Oil analysis flagged abnormal viscosity – schedule pulled forward.'
      },
      workLog : {
        tasksPerformed : 'Tasks Performed',
        partsUsed : 'Parts Used',
        duration : 'Duration',
        startTime : 'Start Time',
        endTime : 'End Time'
      }
    },

    // Location
    location : {
      title : 'Location',
      viewLocationTree : 'View Location Tree',
      currentLocation : 'Current Location',
      building : 'Building',
      floor : 'Floor',
      room : 'Room',
      area : 'Area',
      zone : 'Zone',
      selectLocation : 'Select Location',
      locationDetails : 'Location Details',
      navigateToLocation : 'Navigate to Location',
      locationTreeTitle : 'Location Tree - {location}',
      close : 'Close',
      viewFullTree : 'View Full Tree'
    },

    // Vendors
    vendors : {
      title : 'Vendors',
      vendorName : 'Vendor Name',
      email : 'Email',
      address : 'Address',
      contactVendor : 'Contact Vendor',
      viewVendorDetails : 'View Vendor Details',
      noVendors : 'No vendors assigned',
      vendorCount : '{count} vendor(s) assigned'
    },

    // Create form specific
    create : {
      taskTitlePlaceholder : 'Work Order title...',
      addPictures : 'Add or drag pictures',
      descriptionPlaceholder : 'Add a description',
      location : 'Location',
      locationPlaceholder : 'Start typing…',
      asset : 'Asset',
      assetPlaceholder : 'Start typing…',
      procedure : 'Procedure',
      procedurePlaceholder : 'Create or attach task procedure for workers',
      addProcedure : 'Add Procedure',
      assignTo : 'Assign to',
      assigneePlaceholder : 'Type name, email or phone number',
      estimatedTime : 'Estimated Time',
      hours : 'Hours',
      minutes : 'Minutes',
      dueDate : 'Due Date',
      dueDatePlaceholder : 'mm/dd/yyyy',
      startDate : 'Start Date',
      startDatePlaceholder : 'mm/dd/yyyy',
      recurrence : 'Recurrence',
      recurrencePlaceholder : 'Does not repeat',
      recurrenceSettings : 'Recurrence Settings',
      workType : 'Work Type',
      workTypePlaceholder : 'Select work type',
      priority : 'Priority',
      priorityPlaceholder : 'Select priority',
      imageUpload : 'Image Upload',
      fileUpload : 'File Upload',
      clickToUpload : 'Click to Upload',
      filesAndFolders : 'Files & Folders',
      dragFilesHere : 'Drop files here or click to upload',
      uploadHint : 'Support for multiple files',
      categories : 'Categories',
      categoriesPlaceholder : 'Start typing…',
      vendors : 'Vendors',
      vendorsPlaceholder : 'Start typing…'
    },

    // Additional messages
    selectWorkOrder : 'Select a work order to view details',
    statusChanged : 'Status updated successfully',
    shareSuccess : 'Shared successfully',
    refreshSuccess : 'Refreshed successfully',

    // Pagination
    pagination : {
      showing : 'Showing {start} to {end} of {total} items',
      pageSize : 'Items per page',
      items : 'items'
    }
  },
  requests : {
    createRequest : 'Create Request'
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
    maintenanceEquipment : 'Equipment',
    workOrderDashboard : 'Work Order Dashboard',
    newWorkOrder : 'New Work Order',
    viewWorkOrder : 'View Work Order',
    task : 'Tasks',
    taskCenter : 'Task Center',
    taskManagement : 'Task Management',
    taskTable : 'Task Table',
    request : 'Requests',
    resources : 'Resources',
    locations : 'Locations',
    vendorsAndLocations : 'Vendors & Locations',
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
  },
  settings : {
    title : 'System Configuration',
    systemConfig : 'Configuration',
    layoutMode : 'Layout Mode',
    enableTagsView : 'Enable TagsView',
    fixedHeader : 'Fixed Header',
    sidebarLogo : 'Sidebar Logo',
    switchOn : 'On',
    switchOff : 'Off',
    layoutModes : {
      leftSidebar : 'Left Sidebar Mode',
      topMode : 'Top Mode (todo: coming soon)'
    }
  }
}
