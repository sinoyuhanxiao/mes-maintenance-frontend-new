<template>
  <el-tag :type="tagType" :title="recurrenceType?.description || $t('workOrder.recurrence.none')" effect="plain">
    {{ recurrenceName }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getRecurrenceTagType } from '@/utils/general'

// Props
const props = defineProps( {
  recurrenceType : {
    type : Object,
    default : () => ( {} )
  }
} )

const { t } = useI18n()

// Computed
const recurrenceName = computed( () => {
  if ( !props.recurrenceType?.name ) return '-'

  // Map English recurrence type names to translated names
  const recurrenceMap = {
    'Does not repeat' : t( 'workOrder.recurrence.none' ),
    Daily : t( 'workOrder.recurrence.daily' ),
    Weekly : t( 'workOrder.recurrence.weekly' ),
    Monthly : t( 'workOrder.recurrence.monthlyByDate' ),
    Yearly : t( 'workOrder.recurrence.yearly' )
  }

  return recurrenceMap[props.recurrenceType.name] || props.recurrenceType.name
} )

const tagType = computed( () => {
  return getRecurrenceTagType( props.recurrenceType?.id )
} )

defineOptions( {
  name : 'RecurrenceTag'
} )
</script>
