export default {
  title : 'FPS设备管理系统',
  header : {
    home : '首页'
  },
  workOrder : {
    // Page titles
    title : '维护工单管理',
    subtitle : '维护你的工单，如同一日三餐。',
    newWorkOrder : '新建工单',
    viewWorkOrder : '查看工单',
    editWorkOrder : '编辑工单',

    // Table headers
    table : {
      name : '工单名称',
      id : 'ID',
      code : '工单号',
      dueDate : '截止日期',
      preview : '工单预览图',
      priority : '优先级',
      workType : '维护类型',
      category : '工单类别',
      recurrenceType : '重复类型',
      estimatedTime : '预估时间 (分钟)',
      startDate : '开始日期',
      finishedDate : '完成日期',
      approvedDate : '审批时间',
      state : '状态',
      createdBy : '创建者',
      approvedBy : '审批人',
      description : '工单描述',
      actions : '操作',
      assignedTo : '分配给'
    },

    // Calendar
    calendar : {
      endDate : '结束日期',
      recurrenceId : '重复工单ID',
      assignedUser : '维护人员',
      equipment : '设备',
      taskProgress : '任务进度'
    },

    // Form fields
    form : {
      name : '工单名称',
      description : '描述',
      haltType : '是否停机',
      assets : '涉及资产',
      productionLine : '生产线 (层级 1)',
      equipmentGroup : '设备组 (层级 2)',
      equipment : '设备 (层级 3)',
      component : '组件 (层级 4)',
      classification : '具体分类',
      priority : '优先级',
      category : '工单类别',
      workType : '工作类型',
      recurrence : '重复设置',
      estimatedMinutes : '预估时间',
      createdBy : '创建者',
      createdOn : '创建于'
    },

    // Placeholders
    placeholder : {
      workOrderName : '请输入工单名称',
      description : '请输入描述',
      selectPriority : '请选择优先级',
      selectCategory : '请选择工单类别',
      selectWorkType : '请选择工作类型',
      selectRecurrence : '请选择重复设置',
      search : '搜索',
      maintenanceType : '维护类型'
    },

    // Actions
    actions : {
      search : '搜索',
      create : '新增',
      export : '导出',
      view : '查看',
      edit : '修改',
      delete : '删除',
      save : '保存',
      cancel : '取消',
      confirm : '确认',
      submit : '创建工单',
      uploadToServer : '上传到服务器',
      share : '分享',
      refresh : '刷新',
      backToDetail : '返回详情',
      reset : '重置',
      update : '更新'
    },

    // Status values
    status : {
      failed : '失败',
      completed : '已完成',
      inProgress : '进行中',
      pending : '待处理',
      overdue : '已逾期',
      cancelled : '已取消'
    },

    // Priority values
    priority : {
      urgent : '紧急',
      high : '高',
      medium : '中',
      low : '低',
      none : '无'
    },

    // Work types
    workType : {
      reactive : '反应性',
      preventative : '预防性',
      other : '其他',
      followUp : '跟进'
    },

    // Recurrence types
    recurrence : {
      none : '不重复',
      daily : '每日',
      weekly : '每周',
      monthlyByDate : '每月 (按日期)',
      yearly : '每年',
      doesNotRepeat : '不重复',
      every : '每',
      weeksRepeat : '周重复',
      monthsOn : '个月的第',
      yearsOn : '年的',
      repeat : '重复',
      selectDate : '选择日期',
      selectMonth : '选择月份',
      dayOfMonth : '日',
      month : '月',
      startDateTime : '开始时间',
      endDateTime : '结束时间',
      selectStartTime : '选择开始时间',
      selectEndTime : '选择结束时间'
    },

    // Days of week
    days : {
      monday : '周一',
      tuesday : '周二',
      wednesday : '周三',
      thursday : '周四',
      friday : '周五',
      saturday : '周六',
      sunday : '周日'
    },

    // Messages
    messages : {
      createSuccess : '工单创建成功！',
      createFailed : '工单创建失败',
      updateSuccess : '工单更新成功！',
      updateFailed : '工单更新失败',
      deleteSuccess : '删除成功',
      deleteFailed : '删除失败',
      uploadSuccess : '文件上传成功！',
      uploadFailed : '文件上传失败',
      shareSuccess : '分享成功！',
      exportSuccess : '导出成功！',
      noImagePlaceholder : '无图无真相',
      loadingData : '加载数据中...',
      noData : '暂无数据',
      formReset : '表单已重置',
      validationFailed : '请修正验证错误',
      statusChanged : '状态已更改'
    },

    // Create form specific
    create : {
      taskTitlePlaceholder : '需要做什么？',
      addPictures : '添加或拖拽图片',
      descriptionPlaceholder : '添加描述',
      location : '位置',
      locationPlaceholder : '开始输入…',
      asset : '资产',
      assetPlaceholder : '开始输入…',
      procedure : '程序',
      procedurePlaceholder : '创建或附加新表单、程序或检查清单',
      addProcedure : '添加程序',
      assignTo : '分配给',
      assigneePlaceholder : '输入姓名、邮箱或电话号码',
      estimatedTime : '预估时间',
      hours : '小时',
      minutes : '分钟',
      dueDate : '截止日期',
      dueDatePlaceholder : 'mm/dd/yyyy',
      startDate : '开始日期',
      startDatePlaceholder : 'mm/dd/yyyy',
      recurrence : '重复',
      recurrencePlaceholder : '不重复',
      recurrenceSettings : '重复设置',
      workType : '工作类型',
      workTypePlaceholder : '选择工作类型',
      priority : '优先级',
      priorityPlaceholder : '请选择优先级',
      imageUpload : '图片上传',
      fileUpload : '文件上传',
      clickToUpload : '点击上传',
      filesAndFolders : '文件和文件夹',
      dragFilesHere : '拖拽文件到此处或点击上传',
      uploadHint : '支持多文件上传',
      categories : '类别',
      categoriesPlaceholder : '开始输入…',
      vendors : '供应商',
      vendorsPlaceholder : '开始输入…'
    },

    // Validation messages
    validation : {
      nameRequired : '请输入工单名称',
      taskTitleRequired : '请输入任务标题',
      locationRequired : '请选择位置',
      assetRequired : '请选择资产',
      haltTypeRequired : '请选择是否停机',
      productionLineRequired : '请选择生产线',
      priorityRequired : '请选择优先级',
      categoryRequired : '请选择工单类别',
      workTypeRequired : '请选择工作类型',
      recurrenceRequired : '请选择重复设置',
      startDateRequired : '请选择开始时间',
      endDateRequired : '请选择结束时间'
    },

    // View modes
    viewModes : {
      table : '表格视图',
      todo : '待办视图',
      calendar : '计划视图'
    },

    // Filters
    filters : {
      assignedToMe : '分配给我',
      assignedTo : '分配给',
      overdue : '已逾期',
      today : '今天',
      thisWeek : '本周',
      thisMonth : '本月',
      custom : '自定义',
      highPriority : '高优先级',
      addFilter : '添加筛选',
      dueDate : '截止日期',
      location : '位置',
      priority : '优先级',
      maintenanceType : '维护类型',
      myFilters : '我的筛选',
      clearAll : '清除全部',
      activeFilters : '当前筛选',
      toggleVisibility : '切换显示',
      savePreset : '保存预设',
      managePresets : '管理预设',
      // Filter drawer
      filterDrawerTitle : '筛选器设置',
      filterDrawerSubtitle : '选择要显示的筛选器',
      showFilter : '显示筛选器',
      hideFilter : '隐藏筛选器',
      filterCategories : '筛选器类别',
      basicFilters : '基础筛选',
      advancedFilters : '高级筛选',
      workOrderFilters : '工单筛选',
      state : '工单状态',
      status : '状态',
      category : '类别',
      equipment : '设备',
      recurrence : '重复',
      search : '搜索',
      searchFiltersPlaceholder : '搜索筛选项'
    },

    // Tabs
    tabs : {
      todo : '待办',
      done : '已完成'
    },

    // Sort options
    sort : {
      sortBy : '排序方式',
      priorityHighest : '优先级：最高优先',
      priorityLowest : '优先级：最低优先',
      dueDateNearest : '截止日期：最近',
      dueDateFarthest : '截止日期：最远',
      createdNewest : '创建时间：最新',
      createdOldest : '创建时间：最旧'
    },

    // Details
    details : {
      title : '工单详情'
    },

    // Attachments
    attachments : {
      title : '附件'
    },

    // Tracking
    tracking : {
      title : '跟踪记录',
      addParts : '添加零件使用',
      addTime : '添加时间记录',
      addCosts : '添加其他费用',
      viewProcedure : '查看程序',
      viewstandards : '查看安全措施',
      viewTimeLogs : '查看时间记录',
      viewPartsUsage : '查看零件使用记录'
    },

    // Comments
    comments : {
      title : '评论',
      placeholder : '添加评论...',
      add : '添加评论'
    },

    // Schedule Conditions
    schedule : {
      title : '计划条件',
      subtitle : '自动化循环维护计划',
      repeatType : '重复类型',
      frequency : '频率',
      continuedFrom : '延续自',
      repeatTypeLabel : '重复类型',
      frequencyLabel : '频率',
      continuedFromLabel : '延续自',
      weeklyPatternLabel : '每周模式',
      timeBased : '基于时间的循环',
      weeklyPattern : '每周：周二、周五、周六',
      nextOccurrence : '下次发生',
      viewTimeline : '查看工单时间线'
    },

    // Timeline Modal
    timeline : {
      title : '工单时间线',
      description : '此工单生命周期的完整时间历史记录',
      totalEvents : '总事件数',
      activeDays : '活跃天数',
      export : '导出时间线',
      timeRange : '时间范围',
      to : '至',
      startDate : '开始日期',
      endDate : '结束日期',
      apply : '应用',
      avgTimeConsumed : '平均耗时',
      duration : '持续时间',
      assignees : '分配人员',
      overdue : '逾期'
    },

    // Activity Panel
    activity : {
      title : '活动',
      tabs : {
        all : '全部',
        comments : '评论',
        history : '历史记录',
        workLog : '工作日志'
      },
      composer : {
        placeholder : '添加评论…',
        proTip : '小贴士：按 M 键快速评论',
        quickReplies : {
          looksGood : '看起来不错！',
          needHelp : '需要帮助？',
          blocked : '这被阻塞了…',
          clarify : '能澄清一下吗…？',
          onTrack : '进展顺利'
        }
      },
      actions : {
        reply : '回复',
        like : '点赞',
        copyLink : '复制链接',
        more : '更多'
      },
      history : {
        statusChanged : '更改了 **状态**',
        pmDateUpdated : '更新了 **下次预防性维护日期**',
        systemScheduler : '系统（调度器）',
        reason : '油品分析发现异常粘度 – 提前安排维护。'
      },
      workLog : {
        tasksPerformed : '执行的任务',
        partsUsed : '使用的零件',
        duration : '持续时间',
        startTime : '开始时间',
        endTime : '结束时间'
      }
    },

    // Location
    location : {
      title : '位置',
      viewLocationTree : '查看位置树',
      currentLocation : '当前位置',
      building : '建筑',
      floor : '楼层',
      room : '房间',
      area : '区域',
      zone : '区域',
      selectLocation : '选择位置',
      locationDetails : '位置详情',
      navigateToLocation : '导航到位置',
      locationTreeTitle : '位置树 - {location}',
      close : '关闭',
      viewFullTree : '查看完整树'
    },

    // Vendors
    vendors : {
      title : '供应商',
      vendorName : '供应商名称',
      email : '邮箱',
      address : '地址',
      contactVendor : '联系供应商',
      viewVendorDetails : '查看供应商详情',
      noVendors : '未分配供应商',
      vendorCount : '已分配 {count} 个供应商'
    },

    // Additional messages
    selectWorkOrder : '请选择一个工单查看详情',
    statusChanged : '状态已更新',
    shareSuccess : '分享成功',
    refreshSuccess : '刷新成功',

    // Pagination
    pagination : {
      showing : '显示第 {start} 到 {end} 项，共 {total} 项',
      pageSize : '每页显示',
      items : '项'
    }
  },
  common : {
    success : '成功',
    error : '错误',
    warning : '警告',
    confirm : '确认',
    cancel : '取消',
    delete : '删除',
    edit : '编辑',
    view : '查看',
    save : '保存',
    loading : '加载中...',
    noData : '暂无数据',
    confirmMessage : '确定要执行此操作吗？',
    deleteConfirmMessage : '确定要删除 "{name}" 吗？',
    sortIdAsc : 'ID 升序',
    sortIdDesc : 'ID 降序',
    yes : '是',
    no : '否',
    to : '至',
    startDate : '开始日期',
    endDate : '结束日期',
    searchByKeyword : '关键字搜索',
    paginationTotal : '总数',
    imageUpload : '图片上传',
    id : 'ID',
    name : '名称',
    namePlaceholder : '请输入名称',
    nameRequired : '名称为必填项',
    description : '描述',
    descriptionPlaceholder : '请输入描述',
    createdAt : '创建时间',
    createdBy : '创建人',
    updatedAt : '更新时间',
    updatedBy : '更新人',
    actions : '操作',
    code : '编号',
    type : '类型'
  },
  errors : {
    badRequest : '请求参数错误',
    unauthorized : '未授权访问',
    forbidden : '禁止访问',
    notFound : '资源未找到',
    validationError : '数据验证失败',
    serverError : '服务器内部错误',
    networkError : '网络连接错误',
    unknownError : '未知错误'
  },
  router : {
    dashboard : '主页',
    login : '登录',
    error404 : '404',
    error401 : '401',
    error500 : '500',
    icons : '图标',
    directive : '指令',
    workOrderCenter : '工单中心',
    workOrderManagement : '工单管理',
    maintenanceType : '维护设备',
    maintenanceEquipment : '维护设备',
    newWorkOrder : '新增工单',
    viewWorkOrder : '查看工单',
    locations : '地址',
    vendors : '供应商',
    vendorsAndLocations : '供应商和地址',
    userCenter : '个人中心',
    userDetail : '用户信息',
    userManagement : '用户管理',
    teamManagement : '班组管理',
    shiftManagement : '班次管理',
    systemManagement : '系统管理',
    myAccount : '我的账号',
    nested : '嵌套路由',
    menu1 : '菜单1',
    menu11 : '菜单1-1',
    menu12 : '菜单1-2',
    menu121 : '菜单1-2-1',
    menu122 : '菜单1-2-2',
    menu13 : '菜单1-3',
    menu2 : '菜单2'
  },
  user : {
    firstName : '名',
    lastName : '姓',
    unknownUser : '未知用户',
    department : '部门',
    assignedTeam : '所属班组',
    lastVisited : '最近登陆时间',
    loginCredential : '登陆信息',
    userInformation : '用户信息',
    employeeNumber : '员工编号',
    searchByName : '搜索用户姓名',
    managerAssignTeamMembershipHint : '经理不能被分配为班组成员',
    managerAssignTeamLeadershipHint : '经理不能被分配为班组组长',
    supervisorAssignTeamMembershipHint : '主管不能被分配为班组成员',
    supervisorAssignTeamLeadershipHint : '仅允许主管被分配为最上级班组组长',
    teamLeadAssignTeamMembershipHint : '仅允许班长被分配为最上级班组成员',
    teamLeadAssignTeamLeadershipHint : '班长不能被分配为最上级班组组长',
    workerAssignTeamMembershipHint : '',
    workerAssignTeamLeadershipHint : '質檢員不能被分配为班组组长',
    leadershipTeams : '所属班组(组长关联)',
    leadershipTeamsPlaceholder : '选择班组, 用户将设为已选班组组长',
    membershipTeams : '所属班组(成员关联)',
    membershipTeamsPlaceholder : '选择班组, 用户将设为已选班组成员',
    certificate : '证书',
    noCertificates : '暂无证书',
    addCertificate : '添加证书',
    editCertificate : '编辑证书',
    certificateName : '证书名称',
    certificateNumber : '证书编号',
    reviewer : '审核人',
    issueDate : '签发日期',
    expiryDate : '到期日期',
    table : {
      id : 'ID',
      name : '姓名',
      username : '用户名',
      teams : '所属班组',
      role : '角色',
      status : '激活状态',
      email : '邮箱',
      phoneNumber : '电话号码',
      actions : '操作',
      statusTooltip : '如果未激活，用户将无法使用此账号',
      editButton : '编辑',
      deleteButton : '删除',
      leader : '组长',
      certificate : '证书',
      profileImage : '用户头像'
    },
    form : {
      newUser : '创建用户',
      editUser : '编辑用户',
      name : '姓名',
      role : '角色',
      email : '邮箱',
      phoneNumber : '电话号码',
      assignedTeams : '所属班组',
      status : '激活状态',
      username : '用户名',
      password : '密码',
      cancelButton : '取消',
      confirmButton : '确认',
      selectTeamPlaceHolder : '选择班组',
      selectRolePlaceHolder : '选择角色',
      selectStatusPlaceHolder : '选择激活状态',
      selectDepartmentPlaceHolder : '选择部门',
      changePassword : '修改密码',
      newPassword : '新密码',
      confirmPassword : '确认密码'
    },
    status : {
      active : '已激活',
      inactive : '未激活'
    },
    message : {
      userCreatedSuccess : '用户添加成功',
      userCreatedFailed : '用户添加失败',
      userUpdatedSuccess : '用户更新成功',
      userUpdatedFailed : '用户更新失败',
      userDeletedSuccess : '用户删除成功',
      teamsUpdatedSuccess : '班组更新成功',
      teamsUpdateFailed : '班组更新失败',
      selfDeactivationSuccess : '你的账号已经成功注销，登出后将无法登入.',
      selfDeactivationWarning : '您正在停用自己的账号。确定要继续吗?',
      selfDeletionWarning : '您正在删除自己的账号及其关联的班组。确定要继续吗?',
      deletionConfirmation : '确定要删除用户“{name}”及其班组关联吗?',
      deletionCanceled : '删除已取消',
      selfDeletionCanceled : '自我删除已取消',
      statusUpdatedSuccess : '状态更新成功',
      statusUpdatedFailed : '状态更新失败',
      validationErrors : '请在继续之前修复验证错误',
      selfDeactivationTitle : '注销自己账号',
      deletionTitle : '删除',
      deactivationFailed : '注销账号失败',
      pleaseCorrectErrors : '请修正错误！',
      passwordNotMatchOrFewerCharacters : '密码不匹配或少于4个字符!',
      yourAccountIsDeletedAndUnableToLogin : '你的账户已被删除，登出后将无法登入',
      deletionFailed : '删除失败',
      errorLoadingUsersData : '加载用户数据出错'
    },
    validation : {
      nameRequired : '姓名是必填项',
      roleRequired : '角色是必填项',
      passwordRequired : '请输入密码',
      passwordsNotMatch : '密码不匹配',
      statusRequired : '激活状态是必填项',
      usernameExists : '该用户名已存在',
      emailRequired : '邮箱是必填项',
      emailInvalid : '邮箱格式不正确',
      phoneNumberRequired : '电话号码是必填项',
      phoneNumberFormat : '电话号码必须为国际格式（例如：+1234567890），后跟10到15位数字',
      departmentRequired : '部门为必选项',
      passwordMinLength : '密码至少需要8个字符.',
      passwordUppercase : '必须包含至少一个大写字母.',
      passwordLowercase : '必须包含至少一个小写字母.',
      passwordNumber : '必须包含至少一个数字.',
      passwordSpecialChar : '必须包含至少一个特殊字符.',
      confirmPasswordRequired : '请确认您的密码',
      passwordMismatch : '两次输入的密码不一致',
      employeeNumberRequired : '请输入员工编号',
      nameNoNumbers : '不能包含数字.',
      nameNoSpecialChars : '不能有符号.',
      nameNoSpaces : '不能有空格.',
      employeeNumberFormat : '员工编号只能包含字母, 数字, 连字符(-) 或下划线(_)'
    }
  },
  team : {
    editTeam : '编辑班组',
    newTeam : '新增班组',
    assignedLocation : '负责设备',
    assignedEquipment : '负责区域',
    team : '班组',
    code : '编号',
    name : '名称',
    type : '类型',
    leader : '组长',
    parentTeam : '上级班组',
    level : '层级',
    members : '成员',
    status : {
      active : '启用',
      inactive : '停用'
    },
    message : {
      teamAddedSuccess : '班组创建成功',
      teamAddedFailed : '班组创建失败',
      teamUpdatedSuccess : '班组更新成功',
      teamUpdatedFailed : '班组更新失败',
      teamDeletedSuccess : '班组删除成功',
      teamDeletedFailed : '班组删除失败',
      pleaseCorrectErrors : '请先修正表单中的错误',
      deletionTitle : '删除班组',
      deletionConfirmation : '确定要删除班组{name}吗？',
      deletionCanceled : '已取消删除'
    },
    validation : {
      nameRequired : '请输入班组名称',
      codeRequired : '请输入班组编号',
      typeRequired : '请选择班组类型',
      leaderRequired : '请选择负责人',
      parentTeamRequired : '请选择上级班组',
      descriptionRequired : '请输入描述'
    },
    placeholder : {
      teamName : '请输入班组名称',
      description : '请输入描述',
      selectType : '请选择班组类型',
      selectStatus : '请选择状态',
      selectLeader : '请选择负责人',
      selectMembers : '请选择成员',
      selectParent : '请选择上级班组',
      selectForms : '请选择表单',
      selectLocation : '请选择负责区域',
      selectEquipment : '请选择负责设备'
    }
  },
  shift : {
    graceTimeMinute : '缓冲时间(分鐘)',
    createShift : '新增班次',
    editShift : '编辑班次',
    startTime : '开始时间',
    startTimeRequired : '开始时间为必填项',
    endTimeRequired : '结束时间为必填项',
    endTime : '结束时间',
    minute : '分鐘'
  },
  userCenter : {
    myAccount : '我的账号',
    logout : '登出',
    home : '首页'
  },
  settings : {
    title : '维护系统配置',
    systemConfig : '系统配置',
    layoutMode : '布局模式',
    enableTagsView : '开启 TagsView',
    fixedHeader : '固定 Header',
    sidebarLogo : '侧边栏 Logo',
    switchOn : '开',
    switchOff : '关',
    layoutModes : {
      leftSidebar : '左侧模式',
      topMode : '顶部模式( todo : coming soon )'
    }
  }
}
