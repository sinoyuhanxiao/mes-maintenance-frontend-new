import Mock from 'mockjs'

const list = () => {
  const result = []
  const total = 50 // 控制生成的工单数量

  for ( let i = 1; i <= total; i++ ) {
    const item = {
      ID : i,
      截止日期 : '@date("2025-03-dd")', // 随机生成的截止日期
      工单号 : '@date("yyyyMMdd")-WO-1-2-@string("number", 6)', // 工单编码格式
      工单预览图 : 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3',
      进度 : '@integer(0, 100) %', // 随机生成 0% - 100%
      优先级 : '@pick(["低", "中", "高"])', // 随机生成优先级
      维护类型 : '@pick(["预防性维护", "纠正性维护", "紧急维护"])', // 随机生成维护类型
      类别 : '@pick(["电气", "机械", "仪表"])', // 随机生成类别
      派发人 : '@cname', // 派发人随机生成名字
      创建者 : '@cname', // 创建者随机生成名字
      预估时间 : '@integer(1, 8) 小时' // 随机生成 1 - 8 小时
    }
    result.push( Mock.mock( item ) )
  }
  return result
}

export default [
  {
    url : '/api/workorders',
    type : 'get',
    response : config => {
      return {
        code : 200,
        message : 'success',
        data : list()
      }
    }
  }
]
