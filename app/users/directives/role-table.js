window.angular && (function(angular) {
  'use strict';

  /**
   * Role table
   * Table of privilege role descriptions
   */
  angular.module('app.users').directive('roleTable', [
    '$sce',
    function($sce) {
      return {
        restrict: 'E',
        template: require('./role-table.html'),
        controllerAs: 'roleTableCtrl',
        controller: function() {
          // TODO: This is a workaround to render the checkmark svg icon
          // Would eventually like to enhance <bmc-table> component to
          // compile custom directives as table items
          const svg = require('../../assets/icons/icon-check.svg');
          const check =
              $sce.trustAsHtml(`<span class="icon__check-mark">${svg}<span>`);

          this.tableModel = {};
          this.tableModel.header =
              ['', 'Admin', 'Operator', 'User', 'Callback'];

          this.tableModel.data = [
            {
              uiData: [
                'Configure components managed by this service', check, '', '',
                ''
              ]
            },
            {uiData: ['Configure manager resources', check, '', '', '']},
            {
              uiData: [
                'Update password for current user account', check, check, check,
                ''
              ]
            },
            {uiData: ['Configure users and their accounts', check, '', '', '']},
            {
              uiData: [
                'Log in to the service and read resources', check, check, check,
                ''
              ]
            },
            {uiData: ['IPMI access point', check, check, check, check]},
            {uiData: ['Redfish access point', check, check, check, '']},
            {uiData: ['SSH access point', check, check, check, '']},
            {uiData: ['WebUI access point', check, check, check, '']},
          ];

          this.isCollapsed = true;
          this.onClick = () => {
            this.isCollapsed = !this.isCollapsed;
          };
        }
      };
    }
  ]);
})(window.angular);
