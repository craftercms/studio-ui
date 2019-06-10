const
  fs = require('fs'),
  ncp = require('ncp').ncp,
  rimraf = require('rimraf'),

  APP_DIR = __dirname,
  PATH_BUILD = `${APP_DIR}/build`,
  TEMPLATES = `../../templates`,
  DEST = `../../static-assets/next`,

  REQUIRE_JS_SCRIPT = '<script src="/studio/static-assets/libs/requirejs/require.js"></script>',
  PLACEHOLDER = '<script id="_placeholderscript_"></script>',

  indexContents = fs.readFileSync(`${PATH_BUILD}/index.html`).toString(),
  position = indexContents.indexOf(PLACEHOLDER),

  templateScripts = indexContents
    .substr(position + PLACEHOLDER.length)
    .replace(/\<\/(body|html)>/gi, '')
    .replace(/<\/script>/gi, '<\/script>\n')
;

console.log(`Updating script imports`);
fs.writeFileSync(
  `${TEMPLATES}/web/common/js-next-scripts.ftl`,
  `${REQUIRE_JS_SCRIPT}\n${templateScripts}`);

rimraf.sync(`${DEST}/*`);

console.log(`Copying build files to ${DEST}/static`)
ncp(`${PATH_BUILD}/static`, `${DEST}/static`, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log('Done!');
});
