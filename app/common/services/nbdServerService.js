/**
 * data service
 *
 * @module app/common/services/dataService
 * @exports dataService
 * @name dataService

 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.services').service('nbdServerService', [
    'Constants',
    function(Constants) {
      this.nbdServerMap = {};

      this.addConnection = function(index, nbdServer, file) {
        this.nbdServerMap[index] = {'server': nbdServer, 'file': file};
      };
      this.getExistingConnections = function(index) {
        return this.nbdServerMap;
      }
    }
  ]);
})(window.angular);
