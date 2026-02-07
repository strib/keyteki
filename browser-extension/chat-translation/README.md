# Keyteki Chat Translator Extension

This Chrome extension translates in-game chat messages on Keyteki into a language you choose.

## Load the extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.

## Configure translation

1. Open the extension’s **Details** page.
2. Click **Extension options**.
3. Choose a target language.
4. Set the translation API endpoint and (optional) API key.

The default endpoint is `https://libretranslate.com/translate`, which requires an API key from
https://portal.libretranslate.com. If you host LibreTranslate yourself, point the endpoint at your
server instead.

## Behavior

- Only player chat messages are translated.
- System/game log messages are left unchanged.
- Translated messages are updated live as new chat messages arrive.
