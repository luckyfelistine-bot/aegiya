"use client";

const DB_NAME = "byeol_memory";
const DB_VERSION = 1;

interface DBSchema {
  profile: { key: string; value: any; updated: number };
  messages: { id?: number; role: string; content: string; timestamp: number };
  projects: { id?: number; name: string; code: string; language: string; created: number };
  milestones: { id?: number; title: string; description: string; date: number };
}

// ✅ Added DashboardPrefs interface and default values
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

class MemorySystem {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        this.db = req.result;
        resolve(this.db);
      };

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("profile")) {
          db.createObjectStore("profile", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("messages")) {
          db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("milestones")) {
          db.createObjectStore("milestones", { keyPath: "id", autoIncrement: true });
        }
      };
    });

    return this.initPromise;
  }

  async setProfile(key: string, value: any): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profile", "readwrite");
      const store = tx.objectStore("profile");
      const req = store.put({ key, value, updated: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getProfile(key: string): Promise<any> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("profile", "readonly");
      const store = tx.objectStore("profile");
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value);
      req.onerror = () => reject(req.error);
    });
  }

  async saveMessage(msg: { role: string; content: string; timestamp: number }): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("messages", "readwrite");
      const store = tx.objectStore("messages");
      const req = store.add(msg);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getMessages(limit: number = 50): Promise<any[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("messages", "readonly");
      const store = tx.objectStore("messages");
      const req = store.openCursor(null, "prev");
      const msgs: any[] = [];

      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;
        if (cursor && msgs.length < limit) {
          msgs.unshift(cursor.value);
          cursor.continue();
        } else {
          resolve(msgs);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveProject(name: string, code: string, language: string = "html"): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readwrite");
      const store = tx.objectStore("projects");
      const req = store.add({ name, code, language, created: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getProjects(): Promise<any[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readonly");
      const store = tx.objectStore("projects");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async addMilestone(title: string, description: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("milestones", "readwrite");
      const store = tx.objectStore("milestones");
      const req = store.add({ title, description, date: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getMilestones(): Promise<any[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("milestones", "readonly");
      const store = tx.objectStore("milestones");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getDashboardPrefs(): Promise<DashboardPrefs> {
    const prefs = await this.getProfile("dashboard_prefs");
    return prefs || defaultDashboardPrefs;
  }

  async setDashboardPrefs(prefs: DashboardPrefs): Promise<void> {
    await this.setProfile("dashboard_prefs", prefs);
  }
}

export const memory = new MemorySystem();
