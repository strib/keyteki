/* global chrome */

const getDefaultLanguage = () => chrome.i18n.getUILanguage().split('-')[0];

const DEFAULT_SETTINGS = {
    enabled: true,
    targetLanguage: getDefaultLanguage(),
    apiEndpoint: 'https://libretranslate.com/translate',
    apiKey: ''
};

let settings = { ...DEFAULT_SETTINGS };
const translationCache = new Map();

const updateSettings = (newSettings) => {
    settings = { ...settings, ...newSettings };
};

const buildCacheKey = (text, targetLanguage, apiEndpoint) =>
    `${apiEndpoint}::${targetLanguage}::${text}`;

const fetchTranslation = async (text, targetLanguage, apiEndpoint, apiKey) => {
    const normalizedText = text.trim();

    if (!normalizedText) {
        return '';
    }

    const cacheKey = buildCacheKey(normalizedText, targetLanguage, apiEndpoint);

    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    const payload = {
        q: normalizedText,
        source: 'auto',
        target: targetLanguage,
        format: 'text'
    };

    if (apiKey) {
        payload.api_key = apiKey;
    }

    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Translation failed (${response.status}): ${responseText}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText || '';

    translationCache.set(cacheKey, translatedText);

    return translatedText;
};

chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
    updateSettings(stored);
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') {
        return;
    }

    const updatedSettings = {};

    Object.keys(changes).forEach((key) => {
        updatedSettings[key] = changes[key].newValue;
    });

    updateSettings(updatedSettings);

    if (changes.apiEndpoint || changes.apiKey) {
        translationCache.clear();
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== 'translate') {
        return;
    }

    const targetLanguage = message.targetLanguage || settings.targetLanguage;
    const text = message.text || '';

    if (!settings.enabled) {
        sendResponse({ translatedText: text });
        return;
    }

    fetchTranslation(text, targetLanguage, settings.apiEndpoint, settings.apiKey)
        .then((translatedText) => sendResponse({ translatedText }))
        .catch((error) => {
            sendResponse({ error: error.message || 'Translation failed.' });
        });

    return true;
});
