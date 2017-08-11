/**
 * Controller for unit Id
 *
 * @module app/serverHealth
 * @exports unitIdController
 * @name unitIdController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.serverHealth')
        .controller('unitIdController', [
            '$scope', 
            '$window', 
            'APIUtils', 
            'dataService',
            function($scope, $window, APIUtils, dataService, userModel){
                $scope.dataService = dataService;

                $scope.getLEDState = function(){
                    APIUtils.getLEDState(function(state){
                        if(state == APIUtils.LED_STATE.on){
                            dataService.LED_state = APIUtils.LED_STATE_TEXT.on;
                        }else{
                            dataService.LED_state = APIUtils.LED_STATE_TEXT.off;
                        }
                    });
                }
                $scope.toggleLED = function(){
                    var toggleState = (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
                        APIUtils.LED_STATE.off : APIUtils.LED_STATE.on;
                        dataService.LED_state = (dataService.LED_state == APIUtils.LED_STATE_TEXT.on) ?
                        APIUtils.LED_STATE_TEXT.off : APIUtils.LED_STATE_TEXT.on;
                    APIUtils.setLEDState(toggleState, function(status){
                    });
                }

                $scope.getLEDState();
            }
        ]
    );

})(angular);
