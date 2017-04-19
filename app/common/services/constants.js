/**
 * common Constant service
 *
 * @module app/common/services/constants
 * @exports Constants
 * @name Constants

 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.services')
        .service('Constants', function () {
            return {
                LOGIN_CREDENTIALS: {
                    username: "test",
                    password: "testpass",
                },
                API_CREDENTIALS: {
                    host: 'https://9.41.165.233/'
                },
                API_RESPONSE: {
                    ERROR_STATUS: 'error',
                    ERROR_MESSAGE: '401 Unauthorized',
                    SUCCESS_STATUS: 'ok',
                    SUCCESS_MESSAGE: '200 OK'
                },
                CHASSIS_POWER_STATE: {
                    on: 'On',
                    off: 'Off'
                },
                HOST_STATE_TEXT: {
                    on: 'Running',
                    off: 'Off',
                    booting: 'Quiesced',
                    unreachable: 'Unreachable'
                },
                HOST_STATE: {
                    on: 1,
                    off: -1,
                    booting: 0,
                    unreachable: -2
                },
                LED_STATE: {
                    on: true,
                    off: false
                },
                LED_STATE_TEXT: {
                    on: 'on',
                    off: 'off'
                },
                SEVERITY_TO_PRIORITY_MAP:{
                    Informational: 'Low',
                    Error: 'High',
                    Warning: 'Medium'
                },
                PAGINATION: {
                    LOG_ITEMS_PER_PAGE: 4
                }
            };
        });

})(window.angular);
