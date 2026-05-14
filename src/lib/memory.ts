const DB_NAME = "byeol-memory";
const DB_VERSION = 2;

interface MemoryDB extends IDBDatabase {
  // Type augmentation
}

let dbPromise: Promise<MemoryDB> | null = null;

function openDB(): Promise<MemoryDB> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as MemoryDB);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("profile")) {
        db.createObjectStore("profile", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("messages")) {
        db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("milestones")) {
        db.createObjectStore("milestones", { keyPath: "id", autoIncrement: true });
      }
    };
  });
  return dbPromise;
}

// Dashboard preferences types
export interface DashboardPrefs {
  showCoding: boolean;
  showStatus: boolean;
  showLesson: boolean;
  showConstellation: boolean;
  showVoice: boolean;
  showFiles: boolean;
  showProgress: boolean;
}

export const defaultDashboardPrefs: DashboardPrefs = {
  showCoding: true,
  showStatus: true,
  showLesson: true,
  showConstellation: true,
  showVoice: true,
  showFiles: true,
  showProgress: true,
};

export const memory = {
  async getProfile(key: string): Promise<any> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profile", "readonly");
      const store = tx.objectStore("profile");
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value ?? null);
      req.onerror = () => reject(req.error);
    });
  },

  async setProfile(key: string, value: any): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profile", "readwrite");
      const store = tx.objectStore("profile");
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveMessage(msg: any): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("messages", "readwrite");
      const store = tx.objectStore("messages");
      const req = store.add({ ...msg, savedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getMessages(limit = 50): Promise<any[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("messages", "readonly");
      const store = tx.objectStore("messages");
      const req = store.openCursor(null, "prev");
      const messages: any[] = [];
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor || messages.length >= limit) {
          resolve(messages.reverse());
          return;
        }
        messages.push(cursor.value);
        cursor.continue();
      };
      req.onerror = () => reject(req.error);
    });
  },

  async saveProject(name: string, code: string, language: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readwrite");
      const store = tx.objectStore("projects");
      const req = store.put({
        id: `proj-${Date.now()}`,
        name,
        code,
        language,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getProjects(): Promise<any[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readonly");
      const store = tx.objectStore("projects");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async saveMilestone(title: string, description: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("milestones", "readwrite");
      const store = tx.objectStore("milestones");
      const req = store.add({
        title,
        description,
        date: Date.now(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getMilestones(): Promise<any[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("milestones", "readonly");
      const store = tx.objectStore("milestones");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result.reverse());
      req.onerror = () => reject(req.error);
    });
 },

  async getDashboardPrefs(): Promise<DashboardPrefs> {
    const prefs = await this.getProfile("dashboard_prefs");
    return prefs || defaultDashboardPrefs;
  },

  async setDashboardPrefs(prefs: DashboardPrefs): Promise<void> {
    await this.setProfile("dashboard_prefs", prefs);
  },
};
