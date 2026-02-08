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
    provider: 'libretranslate',
    apiEndpoint: 'https://libretranslate.com/translate',
    apiKey: '',
    googleApiKey: '',
    googleEndpoint: 'https://translation.googleapis.com/language/translate/v2'
};

const LANGUAGE_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' },
    { code: 'az', label: 'Azerbaijani' },
    { code: 'eu', label: 'Basque' },
    { code: 'bn', label: 'Bengali' },
    { code: 'bg', label: 'Bulgarian' },
    { code: 'ca', label: 'Catalan' },
    { code: 'zh', label: 'Chinese' },
    { code: 'zt', label: 'Chinese (Traditional)' },
    { code: 'cs', label: 'Czech' },
    { code: 'da', label: 'Danish' },
    { code: 'nl', label: 'Dutch' },
    { code: 'eo', label: 'Esperanto' },
    { code: 'et', label: 'Estonian' },
    { code: 'fi', label: 'Finnish' },
    { code: 'fr', label: 'French' },
    { code: 'gl', label: 'Galician' },
    { code: 'de', label: 'German' },
    { code: 'el', label: 'Greek' },
    { code: 'he', label: 'Hebrew' },
    { code: 'hi', label: 'Hindi' },
    { code: 'hu', label: 'Hungarian' },
    { code: 'id', label: 'Indonesian' },
    { code: 'ga', label: 'Irish' },
    { code: 'it', label: 'Italian' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'ky', label: 'Kyrgyz' },
    { code: 'lv', label: 'Latvian' },
    { code: 'lt', label: 'Lithuanian' },
    { code: 'ms', label: 'Malay' },
    { code: 'no', label: 'Norwegian' },
    { code: 'fa', label: 'Persian' },
    { code: 'pl', label: 'Polish' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'pt-BR', label: 'Portuguese (Brazil)' },
    { code: 'ro', label: 'Romanian' },
    { code: 'ru', label: 'Russian' },
    { code: 'sk', label: 'Slovak' },
    { code: 'sl', label: 'Slovenian' },
    { code: 'es', label: 'Spanish' },
    { code: 'sv', label: 'Swedish' },
    { code: 'tl', label: 'Tagalog' },
    { code: 'th', label: 'Thai' },
    { code: 'tr', label: 'Turkish' },
    { code: 'uk', label: 'Ukrainian' },
    { code: 'ur', label: 'Urdu' },
    { code: 'vi', label: 'Vietnamese' }
];

const statusEl = document.getElementById('status');
const enabledEl = document.getElementById('enabled');
const targetLanguageEl = document.getElementById('targetLanguage');
const providerEl = document.getElementById('provider');
const apiEndpointEl = document.getElementById('apiEndpoint');
const apiKeyEl = document.getElementById('apiKey');
const googleApiKeyEl = document.getElementById('googleApiKey');

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
        provider: providerEl.value,
        apiEndpoint: apiEndpointEl.value.trim(),
        apiKey: apiKeyEl.value.trim(),
        googleApiKey: googleApiKeyEl.value.trim()
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
        providerEl.value = stored.provider;
        apiEndpointEl.value = stored.apiEndpoint;
        apiKeyEl.value = stored.apiKey;
        googleApiKeyEl.value = stored.googleApiKey;
    });
};

const init = () => {
    populateLanguageOptions();
    loadSettings();

    enabledEl.addEventListener('change', saveSettings);
    targetLanguageEl.addEventListener('change', saveSettings);
    providerEl.addEventListener('change', saveSettings);
    apiEndpointEl.addEventListener('change', saveSettings);
    apiKeyEl.addEventListener('change', saveSettings);
    googleApiKeyEl.addEventListener('change', saveSettings);
};

document.addEventListener('DOMContentLoaded', init);
