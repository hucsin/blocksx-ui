'use strict';

const compile = require('./compile');
const path = require('path');

compile('src/components', path.resolve(__dirname, '../'), false);
//compile('src/components', true);