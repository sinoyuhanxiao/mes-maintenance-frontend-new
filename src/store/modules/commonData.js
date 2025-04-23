// store/modules/commonData.js
import { defineStore } from 'pinia'
import {
  getAllPriorities,
  getAllWorkTypes,
  getAllCategories
} from '@/api/common'
import {
  getAllProductionLines
} from '@/api/equipment'

export const useCommonDataStore = defineStore( 'commonData', {
  state : () => ( {
    priorities : [],
    workTypes : [],
    categories : [],
    productionLines : [],
    equipmentGroups : [],
    equipments : [],
    components : []
  } ),
  actions : {
    async fetchPriorities() {
      const { data } = await getAllPriorities()
      this.priorities = data.data
    },
    async fetchWorkTypes() {
      const { data } = await getAllWorkTypes()
      this.workTypes = data.data
    },
    async fetchCategories() {
      const { data } = await getAllCategories()
      this.categories = data.data
    },
    async fetchProductionLines() {
      const { data } = await getAllProductionLines()
      this.productionLines = data.data
    }
  }
} )
