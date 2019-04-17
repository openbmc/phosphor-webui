window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('ldapUserRoles', [
    'APIUtils',
    function(APIUtils) {
      return {
        'restrict': 'E',
        'template': require('./ldap-user-roles.html'),
        'scope': {'roleGroups': '=', 'enabled': '='},
        'controller': [
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

            $scope.addRoleGroup = function() {
              console.log('add');
              // use newGroup to add new group
            };

            $scope.editRoleGroup = function() {
              console.log('edit');
              $scope.editGroup = false;
              // use selectedGroupIndex and newGroup to edit role group
            };

            $scope.removeRoleGroup = function() {
              console.log('remove');
              // use selectedGroupIndex to remove
            };
            $scope.removeRoleGroups = function() {
              console.log('removeMultiple');
              for (var i in $scope.roleGroups) {
                if ($scope.roleGroups[i].isSelected) {
                  // needs to be removed
                }
              }
            };
            $scope.toggleAll = function() {
              var toggleStatus = !$scope.all;
              angular.forEach($scope.roleGroups, function(group) {
                group.isSelected = toggleStatus;
              });
            };
            $scope.optionToggled = function() {
              $scope.all = $scope.roleGroups.every(function(group) {
                return group.isSelected;
              })
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
