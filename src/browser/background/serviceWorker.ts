import { BrowserStorageAdapter } from '../storage/storageAdapter';
import type { BrowserMessage, FidelBrowserSettings } from '../storage/types';
import { Transliterator } from '../../engine/transliterator';

function updateBadge(enabled: boolean): void {
  if (typeof chrome === 'undefined' || !chrome.action) return;

  if (enabled) {
    chrome.action.setBadgeText({ text: 'ፊ' });
    chrome.action.setBadgeBackgroundColor({ color: '#2ea043' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function canInjectUrl(url?: string): boolean {
  if (!url) return false;
  return /^(https?|file|ftp):/i.test(url);
}

async function pingTab(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch {
    return false;
  }
}

async function injectContentScript(tabId: number): Promise<void> {
  if (!chrome.scripting?.executeScript) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ['content.js'],
      injectImmediately: true
    });
  } catch {
    // Restricted pages, discarded tabs, or missing host access
  }
}

async function ensureContentScript(tabId: number, url?: string, force = false): Promise<void> {
  if (!canInjectUrl(url)) return;
  if (!force && await pingTab(tabId)) return;
  await injectContentScript(tabId);
}

async function ensureAllTabs(force = false): Promise<void> {
  if (!chrome.tabs?.query) return;
  try {
    const tabs = await chrome.tabs.query({});
    await Promise.all(tabs.map((tab) => {
      if (!tab.id) return Promise.resolve();
      return ensureContentScript(tab.id, tab.url, force);
    }));
  } catch (err) {
    console.warn('[Fidel Background] Tab inject error:', err);
  }
}

async function broadcastSettings(settings: FidelBrowserSettings): Promise<void> {
  updateBadge(settings.enabled);

  if (typeof chrome === 'undefined' || !chrome.tabs) return;

  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id) continue;
      chrome.tabs.sendMessage(tab.id, {
        type: 'STATE_UPDATE',
        state: settings
      }).catch(async () => {
        if (tab.id) await ensureContentScript(tab.id, tab.url);
      });
    }
  } catch (err) {
    console.warn('[Fidel Background] Tab broadcast error:', err);
  }
}

async function setupContextMenus(): Promise<void> {
  if (!chrome.contextMenus) return;
  try {
    await chrome.contextMenus.removeAll();
  } catch {
    // First install
  }

  chrome.contextMenus.create({
    id: 'fidel-transliterate-selection',
    title: 'Transliterate Selection to Amharic (ፊደል)',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'fidel-toggle',
    title: 'Toggle Fidel Amharic Input (Alt+Shift+A)',
    contexts: ['all']
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await BrowserStorageAdapter.getSettings();
  updateBadge(settings.enabled);
  await setupContextMenus();
  await ensureAllTabs(true);
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await BrowserStorageAdapter.getSettings();
  updateBadge(settings.enabled);
  await ensureAllTabs(true);
});

if (chrome.permissions?.onAdded) {
  chrome.permissions.onAdded.addListener(() => {
    void ensureAllTabs(true);
  });
}

BrowserStorageAdapter.getSettings().then((s) => {
  updateBadge(s.enabled);
  void ensureAllTabs();
});

chrome.tabs.onActivated.addListener(async (info) => {
  try {
    const tab = await chrome.tabs.get(info.tabId);
    await ensureContentScript(info.tabId, tab.url, true);
  } catch {
    // Tab gone
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    void ensureContentScript(tabId, tab.url);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-fidel') {
    const current = await BrowserStorageAdapter.getSettings();
    const updated = await BrowserStorageAdapter.saveSettings({ enabled: !current.enabled });
    await broadcastSettings(updated);
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'fidel-toggle') {
    const current = await BrowserStorageAdapter.getSettings();
    const updated = await BrowserStorageAdapter.saveSettings({ enabled: !current.enabled });
    await broadcastSettings(updated);
  } else if (info.menuItemId === 'fidel-transliterate-selection' && info.selectionText && tab?.id) {
    const settings = await BrowserStorageAdapter.getSettings();
    const transliterator = new Transliterator({
      convertPunctuation: settings.convertPunctuation,
      convertNumbers: settings.convertNumbers,
      smartCorrection: settings.smartCorrection,
      dictionary: settings.dictionary
    });
    const transliterated = transliterator.transliterate(info.selectionText);

    chrome.tabs.sendMessage(tab.id, {
      type: 'TRANSLITERATE_TEXT',
      text: transliterated
    }).catch(() => {
      if (tab.id) void ensureContentScript(tab.id, tab.url);
    });
  }
});

chrome.runtime.onMessage.addListener((message: BrowserMessage, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ ok: true });
    return;
  }

  if (message.type === 'GET_STATE') {
    BrowserStorageAdapter.getSettings().then((settings) => sendResponse(settings));
    return true;
  }

  if (message.type === 'TOGGLE_ENABLED') {
    BrowserStorageAdapter.getSettings().then(async (current) => {
      const updated = await BrowserStorageAdapter.saveSettings({ enabled: !current.enabled });
      await broadcastSettings(updated);
      sendResponse(updated);
    });
    return true;
  }

  if (message.type === 'SET_ENABLED') {
    BrowserStorageAdapter.saveSettings({ enabled: message.enabled }).then(async (updated) => {
      await broadcastSettings(updated);
      sendResponse(updated);
    });
    return true;
  }

  if (message.type === 'UPDATE_SETTINGS') {
    BrowserStorageAdapter.saveSettings(message.settings).then(async (updated) => {
      await broadcastSettings(updated);
      sendResponse(updated);
    });
    return true;
  }
});
