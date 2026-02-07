/* global chrome */

const getDefaultLanguage = () => navigator.language.split('-')[0];

const DEFAULT_SETTINGS = {
    enabled: true,
    targetLanguage: getDefaultLanguage(),
    apiEndpoint: 'https://libretranslate.com/translate',
    apiKey: ''
};

const CHAT_CONTAINER_SELECTOR = '.gamechat .messages';
const CHAT_MESSAGE_SELECTOR = '.message.chat-bubble .message-fragment';
const TRANSLATION_ORIGINAL_ATTR = 'translationOriginal';
const TRANSLATION_LANGUAGE_ATTR = 'translationLanguage';
const TRANSLATION_TEXT_ATTR = 'translationText';
const TRANSLATION_PENDING_ATTR = 'translationPending';

let settings = { ...DEFAULT_SETTINGS };
let chatObserver = null;
let attachInterval = null;

const loadSettings = () =>
    new Promise((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
            settings = { ...DEFAULT_SETTINGS, ...stored };
            resolve(settings);
        });
    });

const restoreOriginal = (node) => {
    const originalText = node.dataset[TRANSLATION_ORIGINAL_ATTR];

    if (originalText !== undefined) {
        node.textContent = originalText;
    }

    delete node.dataset[TRANSLATION_LANGUAGE_ATTR];
    delete node.dataset[TRANSLATION_TEXT_ATTR];
    delete node.dataset[TRANSLATION_PENDING_ATTR];
};

const requestTranslation = (text, targetLanguage) =>
    new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'translate', text, targetLanguage }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            if (!response || response.error) {
                reject(new Error(response?.error || 'Translation failed.'));
                return;
            }

            resolve(response.translatedText);
        });
    });

const translateNode = async (node) => {
    const currentText = node.dataset[TRANSLATION_ORIGINAL_ATTR] ?? node.textContent;
    const trimmedText = currentText.trim();

    if (!trimmedText) {
        return;
    }

    if (node.dataset[TRANSLATION_ORIGINAL_ATTR] === undefined) {
        node.dataset[TRANSLATION_ORIGINAL_ATTR] = currentText;
    }

    if (!settings.enabled) {
        restoreOriginal(node);
        return;
    }

    if (
        node.dataset[TRANSLATION_LANGUAGE_ATTR] === settings.targetLanguage &&
        node.dataset[TRANSLATION_TEXT_ATTR]
    ) {
        node.textContent = node.dataset[TRANSLATION_TEXT_ATTR];
        return;
    }

    if (node.dataset[TRANSLATION_PENDING_ATTR] === 'true') {
        return;
    }

    node.dataset[TRANSLATION_PENDING_ATTR] = 'true';

    try {
        const translatedText = await requestTranslation(trimmedText, settings.targetLanguage);

        node.dataset[TRANSLATION_LANGUAGE_ATTR] = settings.targetLanguage;
        node.dataset[TRANSLATION_TEXT_ATTR] = translatedText;
        node.textContent = translatedText;
    } catch (error) {
        console.warn('Chat translation failed', error);
    } finally {
        delete node.dataset[TRANSLATION_PENDING_ATTR];
    }
};

const translateAllMessages = () => {
    const nodes = document.querySelectorAll(CHAT_MESSAGE_SELECTOR);
    nodes.forEach((node) => {
        translateNode(node);
    });
};

const handleMutations = (mutations) => {
    const nodesToTranslate = new Set();

    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) {
                return;
            }

            if (node.matches(CHAT_MESSAGE_SELECTOR)) {
                nodesToTranslate.add(node);
            }

            node.querySelectorAll(CHAT_MESSAGE_SELECTOR).forEach((child) => {
                nodesToTranslate.add(child);
            });
        });
    });

    nodesToTranslate.forEach((node) => {
        translateNode(node);
    });
};

const attachObserver = () => {
    const container = document.querySelector(CHAT_CONTAINER_SELECTOR);

    if (!container) {
        return false;
    }

    if (chatObserver) {
        chatObserver.disconnect();
    }

    chatObserver = new MutationObserver(handleMutations);
    chatObserver.observe(container, { childList: true, subtree: true });

    translateAllMessages();
    return true;
};

const startObserver = () => {
    if (attachObserver()) {
        return;
    }

    if (attachInterval) {
        return;
    }

    attachInterval = window.setInterval(() => {
        if (attachObserver()) {
            clearInterval(attachInterval);
            attachInterval = null;
        }
    }, 1000);
};

const refreshTranslations = async () => {
    await loadSettings();

    const nodes = document.querySelectorAll(CHAT_MESSAGE_SELECTOR);

    nodes.forEach((node) => {
        if (!settings.enabled) {
            restoreOriginal(node);
        } else {
            translateNode(node);
        }
    });
};

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') {
        return;
    }

    Object.keys(changes).forEach((key) => {
        settings[key] = changes[key].newValue;
    });

    refreshTranslations();
});

chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'settings-updated') {
        refreshTranslations();
    }
});

const init = async () => {
    await loadSettings();
    startObserver();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
