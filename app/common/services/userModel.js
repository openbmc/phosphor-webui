/**
 * userModel
 *
 * @module app/common/services/userModel
 * @exports userModel
 * @name userModel

 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.services').service('userModel', [
    'APIUtils',
    function(APIUtils) {
      // unsure if this is the best practice to store the login id
      var loginId;
      return {
        login: function(username, password, callback) {
          APIUtils.loginRedfish(username, password, function(response, error) {
            if (response &&
                (response.status == 201 || response.status === undefined)) {
              loginId = response.data.Id;
              sessionStorage.setItem('LOGIN_ID', username);
              callback(true);
            } else if (error) {
              callback(false, 'Server unreachable');
            } else {
              callback(false, 'Internal error');
            }
          });
        },
        isLoggedIn: function() {
          if (sessionStorage.getItem('LOGIN_ID') === null) {
            return false;
          }
          return true;
        },
        logout: function(callback) {
          APIUtils.logoutRedfish(loginId, function(response, error) {
            if (response &&
                response.status == APIUtils.API_RESPONSE.SUCCESS_STATUS) {
              sessionStorage.removeItem('LOGIN_ID');
              sessionStorage.removeItem(APIUtils.HOST_SESSION_STORAGE_KEY);
              callback(true);
            } else if (response.status == APIUtils.API_RESPONSE.ERROR_STATUS) {
              callback(false);
            } else {
              callback(false, error);
            }
          });
        }
      };
    }
  ]);
})(window.angular);
