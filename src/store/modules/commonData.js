// store/modules/commonData.js
import { defineStore } from 'pinia'
import { getAllPriorities, getAllWorkTypes, getAllCategories, getAllStates } from '@/api/common'
// import { getAllProductionLines } from '@/api/equipment'

export const useCommonDataStore = defineStore('commonData', {
  state: () => ({
    priorities: [],
    workTypes: [],
    categories: [],
    states: [],
    productionLines: [],
    equipmentGroups: [],
    equipments: [],
    components: [],
  }),
  actions: {
    async fetchPriorities() {
      const { data } = await getAllPriorities()
      this.priorities = data
    },
    async fetchWorkTypes() {
      const { data } = await getAllWorkTypes()
      this.workTypes = data
    },
    async fetchCategories() {
      const { data } = await getAllCategories()
      this.categories = data
    },
    async fetchStates() {
      const { data } = await getAllStates()
      this.states = data
    },
    // TODO: CHANGE THIS TO NEW EQUIPMENT NODE API
    // async fetchProductionLines() {
    //   const { data } = await getAllProductionLines()
    //   this.productionLines = data.data
    // },
  },
})
