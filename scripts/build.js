'use strict';

const compile = require('./compile');
const path = require('path');

compile('src/components', path.resolve(__dirname, '../'), true);
//compile('src/components', true);