// utils/idb.ts
export function openDB(dbName: string, storeName: string) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"))
      return
    }
    const request = indexedDB.open(dbName, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true })
      }
    }
  })
}

export async function addData(dbName: string, storeName: string, data: any) {
  console.log(`addData called for ${dbName}/${storeName} with:`, data)
  try {
    const db = await openDB(dbName, storeName)
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => {
        console.log(`Data added successfully to ${dbName}/${storeName}`)
        resolve(request.result)
      }
      request.onerror = () => {
        console.error(`Error adding data to ${dbName}/${storeName}:`, request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error(`Failed to use IndexedDB, falling back to localStorage for ${dbName}/${storeName}`)
    const key = `${dbName}_${storeName}`
    const existingData = JSON.parse(localStorage.getItem(key) || "[]")
    existingData.push(data)
    localStorage.setItem(key, JSON.stringify(existingData))
    return Promise.resolve()
  }
}

export async function getData(dbName: string, storeName: string) {
  try {
    const db = await openDB(dbName, storeName)
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error(`Failed to use IndexedDB, falling back to localStorage for ${dbName}/${storeName}`)
    const key = `${dbName}_${storeName}`
    const data = localStorage.getItem(key)
    return Promise.resolve(data ? JSON.parse(data) : [])
  }
}

