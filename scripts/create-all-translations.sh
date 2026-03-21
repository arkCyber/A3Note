#!/bin/bash

# Script to create all translation files for 24 languages
# This creates a complete translation structure for all languages

echo "🌍 Creating translation files for all 24 languages..."

# Define the base directory
BASE_DIR="src/i18n/locales"

# Language codes (excluding already created: zh-CN, en-US, ja-JP)
LANGUAGES=(
  "ko-KR" "zh-TW" "th-TH" "vi-VN" "id-ID" "ms-MY" "hi-IN"
  "fr-FR" "de-DE" "es-ES" "it-IT" "pt-BR" "ru-RU" "pl-PL"
  "nl-NL" "sv-SE" "tr-TR" "ar-SA" "he-IL" "fa-IR" "uk-UA"
)

# File templates
FILES=("common.json" "toolbar.json" "sidebar.json" "settings.json" "commandPalette.json" "statusBar.json" "welcome.json" "messages.json" "index.ts")

echo "Creating ${#LANGUAGES[@]} language directories with ${#FILES[@]} files each..."

for lang in "${LANGUAGES[@]}"; do
  echo "  Creating $lang..."
  mkdir -p "$BASE_DIR/$lang"
done

echo "✅ All language directories created!"
echo "📝 Next: Use Node.js script to populate translation files"
