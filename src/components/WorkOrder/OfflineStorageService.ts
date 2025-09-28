const DB_NAME = 'StartWorkOrderDB'
const STORE_NAME = 'drafts'
const DB_VERSION = 1

interface TaskDraftRecord {
  workOrderId : string | number
  taskId : string | number
  status : 'draft' | 'completed'
  time_spent : {
    value : number
    unit : string
  }
  step_progress : Record<string, string>
  updated_at : string
}

let dbPromise: Promise<IDBDatabase> | null = null

const openIndexedDB = (): Promise<IDBDatabase> => {
  if ( dbPromise ) return dbPromise
  dbPromise = new Promise( ( resolve, reject ) => {
    const request = indexedDB.open( DB_NAME, DB_VERSION )

    request.onupgradeneeded = () => {
      const db = request.result
      if ( !db.objectStoreNames.contains( STORE_NAME ) ) {
        db.createObjectStore( STORE_NAME, { keyPath : 'key' } )
      }
    }

    request.onsuccess = () => {
      resolve( request.result )
    }

    request.onerror = () => {
      reject( request.error )
    }
  } )
  return dbPromise
}

const getKey = ( workOrderId : string | number, taskId : string | number ) => `${workOrderId}::${taskId}`

const supportsIndexedDB = () => typeof indexedDB !== 'undefined'

const localStorageKey = ( workOrderId : string | number ) => `start-work-order-${workOrderId}`

const saveLocalStorage = async( draft : TaskDraftRecord ) => {
  const key = localStorageKey( draft.workOrderId )
  const existing = JSON.parse( localStorage.getItem( key ) || '[]' ) as TaskDraftRecord[]
  const filtered = existing.filter( item => item.taskId !== draft.taskId )
  localStorage.setItem( key, JSON.stringify( [...filtered, draft] ) )
}

const loadLocalStorage = async( workOrderId : string | number ) => {
  const key = localStorageKey( workOrderId )
  return JSON.parse( localStorage.getItem( key ) || '[]' ) as TaskDraftRecord[]
}

const removeLocalStorage = async( workOrderId : string | number, taskId : string | number ) => {
  const key = localStorageKey( workOrderId )
  const existing = JSON.parse( localStorage.getItem( key ) || '[]' ) as TaskDraftRecord[]
  const filtered = existing.filter( item => item.taskId !== taskId )
  localStorage.setItem( key, JSON.stringify( filtered ) )
}

const clearLocalStorage = async( workOrderId : string | number ) => {
  const key = localStorageKey( workOrderId )
  localStorage.removeItem( key )
}

export const OfflineStorageService = {
  async saveDraft( draft : TaskDraftRecord ) {
    if ( supportsIndexedDB() ) {
      try {
        const db = await openIndexedDB()
        const tx = db.transaction( STORE_NAME, 'readwrite' )
        const store = tx.objectStore( STORE_NAME )
        store.put( { ...draft, key : getKey( draft.workOrderId, draft.taskId ) } )
        await new Promise<void>( ( resolve, reject ) => {
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject( tx.error )
          tx.onabort = () => reject( tx.error )
        } )
        return
      } catch ( error ) {
        console.warn( '[StartWorkOrder][IndexedDB] Falling back to localStorage', error )
      }
    }
    await saveLocalStorage( draft )
  },

  async getDrafts( workOrderId : string | number ) : Promise<TaskDraftRecord[]> {
    if ( supportsIndexedDB() ) {
      try {
        const db = await openIndexedDB()
        const tx = db.transaction( STORE_NAME, 'readonly' )
        const store = tx.objectStore( STORE_NAME )
        const request = store.getAll()
        const records : any[] = await new Promise( ( resolve, reject ) => {
          request.onsuccess = () => resolve( request.result )
          request.onerror = () => reject( request.error )
        } )
        await new Promise<void>( ( resolve, reject ) => {
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject( tx.error )
          tx.onabort = () => reject( tx.error )
        } )
        const comparisonKey = String( workOrderId )
        return records
          .filter( record => String( record.workOrderId ) === comparisonKey )
          .map( record => ( {
            workOrderId : record.workOrderId,
            taskId : record.taskId,
            status : record.status,
            time_spent : record.time_spent,
            step_progress : record.step_progress,
            updated_at : record.updated_at
          } ) )
      } catch ( error ) {
        console.warn( '[StartWorkOrder][IndexedDB] Falling back to localStorage', error )
      }
    }
    return loadLocalStorage( workOrderId )
  },

  async removeDraft( workOrderId : string | number, taskId : string | number ) {
    if ( supportsIndexedDB() ) {
      try {
        const db = await openIndexedDB()
        const tx = db.transaction( STORE_NAME, 'readwrite' )
        const store = tx.objectStore( STORE_NAME )
        store.delete( getKey( workOrderId, taskId ) )
        await new Promise<void>( ( resolve, reject ) => {
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject( tx.error )
          tx.onabort = () => reject( tx.error )
        } )
        return
      } catch ( error ) {
        console.warn( '[StartWorkOrder][IndexedDB] Falling back to localStorage', error )
      }
    }
    await removeLocalStorage( workOrderId, taskId )
  },

  async clearWorkOrder( workOrderId : string | number ) {
    if ( supportsIndexedDB() ) {
      try {
        const db = await openIndexedDB()
        const tx = db.transaction( STORE_NAME, 'readwrite' )
        const store = tx.objectStore( STORE_NAME )
        const request = store.getAllKeys()
        const keys : any[] = await new Promise( ( resolve, reject ) => {
          request.onsuccess = () => resolve( request.result )
          request.onerror = () => reject( request.error )
        } )
        keys
          .filter( key => typeof key === 'string' && key.startsWith( `${workOrderId}::` ) )
          .forEach( key => store.delete( key ) )
        await new Promise<void>( ( resolve, reject ) => {
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject( tx.error )
          tx.onabort = () => reject( tx.error )
        } )
        return
      } catch ( error ) {
        console.warn( '[StartWorkOrder][IndexedDB] Falling back to localStorage', error )
      }
    }
    await clearLocalStorage( workOrderId )
  }
}

export type { TaskDraftRecord }
