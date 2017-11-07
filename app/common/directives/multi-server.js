window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('multiServer', function () {
            return {
                'restrict': 'E',
                'template': require('./multi-server.html')
            };
        });

})(window.angular);
