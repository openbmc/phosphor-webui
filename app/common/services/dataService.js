/**
 * data service
 *
 * @module app/common/services/dataService
 * @exports dataService
 * @name dataService

 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.services')
        .service('dataService', ['Constants', function (Constants) {
            this.app_version = "V.0.0.1";
            this.server_health = Constants.SERVER_HEALTH.unknown;
            this.server_state = 'Unreachable';
            this.server_status = -2;
            this.chassis_state = 'On';
            this.LED_state = Constants.LED_STATE_TEXT.off;
            this.last_updated = new Date();

            this.loading = false;
            this.server_unreachable = false;
            this.loading_message = "";
            this.showNavigation = false;
            this.bodyStyle = {};
            this.path = '';
            this.sensorData = [];

            this.hostname = "";
            this.mac_address = "";
            this.remote_window_active = false;

            this.getServerId = function(){
                 return this.host.replace(/^https?\:\/\//ig,"");
            }

            this.reloadServerId = function(){
                this.server_id = this.getServerId();
            }

            this.getHost = function(){
                if(sessionStorage.getItem(Constants.API_CREDENTIALS.host_storage_key) !== null){
                    return sessionStorage.getItem(Constants.API_CREDENTIALS.host_storage_key);
                }else{
                    return Constants.API_CREDENTIALS.default_protocol + "://" +
                           window.location.hostname + ':' +
                           window.location.port;
                }
            }

            this.setHost = function(hostWithPort){
                hostWithPort = hostWithPort.replace(/^https?\:\/\//ig, '');
                var hostURL = Constants.API_CREDENTIALS.default_protocol + "://" + hostWithPort;
                sessionStorage.setItem(Constants.API_CREDENTIALS.host_storage_key, hostURL);
                this.host = hostURL;
                this.reloadServerId();
            }

            this.getUser = function(){
                return sessionStorage.getItem('LOGIN_ID');
            }

            this.host = this.getHost();
            this.server_id = this.getServerId();

            this.setNetworkInfo = function(data){
                this.hostname = data.hostname;
                this.mac_address = data.mac_address;
            }

            this.setPowerOnState = function(){
                this.server_state = Constants.HOST_STATE_TEXT.on;
                this.server_status = Constants.HOST_STATE.on;
            }

            this.setPowerOffState = function(){
                this.server_state = Constants.HOST_STATE_TEXT.off;
                this.server_status = Constants.HOST_STATE.off;
            }

            this.setBootingState = function(){
                this.server_state = Constants.HOST_STATE_TEXT.booting;
                this.server_status = Constants.HOST_STATE.booting;
            }

            this.setUnreachableState = function(){
                this.server_state = Constants.HOST_STATE_TEXT.unreachable;
                this.server_status = Constants.HOST_STATE.unreachable;
            }

            this.setRemoteWindowActive = function(){
                this.remote_window_active = true;
            }

            this.setRemoteWindowInactive = function(){
                this.remote_window_active = false;
            }

            this.updateServerHealth = function(logs){
                var criticals = logs.filter(function(item){
                    return item.health_flags.critical == true;
                });

                if(criticals.length){
                    this.server_health = Constants.SERVER_HEALTH.critical;
                    return;
                }

                var warnings = logs.filter(function(item){
                    return item.health_flags.warning == true;
                });

                if(warnings.length){
                    this.server_health = Constants.SERVER_HEALTH.warning;
                    return;
                }

                this.server_health = Constants.SERVER_HEALTH.good;
            }
        }]);

})(window.angular);
