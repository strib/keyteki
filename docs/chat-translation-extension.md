# Chat Translation Chrome Extension

This extension translates in-game chat messages on the Keyteki web client into a language of your choice.

## Features

- Translate player chat messages in real time.
- Automatically re-translate when you change languages.
- Configure the translation endpoint and optional API key.

## Loading the extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right).
3. Click **Load unpacked**.
4. Select the `browser-extension/chat-translation` folder in this repo.

The extension will now run on:

- `https://thecrucible.online/*`
- `https://*.thecrucible.online/*`
- `http://localhost:*/*`
- `http://127.0.0.1:*/*`

## Configure translation settings

1. In `chrome://extensions`, click **Details** on the “Keyteki Chat Translator” extension.
2. Click **Extension options**.
3. Choose your target language, and optionally set a custom translation endpoint or API key.

### Default translation service

The extension defaults to the LibreTranslate managed endpoint:

```
https://libretranslate.com/translate
```

The managed endpoint requires an API key from https://portal.libretranslate.com. If you host your
own translation server, replace the URL in the options page. The extension’s host permissions allow
any HTTPS endpoint so you can point it at your own API.

## Notes

- Only player chat messages are translated. System/game log messages are left unchanged.
- If the translation service is unavailable, the original chat text remains unchanged.

### Local development overrides

When testing on localhost, you can override the settings via query parameters:

```
http://localhost:8000/chat-translation-test.html?chatTranslationLanguage=es&chatTranslationEndpoint=http://localhost:5050/translate
```

These overrides are only honored on `localhost` and `127.0.0.1`.
