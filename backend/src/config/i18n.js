const i18n = require('i18n');
const path = require('path');

const initI18n = (app) => {
  i18n.configure({
    locales: ['en', 'es', 'fr', 'de', 'hi', 'zh'],
    defaultLocale: 'en',
    directory: path.join(__dirname, '../locales'),
    cookie: 'language',
    queryParameter: 'lang',
    autoReload: true,
    updateFiles: false,
    syncFiles: false,
    objectNotation: true,
    api: {
      __: 't',
      __n: 'tn'
    }
  });

  app.use(i18n.init);
};

module.exports = { initI18n, i18n };
