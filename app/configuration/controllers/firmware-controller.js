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

                    //Check if window has scroll
                    $scope.hasVScroll = document.body.scrollHeight > document.body.clientHeight;
                    $scope.link = document.getElementsByClassName("btn-upload");
                    $scope.appWindow = angular.element($window);

                    //Hide/Show anchor link if window has scroll
                    if ($scope.hasVScroll == true) {
                        $scope.link[0].style.display = 'block';
                    } else {
                        $scope.link[0].style.display = 'none';
                    }

                    //Scroll to target anchor
                    $scope.gotoAnchor = function () {
                        $location.hash('upload');
                        $anchorScroll();
                    };
                }
            ]
        );

})(angular);
