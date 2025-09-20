// shift.js (mocked backend)
let mockShiftIdCounter = 100
const mockShiftList = [
  {
    id : 2,
    name : 'Night Shift',
    description : '',
    start_time : '03:00:00Z',
    end_time : '15:00:00Z',
    grace_minute : 30,
    status : 1,
    created_at : '2025-04-16T22:11:29.11095Z',
    created_by : 12,
    updated_at : '2025-07-23T16:33:57.076142Z',
    updated_by : 19
  },
  {
    id : 1,
    name : 'Day Shift',
    description : '',
    start_time : '15:00:00Z',
    end_time : '03:00:00Z',
    grace_minute : 30,
    status : 1,
    created_at : '2025-04-16T22:11:29.11095Z',
    created_by : 12,
    updated_at : '2025-06-18T17:18:06.890345Z',
    updated_by : 19
  }
]

/**
 * GET all shifts (mocked)
 */
export const getAllShifts = () => {
  return new Promise( resolve => {
    setTimeout( () => {
      resolve( {
        data : {
          timestamp : Date.now(),
          status : '200',
          message : 'success',
          data : mockShiftList
        }
      } )
    }, 200 )
  } )
}

/**
 * POST create a new shift (mocked)
 * @param {Object} payload - New shift payload
 */
export const createShift = payload => {
  return new Promise( resolve => {
    setTimeout( () => {
      const now = new Date().toISOString()
      const newShift = {
        ...payload,
        id : ++mockShiftIdCounter,
        created_at : now,
        updated_at : now,
        created_by : payload.created_by ?? 0,
        updated_by : payload.updated_by ?? 0,
        status : payload.status ?? 1
      }
      mockShiftList.push( newShift )

      resolve( {
        data : {
          timestamp : Date.now(),
          status : '200',
          message : 'success',
          data : newShift
        }
      } )
    }, 300 )
  } )
}

/**
 * PUT update an existing shift by ID (mocked)
 * @param {number|string} id - Shift ID to update
 * @param {Object} payload - Updated shift payload
 */
export const updateShift = ( id, payload ) => {
  return new Promise( ( resolve, reject ) => {
    setTimeout( () => {
      const index = mockShiftList.findIndex( s => s.id === Number( id ) )
      if ( index === -1 ) {
        return reject( new Error( `Shift with ID ${id} not found` ) )
      }

      const now = new Date().toISOString()
      const updated = {
        ...mockShiftList[index],
        ...payload,
        id : Number( id ),
        updated_at : now,
        updated_by : payload.updated_by ?? 0
      }

      mockShiftList[index] = updated

      resolve( {
        data : {
          timestamp : Date.now(),
          status : '200',
          message : 'success',
          data : updated
        }
      } )
    }, 300 )
  } )
}

/**
 * DELETE a shift by ID (mocked)
 * @param {number|string} id - Shift ID to delete
 */
export const deleteShift = id => {
  return new Promise( ( resolve, reject ) => {
    setTimeout( () => {
      const index = mockShiftList.findIndex( s => s.id === Number( id ) )
      if ( index === -1 ) {
        return reject( new Error( `Shift with ID ${id} not found` ) )
      }

      const deleted = mockShiftList.splice( index, 1 )[0]

      resolve( {
        data : {
          timestamp : Date.now(),
          status : '200',
          message : 'Shift deleted successfully',
          data : deleted
        }
      } )
    }, 300 )
  } )
}
