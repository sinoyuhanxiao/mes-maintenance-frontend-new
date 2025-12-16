/**
 * Transform equipment tree node to exclude parts layer (tier 5).
 * This ensures consistency across the application by showing only tiers 0-4.
 *
 * Tier levels:
 * - Tier 0: Site
 * - Tier 1: Production Line
 * - Tier 2: Equipment Group
 * - Tier 3: Equipment
 * - Tier 4: Sub-Equipment/Component
 * - Tier 5: Spare Parts (EXCLUDED)
 *
 * @param {Object} node - Equipment tree node from API
 * @param {number} level - Current tier level (0-based)
 * @returns {Object} Transformed node without tier 5 children
 */
export const transformEquipmentNode = ( node, level = 0 ) => {
  const base = {
    id : node.id,
    value : node.id,
    label : level === 0 ? node.name : `T${level}: ${node.name}`,
    level
  }

  // Stop including children at level 4 (tier 4) to exclude tier 5 (parts)
  if ( level >= 4 ) {
    return { ...base, children : undefined }
  }

  const kids = Array.isArray( node.children )
    ? node.children.map( c => transformEquipmentNode( c, level + 1 ) )
    : undefined

  return { ...base, children : kids && kids.length ? kids : undefined }
}

/**
 * Transform an array of equipment tree nodes to exclude parts layer.
 * @param {Array} nodes - Array of equipment tree nodes from API
 * @returns {Array} Transformed nodes without tier 5 children
 */
export const transformEquipmentTree = ( nodes = [] ) => {
  if ( !Array.isArray( nodes ) ) {
    return []
  }
  return nodes.map( node => transformEquipmentNode( node, 0 ) )
}
