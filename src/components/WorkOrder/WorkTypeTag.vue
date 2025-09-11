<template>
  <el-tag :type="tagType" :title="workType?.description" effect="light">
    {{ workTypeName }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getWorkTypeTagType } from '@/utils/general'

// Props
const props = defineProps( {
  workType : {
    type : Object,
    default : () => ( {} )
  }
} )

const { t } = useI18n()

// Computed
const workTypeName = computed( () => {
  if ( !props.workType?.name ) return '-'

  // Map English work type names to translated names
  const workTypeMap = {
    Reactive : t( 'workOrder.workType.reactive' ),
    Preventative : t( 'workOrder.workType.preventative' ),
    Other : t( 'workOrder.workType.other' ),
    'Follow up' : t( 'workOrder.workType.followUp' )
  }

  return workTypeMap[props.workType.name] || props.workType.name
} )

const tagType = computed( () => {
  return getWorkTypeTagType( props.workType?.name )
} )

defineOptions( {
  name : 'WorkTypeTag'
} )
</script>
