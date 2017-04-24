/*eslint-env node */
/*global module: true, __dirname: true */

'use strict';

module.exports = {
    'targetFolderPath': './target',
    'srcFolderPath': './app',
    'tempFolderPath': __dirname + '/.temp',
    'nodeModulesFolderPath': './node_modules',
	'bowerFolderPath': __dirname + '/bower_components',
    'dirname': __dirname,
    'excludePath': '!./app/vendors/**/*'
};
