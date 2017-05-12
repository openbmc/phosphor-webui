/**
 * Controller for bmc-reboot
 *
 * @module app/overview
 * @exports bmcRebootController
 * @name bmcRebootController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('bmcRebootController', [
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            function($scope, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;
            }
        ]
    );

})(angular);
