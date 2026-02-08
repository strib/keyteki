/* global chrome */

const getDefaultLanguage = () => navigator.language.split('-')[0];

const DEFAULT_SETTINGS = {
    enabled: true,
    targetLanguage: getDefaultLanguage(),
    apiEndpoint: 'https://libretranslate.com/translate',
    apiKey: ''
};

const CHAT_CONTAINER_SELECTOR = '.gamechat .messages';
const CHAT_MESSAGE_SELECTOR = '.message .message-fragment';
const TRANSLATION_LANGUAGE_ATTR = 'translationLanguage';
const TRANSLATION_PENDING_ATTR = 'translationPending';
const PLACEHOLDER_ATTR = 'data-kt-placeholder';
const PLACEHOLDER_TAG_REGEX = new RegExp('<span data-kt-placeholder="\\d+"></span>', 'g');

let settings = { ...DEFAULT_SETTINGS };
let chatObserver = null;
let attachInterval = null;
const originalContent = new WeakMap();

const buildOriginalContent = (node) => {
    const nodes = Array.from(node.childNodes).map((child) => child.cloneNode(true));

    return { nodes };
};

const getOriginalContent = (node) => {
    const stored = originalContent.get(node);

    if (stored) {
        return stored;
    }

    const content = buildOriginalContent(node);
    originalContent.set(node, content);
    return content;
};

const buildTranslationPayload = (nodes) => {
    const placeholders = [];
    let html = '';

    nodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
            html += child.textContent || '';
            return;
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
            const placeholder = `<span ${PLACEHOLDER_ATTR}="${placeholders.length}"></span>`;
            placeholders.push(child.cloneNode(true));
            html += placeholder;
        }
    });

    return { html, placeholders };
};

const stripPlaceholderTags = (html) => html.replace(PLACEHOLDER_TAG_REGEX, '');

const collectTranslatedNodes = (node, placeholders) => {
    if (node.nodeType === Node.TEXT_NODE) {
        return [document.createTextNode(node.textContent || '')];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return [];
    }

    const placeholderIndex = node.getAttribute(PLACEHOLDER_ATTR);

    if (placeholderIndex !== null) {
        const placeholder = placeholders[Number(placeholderIndex)];
        return placeholder ? [placeholder.cloneNode(true)] : [];
    }

    const nodes = [];
    node.childNodes.forEach((child) => {
        nodes.push(...collectTranslatedNodes(child, placeholders));
    });

    if (nodes.length === 0 && node.textContent) {
        nodes.push(document.createTextNode(node.textContent));
    }

    return nodes;
};

const buildNodesFromHtml = (html, placeholders) => {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const nodes = [];

    parsed.body.childNodes.forEach((child) => {
        nodes.push(...collectTranslatedNodes(child, placeholders));
    });

    return nodes;
};

const loadSettings = () =>
    new Promise((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
            settings = { ...DEFAULT_SETTINGS, ...stored };
            resolve(settings);
        });
    });

const restoreOriginal = (node) => {
    const original = getOriginalContent(node);

    if (original?.nodes?.length) {
        node.replaceChildren(...original.nodes.map((child) => child.cloneNode(true)));
    }

    delete node.dataset[TRANSLATION_LANGUAGE_ATTR];
    delete node.dataset[TRANSLATION_PENDING_ATTR];
};

const requestTranslation = (text, targetLanguage) =>
    new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: 'translate', text, targetLanguage, format: 'html' },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (!response || response.error) {
                    reject(new Error(response?.error || 'Translation failed.'));
                    return;
                }

                resolve(response.translatedText);
            }
        );
    });

const translateNode = async (node) => {
    const original = getOriginalContent(node);
    const hasText = original.nodes.some(
        (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()
    );

    if (!hasText) {
        return;
    }

    if (!settings.enabled) {
        restoreOriginal(node);
        return;
    }

    if (node.dataset[TRANSLATION_LANGUAGE_ATTR] === settings.targetLanguage) {
        return;
    }

    if (node.dataset[TRANSLATION_PENDING_ATTR] === 'true') {
        return;
    }

    node.dataset[TRANSLATION_PENDING_ATTR] = 'true';

    try {
        const { html, placeholders } = buildTranslationPayload(original.nodes);
        const strippedHtml = stripPlaceholderTags(html).trim();

        if (!strippedHtml) {
            restoreOriginal(node);
            return;
        }

        const translatedHtml = await requestTranslation(html, settings.targetLanguage);

        if (!translatedHtml) {
            restoreOriginal(node);
            return;
        }

        const translatedNodes = buildNodesFromHtml(translatedHtml, placeholders);

        if (translatedNodes.length === 0) {
            restoreOriginal(node);
            return;
        }

        node.dataset[TRANSLATION_LANGUAGE_ATTR] = settings.targetLanguage;
        node.replaceChildren(...translatedNodes);
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
