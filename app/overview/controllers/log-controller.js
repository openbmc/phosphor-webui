/**
 * Controller for log
 *
 * @module app/overview
 * @exports logController
 * @name logController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.overview')
        .controller('logController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;
<<<<<<< HEAD

                $scope.dropdown_selected = false;
=======
>>>>>>> 4c1a3dd... Major update to code structure
            }
        ]
    );

})(angular);
