/**
 * Controller for user Accounts
 *
 * @module app/users
 * @exports userAccountsController
 * @name userAccountsController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.users')
  .directive('usernameValidator', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, controller) {
        console.log('usernameValidator')
      }
    }
  })
  .controller('userAccountsController', [
    '$scope', 'APIUtils', 'toastService', '$uibModal',
    function($scope, APIUtils, toastService, $uibModal) {
      $scope.loading;
      $scope.accountSettings;
      $scope.userRoles;
      $scope.localUsers;

      $scope.tableModel = {};
      $scope.tableModel.data = [];
      $scope.tableModel.header = ['Username', 'Privilege', 'Account status']
      $scope.tableModel.actions = ['Edit', 'Delete'];

      /**
       * Data table mapper
       * @param {*} user
       */
      function mapTableData(user) {
        let accountStatus =
            user.Locked ? 'Locked' : user.Enabled ? 'Enabled' : 'Disabled';
        user.uiData = [user.UserName, user.RoleId, accountStatus];
        return user;
      }

      /**
       * API call to get all user accounts
       */
      function getLocalUsers() {
        $scope.loading = true;
        APIUtils.getAllUserAccounts()
            .then((users) => {
              $scope.localUsers = users;
              $scope.tableModel.data = users.map(mapTableData);
            })
            .catch((error) => {
              console.log(error);
              toastService.error('Failed to load users.');
            })
            .finally(() => {
              $scope.loading = false;
            })
      }

      /**
       * API call to get current Account settings
       * @returns {Promise} : request Promise
       */
      function getAccountSettings() {
        return APIUtils.getAllUserAccountProperties()
            .then((settings) => {
              $scope.accountSettings = settings;
            })
            .catch((error) => {
              console.log(error);
              toastService.error('Failed to load account policy settings.');
            })
      }

      /**
       * API call to get local user roles
       */
      function getUserRoles() {
        APIUtils.getAccountServiceRoles()
            .then((roles) => {
              $scope.userRoles = roles;
            })
            .catch((error) => {
              console.log(error);
              $scope.userRoles = null;
            })
      }

      /**
       * API call to create new user
       * @param {*} user
       */
      function createUser(username, password, role, enabled) {
        APIUtils.createUser(username, password, role, enabled)
            .then(() => {
              getLocalUsers();
              toastService.success(`User '${username}' has been created.`);
            })
            .catch((error) => {
              console.log(error);
              toastService.error(`Failed to create new user '${username}'.`);
            })
            .finally(() => {
              $scope.loading = false;
            });
      }

      /**
       * API call to update existing user
       */
      function updateUser() {}

      /**
       * API call to delete user
       * @param {*} username
       */
      function deleteUser(username) {
        $scope.loading = true;
        APIUtils.deleteUser(username)
            .then(() => {
              // TODO: Remove user from data table
              toastService.success(`User '${username}' has been deleted.`);
            })
            .catch((error) => {
              console.log(error);
              toastService.error(`Failed to delete user '${username}'.`);
            })
            .finally(() => {
              $scope.loading = false;
            });
      }

      /**
       * API call to save account policy settings
       * @param {number} lockoutDuration
       * @param {number} lockoutThreshold
       */
      function updateAccountSettings(lockoutDuration, lockoutThreshold) {
        $scope.loading = true;
        APIUtils.saveUserAccountProperties(lockoutDuration, lockoutThreshold)
            .then(() => {
              toastService.success(
                  'Account policy settings have been updated.');
            })
            .catch((error) => {
              console.log(error);
              toastService.error('Failed to update account policy settings.');
            })
            .finally(() => {
              $scope.loading = false;
            });
      }

      /**
       * Initiate account settings modal
       */
      function initAccountSettingsModal() {
        const template = require('./user-accounts-modal-settings.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controller: function() {
                // If AccountLockoutDuration is not 0 the lockout
                // method is automatic. If AccountLockoutDuration is 0 the
                // lockout method is manual
                const lockoutMethod =
                    $scope.accountSettings.AccountLockoutDuration ? 1 : 0;
                this.settings = {};
                this.settings.maxLogin =
                    $scope.accountSettings.AccountLockoutThreshold;
                this.settings.lockoutMethod = lockoutMethod;
                this.settings.timeoutDuration = !lockoutMethod ?
                    null :
                    $scope.accountSettings.AccountLockoutDuration;
              },
              controllerAs: 'modalCtrl'
            })
            .result
            .then((form) => {
              if (form.$valid) {
                if(form.$pristine) {
                  toastService.success('Changes saved.')
                  return;
                }
                const lockoutDuration = form.lockoutMethod1.$modelValue ?
                    0 :
                    form.timeoutDuration.$modelValue;
                const lockoutThreshold = form.maxLogin.$modelValue;
                updateAccountSettings(lockoutDuration, lockoutThreshold);
              }
            })
            .catch(
                () => {
                    // do nothing
                })
      }

      /**
       * Initiate user modal
       * Can be triggered by clicking edit in table or 'Add user' button
       * If triggered from the table, user parameter will be provided
       * If triggered by add user button, user parameter will be undefined
       * @optional @param {*} user
       */
      function initUserModal(user) {
        if ($scope.userRoles === null) {
          // If userRoles failed to load,  do not allow add/edit functionality
          return;
        }
        const newUser = user ? false : true;
        const template = require('./user-accounts-modal-user.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controller: function() {
                // Set default status to Enabled
                const status = newUser ? 1 : user.Enabled ? 1 : 0;
                // Check if UserName is root
                const isRoot =
                    newUser ? false : user.Id === 'root' ? true : false;

                this.user = {};
                this.user.isRoot = isRoot;
                this.user.new = newUser;
                this.user.accountStatus = status;
                this.user.username = newUser ? '' : user.UserName;
                this.user.privilegeRoles = $scope.userRoles;
                this.user.privilege = newUser ? '' : user.RoleId;
              },
              controllerAs: 'modalCtrl'
            })
            .result
            .then((form) => {
              if (form.$valid) {
                if(form.$pristine) {
                  toastService.success('Changes saved.')
                  return;
                }
                if (!newUser) {
                  // updateUser()
                } else {
                  const username = form.username.$modelValue;
                  const password = form.password.$modelValue;
                  const role = form.privilege.$modelValue;
                  const enabled =
                      form.accountStatus1.$modelValue ? true : false;
                  createUser(username, password, role, enabled);
                }
              }
            })
            .catch(
                () => {
                    // do nothing
                })
      }

      /**
       * Intiate remove user modal
       * @param {*} user
       */
      function initRemoveModal(user) {
        const template = require('./user-accounts-modal-remove.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controller: function() {
                this.user = user.UserName;
              },
              controllerAs: 'modalCtrl'
            })
            .result
            .then(() => {
              const isRoot = user.UserName === 'root' ? true : false;
              if (isRoot) {
                toastService.error(`Cannot delete 'root' user.`)
                return;
              }
              deleteUser(user.UserName);
            })
            .catch(
                () => {
                    // do nothing
                })
      }

      /**
       * Callback when action emitted from table
       * @param {*} value
       */
      $scope.onEmitAction = (value) => {
        switch (value.action) {
          case 'Edit':
            initUserModal(value.row);
            break;
          case 'Delete':
            initRemoveModal(value.row);
            break;
          default:
        }
      };

      /**
       * Callback when 'Account settings policy' button clicked
       */
      $scope.onClickAccountSettingsPolicy = () => {
        getAccountSettings().then(() => {
          initAccountSettingsModal();
        })
      };

      /**
       * Callback when 'Add user' button clicked
       */
      $scope.onClickAddUser = () => {
        initUserModal();
      };

      $scope.$on('$viewContentLoaded', () => {
        getLocalUsers();
        getUserRoles();
      })

      // $scope.cancel = function() {
      //   loadUserInfo();
      // };

      // $scope.saveAllValues = function() {
      //   $scope.loading = true;
      //   var data = {};
      //   if ($scope.properties.AccountLockoutDuration !=
      //       $scope.origProp.AccountLockoutDuration) {
      //     data['AccountLockoutDuration'] =
      //         $scope.properties.AccountLockoutDuration;
      //   }
      //   if ($scope.properties.AccountLockoutThreshold !=
      //       $scope.origProp.AccountLockoutThreshold) {
      //     data['AccountLockoutThreshold'] =
      //         $scope.properties.AccountLockoutThreshold;
      //   }

      //   if ($scope.properties.AccountLockoutDuration ==
      //           $scope.origProp.AccountLockoutDuration &&
      //       $scope.properties.AccountLockoutThreshold ==
      //           $scope.origProp.AccountLockoutThreshold) {
      //     // No change in properties, just return;
      //     $scope.loading = false;
      //     return;
      //   }

      //   APIUtils
      //       .saveUserAccountProperties(
      //           data['AccountLockoutDuration'],
      //           data['AccountLockoutThreshold'])
      //       .then(
      //           function(response) {
      //             toastService.success(
      //                 'User account properties have been updated
      //                 successfully');
      //           },
      //           function(error) {
      //             toastService.error('Unable to update account properties');
      //           })
      //       .finally(function() {
      //         loadUserInfo();
      //         $scope.loading = false;
      //       });
      // };

      // $scope.setSelectedUser = function(user) {
      //   $scope.isUserSelected = true;
      //   $scope.selectedUser = angular.copy(user);
      //   $scope.selectedUser.VerifyPassword = null;
      //   // Used while renaming the user.
      //   $scope.selectedUser.CurrentUserName = $scope.selectedUser.UserName;
      // };
      // $scope.createNewUser = function() {
      //   if ($scope.users.length >= 15) {
      //     toastService.error(
      //         'Cannot create user. The maximum number of users that can be
      //         created is 15');
      //     return;
      //   }
      //   if (!$scope.selectedUser.UserName ||
      //       !$scope.selectedUser.Password) {
      //     toastService.error('Username or password cannot be empty');
      //     return;
      //   }
      //   if ($scope.selectedUser.Password !==
      //       $scope.selectedUser.VerifyPassword) {
      //     toastService.error('Passwords do not match');
      //     return;
      //   }
      //   if ($scope.doesUserExist()) {
      //     toastService.error('Username already exists');
      //     return;
      //   }
      //   var user = $scope.selectedUser.UserName;
      //   var passwd = $scope.selectedUser.Password;
      //   var role = $scope.selectedUser.RoleId;
      //   var enabled = false;
      //   if ($scope.selectedUser.Enabled != null) {
      //     enabled = $scope.selectedUser.Enabled;
      //   }

      //   $scope.loading = true;
      //   APIUtils.createUser(user, passwd, role, enabled)
      //       .then(
      //           function(response) {
      //             toastService.success(
      //                 'User has been created successfully');
      //           },
      //           function(error) {
      //             toastService.error('Failed to create new user');
      //           })
      //       .finally(function() {
      //         loadUserInfo();
      //         $scope.loading = false;
      //       });
      // };
      // $scope.updateUserInfo = function() {
      //   if ($scope.selectedUser.Password !==
      //       $scope.selectedUser.VerifyPassword) {
      //     toastService.error('Passwords do not match');
      //     return;
      //   }
      //   if ($scope.doesUserExist()) {
      //     toastService.error('Username already exists');
      //     return;
      //   }
      //   var data = {};
      //   if ($scope.selectedUser.UserName !==
      //       $scope.selectedUser.CurrentUserName) {
      //     data['UserName'] = $scope.selectedUser.UserName;
      //   }
      //   $scope.selectedUser.VerifyPassword = null;
      //   if ($scope.selectedUser.Password != null) {
      //     data['Password'] = $scope.selectedUser.Password;
      //   }
      //   data['RoleId'] = $scope.selectedUser.RoleId;
      //   data['Enabled'] = $scope.selectedUser.Enabled;

      //   $scope.loading = true;
      //   APIUtils
      //       .updateUser(
      //           $scope.selectedUser.CurrentUserName, data['UserName'],
      //           data['Password'], data['RoleId'], data['Enabled'])
      //       .then(
      //           function(response) {
      //             toastService.success(
      //                 'User has been updated successfully');
      //           },
      //           function(error) {
      //             toastService.error('Unable to update user');
      //           })
      //       .finally(function() {
      //         loadUserInfo();
      //         $scope.loading = false;
      //       });
      // };
      // $scope.deleteUser = function(userName) {
      //   $scope.loading = true;
      //   APIUtils.deleteUser(userName)
      //       .then(
      //           function(response) {
      //             toastService.success(
      //                 'User has been deleted successfully');
      //           },
      //           function(error) {
      //             toastService.error('Unable to delete user');
      //           })
      //       .finally(function() {
      //         loadUserInfo();
      //         $scope.loading = false;
      //       });
      // };

      // $scope.doesUserExist = function() {
      //   for (var i in $scope.users) {
      //     // If a user exists with the same user name and a different Id
      //     // then the username already exists and isn't valid
      //     if (($scope.users[i].UserName === $scope.selectedUser.UserName) &&
      //         ($scope.users[i].Id !== $scope.selectedUser.Id)) {
      //       return true;
      //     }
      //   }
      // };
    }
  ]);
})(angular);
