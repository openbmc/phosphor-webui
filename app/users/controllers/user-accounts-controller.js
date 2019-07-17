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
              console.log(JSON.stringify(error));
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
        APIUtils.getAllUserAccountProperties()
            .then((settings) => {
              $scope.accountSettings = settings;
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              $scope.accountSettings = null;
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
              console.log(JSON.stringify(error));
              $scope.userRoles = null;
            })
      }

      /**
       * API call to create new user
       * @param {*} user
       */
      function createUser(username, password, role, enabled) {
        $scope.loading = true;
        APIUtils.createUser(username, password, role, enabled)
            .then(() => {
              getLocalUsers();
              toastService.success(`User '${username}' has been created.`);
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              toastService.error(`Failed to create new user '${username}'.`);
            })
            .finally(() => {
              $scope.loading = false;
            });
      }

      /**
       * API call to update existing user
       */
      function updateUser(originalUsername, username, password, role, enabled) {
        $scope.loading = true;
        APIUtils.updateUser(originalUsername, username, password, role, enabled)
            .then(() => {
              getLocalUsers();
              toastService.success('User has been updated successfully.')
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
              toastService.error(`Unable to update user '${originalUsername}'.`)
            })
            .finally(() => {
              $scope.loading = false;
            })
      }

      /**
       * API call to delete user
       * @param {*} username
       */
      function deleteUser(username) {
        $scope.loading = true;
        APIUtils.deleteUser(username)
            .then(() => {
              getLocalUsers();
              toastService.success(`User '${username}' has been deleted.`);
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
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
              $scope.accountSettings['AccountLockoutDuration'] =
                  lockoutDuration;
              $scope.accountSettings['AccountLockoutThreshold'] =
                  lockoutThreshold;
              toastService.success(
                  'Account policy settings have been updated.');
            })
            .catch((error) => {
              console.log(JSON.stringify(error));
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
              controllerAs: 'modalCtrl',
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
              }
            })
            .result
            .then((form) => {
              if (form.$valid) {
                const lockoutDuration = form.lockoutMethod1.$modelValue ?
                    form.timeoutDuration.$modelValue :
                    0;
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
        if ($scope.userRoles === null || $scope.userRoles === undefined) {
          // If userRoles failed to load,  do not allow add/edit
          // functionality
          return;
        }
        const newUser = user ? false : true;
        const originalUsername = user ? angular.copy(user.UserName) : null;
        const template = require('./user-accounts-modal-user.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controllerAs: 'modalCtrl',
              controller: function() {
                // Set default status to Enabled
                const status = newUser ? 1 : user.Enabled ? 1 : 0;
                // Check if UserName is root
                const isRoot =
                    newUser ? false : user.UserName === 'root' ? true : false;
                // Array of existing usernames (excluding current user instance)
                const existingUsernames =
                    $scope.localUsers.reduce((acc, val) => {
                      if (user && (val.UserName === user.UserName)) {
                        return acc;
                      }
                      acc.push(val.UserName);
                      return acc;
                    }, []);

                this.user = {};
                this.user.isRoot = isRoot;
                this.user.new = newUser;
                this.user.accountStatus = status;
                this.user.username = newUser ? '' : user.UserName;
                this.user.privilege = newUser ? '' : user.RoleId;

                this.privilegeRoles = $scope.userRoles;
                this.existingUsernames = existingUsernames;
                this.minPasswordLength = $scope.accountSettings ?
                    $scope.accountSettings.MinPasswordLength :
                    null;
                this.maxPasswordLength = $scope.accountSettings ?
                    $scope.accountSettings.MaxPasswordLength :
                    null;
              }
            })
            .result
            .then((form) => {
              if (form.$valid) {
                // If form control is pristine set property to null
                // this will make sure only changed values are updated when
                // modifying existing users
                // API utils checks for null values
                const username =
                    form.username.$pristine ? null : form.username.$modelValue;
                const password =
                    form.password.$pristine ? null : form.password.$modelValue;
                const role = form.privilege.$pristine ?
                    null :
                    form.privilege.$modelValue;
                const enabledControllerPristine =
                    (form.accountStatus1.$pristine &&
                     form.accountStatus0.$pristine);
                const enabled = form.accountStatus1.$modelValue ? true : false;
                if (!newUser) {
                  updateUser(
                      originalUsername, username, password, role,
                      enabledControllerPristine ? null : enabled);
                } else {
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
              controllerAs: 'modalCtrl',
              controller: function() {
                this.user = user.UserName;
              }
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
        initAccountSettingsModal();
      };

      /**
       * Callback when 'Add user' button clicked
       */
      $scope.onClickAddUser = () => {
        initUserModal();
      };

      /**
       * Callback when controller view initially loaded
       */
      $scope.$on('$viewContentLoaded', () => {
        getLocalUsers();
        getUserRoles();
        getAccountSettings();
      })
    }
  ]);
})(angular);
