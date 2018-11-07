window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('ldapUserRoles', [
    'APIUtils',
    function(APIUtils) {
      return {
        restrict: 'E',
        template: require('./ldap-user-roles.html'),
        scope: {roleGroups: '=', enabled: '=', roleGroupType: '='},
        controller: [
          '$scope', 'APIUtils', 'toastService', '$q',
          function($scope, APIUtils, toastService, $q) {
            $scope.privileges = [];
            $scope.loading = true;
            $scope.newGroup = {};
            $scope.selectedGroupIndex = '';
            $scope.editGroup = false;
            $scope.removeGroup = false;
            $scope.removeMultipleGroups = false;
            $scope.all = false;
            $scope.sortPropertyName = 'id';
            $scope.reverse = false;
            $scope.addGroup = false;
            $scope.hasSelectedGroup = false;

            APIUtils.getAccountServiceRoles()
                .then(
                    function(data) {
                      $scope.privileges = data;
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                    })
                .finally(function() {
                  $scope.loading = false;
                });

            $scope.addGroupFn = function() {
              $scope.addGroup = true;
            };

            $scope.addRoleGroup = function() {
              const newGroup = {};
              newGroup.RemoteGroup = $scope.newGroup.RemoteGroup;
              newGroup.LocalRole = $scope.newGroup.LocalRole;

              $scope.loading = true;
              const data = {};

              if ($scope.roleGroupType == 'ldap') {
                data.LDAP = {};
                data.LDAP.RemoteRoleMapping = $scope.roleGroups;
                data.LDAP.RemoteRoleMapping.push(newGroup);
              } else {
                data.ActiveDirectory = {};
                data.ActiveDirectory.RemoteRoleMapping = $scope.roleGroups;
                data.ActiveDirectory.RemoteRoleMapping.push(newGroup);
              }

              APIUtils.saveLdapProperties(data)
                  .then(
                      function(response) {
                        toastService.success(
                            'Group has been created successfully');
                      },
                      function(error) {
                        toastService.error('Failed to create new group');
                      })
                  .finally(function() {
                    $scope.loading = false;
                  });
            };

            $scope.editGroupFn = function(group, role, index) {
              $scope.editGroup = true;
              $scope.selectedGroupIndex = index;
              $scope.newGroup.RemoteGroup = group;
              $scope.newGroup.LocalRole = role;
            };

            $scope.editRoleGroup = function() {
              $scope.loading = true;
              const data = {};

              if ($scope.roleGroupType == 'ldap') {
                data.LDAP = {};
                data.LDAP.RemoteRoleMapping = $scope.roleGroups;
                data.LDAP.RemoteRoleMapping[$scope.selectedGroupIndex]
                    .LocalRole = $scope.newGroup.LocalRole;
              } else {
                data.ActiveDirectory = {};
                data.ActiveDirectory.RemoteRoleMapping = $scope.roleGroups;
                data.ActiveDirectory
                    .RemoteRoleMapping[$scope.selectedGroupIndex]
                    .LocalRole = $scope.newGroup.LocalRole;
              }

              APIUtils.saveLdapProperties(data)
                  .then(
                      function(response) {
                        toastService.success(
                            'Group has been edited successfully');
                      },
                      function(error) {
                        toastService.error('Failed to edit group');
                      })
                  .finally(function() {
                    $scope.loading = false;
                  });
              $scope.editGroup = false;
            };

            $scope.removeGroupFn = function(index) {
              $scope.removeGroup = true;
              $scope.selectedGroupIndex = index;
            };

            $scope.removeRoleGroup = function() {
              const data = {};

              if ($scope.roleGroupType == 'ldap') {
                data.LDAP = {};
                data.LDAP.RemoteRoleMapping = $scope.roleGroups;
                data.LDAP.RemoteRoleMapping[$scope.selectedGroupIndex] =
                    $scope.newGroup;
              } else {
                data.ActiveDirectory = {};
                data.ActiveDirectory.RemoteRoleMapping = $scope.roleGroups;
                data.ActiveDirectory
                    .RemoteRoleMapping[$scope.selectedGroupIndex] =
                    $scope.newGroup;
              }

              $scope.roleGroups[$scope.selectedGroupIndex] = null;

              APIUtils.saveLdapProperties(data)
                  .then(
                      function(response) {
                        toastService.success(
                            'Group has been removed successfully');
                      },
                      function(error) {
                        toastService.error('Failed to remove group');
                      })
                  .finally(function() {
                    $scope.loading = false;
                    $scope.$parent.loadLdap();
                  });
              $scope.removeGroup = false;
            };

            $scope.removeMultipleRoleGroupsFn = function() {
              $scope.removeMultipleGroups = true;
            };

            $scope.roleGroupIsSelectedChanged =
                function() {
              let groupSelected = false;
              $scope.roleGroups.map((group) => {
                if (group['isSelected']) {
                  groupSelected = true;
                }
              });
              $scope.hasSelectedGroup = groupSelected;
            }

                $scope.removeMultipleRoleGroups = function() {
              const data = {};

              if ($scope.roleGroupType == 'ldap') {
                data.LDAP = {};
                data.LDAP.RemoteRoleMapping = $scope.roleGroups.map(group => {
                  if (group['isSelected']) {
                    return null;
                  } else {
                    return group;
                  }
                });
              } else {
                data.ActiveDirectory = {};
                data.ActiveDirectory.RemoteRoleMapping =
                    $scope.roleGroups.map(group => {
                      if (group['isSelected']) {
                        return null;
                      } else {
                        return group;
                      }
                    });
              }

              APIUtils.saveLdapProperties(data)
                  .then(
                      function(response) {
                        toastService.success(
                            'Groups has been removed successfully');
                      },
                      function(error) {
                        toastService.error('Failed to remove groups');
                      })
                  .finally(function() {
                    $scope.loading = false;
                    $scope.$parent.loadLdap();
                  });
              $scope.removeMultipleGroups = false;
            };

            $scope.toggleAll = function() {
              let toggleStatus = !$scope.all;
              angular.forEach($scope.roleGroups, function(group) {
                group.isSelected = toggleStatus;
              });
            };
            $scope.optionToggled = function() {
              $scope.all = $scope.roleGroups.every(function(group) {
                return group.isSelected;
              });
            };
            $scope.sortBy = function(propertyName, isReverse) {
              $scope.reverse = isReverse;
              $scope.sortPropertyName = propertyName;
            };
          }
        ]
      };
    }
  ]);
})(window.angular);
