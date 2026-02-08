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
const PLACEHOLDER_PREFIX = '[[#';
const PLACEHOLDER_SUFFIX = ']]';
const PLACEHOLDER_REGEX = /\[\[#\s*(\d+)\s*\]\]/g;
const TERM_PLACEHOLDER_PREFIX = '[[@';
const TERM_PLACEHOLDER_SUFFIX = ']]';
const TERM_PLACEHOLDER_REGEX = /\[\[@\s*(\d+)\s*\]\]/g;
const PROTECTED_TERMS = ['Æmber', 'Aember'];

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
    let text = '';

    nodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent || '';
            return;
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
            const placeholder = `${PLACEHOLDER_PREFIX}${placeholders.length}${PLACEHOLDER_SUFFIX}`;
            placeholders.push(child.cloneNode(true));
            text += placeholder;
        }
    });

    return { text, placeholders };
};

const stripPlaceholders = (text) => text.replace(PLACEHOLDER_REGEX, '');
const stripTermPlaceholders = (text) => text.replace(TERM_PLACEHOLDER_REGEX, '');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getProtectedTerms = () => {
    const names = Array.from(document.querySelectorAll('.username'))
        .map((node) => node.textContent?.trim())
        .filter(Boolean);
    return Array.from(new Set([...PROTECTED_TERMS, ...names])).sort((a, b) => b.length - a.length);
};

const protectTerms = (text) => {
    const placeholders = [];
    let protectedText = text;

    getProtectedTerms().forEach((term) => {
        const regex = new RegExp(escapeRegex(term), 'g');

        if (!regex.test(protectedText)) {
            return;
        }

        const placeholder = `${TERM_PLACEHOLDER_PREFIX}${placeholders.length}${TERM_PLACEHOLDER_SUFFIX}`;
        placeholders.push(term);
        protectedText = protectedText.replace(regex, placeholder);
    });

    return { text: protectedText, placeholders };
};

const restoreProtectedTerms = (text, placeholders) => {
    TERM_PLACEHOLDER_REGEX.lastIndex = 0;

    return text.replace(TERM_PLACEHOLDER_REGEX, (match, index) => {
        const term = placeholders[Number(index)];
        return term === undefined ? match : term;
    });
};

const buildNodesFromText = (text, placeholders) => {
    const nodes = [];
    let lastIndex = 0;
    let match;

    PLACEHOLDER_REGEX.lastIndex = 0;

    while ((match = PLACEHOLDER_REGEX.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        const placeholderIndex = Number(match[1]);
        const placeholderNode = placeholders[placeholderIndex];

        if (placeholderNode) {
            nodes.push(placeholderNode.cloneNode(true));
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        nodes.push(document.createTextNode(text.slice(lastIndex)));
    }

    return nodes;
};

const applyTextWithPlaceholders = (node, text, placeholders) => {
    const nodes = buildNodesFromText(text, placeholders);

    if (nodes.length === 0) {
        node.replaceChildren(document.createTextNode(text));
        return;
    }

    node.replaceChildren(...nodes);
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
            { type: 'translate', text, targetLanguage, format: 'text' },
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
    const strippedText = stripTermPlaceholders(
        stripPlaceholders(original.nodes.map((child) => child.textContent || '').join(''))
    ).trim();

    if (!strippedText) {
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
        const { text, placeholders } = buildTranslationPayload(original.nodes);
        const leadingWhitespace = text.match(/^\s+/)?.[0] ?? '';
        const trailingWhitespace = text.match(/\s+$/)?.[0] ?? '';
        const trimmedText = text.trim();
        const strippedTextContent = stripTermPlaceholders(stripPlaceholders(trimmedText)).trim();

        if (!strippedTextContent) {
            restoreOriginal(node);
            return;
        }

        const protectedPayload = protectTerms(trimmedText);
        const translatedText = await requestTranslation(
            protectedPayload.text,
            settings.targetLanguage
        );

        if (!translatedText) {
            restoreOriginal(node);
            return;
        }

        const placeholderMatches = Array.from(translatedText.matchAll(PLACEHOLDER_REGEX));
        const termMatches = Array.from(translatedText.matchAll(TERM_PLACEHOLDER_REGEX));

        if (
            placeholderMatches.length !== placeholders.length ||
            termMatches.length !== protectedPayload.placeholders.length
        ) {
            restoreOriginal(node);
            return;
        }

        const restoredText = restoreProtectedTerms(translatedText, protectedPayload.placeholders);
        node.dataset[TRANSLATION_LANGUAGE_ATTR] = settings.targetLanguage;
        applyTextWithPlaceholders(
            node,
            `${leadingWhitespace}${restoredText}${trailingWhitespace}`,
            placeholders
        );
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
