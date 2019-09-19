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
      return {
        login: function(username, password, callback) {
          APIUtils.login(username, password, function(response, error) {
            if (response &&
                (response.status == 201 || response.status === undefined)) {
              const responseHeader = response.headers();
              const xsrfToken = responseHeader['x-auth-token'];
              sessionStorage.setItem('LOGIN_ID', username);
              sessionStorage.setItem('SESSION_ID', response.data.Id);
              sessionStorage.setItem('X-AUTH-TOKEN', xsrfToken);
              callback(true);
            } else if (
                response && response.data && response.data.data &&
                response.data.data.description) {
              callback(false, response.data.data.description);
            } else if (response && response.statusText) {
              callback(false, response.statusText);
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
          APIUtils.logout(
              sessionStorage.getItem('SESSION_ID'), function(response, error) {
                if (response) {
                  sessionStorage.removeItem('LOGIN_ID');
                  sessionStorage.removeItem('SESSION_ID');
                  sessionStorage.removeItem('X-AUTH-TOKEN');
                  sessionStorage.removeItem(APIUtils.HOST_SESSION_STORAGE_KEY);
                  callback(true);
                } else {
                  callback(false, error);
                }
              });
        }
      };
    }
  ]);
})(window.angular);
