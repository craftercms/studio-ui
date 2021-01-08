const fs = require('fs'),
  sass = require('node-sass'),
  OUT_DIR = '../../static-assets/styles',
  FILES = [
    'temp',
    'forms-engine',
    { input: 'user-dashboard/user-dashboard', output: 'main' },
    'search',
    'graphiql',
    'uppy',
    'tinymce-ace',
    'browse',
    { input: 'guest/guest', output: 'guest' },
    { input: 'global', output: '../themes/cstudioTheme/css/global' },
    { input: 'base', output: '../themes/cstudioTheme/base' },
    'fonts'
  ];

function processFile(data) {
  let input, output;
  if (typeof data === 'string') {
    input = output = data;
  } else {
    input = data.input;
    output = data.output;
  }
  sass.render(
    {
      file: `./${input}.scss`,
      outputStyle: 'compressed'
    },
    function (error, result) {
      if (!error) {
        write({ file: output, content: result.css.toString() });
      } else {
        console.log(`Error compiling ${input}.scss`, error);
      }
    }
  );
}

function write({ file, content }) {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
  }

  const regExp = /\/\*[^*]*\*+([^\/][^*]*)(Crafter Software)[^*]*\*+([^\/][^*]*\*+)*\//g,
    copyright = content.match(regExp),
    withoutCopyrights = content.replace(regExp, '').replace(String.fromCharCode(65279), ''),
    css = copyright ? `${copyright[0]}\n\n${withoutCopyrights}` : content;

  fs.writeFile(`${OUT_DIR}/${file}.css`, css, function (error) {
    if (!error) {
      console.log(`${file}.css wrote.`);
    } else {
      console.log(`Error writing ${file}.css`);
      console.log(error);
    }
  });
}

module.exports = { processFile, write, FILES, OUT_DIR };
