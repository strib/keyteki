/* global chrome */

const getDefaultLanguage = () => {
    if (navigator?.language) {
        return navigator.language.split('-')[0];
    }

    return 'en';
};

const DEFAULT_SETTINGS = {
    enabled: true,
    targetLanguage: getDefaultLanguage(),
    apiEndpoint: 'https://libretranslate.com/translate',
    apiKey: ''
};

const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'zh', label: 'Chinese (Simplified)' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'nl', label: 'Dutch' },
    { code: 'pl', label: 'Polish' },
    { code: 'sv', label: 'Swedish' },
    { code: 'tr', label: 'Turkish' },
    { code: 'uk', label: 'Ukrainian' }
];

const statusEl = document.getElementById('status');
const enabledEl = document.getElementById('enabled');
const targetLanguageEl = document.getElementById('targetLanguage');
const apiEndpointEl = document.getElementById('apiEndpoint');
const apiKeyEl = document.getElementById('apiKey');

const populateLanguageOptions = () => {
    targetLanguageEl.innerHTML = '';
    LANGUAGE_OPTIONS.forEach((language) => {
        const option = document.createElement('option');
        option.value = language.code;
        option.textContent = `${language.label} (${language.code})`;
        targetLanguageEl.appendChild(option);
    });
};

const showStatus = (message) => {
    statusEl.textContent = message;

    window.clearTimeout(showStatus.timeoutId);
    showStatus.timeoutId = window.setTimeout(() => {
        statusEl.textContent = '';
    }, 2000);
};

const saveSettings = () => {
    const updatedSettings = {
        enabled: enabledEl.checked,
        targetLanguage: targetLanguageEl.value,
        apiEndpoint: apiEndpointEl.value.trim(),
        apiKey: apiKeyEl.value.trim()
    };

    chrome.storage.sync.set(updatedSettings, () => {
        showStatus('Settings saved.');
        chrome.runtime.sendMessage({ type: 'settings-updated' });
    });
};

const loadSettings = () => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
        enabledEl.checked = stored.enabled;
        targetLanguageEl.value = stored.targetLanguage;
        apiEndpointEl.value = stored.apiEndpoint;
        apiKeyEl.value = stored.apiKey;
    });
};

const init = () => {
    populateLanguageOptions();
    loadSettings();

    enabledEl.addEventListener('change', saveSettings);
    targetLanguageEl.addEventListener('change', saveSettings);
    apiEndpointEl.addEventListener('change', saveSettings);
    apiKeyEl.addEventListener('change', saveSettings);
};

document.addEventListener('DOMContentLoaded', init);
