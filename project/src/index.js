#! /usr/bin/env node

const { program } = require('commander');
const { resolve } = require("path");
const { sync } = require("globby");
const jscodeshift = require('jscodeshift');
const { readFileSync, writeFileSync } = require('fs');

program.version('0.0.1').option('-o, --out <path>', 'output root path');

program.on('--help', () => {
  console.log(`
  You can add the following commands to npm scripts:
 ------------------------------------------------------
  "compile": "tscss -o dist"
 ------------------------------------------------------
`);
});

program.parse(process.argv);

const { out } = program.opts();

if (!out) {
  throw new Error('--out must be specified');
}

const outRoot = resolve(process.cwd(), out);

console.log(`tscss --out ${outRoot}`);

// Read output files
const files = sync(`${outRoot}/**/!(*.d).{ts,tsx,js,jsx}`, {
    dot: true,
  }).map((x) => resolve(x));

console.log(files);

const filesLen = files.length;

function transToSCSS(str) {
    const jf = jscodeshift;
    const root = jf(str);
    root.find(jf.ImportDeclaration).forEach((path) => {
      let value = '';
      if (path && path.node && path.node.source) {
        value = path.node.source.value;
      }
      const regex = /(styl|scss|css|less)('|"|`)?$/i;
      if (value && regex.test(value.toString())) {
        path.node.source.value = value
          .toString()
          .replace(regex, (_res, $1, $2) => ($2 ? `scss${$2}` : 'scss'));
      }
    });
  
    return root.toSource();
}
  
for (let i = 0; i < filesLen; i += 1) {
  const file = files[i];
  const content = readFileSync(file, 'utf-8');
  const resContent = transToSCSS(content);
  writeFileSync(file, resContent, 'utf8');
}



