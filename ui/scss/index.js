const fs = require('fs');
const sass = require('node-sass');

const OUT_DIR = '../css';
const FILES = [
  'temp',
  { input: 'user-dashboard/user-dashboard', output: 'main' },
  'search'
];

FILES.forEach((data) => {
  let input, output;
  if (typeof data === 'string') {
    input = output = data;
  } else {
    input = data.input;
    output = data.output;
  }
  sass.render({
    file: `./${input}.scss`,
    outputStyle: 'compressed'
  }, function (error, result) {
    if (!error) {
      write({ file: output, content: result.css });
    } else {
      console.log(`Error compiling ${input}.scss`, error);
    }
  });
});

function write({ file, content }) {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
  }
  fs.writeFile(`${OUT_DIR}/${file}.css`, content, function (error) {
    if (!error) {
      console.log(`${file}.css wrote.`);
    } else {
      console.log(`Error writing ${file}.css`);
      console.log(error);
    }
  });
}
