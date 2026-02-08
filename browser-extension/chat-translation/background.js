/* global chrome */

const getDefaultLanguage = () => chrome.i18n.getUILanguage().split('-')[0];

const DEFAULT_SETTINGS = {
    enabled: true,
    targetLanguage: getDefaultLanguage(),
    provider: 'libretranslate',
    apiEndpoint: 'https://libretranslate.com/translate',
    apiKey: '',
    googleApiKey: '',
    googleEndpoint: 'https://translation.googleapis.com/language/translate/v2'
};

let settings = { ...DEFAULT_SETTINGS };
const translationCache = new Map();

const updateSettings = (newSettings) => {
    settings = { ...settings, ...newSettings };
};

const buildCacheKey = (text, targetLanguage, provider, apiEndpoint) =>
    `${provider}::${apiEndpoint}::${targetLanguage}::${text}`;

const fetchTranslation = async (text, targetLanguage, provider, format) => {
    const normalizedText = text.trim();

    if (!normalizedText) {
        return '';
    }

    const cacheKey = buildCacheKey(
        normalizedText,
        targetLanguage,
        provider,
        provider === 'google' ? settings.googleEndpoint : settings.apiEndpoint
    );

    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }

    const response =
        provider === 'google'
            ? await fetch(
                  `${settings.googleEndpoint}?key=${encodeURIComponent(settings.googleApiKey)}`,
                  {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          q: normalizedText,
                          source: 'auto',
                          target: targetLanguage,
                          format
                      })
                  }
              )
            : await fetch(settings.apiEndpoint, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      q: normalizedText,
                      source: 'auto',
                      target: targetLanguage,
                      format,
                      ...(settings.apiKey ? { api_key: settings.apiKey } : {})
                  })
              });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Translation failed (${response.status}): ${responseText}`);
    }

    const data = await response.json();
    const translatedText =
        provider === 'google'
            ? data?.data?.translations?.[0]?.translatedText || ''
            : data.translatedText || '';

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

    fetchTranslation(text, targetLanguage, settings.provider, message.format || 'text')
        .then((translatedText) => sendResponse({ translatedText }))
        .catch((error) => {
            sendResponse({ error: error.message || 'Translation failed.' });
        });

    return true;
});
