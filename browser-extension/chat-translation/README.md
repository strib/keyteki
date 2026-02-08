# Keyteki Chat Translator Extension

This Chrome extension translates in-game chat and the game log on Keyteki into a language you
choose.

## Load the extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.

## Configure translation

1. Open the extension’s **Details** page.
2. Click **Extension options**.
3. Choose a target language.
4. Choose a translation provider and supply any required API keys.

The default provider is LibreTranslate at `https://libretranslate.com/translate`, which requires an
API key from https://portal.libretranslate.com. If you host LibreTranslate yourself, point the
endpoint at your server instead. You can also switch to the Google Translate API by selecting it in
the options and providing a Google API key.

## Behavior

- Player chat messages and the in-game log are translated.
- Translated messages are updated live as new messages arrive.
