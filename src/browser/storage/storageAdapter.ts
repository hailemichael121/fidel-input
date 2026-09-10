import { DEFAULT_SETTINGS, type FidelBrowserSettings } from './types';

export class BrowserStorageAdapter {
  private static STORAGE_KEY = 'fidel_browser_settings';

  private static withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(fallback), ms);
      promise.then((value) => {
        clearTimeout(timer);
        resolve(value);
      }).catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
    });
  }

  private static readArea(area: 'local' | 'sync'): Promise<Partial<FidelBrowserSettings> | null> {
    if (typeof chrome === 'undefined' || !chrome.storage?.[area]) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        chrome.storage[area].get([this.STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve((result?.[this.STORAGE_KEY] as Partial<FidelBrowserSettings>) || null);
        });
      } catch {
        resolve(null);
      }
    });
  }

  static async getSettings(): Promise<FidelBrowserSettings> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return DEFAULT_SETTINGS;
    }

    const localData = await this.withTimeout(this.readArea('local'), 400, null);
    if (localData) {
      return { ...DEFAULT_SETTINGS, ...localData };
    }

    const syncData = await this.withTimeout(this.readArea('sync'), 400, null);
    if (syncData) {
      return { ...DEFAULT_SETTINGS, ...syncData };
    }

    return DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: Partial<FidelBrowserSettings>): Promise<FidelBrowserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        const timer = setTimeout(done, 600);
        try {
          chrome.storage.local.set({ [this.STORAGE_KEY]: updated }, () => {
            try {
              chrome.storage.sync.set({ [this.STORAGE_KEY]: updated }, () => {
                clearTimeout(timer);
                done();
              });
            } catch {
              clearTimeout(timer);
              done();
            }
          });
        } catch {
          clearTimeout(timer);
          done();
        }
      });
    }

    return updated;
  }

  static onSettingsChange(callback: (newSettings: FidelBrowserSettings) => void): void {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if ((areaName === 'sync' || areaName === 'local') && changes[this.STORAGE_KEY]) {
        const newValue = changes[this.STORAGE_KEY].newValue;
        if (newValue) {
          callback({ ...DEFAULT_SETTINGS, ...newValue });
        }
      }
    });
  }
}
