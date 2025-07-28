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
      refresh : '刷新'
    },

    // Status values
    status : {
      failed : '失败',
      completed : '已完成',
      inProgress : '进行中',
      pending : '待处理',
      overdue : '已逾期'
    },

    // Priority values
    priority : {
      urgent : '紧急',
      high : '高',
      medium : '中',
      low : '低'
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
      yearly : '每年'
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
      noImagePlaceholder : '无图无真相',
      loadingData : '加载数据中...',
      noData : '暂无数据'
    },

    // Validation messages
    validation : {
      nameRequired : '请输入工单名称',
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
      todo : '待办视图'
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
      managePresets : '管理预设'
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
      viewSafetyMeasures : '查看安全措施',
      viewTimeLogs : '查看时间记录',
      viewPartsUsage : '查看零件使用记录'
    },

    // Comments
    comments : {
      title : '评论',
      placeholder : '添加评论...',
      add : '添加评论'
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
    confirm : '确认',
    cancel : '取消',
    delete : '删除',
    edit : '编辑',
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
    endDate : '结束日期'
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
    newWorkOrder : '新增工单',
    viewWorkOrder : '查看工单',
    userCenter : '个人中心',
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
  userCenter : {
    myAccount : '我的账号',
    logout : '登 出',
    home : '首 页'
  }
}
