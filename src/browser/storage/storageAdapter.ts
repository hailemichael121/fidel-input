import { DEFAULT_SETTINGS, type FidelBrowserSettings } from './types';

export class BrowserStorageAdapter {
  private static STORAGE_KEY = 'fidel_browser_settings';

  static async getSettings(): Promise<FidelBrowserSettings> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return DEFAULT_SETTINGS;
    }

    return new Promise((resolve) => {
      chrome.storage.sync.get([this.STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError || !result[this.STORAGE_KEY]) {
          // Fallback to local storage if sync fails
          chrome.storage.local.get([this.STORAGE_KEY], (localResult) => {
            const localData = (localResult?.[this.STORAGE_KEY] as Partial<FidelBrowserSettings>) || {};
            resolve({ ...DEFAULT_SETTINGS, ...localData });
          });
        } else {
          const syncData = (result?.[this.STORAGE_KEY] as Partial<FidelBrowserSettings>) || {};
          resolve({ ...DEFAULT_SETTINGS, ...syncData });
        }
      });
    });
  }

  static async saveSettings(settings: Partial<FidelBrowserSettings>): Promise<FidelBrowserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      await new Promise<void>((resolve) => {
        chrome.storage.sync.set({ [this.STORAGE_KEY]: updated }, () => {
          if (chrome.runtime.lastError) {
            chrome.storage.local.set({ [this.STORAGE_KEY]: updated }, () => resolve());
          } else {
            chrome.storage.local.set({ [this.STORAGE_KEY]: updated }, () => resolve());
          }
        });
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
