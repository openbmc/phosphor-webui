/**
 * virtualMediaModel
 *
 * @module app/common/services/virtualMediaModel
 * @exports virtualMediaModel
 * @name virtualMediaModel

 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.services')
      .service('virtualMediaModel', [function() {
                 this.configsMap = {};

                 this.saveConfig = function(index, config) {
                   this.configsMap[index] = config;
                 };
                 this.getConfiguredDevices = function() {
                   return this.configsMap;
                 };
                 this.getDeviceConfig = function(index) {
                   if (this.configsMap.hasOwnProperty(index)) {
                     return this.configsMap[index];
                   } else {
                     return undefined;
                   }
                 };
               }]);
})(window.angular);
