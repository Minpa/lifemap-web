/**
 * IndexedDB wrapper for local storage
 * Provides CRUD operations for all data stores
 */

import type {
  LocationPoint,
  Place,
  Trip,
  RunSession,
  JournalEntry,
  Photo,
  UserPreferences,
  PrivacySettings,
  SyncOperation,
} from '@/types';

const DB_NAME = 'lifemap-db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  LOCATIONS: 'locations',
  PLACES: 'places',
  TRIPS: 'trips',
  RUNS: 'runs',
  JOURNALS: 'journals',
  PHOTOS: 'photos',
  PREFERENCES: 'preferences',
  PRIVACY_SETTINGS: 'privacySettings',
  SYNC_QUEUE: 'syncQueue',
} as const;

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Locations store
        if (!db.objectStoreNames.contains(STORES.LOCATIONS)) {
          const locationStore = db.createObjectStore(STORES.LOCATIONS, {
            keyPath: 'id',
          });
          locationStore.createIndex('timestamp', 'timestamp');
          locationStore.createIndex('coordinates', ['latitude', 'longitude']);
        }

        // Places store
        if (!db.objectStoreNames.contains(STORES.PLACES)) {
          const placeStore = db.createObjectStore(STORES.PLACES, {
            keyPath: 'id',
          });
          placeStore.createIndex('category', 'category');
          placeStore.createIndex('lastVisit', 'lastVisit');
          placeStore.createIndex('isFavorite', 'isFavorite');
        }

        // Trips store
        if (!db.objectStoreNames.contains(STORES.TRIPS)) {
          const tripStore = db.createObjectStore(STORES.TRIPS, {
            keyPath: 'id',
          });
          tripStore.createIndex('startDate', 'startDate');
        }

        // Runs store
        if (!db.objectStoreNames.contains(STORES.RUNS)) {
          const runStore = db.createObjectStore(STORES.RUNS, {
            keyPath: 'id',
          });
          runStore.createIndex('startTime', 'startTime');
        }

        // Journals store
        if (!db.objectStoreNames.contains(STORES.JOURNALS)) {
          const journalStore = db.createObjectStore(STORES.JOURNALS, {
            keyPath: 'id',
          });
          journalStore.createIndex('date', 'date', { unique: true });
        }

        // Photos store
        if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
          const photoStore = db.createObjectStore(STORES.PHOTOS, {
            keyPath: 'id',
          });
          photoStore.createIndex('timestamp', 'timestamp');
          photoStore.createIndex('hash', 'hash');
          photoStore.createIndex('journalEntryId', 'journalEntryId');
        }

        // Preferences store
        if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
          db.createObjectStore(STORES.PREFERENCES, { keyPath: 'userId' });
        }

        // Privacy settings store
        if (!db.objectStoreNames.contains(STORES.PRIVACY_SETTINGS)) {
          db.createObjectStore(STORES.PRIVACY_SETTINGS, { keyPath: 'userId' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
          });
          syncStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  private getStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
  ): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Generic CRUD operations
  async add<T>(storeName: string, data: T): Promise<string> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export async function getDB(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = new Database();
    await dbInstance.init();
  }
  return dbInstance;
}

// Typed helper functions
export const db = {
  // Locations
  async addLocation(location: LocationPoint): Promise<string> {
    const database = await getDB();
    return database.add(STORES.LOCATIONS, location);
  },

  async getLocation(id: string): Promise<LocationPoint | undefined> {
    const database = await getDB();
    return database.get<LocationPoint>(STORES.LOCATIONS, id);
  },

  async getAllLocations(): Promise<LocationPoint[]> {
    const database = await getDB();
    return database.getAll<LocationPoint>(STORES.LOCATIONS);
  },

  // Places
  async addPlace(place: Place): Promise<string> {
    const database = await getDB();
    return database.add(STORES.PLACES, place);
  },

  async getPlace(id: string): Promise<Place | undefined> {
    const database = await getDB();
    return database.get<Place>(STORES.PLACES, id);
  },

  async getAllPlaces(): Promise<Place[]> {
    const database = await getDB();
    return database.getAll<Place>(STORES.PLACES);
  },

  async updatePlace(place: Place): Promise<void> {
    const database = await getDB();
    return database.update(STORES.PLACES, place);
  },

  // Trips
  async addTrip(trip: Trip): Promise<string> {
    const database = await getDB();
    return database.add(STORES.TRIPS, trip);
  },

  async getTrip(id: string): Promise<Trip | undefined> {
    const database = await getDB();
    return database.get<Trip>(STORES.TRIPS, id);
  },

  async getAllTrips(): Promise<Trip[]> {
    const database = await getDB();
    return database.getAll<Trip>(STORES.TRIPS);
  },

  // Runs
  async addRun(run: RunSession): Promise<string> {
    const database = await getDB();
    return database.add(STORES.RUNS, run);
  },

  async getRun(id: string): Promise<RunSession | undefined> {
    const database = await getDB();
    return database.get<RunSession>(STORES.RUNS, id);
  },

  async getAllRuns(): Promise<RunSession[]> {
    const database = await getDB();
    return database.getAll<RunSession>(STORES.RUNS);
  },

  // Journals
  async addJournal(journal: JournalEntry): Promise<string> {
    const database = await getDB();
    return database.add(STORES.JOURNALS, journal);
  },

  async getJournal(id: string): Promise<JournalEntry | undefined> {
    const database = await getDB();
    return database.get<JournalEntry>(STORES.JOURNALS, id);
  },

  async getJournalByDate(date: string): Promise<JournalEntry | undefined> {
    const database = await getDB();
    const journals = await database.getByIndex<JournalEntry>(
      STORES.JOURNALS,
      'date',
      date
    );
    return journals[0];
  },

  async getAllJournals(): Promise<JournalEntry[]> {
    const database = await getDB();
    return database.getAll<JournalEntry>(STORES.JOURNALS);
  },

  async updateJournal(journal: JournalEntry): Promise<void> {
    const database = await getDB();
    return database.update(STORES.JOURNALS, journal);
  },

  // Photos
  async addPhoto(photo: Photo): Promise<string> {
    const database = await getDB();
    return database.add(STORES.PHOTOS, photo);
  },

  async getPhoto(id: string): Promise<Photo | undefined> {
    const database = await getDB();
    return database.get<Photo>(STORES.PHOTOS, id);
  },

  async getAllPhotos(): Promise<Photo[]> {
    const database = await getDB();
    return database.getAll<Photo>(STORES.PHOTOS);
  },

  async getPhotosByHash(hash: string): Promise<Photo[]> {
    const database = await getDB();
    return database.getByIndex<Photo>(STORES.PHOTOS, 'hash', hash);
  },

  // Preferences
  async getPreferences(userId: string): Promise<UserPreferences | undefined> {
    const database = await getDB();
    return database.get<UserPreferences>(STORES.PREFERENCES, userId);
  },

  async updatePreferences(preferences: UserPreferences): Promise<void> {
    const database = await getDB();
    return database.update(STORES.PREFERENCES, preferences);
  },

  // Privacy Settings
  async getPrivacySettings(
    userId: string
  ): Promise<PrivacySettings | undefined> {
    const database = await getDB();
    return database.get<PrivacySettings>(STORES.PRIVACY_SETTINGS, userId);
  },

  async updatePrivacySettings(settings: PrivacySettings): Promise<void> {
    const database = await getDB();
    return database.update(STORES.PRIVACY_SETTINGS, settings);
  },

  // Sync Queue
  async addToSyncQueue(operation: SyncOperation): Promise<string> {
    const database = await getDB();
    return database.add(STORES.SYNC_QUEUE, operation);
  },

  async getSyncQueue(): Promise<SyncOperation[]> {
    const database = await getDB();
    return database.getAll<SyncOperation>(STORES.SYNC_QUEUE);
  },

  async removeSyncOperation(id: string): Promise<void> {
    const database = await getDB();
    return database.delete(STORES.SYNC_QUEUE, id);
  },
};
