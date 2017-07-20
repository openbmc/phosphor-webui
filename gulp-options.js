/*eslint-env node */
/*global module: true, __dirname: true */

'use strict';

module.exports = {
    'targetFolderPath': './target',
    'srcFolderPath': './app',
    'tempFolderPath': __dirname + '/.temp',
    'nodeModulesFolderPath': './node_modules',
<<<<<<< HEAD
	'bowerFolderPath': __dirname + '/bower_components',
=======
	'bowerFolderPath': './app/bower_components',
>>>>>>> 4c1a3dd... Major update to code structure
    'dirname': __dirname,
    'excludePath': '!./app/vendors/**/*'
};
