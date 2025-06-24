# Internationalization (i18n) in RestMan

This directory contains the internationalization (i18n) setup for the RestMan application, supporting English and Hebrew languages.

## Features

1. **Multi-language Support**
   - English (en) - Default
   - Hebrew (he)

2. **Automatic Language Detection**
   - Detects language based on device settings at startup
   - Dynamically detects language from user input in the chat
   - Automatically switches UI language based on detected input language

3. **RTL Support**
   - Proper right-to-left text rendering for Hebrew

4. **Language Persistence**
   - Language preferences are saved between app sessions
   - Uses AsyncStorage to persist language settings

5. **Language Toggle**
   - Simple UI component to switch between languages

## Implementation Details

### Directory Structure

- `i18n/` - Root internationalization directory
  - `index.ts` - Main configuration and initialization
  - `locales/` - Translation files
    - `en.json` - English translations
    - `he.json` - Hebrew translations

### Key Files

1. **index.ts**
   - Initializes i18next
   - Provides language detection functions
   - Manages language persistence

2. **Translation Files**
   - Structured JSON with nested translation keys
   - Organized by functional areas

3. **LanguageSwitcher.tsx**
   - UI component to toggle between languages

### Language Detection in Chat

The application includes a custom hook `useLanguageDetection` that:
- Detects if text contains Hebrew characters
- Can automatically switch the UI language based on input
- Properly aligns text based on detected language

### API Integration

The application sends the current language to the server with all API requests, allowing the backend to:
- Generate responses in the appropriate language
- Support language-specific analysis and processing

## Usage

1. **Translating Text**
   ```jsx
   import { useTranslation } from 'react-i18next';

   const Component = () => {
     const { t } = useTranslation();
     return <Text>{t('key.to.translate')}</Text>;
   };
   ```

2. **Adding Language Switcher**
   ```jsx
   import LanguageSwitcher from '../components/LanguageSwitcher';

   // Add to your component
   <LanguageSwitcher />
   ```

3. **Using Language Detection**
   ```jsx
   import { useLanguageDetection } from '../hooks/useLanguageDetection';

   const { isHebrew } = useLanguageDetection({ text: inputText });
   ```

## Adding New Languages

To add a new language:

1. Create a new translation file (e.g., `ar.json`) in the `locales` directory
2. Add the language to the resources in `i18n/index.ts`
3. Update any language detection logic if necessary 