class OfflineService {
  constructor() {
    this.dbName = 'PTOExpensesDB';
    this.dbVersion = 1;
    this.db = null;
    this.stores = {
      expenses: 'offlineExpenses',
      cache: 'dataCache'
    };
  }

  async initDB() {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create expenses store
        if (!db.objectStoreNames.contains(this.stores.expenses)) {
          const expenseStore = db.createObjectStore(this.stores.expenses, { 
            keyPath: 'id' 
          });
          expenseStore.createIndex('timestamp', 'timestamp');
          expenseStore.createIndex('synced', 'synced');
          expenseStore.createIndex('userId', 'userId');
        }

        // Create cache store
        if (!db.objectStoreNames.contains(this.stores.cache)) {
          const cacheStore = db.createObjectStore(this.stores.cache, { 
            keyPath: 'key' 
          });
          cacheStore.createIndex('type', 'type');
          cacheStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async storeExpense(expenseData) {
    try {
      await this.initDB();

      const expenseRecord = {
        id: this.generateId(),
        data: expenseData,
        timestamp: Date.now(),
        synced: false,
        userId: expenseData.submitted_by,
        retryCount: 0
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.expenses], 'readwrite');
        const store = transaction.objectStore(this.stores.expenses);
        
        const request = store.add(expenseRecord);
        
        request.onsuccess = () => {
          console.log('Expense stored offline:', expenseRecord.id);
          resolve(expenseRecord.id);
        };
        
        request.onerror = () => {
          console.error('Failed to store expense offline:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Store expense error:', error);
      throw error;
    }
  }

  async getPendingExpenses() {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.expenses], 'readonly');
        const store = transaction.objectStore(this.stores.expenses);
        const index = store.index('synced');
        
        const request = index.getAll(false);
        
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Get pending expenses error:', error);
      return [];
    }
  }

  async getPendingSyncCount() {
    try {
      const pendingExpenses = await this.getPendingExpenses();
      return pendingExpenses.length;
    } catch (error) {
      console.error('Get pending sync count error:', error);
      return 0;
    }
  }

  async markExpenseSynced(expenseId) {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.expenses], 'readwrite');
        const store = transaction.objectStore(this.stores.expenses);
        
        const getRequest = store.get(expenseId);
        
        getRequest.onsuccess = () => {
          const expense = getRequest.result;
          if (expense) {
            expense.synced = true;
            expense.syncedAt = Date.now();
            
            const updateRequest = store.put(expense);
            
            updateRequest.onsuccess = () => {
              console.log('Expense marked as synced:', expenseId);
              resolve();
            };
            
            updateRequest.onerror = () => {
              reject(updateRequest.error);
            };
          } else {
            resolve(); // Expense not found, consider it synced
          }
        };
        
        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error('Mark expense synced error:', error);
      throw error;
    }
  }

  async syncPendingExpenses() {
    try {
      const pendingExpenses = await this.getPendingExpenses();
      const results = [];

      for (const expense of pendingExpenses) {
        try {
          // This would be called by the expense service
          // We'll just mark it as ready for sync here
          results.push({
            id: expense.id,
            ready: true,
            data: expense.data
          });
        } catch (error) {
          console.error(`Failed to prepare expense ${expense.id} for sync:`, error);
          results.push({
            id: expense.id,
            ready: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Sync pending expenses error:', error);
      throw error;
    }
  }

  // Cache management
  async cacheData(type, data) {
    try {
      await this.initDB();

      const cacheRecord = {
        key: `${type}_${Date.now()}`,
        type: type,
        data: data,
        timestamp: Date.now()
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.cache], 'readwrite');
        const store = transaction.objectStore(this.stores.cache);
        
        // Clear old cache entries of the same type first
        const index = store.index('type');
        const clearRequest = index.openCursor(IDBKeyRange.only(type));
        
        clearRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            // Add new cache entry
            const addRequest = store.add(cacheRecord);
            
            addRequest.onsuccess = () => {
              resolve();
            };
            
            addRequest.onerror = () => {
              reject(addRequest.error);
            };
          }
        };
        
        clearRequest.onerror = () => {
          reject(clearRequest.error);
        };
      });
    } catch (error) {
      console.error('Cache data error:', error);
      throw error;
    }
  }

  async getCachedData(type) {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.cache], 'readonly');
        const store = transaction.objectStore(this.stores.cache);
        const index = store.index('type');
        
        const request = index.getAll(type);
        
        request.onsuccess = () => {
          const results = request.result || [];
          if (results.length > 0) {
            // Return the most recent cache entry
            const latest = results.sort((a, b) => b.timestamp - a.timestamp)[0];
            resolve(latest.data);
          } else {
            resolve([]);
          }
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Get cached data error:', error);
      return [];
    }
  }

  // Specific cache methods
  async getCachedExpenses() {
    return await this.getCachedData('expenses');
  }

  async getCachedCategories() {
    return await this.getCachedData('categories');
  }

  async getCachedEvents() {
    return await this.getCachedData('events');
  }

  // Cleanup methods
  async clearOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      await this.initDB();

      const cutoffTime = Date.now() - maxAge;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.cache], 'readwrite');
        const store = transaction.objectStore(this.stores.cache);
        const index = store.index('timestamp');
        
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Clear old cache error:', error);
    }
  }

  async clearSyncedExpenses(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      await this.initDB();

      const cutoffTime = Date.now() - maxAge;

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.expenses], 'readwrite');
        const store = transaction.objectStore(this.stores.expenses);
        const index = store.index('timestamp');
        
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const expense = cursor.value;
            if (expense.synced) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Clear synced expenses error:', error);
    }
  }

  // Utility methods
  generateId() {
    return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getStorageUsage() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      }
      return null;
    } catch (error) {
      console.error('Get storage usage error:', error);
      return null;
    }
  }

  async isStorageAvailable() {
    try {
      return 'indexedDB' in window;
    } catch (error) {
      return false;
    }
  }

  // Background sync registration
  async registerBackgroundSync() {
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('expense-sync');
        console.log('Background sync registered');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Background sync registration error:', error);
      return false;
    }
  }

  // Export/Import for debugging
  async exportData() {
    try {
      const [expenses, cache] = await Promise.all([
        this.getPendingExpenses(),
        this.getCachedData('all')
      ]);

      return {
        expenses,
        cache,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Export data error:', error);
      return null;
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.initDB();
      const pendingCount = await this.getPendingSyncCount();
      const storageUsage = await this.getStorageUsage();
      
      return {
        status: 'healthy',
        pendingExpenses: pendingCount,
        storage: storageUsage,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Offline service health check failed:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}

export const offlineService = new OfflineService();
