const jf = require('jscodeshift');
const colors = require('colors');

const value = `
import React from 'react';
import { Button } from 'antd';
`;

const root = jf(value);

root
  .find(jf.ImportDeclaration, { source: { value: "antd" } })
  .forEach((path) => {
    console.log(colors.green(path.node.source.value));
  });

