/**
 * Controller for firmware
 *
 * @module app/configuration
 * @exports firmwareController
 * @name firmwareController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.configuration')
        .controller('firmwareController', [
                '$scope',
                '$window',
                'APIUtils',
                'dataService',
                '$location',
                '$anchorScroll',
                function ($scope, $window, APIUtils, dataService, $location, $anchorScroll) {
                    $scope.dataService = dataService;

                    //Scroll to target anchor
                    $scope.gotoAnchor = function () {
                        $location.hash('upload');
                        $anchorScroll();
                    };
                }
            ]
        );

})(angular);
