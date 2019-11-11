const manageTranslations = require('react-intl-translations-manager').default;

manageTranslations({
  messagesDirectory: './src/translations/src',
  translationsDirectory: './public/locales/',
  whitelistsDirectory: './src/translations/whitelists',
  languages: ['en', 'es', 'de', 'ko', 'fr']
});
