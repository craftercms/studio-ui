// translationRunner.js
const manageTranslations = require('react-intl-translations-manager').default;

// es2015 import
// import manageTranslations from 'react-intl-translations-manager';
manageTranslations({
  messagesDirectory: './src/translations/src',
  translationsDirectory: './src/translations/locales/',
  whitelistsDirectory: './src/translations/whitelists',
  languages: ['en', 'es', 'de', 'kr', 'fr']
});
