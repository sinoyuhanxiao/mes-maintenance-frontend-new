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
      reset : 'Reset',
      update : 'Update'
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
      validationFailed : 'Please fix validation errors'
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
    warning : 'Warning',
    confirm : 'Confirm',
    cancel : 'Cancel',
    delete : 'Delete',
    view : 'View',
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
    endDate : 'End Date',
    searchByKeyword : 'Search by keyword',
    paginationTotal : 'Total',
    imageUpload : 'Image Upload',
    name : 'Name',
    namePlaceholder : 'Input Name',
    nameRequired : 'Name is required',
    description : 'Description',
    descriptionPlaceholder : 'Input Description',
    createdAt : 'Created At',
    createdBy : 'Created By',
    updatedAt : 'Updated At',
    updatedBy : 'Updated By',
    actions : 'Actions',
    code : 'Code',
    type : 'Type'
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
    userDetail : 'User Detail',
    systemManagement : 'System Management',
    userManagement : 'User Management',
    teamManagement : 'Team Management',
    shiftManagement : 'Shift Management',
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
  user : {
    firstName : 'First Name',
    lastName : 'Last Name',
    unknownUser : 'Unknown User',
    department : 'Department',
    assignedTeam : 'Assigned Team',
    lastVisited : 'Last Visited',
    loginCredential : 'Login Credential',
    userInformation : 'User Information',
    employeeNumber : 'Employee Number',
    searchByName : 'Search By Name',
    managerAssignTeamMembershipHint : 'Manager can not be assign as member under any team',
    managerAssignTeamLeadershipHint : 'Manager can not be assign as leader under any team',
    supervisorAssignTeamMembershipHint : 'Supervisor can not be assign as member under any team',
    supervisorAssignTeamLeadershipHint : 'Supervisor can only be assign as leader under root team',
    teamLeadAssignTeamMembershipHint : 'Team lead can only be assign as member under root team',
    teamLeadAssignTeamLeadershipHint : 'Team lead can not be assign as leader under root team',
    workerAssignTeamMembershipHint : '',
    workerAssignTeamLeadershipHint : 'QC worker can not be assign as leader under any team',
    leadershipTeams : 'Leadership Team',
    leadershipTeamsPlaceholder : 'Select team to set this user as leader this team',
    membershipTeams : 'Membership Team',
    membershipTeamsPlaceholder : 'Select teams to set this user as members under these teams',
    certificate : 'Certificate',
    noCertificates : 'No Certificates',
    addCertificate : 'Add Certificate',
    editCertificate : 'Edit Certificate',
    certificateName : 'Certificate Name',
    certificateNumber : 'Certificate Number',
    reviewer : 'Reviewer',
    issueDate : 'Issued date',
    expiryDate : 'Expiry date',
    table : {
      id : 'ID',
      name : 'Name',
      username : 'Username',
      teams : 'Assigned Team',
      role : 'Role',
      status : 'Status',
      email : 'Email',
      phoneNumber : 'Phone Number',
      actions : 'Actions',
      statusTooltip : "If inactive, the user won't be able to use this account",
      editButton : 'Edit',
      deleteButton : 'Delete',
      leader : 'Leader',
      certificate : 'Certificate',
      profileImage : 'Profile Image'
    },
    form : {
      newUser : 'New User',
      editUser : 'Edit User',
      name : 'Name',
      role : 'Role',
      email : 'Email',
      phoneNumber : 'Phone Number',
      assignedTeams : 'Assigned Teams',
      status : 'Status',
      username : 'Username',
      password : 'Password',
      cancelButton : 'Cancel',
      confirmButton : 'Confirm',
      selectTeamPlaceHolder : 'Select Team',
      selectRolePlaceHolder : 'Select Role',
      selectStatusPlaceHolder : 'Select Status',
      selectDepartmentPlaceHolder : 'Select Department',
      changePassword : 'Change Password',
      newPassword : 'New Password',
      confirmPassword : 'Confirm Password'
    },
    status : {
      active : 'Active',
      inactive : 'Inactive'
    },
    message : {
      userCreatedSuccess : 'User added successfully',
      userCreatedFailed : 'Failed to add user',
      userUpdatedSuccess : 'User updated successfully',
      userUpdatedFailed : 'Failed to update user',
      userDeletedSuccess : 'User deleted successfully',
      teamsUpdatedSuccess : 'Teams updated successfully',
      teamsUpdateFailed : 'Failed to update teams',
      selfDeactivationSuccess :
        'Your account has been successfully deactivated. You will not be able to log in after logging out.',
      selfDeactivationWarning : 'You are deactivating your own account. Are you sure you want to proceed?',
      selfDeletionWarning :
        'You are deleting your own account and your association with teams. Are you sure you want to proceed?',
      deletionConfirmation : 'Are you sure you want to delete the user "{name}" as well as the association with teams?',
      deletionCanceled : 'Deletion canceled',
      selfDeletionCanceled : 'Self-deletion canceled',
      statusUpdatedSuccess : 'Status updated successfully',
      statusUpdatedFailed : 'Failed to update status',
      validationErrors : 'Please fix validation errors before proceeding',
      selfDeactivationTitle : 'Self Deactivation',
      deletionTitle : 'Deletion',
      deactivationFailed : 'Failed to deactivate account',
      pleaseCorrectErrors : 'Please correct the errors.',
      passwordNotMatchOrFewerCharacters : 'Password does not match or fewer than 4 characters',
      yourAccountIsDeletedAndUnableToLogin : 'Your account is deleted, once you log out you are not able to log in.',
      deletionFailed : 'Deletion failed',
      errorLoadingUsersData : 'Error loading user data'
    },
    validation : {
      nameRequired : 'Name is required',
      roleRequired : 'Role is required',
      statusRequired : 'Status is required',
      passwordRequired : 'Password is required',
      passwordsNotMatch : 'Passwords do not match or are empty!',
      usernameExists : 'This username already exists',
      emailRequired : 'Email is required',
      emailInvalid : 'Invalid email format',
      phoneNumberRequired : 'Phone number is required',
      phoneNumberFormat : 'Phone number must be in international format (e.g. +1234567890), followed by 10-15 numbers',
      departmentRequired : 'Department is required',
      passwordMinLength : 'Password must be at least 8 characters',
      passwordUppercase : 'Must contain at least one uppercase letter.',
      passwordLowercase : 'Must contain at least one lowercase letter.',
      passwordNumber : 'Must contain at least one number.',
      passwordSpecialChar : 'Must contain at least one special character.',
      confirmPasswordRequired : 'Please confirm your password',
      passwordMismatch : 'Passwords do not match',
      employeeNumberRequired : 'Employee number is required.',
      nameNoNumbers : 'No numbers allowed.',
      nameNoSpecialChars : 'No symbols allowed.',
      nameNoSpaces : 'No spaces allowed.',
      employeeNumberFormat : 'Employee number can only contain letters, digits, hyphens (-), or underscores (_).'
    }
  },
  team : {
    editTeam : 'Edit Team',
    newTeam : 'New Team',
    assignedLocation : 'Assigned Location',
    assignedEquipment : 'Assigned Equipment',
    team : 'Team',
    code : 'Code',
    name : 'Name',
    type : 'Type',
    leader : 'Leader',
    parentTeam : 'Parent Team',
    level : 'Level',
    members : 'Members',
    status : {
      active : 'Active',
      inactive : 'Inactive'
    },
    message : {
      teamAddedSuccess : 'Team created successfully',
      teamAddedFailed : 'Failed to create team',
      teamUpdatedSuccess : 'Team updated successfully',
      teamUpdatedFailed : 'Failed to update team',
      teamDeletedSuccess : 'Team deleted successfully',
      teamDeletedFailed : 'Failed to delete team',
      pleaseCorrectErrors : 'Please correct the errors in the form first',
      deletionTitle : 'Delete Team',
      deletionConfirmation : 'Are you sure you want to delete team {name}?',
      deletionCanceled : 'Deletion canceled'
    },
    validation : {
      nameRequired : 'Please enter team name',
      codeRequired : 'Please enter team code',
      typeRequired : 'Please select a team type',
      leaderRequired : 'Please select a leader',
      parentTeamRequired : 'Please select a parent team',
      descriptionRequired : 'Please enter a description'
    },
    placeholder : {
      teamName : 'Enter team name',
      description : 'Enter description',
      selectType : 'Select team type',
      selectStatus : 'Select status',
      selectLeader : 'Please select a leader',
      selectMembers : 'Please select members',
      selectParent : 'Please select a parent team',
      selectForms : 'Please select forms',
      selectLocation : 'Please select assigned location',
      selectEquipment : 'Please select assigned equipment'
    }
  },
  shift : {
    graceTimeMinute : 'Grace Period (Minute)',
    createShift : 'New Shift',
    editShift : 'Edit Shift',
    startTime : 'Start Time',
    startTimeRequired : 'Start time is required',
    endTimeRequired : 'End time is required',
    endTime : 'End Time',
    minute : 'Minute'
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
