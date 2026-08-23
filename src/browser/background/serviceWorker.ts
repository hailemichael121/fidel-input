import { BrowserStorageAdapter } from '../storage/storageAdapter';
import type { BrowserMessage, FidelBrowserSettings } from '../storage/types';
import { Transliterator } from '../../engine/transliterator';

function updateBadge(enabled: boolean): void {
  if (typeof chrome === 'undefined' || !chrome.action) return;

  if (enabled) {
    chrome.action.setBadgeText({ text: 'ፊ' });
    chrome.action.setBadgeBackgroundColor({ color: '#2ea043' }); // Green
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#6e7681' }); // Gray
  }
}

async function broadcastSettings(settings: FidelBrowserSettings): Promise<void> {
  updateBadge(settings.enabled);

  if (typeof chrome === 'undefined' || !chrome.tabs) return;

  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'STATE_UPDATE',
          state: settings
        }).catch(() => {
          // Ignore tabs without content script (e.g. chrome://)
        });
      }
    }
  } catch (err) {
    console.warn('[Fidel Background] Tab broadcast error:', err);
  }
}

// Setup context menus on installation
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await BrowserStorageAdapter.getSettings();
  updateBadge(settings.enabled);

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
});

// Setup badge on worker startup
BrowserStorageAdapter.getSettings().then((s) => updateBadge(s.enabled));

// Listen for global shortcut commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-fidel') {
    const current = await BrowserStorageAdapter.getSettings();
    const updated = await BrowserStorageAdapter.saveSettings({ enabled: !current.enabled });
    await broadcastSettings(updated);
  }
});

// Context menu click handling
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
      // Content script message failed
    });
  }
});

// Message handling between content script, popup, and background
chrome.runtime.onMessage.addListener((message: BrowserMessage, _sender, sendResponse) => {
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
