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
    function(Constants) {
      this.server_health = Constants.SERVER_HEALTH.unknown;
      this.server_state = 'Unreachable';
      this.server_status = -2;
      this.chassis_state = 'On';
      this.LED_state = Constants.LED_STATE_TEXT.off;
      this.last_updated = new Date();

      this.loading = false;
      this.server_unreachable = false;
      this.showNavigation = false;
      this.bodyStyle = {};
      this.path = '';
      this.sensorData = [];

      this.hostname = '';
      this.mac_address = '';
      this.defaultgateway = '';

      this.displayErrorModal = false;
      this.errorModalDetails = {};

      this.ignoreHttpError = false;
      this.getServerId = function() {
        return this.host.replace(/^https?\:\/\//ig, '');
      };

      this.reloadServerId = function() {
        this.server_id = this.getServerId();
      };

      this.getHost = function() {
        if (sessionStorage.getItem(
                Constants.API_CREDENTIALS.host_storage_key) !== null) {
          return sessionStorage.getItem(
              Constants.API_CREDENTIALS.host_storage_key);
        } else {
          return Constants.API_CREDENTIALS.default_protocol + '://' +
              window.location.hostname +
              (window.location.port ? ':' + window.location.port : '');
        }
      };

      this.setHost = function(hostWithPort) {
        hostWithPort = hostWithPort.replace(/^https?\:\/\//ig, '');
        var hostURL =
            Constants.API_CREDENTIALS.default_protocol + '://' + hostWithPort;
        sessionStorage.setItem(
            Constants.API_CREDENTIALS.host_storage_key, hostURL);
        this.host = hostURL;
        this.reloadServerId();
      };

      this.getUser = function() {
        return sessionStorage.getItem('LOGIN_ID');
      };

      this.host = this.getHost();
      this.server_id = this.getServerId();

      this.setNetworkInfo = function(data) {
        this.hostname = data.hostname;
        this.defaultgateway = data.defaultgateway;
        this.mac_address = data.mac_address;
      };

      this.setPowerOnState = function() {
        this.server_state = Constants.HOST_STATE_TEXT.on;
        this.server_status = Constants.HOST_STATE.on;
      };

      this.setPowerOffState = function() {
        this.server_state = Constants.HOST_STATE_TEXT.off;
        this.server_status = Constants.HOST_STATE.off;
      };

      this.setErrorState = function() {
        this.server_state = Constants.HOST_STATE_TEXT.error;
        this.server_status = Constants.HOST_STATE.error;
      };

      this.setUnreachableState = function() {
        this.server_state = Constants.HOST_STATE_TEXT.unreachable;
        this.server_status = Constants.HOST_STATE.unreachable;
      };

      this.updateServerHealth = function(logs) {
        var criticals = logs.filter(function(item) {
          return item.health_flags.critical == true;
        });

        if (criticals.length) {
          this.server_health = Constants.SERVER_HEALTH.critical;
          return;
        }

        var warnings = logs.filter(function(item) {
          return item.health_flags.warning == true;
        });

        if (warnings.length) {
          this.server_health = Constants.SERVER_HEALTH.warning;
          return;
        }

        this.server_health = Constants.SERVER_HEALTH.good;
      };

      this.activateErrorModal = function(data) {
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
      };

      this.deactivateErrorModal = function() {
        this.displayErrorModal = false;
      };
    }
  ]);
})(window.angular);
