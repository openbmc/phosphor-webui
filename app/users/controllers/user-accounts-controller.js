/**
 * Controller for user Accounts
 *
 * @module app/users
 * @exports userAccountsController
 * @name userAccountsController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.users')
        .controller('userAccountsController', [
            '$scope',
            '$window',
            'APIUtils',
            'dataService',
            function($scope, $window, APIUtils, dataService){
                $scope.dataService = dataService;
                $scope.changePassword = function(oldPassword, newPassword, confirmNewPassword){
                    if(!oldPassword || !newPassword || !confirmNewPassword ){
                        // TODO: Display error
                        return false;
                    }
                    if (newPassword !== confirmNewPassword){
                        // TODO: Display error
                        return false;
                    }
                    if (newPassword === oldPassword){
                        // TODO: Display error
                        return false;
                    }

                    // Verify the oldPassword is correct
                    APIUtils.testPassword($scope.dataService.getUser(), "0penBmc").then(function(state){
                        APIUtils.changePassword($scope.dataService.getUser(), newPassword).then(function(response){
                            // Clear the textboxes on a success
                            $scope.passwordVerify = '';
                            $scope.password = '';
                            $scope.oldPassword = '';
                        }, function(error){
                            // TODO: Display error
                        });
                    }, function(error){
                        // TODO: Display error
                    });
                }
            }
        ]
    );
})(angular);
