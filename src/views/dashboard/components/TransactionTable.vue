<template>
  <el-table ref="multipleTable" :data="set.newList" tooltip-effect="dark" style="width: 100%">
    <el-table-column label="截止日期" width="150">
      <template #default="scope">{{ scope.row['截止日期'] }}</template>
    </el-table-column>

    <el-table-column label="工单号" min-width="200">
      <template #default="scope">
        {{ scope.row['工单号'] }}
      </template>
    </el-table-column>

    <el-table-column label="进度" width="100" align="center">
      <template #default="scope">
        <el-tag :type="scope.row.statusStr">{{ scope.row['进度'] }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column label="创建者" prop="创建者" min-width="150"></el-table-column>

    <el-table-column label="优先级" prop="优先级" min-width="100"></el-table-column>
  </el-table>
</template>

<script setup>
import { ref, reactive, computed, onBeforeMount } from 'vue'
import axios from 'axios'

// eslint-disable-next-line prefer-const
let list = ref( [] )

const set = reactive( {
  newList : computed( () => {
    const statusMap = {
      '准备就绪' : 'success',
      '进行中' : 'warning',
      '已完成' : 'info',
      '待审核' : 'danger'
    }
    if ( list.value && list.value.length > 0 ) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      list.value = list.value.map( item => {
        return {
          ...item,
          statusStr : statusMap[item.status] || 'info'
        }
      } )
    } else {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      list.value = []
    }
    return list.value
  } )
} )

onBeforeMount( () => {
  fetchData()
} )

const fetchData = async() => {
  try {
    const response = await axios.get( '/api/workorders' )
    list.value = response.data.data
  } catch ( error ) {
    console.error( 'Failed to fetch work orders:', error )
  }
}

defineOptions( {
  name : 'TransactionTable'
} )
</script>
