export interface Profile {
  key: string;
  value: any;
  updated: number;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Project {
  id?: number;
  name: string;
  code: string;
  language: string;
  created: number;
}

export interface Milestone {
  id?: number;
  title: string;
  description: string;
  date: number;
}

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
  private dbName = 'byeol_memory';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.dbVersion);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        this.db = req.result;
        resolve();
      };
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('milestones')) {
          db.createObjectStore('milestones', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async setProfile(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('profile', 'readwrite');
      const store = tx.objectStore('profile');
      const req = store.put({ key, value, updated: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getProfile(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('profile', 'readonly');
      const store = tx.objectStore('profile');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.value);
      req.onerror = () => reject(req.error);
    });
  }

  async saveMessage(msg: Omit<ChatMessage, 'id'>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const req = store.add(msg);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getMessages(limit = 50): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const req = store.openCursor(null, 'prev');
      const msgs: ChatMessage[] = [];
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

  async clearMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveProject(name: string, code: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('projects', 'readwrite');
      const store = tx.objectStore('projects');
      const req = store.add({ name, code, language, created: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getProjects(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteProject(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('projects', 'readwrite');
      const store = tx.objectStore('projects');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async addMilestone(title: string, description: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('milestones', 'readwrite');
      const store = tx.objectStore('milestones');
      const req = store.add({ title, description, date: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getMilestones(): Promise<Milestone[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('DB not initialized'));
      const tx = this.db.transaction('milestones', 'readonly');
      const store = tx.objectStore('milestones');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getDashboardPrefs(): Promise<DashboardPrefs> {
    const prefs = await this.getProfile('dashboardPrefs');
    return prefs || defaultDashboardPrefs;
  }

  async setDashboardPrefs(prefs: DashboardPrefs): Promise<void> {
    await this.setProfile('dashboardPrefs', prefs);
  }
}

export const memory = new MemorySystem();
