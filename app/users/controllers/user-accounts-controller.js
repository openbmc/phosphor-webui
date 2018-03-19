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
                $scope.error = false;
                $scope.success = false;
                $scope.errorMsg = "";

                $scope.changePassword = function(oldPassword, newPassword, confirmNewPassword){
                    var user = $scope.dataService.getUser();
                    if(!oldPassword || !newPassword || !confirmNewPassword ){
                        $scope.error = true;
                        $scope.errorMsg = "Field is required!";
                        return false;
                    }
                    if (newPassword !== confirmNewPassword){
                        $scope.error = true;
                        $scope.errorMsg = "New passwords do not match!";
                        return false;
                    }
                    if (newPassword === oldPassword){
                        $scope.error = true;
                        $scope.errorMsg = "New password and old password match!";
                        return false;
                    }

                    // Verify the oldPassword is correct
                    APIUtils.testPassword(user, oldPassword).then(function(state){
                        APIUtils.changePassword(user, newPassword).then(function(response){
                            // Clear the textboxes on a success
                            $scope.passwordVerify = '';
                            $scope.password = '';
                            $scope.oldPassword = '';
                            // encase the previous try was an error
                            $scope.error = false;
                            $scope.success = true;
                        }, function(error){
                            $scope.error = true;
                            $scope.errorMsg = "Error changing password!";
                        });
                    }, function(error){
                        $scope.error = true;
                        $scope.errorMsg = "Old password is not correct!";
                    });
                }
            }
        ]
    );
})(angular);
