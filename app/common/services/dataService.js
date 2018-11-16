/**
 * data service
 *
 * @module app/common/services/dataService
 * @exports dataService
 * @name dataService

 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.services').service('dataService', [
    'Constants',
    {
      'server_health': Constants.SERVER_HEALTH.unknown,
      'server_state': 'Unreachable',
      'server_status': -2,
      'chassis_state': 'On',
      'LED_state': Constants.LED_STATE_TEXT.off,
      'last_updated': new Date(),

      'loading': false,
      'server_unreachable': false,
      'showNavigation': false,
      'bodyStyle': {},
      'path': '',

      'hostname': '',
      'mac_address': '',
      'defaultgateway': '',

      'displayErrorModal': false,
      'errorModalDetails': {},

      'ignoreHttpError': false,
      'getServerId': function() {
        return this.host.replace(/^https?\:\/\//ig, '');
      },

      'reloadServerId': function() {
        this.server_id = this.getServerId();
      },

      'getHost': function() {
        if (sessionStorage.getItem(
                Constants.API_CREDENTIALS.host_storage_key) !== null) {
          return sessionStorage.getItem(
              Constants.API_CREDENTIALS.host_storage_key);
        } else {
          return Constants.API_CREDENTIALS.default_protocol + '://' +
              window.location.hostname +
              (window.location.port ? ':' + window.location.port : '');
        }
      },

      'setHost': function(hostWithPort) {
        hostWithPort = hostWithPort.replace(/^https?\:\/\//ig, '');
        const hostURL =
            Constants.API_CREDENTIALS.default_protocol + '://' + hostWithPort;
        sessionStorage.setItem(
            Constants.API_CREDENTIALS.host_storage_key, hostURL);
        this.host = hostURL;
        this.reloadServerId();
      },

      'getUser': function() {
        return sessionStorage.getItem('LOGIN_ID');
      },

      'setNetworkInfo': function(data) {
        this.hostname = data.hostname;
        this.defaultgateway = data.defaultgateway;
        this.mac_address = data.mac_address;
      },

      'setPowerOnState': function() {
        this.server_state = Constants.HOST_STATE_TEXT.on;
        this.server_status = Constants.HOST_STATE.on;
      },

      'setPowerOffState': function() {
        this.server_state = Constants.HOST_STATE_TEXT.off;
        this.server_status = Constants.HOST_STATE.off;
      },

      'setErrorState': function() {
        this.server_state = Constants.HOST_STATE_TEXT.error;
        this.server_status = Constants.HOST_STATE.error;
      },

      'setUnreachableState': function() {
        this.server_state = Constants.HOST_STATE_TEXT.unreachable;
        this.server_status = Constants.HOST_STATE.unreachable;
      },

      'updateServerHealth': function(logs) {
        // If any unresolved severity high logs are present, set server health
        // to critical. Else if any unresolved severity medium logs are present
        // set server health to warning.
        this.server_health = Constants.SERVER_HEALTH.good;
        for (const log of logs) {
          if (log.priority == 'High' && !log.Resolved) {
            this.server_health = Constants.SERVER_HEALTH.critical;
            return;
          } else if (log.priority == 'Medium' && !log.Resolved) {
            this.server_health = Constants.SERVER_HEALTH.warning;
          }
        }
      },

      'activateErrorModal': function(data) {
        if (data && data.hasOwnProperty('title')) {
          this.errorModalDetails.title = data.title;
        } else {
          this.errorModalDetails.title = Constants.MESSAGES.ERROR_MODAL.TITLE;
        }

        if (data && data.hasOwnProperty('description')) {
          this.errorModalDetails.description = data.description;
        } else {
          this.errorModalDetails.description =
              Constants.MESSAGES.ERROR_MODAL.DESCRIPTION;
        }
        this.displayErrorModal = true;
      },

      'deactivateErrorModal': function() {
        this.displayErrorModal = false;
      },
    },
  ]);
})(window.angular);
