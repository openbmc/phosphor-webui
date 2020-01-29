/**
 * Controller for the login page
 *
 * @module app/profile-settings/controllers/index
 * @exports ProfileSettingsController
 * @name ProfileSettingsController
 */

window.angular && (function (angular) {
  'use strict';

  angular.module('app.profileSettings').controller('profileSettingsController', [
    '$scope',
    'APIUtils',
    'dataService',
    'toastService',
    function ($scope, APIUtils, dataService, toastService) {
      $scope.username = dataService.getUser();
      $scope.minPasswordLength = 8; //TODO: dynamic value
      $scope.maxPasswordLength = 12; //TODO: dynamic value

      $scope.password;
      $scope.passwordConfirm;

      /**
       * Make API call to update user password
       * @param {string} password
       */
      const updatePassword = function (password) {
        $scope.loading = true;
        APIUtils
          .updateUser($scope.username, null, password)
          .then(() => toastService.success('Password has been updated successfully.'))
          .catch((error) => {
            console.log(JSON.stringify(error));
            toastService.error('Unable to update password.')
          })
          .finally(() => {
            $scope.password = '';
            $scope.passwordConfirm = '';
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
            $scope.loading = false;
          })
      };

      $scope.onSubmit = function(form) {
        if(form.$valid) {
          const password = form.password.$viewValue;
          updatePassword(password);
        }
      };
    }
  ]);
})(angular);
