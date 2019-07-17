/**
 * Controller for user Accounts
 *
 * @module app/users
 * @exports userAccountsController
 * @name userAccountsController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.users').controller('userAccountsController', [
        '$scope', '$q', 'APIUtils', 'toastService', '$uibModal',
        function($scope, $q, APIUtils, toastService, $uibModal) {
          // $scope.users = [];
          // $scope.roles = [];
          // $scope.loading = true;
          // $scope.properties = {};
          // $scope.origProp = {};
          // $scope.submitted = false;

          $scope.loadError = false;
          $scope.tableModel = {};
          $scope.tableModel.header = ['Username', 'Privilege', 'Account status']
          $scope.tableModel.actions = ['Edit', 'Delete'];

          /**
           * Data table mapper
           * @param {*} user
           */
          const mapperTableData = (user) => {
            let accountStatus =
                user.Locked ? 'Locked' : user.Enabled ? 'Enabled' : 'Disabled';
            user.uiData = [user.UserName, user.RoleId, accountStatus];
            return user;
          };

          /**
           * Intiate remove user modal
           * @param {*} row
           */
          const initRemoveModal = (row) => {
            const template = require('./user-accounts-modal-remove.html');
            $uibModal
                .open({
                  template,
                  windowTopClass: 'uib-modal',
                  ariaLabelledBy: 'dialog_label',
                  controller: function() {
                    this.user = row.UserName;
                  },
                  controllerAs: 'modalCtrl'
                })
                .result
                .then(() => {
                  const isRoot = row.Id === 'root' ? true : false;
                  if (!isRoot) {
                    // API call to remove user
                  }
                })
                .catch(
                    () => {
                        // do nothing
                    })
          };

          const loadUserInfo = () => {
            $scope.loading = true;
            $scope.submitted = false;
            $scope.isUserSelected = false;
            $scope.selectedUser = {};
            $scope.togglePassword = false;
            $scope.toggleVerify = false;

            $q.all([
                APIUtils.getAllUserAccounts().then(function(res) {
                  $scope.users = res;
                  $scope.tableModel.data = res.map(mapperTableData);
                }),
                APIUtils.getAllUserAccountProperties().then(function(res) {
                  $scope.properties = res;
                  $scope.origProp = angular.copy($scope.properties);
                }),
                APIUtils.getAccountServiceRoles().then(function(res) {
                  $scope.roles = res;
                })
              ])
                .catch(function(error) {
                  console.log(error);
                  $scope.loadError = true;
                })
                .finally(function() {
                  $scope.loading = false;
                });
          };

          /**
           * Callback when action emitted from table
           * @param value
           */
          $scope.onEmitAction = (value) => {
            switch (value.action) {
              case 'Edit':
                $scope.initUserModal(value.row);
                break;
              case 'Delete':
                initRemoveModal(value.row);
                break;
              default:
            }
          };

          /**
           * Initiate user modal
           */
          $scope.initUserModal = (row) => {
            const template = require('./user-accounts-modal-user.html');
            $uibModal
                .open({
                  template,
                  windowTopClass: 'uib-modal',
                  ariaLabelledBy: 'dialog_label',
                  controller: function() {
                    // Set default status to Enabled
                    const status = !row ? 1 : row.Enabled ? 1 : 0;
                    // Check if UserName is root
                    const isRoot =
                        !row ? false : row.Id === 'root' ? true : false;
                    this.user = {};
                    this.user.isRoot = isRoot;
                    this.user.new = row ? false : true;
                    this.user.accountStatus = status;
                    this.user.userName = row ? row.UserName : '';
                    this.user.privilegeRoles = $scope.roles;
                    this.user.privilege = row ? row.RoleId : '';
                  },
                  controllerAs: 'modalCtrl'
                })
                .result
                .then(
                    (form) => {
                      if (form.$valid) {
                        // API call to add/edit user
                      }
                    })
                .catch(
                    () => {
                        // do nothing
                    })
          };

          /**
           * Initiate account settings modal
           */
          $scope.initAccountSettingsModal = () => {
            const template = require('./user-accounts-modal-settings.html');
            $uibModal
                .open({
                  template,
                  windowTopClass: 'uib-modal',
                  ariaLabelledBy: 'dialog_label',
                  scope: $scope,
                  controller: function($scope) {
                    const lockoutMethod =
                        $scope.properties.AccountLockoutDuration ? 1 : 0;
                    this.accountSettings = {};
                    this.accountSettings.maxLogin =
                        $scope.properties.AccountLockoutThreshold;
                    this.accountSettings.lockoutMethod = lockoutMethod;
                    this.accountSettings.timeoutDuration = !lockoutMethod ?
                        null :
                        $scope.properties.AccountLockoutDuration;
                  },
                  controllerAs: 'modalCtrl'
                })
                .result
                .then((form) => {
                  if (form.$valid) {
                    // API call to set account setting
                  }
                })
                .catch(
                    () => {
                        // do nothing
                    })
          };

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
          //                 'User account properties have been updated successfully');
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
          //         'Cannot create user. The maximum number of users that can be created is 15');
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

          loadUserInfo();
        }
      ]);
})(angular);
