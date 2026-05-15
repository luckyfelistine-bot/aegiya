const DB_NAME = "byeol-memory-v3";
const DB_VERSION = 1;

interface MemoryRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface Project {
  id: number;
  name: string;
  code: string;
  language: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  content?: string;
}

export interface FileRecord {
  id?: number;
  name: string;
  path: string;
  content: string;
  language: string;
  projectId?: number;
  createdAt: number;
  updatedAt: number;
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

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("memory")) {
        db.createObjectStore("memory", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("messages")) {
        db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

class MemoryStore {
  async get<T>(key: string): Promise<T | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("memory", "readonly");
      const store = tx.objectStore("memory");
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result as MemoryRecord | undefined;
        resolve(result ? (result.value as T) : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("memory", "readwrite");
      const store = tx.objectStore("memory");
      const req = store.put({ key, value, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async remove(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("memory", "readwrite");
      const store = tx.objectStore("memory");
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getProfile<T = unknown>(key: string): Promise<T | null> {
    return this.get<T>(`profile:${key}`);
  }

  async setProfile<T>(key: string, value: T): Promise<void> {
    return this.set(`profile:${key}`, value);
  }

  async getDashboardPrefs(): Promise<DashboardPrefs> {
    const prefs = await this.get<DashboardPrefs>("dashboard:prefs");
    return prefs ?? { ...defaultDashboardPrefs };
  }

  async setDashboardPrefs(prefs: DashboardPrefs): Promise<void> {
    return this.set("dashboard:prefs", prefs);
  }

  async getProjects(): Promise<Project[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readonly");
      const store = tx.objectStore("projects");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as Project[]);
      req.onerror = () => reject(req.error);
    });
  }

  async addProject(project: Omit<Project, "id">): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readwrite");
      const store = tx.objectStore("projects");
      const req = store.add({ ...project, updatedAt: Date.now() });
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readwrite");
      const store = tx.objectStore("projects");
      const req = store.get(id);
      req.onsuccess = () => {
        const existing = req.result as Project;
        if (existing) {
          const updated = { ...existing, ...updates, updatedAt: Date.now() };
          store.put(updated);
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteProject(id: number): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", "readwrite");
      const store = tx.objectStore("projects");
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getMessages(): Promise<ChatMessage[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("messages", "readonly");
      const store = tx.objectStore("messages");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as ChatMessage[]);
      req.onerror = () => reject(req.error);
    });
  }

  async addMessage(message: Omit<ChatMessage, "id">): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("messages", "readwrite");
      const store = tx.objectStore("messages");
      const req = store.add(message);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  async clearMessages(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("messages", "readwrite");
      const store = tx.objectStore("messages");
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ===== File operations =====
  async getFiles(): Promise<FileRecord[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as FileRecord[]);
      req.onerror = () => reject(req.error);
    });
  }

  async addFile(file: Omit<FileRecord, "id">): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const req = store.add(file);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteFile(id: number): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const memory = new MemoryStore();
