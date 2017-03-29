window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.directives')
        .directive('paginate', function () {
            return {
                'restrict': 'E',
                'templateUrl': 'common/directives/paginate.html',
                'scope': {
                    'path': '='
                },
                'controller': ['$scope',function($scope){

                }]
            };
        }]);
})(window.angular);
