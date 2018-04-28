/**
 * Controller for user Accounts
 *
 * @module app/users
 * @exports userAccountsController
 * @name userAccountsController
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
                $scope.state = "none";
                $scope.errorMsg = "";

                $scope.changePassword = function(oldPassword, newPassword, confirmNewPassword){
                    var user = $scope.dataService.getUser();
                    if(!oldPassword || !newPassword || !confirmNewPassword ){
                        $scope.state = "error";
                        $scope.errorMsg = "Field is required!";
                        return false;
                    }
                    if (newPassword !== confirmNewPassword){
                        $scope.state = "error";
                        $scope.errorMsg = "New passwords do not match!";
                        return false;
                    }
                    if (newPassword === oldPassword){
                        $scope.state = "error";
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
                            $scope.state = "success";
                        }, function(error){
                            $scope.state = "error";
                            $scope.errorMsg = "Error changing password!";
                        });
                    }, function(error){
                        $scope.state = "error";
                        $scope.errorMsg = "Old password is not correct!";
                    });
                }
            }
        ]
    );
})(angular);
