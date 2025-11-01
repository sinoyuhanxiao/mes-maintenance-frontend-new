/**
 * Equipment Hierarchy Management Composable
 * Handles the cascading selection of production lines, equipment groups, equipment, and components
 */
import { ref, reactive, computed } from 'vue'
import { getEquipmentGroups, getEquipments, getEquipmentComponents } from '@/api/equipment'
import { useErrorHandler } from './useErrorHandler'

export function useEquipment() {
  const { handleAsync } = useErrorHandler()

  // State
  const equipmentGroups = ref([])
  const equipments = ref([])
  const components = ref([])
  const loading = reactive({
    equipmentGroups: false,
    equipments: false,
    components: false,
  })

  // Selected values
  const selectedValues = reactive({
    productionLineId: null,
    equipmentGroupId: null,
    equipmentId: null,
    componentId: null,
  })

  // Computed properties
  const hasEquipmentGroups = computed(() => equipmentGroups.value.length > 0)
  const hasEquipments = computed(() => equipments.value.length > 0)
  const hasComponents = computed(() => components.value.length > 0)

  /**
   * Fetch equipment groups for a production line
   * @param {number} productionLineId - Production line ID
   */
  const fetchEquipmentGroups = async productionLineId => {
    if (!productionLineId) {
      equipmentGroups.value = []
      return
    }

    await handleAsync(
      async () => {
        const { data } = await getEquipmentGroups(productionLineId)
        equipmentGroups.value = data.data || []
      },
      {
        loadingRef: loading.equipmentGroups,
        context: 'fetchEquipmentGroups',
        customMessage: 'Failed to load equipment groups',
      }
    )
  }

  /**
   * Fetch equipments for an equipment group
   * @param {number} equipmentGroupId - Equipment group ID
   */
  const fetchEquipments = async equipmentGroupId => {
    if (!equipmentGroupId) {
      equipments.value = []
      return
    }

    await handleAsync(
      async () => {
        const { data } = await getEquipments(equipmentGroupId)
        equipments.value = data.data || []
      },
      {
        loadingRef: loading.equipments,
        context: 'fetchEquipments',
        customMessage: 'Failed to load equipments',
      }
    )
  }

  /**
   * Fetch components for an equipment
   * @param {number} equipmentId - Equipment ID
   */
  const fetchComponents = async equipmentId => {
    if (!equipmentId) {
      components.value = []
      return
    }

    await handleAsync(
      async () => {
        const { data } = await getEquipmentComponents(equipmentId)
        components.value = data.data || []
      },
      {
        loadingRef: loading.components,
        context: 'fetchComponents',
        customMessage: 'Failed to load components',
      }
    )
  }

  /**
   * Clear downstream selections when parent changes
   * @param {string} level - The level that changed
   */
  const clearDownstreamSelections = level => {
    switch (level) {
      case 'productionLine':
        selectedValues.equipmentGroupId = null
        selectedValues.equipmentId = null
        selectedValues.componentId = null
        equipmentGroups.value = []
        equipments.value = []
        components.value = []
        break
      case 'equipmentGroup':
        selectedValues.equipmentId = null
        selectedValues.componentId = null
        equipments.value = []
        components.value = []
        break
      case 'equipment':
        selectedValues.componentId = null
        components.value = []
        break
      default:
        console.warn(`Invalid level provided to clearDownstreamSelections: ${level}`)
        break
    }
  }

  /**
   * Handle production line selection change
   * @param {number} productionLineId - Selected production line ID
   */
  const handleProductionLineChange = async productionLineId => {
    selectedValues.productionLineId = productionLineId
    clearDownstreamSelections('productionLine')

    if (productionLineId) {
      await fetchEquipmentGroups(productionLineId)
    }
  }

  /**
   * Handle equipment group selection change
   * @param {number} equipmentGroupId - Selected equipment group ID
   */
  const handleEquipmentGroupChange = async equipmentGroupId => {
    selectedValues.equipmentGroupId = equipmentGroupId
    clearDownstreamSelections('equipmentGroup')

    if (equipmentGroupId) {
      await fetchEquipments(equipmentGroupId)
    }
  }

  /**
   * Handle equipment selection change
   * @param {number} equipmentId - Selected equipment ID
   */
  const handleEquipmentChange = async equipmentId => {
    selectedValues.equipmentId = equipmentId
    clearDownstreamSelections('equipment')

    if (equipmentId) {
      await fetchComponents(equipmentId)
    }
  }

  /**
   * Handle component selection change
   * @param {number} componentId - Selected component ID
   */
  const handleComponentChange = componentId => {
    selectedValues.componentId = componentId
  }

  /**
   * Reset all selections and data
   */
  const resetAll = () => {
    selectedValues.productionLineId = null
    selectedValues.equipmentGroupId = null
    selectedValues.equipmentId = null
    selectedValues.componentId = null

    equipmentGroups.value = []
    equipments.value = []
    components.value = []
  }

  /**
   * Set initial values (useful for editing existing work orders)
   * @param {Object} values - Initial values
   */
  const setInitialValues = async values => {
    const { productionLineId, equipmentGroupId, equipmentId, componentId } = values

    // Set production line and fetch equipment groups
    if (productionLineId) {
      selectedValues.productionLineId = productionLineId
      await fetchEquipmentGroups(productionLineId)

      // Set equipment group and fetch equipments
      if (equipmentGroupId) {
        selectedValues.equipmentGroupId = equipmentGroupId
        await fetchEquipments(equipmentGroupId)

        // Set equipment and fetch components
        if (equipmentId) {
          selectedValues.equipmentId = equipmentId
          await fetchComponents(equipmentId)

          // Set component
          if (componentId) {
            selectedValues.componentId = componentId
          }
        }
      }
    }
  }

  /**
   * Get current selection path as a readable string
   */
  const getSelectionPath = commonDataStore => {
    const parts = []

    if (selectedValues.productionLineId) {
      const productionLine = commonDataStore.productionLines.find(pl => pl.id === selectedValues.productionLineId)
      if (productionLine) parts.push(productionLine.name)
    }

    if (selectedValues.equipmentGroupId) {
      const equipmentGroup = equipmentGroups.value.find(eg => eg.id === selectedValues.equipmentGroupId)
      if (equipmentGroup) parts.push(equipmentGroup.name)
    }

    if (selectedValues.equipmentId) {
      const equipment = equipments.value.find(e => e.id === selectedValues.equipmentId)
      if (equipment) parts.push(equipment.name)
    }

    if (selectedValues.componentId) {
      const component = components.value.find(c => c.id === selectedValues.componentId)
      if (component) parts.push(component.name)
    }

    return parts.join(' > ')
  }

  return {
    // State
    equipmentGroups,
    equipments,
    components,
    loading,
    selectedValues,

    // Computed
    hasEquipmentGroups,
    hasEquipments,
    hasComponents,

    // Methods
    fetchEquipmentGroups,
    fetchEquipments,
    fetchComponents,
    handleProductionLineChange,
    handleEquipmentGroupChange,
    handleEquipmentChange,
    handleComponentChange,
    resetAll,
    setInitialValues,
    getSelectionPath,
  }
}
