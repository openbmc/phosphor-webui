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
                    host: 'https://9.3.181.15',
                    mock_host: 'http://localhost:3000'
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
                    LOG_ITEMS_PER_PAGE: 25
                },
                HARDWARE: {
                  component_key_filter: '/xyz/openbmc_project/inventory/system',
                  parent_components: [
                   /xyz\/openbmc_project\/inventory\/system\/chassis\/motherboard\/cpu\d+\//
                  ],
                  uppercase_titles: [
                   'cpu', 'dimm'
                  ]
                },
                SENSOR_UNIT_MAP: {
                  'xyz.openbmc_project.Sensor.Value.Unit.RPMS': 'rpms',
                  'xyz.openbmc_project.Sensor.Value.Unit.DegreesC': 'C',
                  'xyz.openbmc_project.Sensor.Value.Unit.Volts': 'volts',
                  'xyz.openbmc_project.Sensor.Value.Unit.Meters': 'meters',
                  'xyz.openbmc_project.Sensor.Value.Unit.Watts': 'watts',
                  'xyz.openbmc_project.Sensor.Value.Unit.Amperes': 'amperes',
                  'xyz.openbmc_project.Sensor.Value.Unit.Joules': 'joules'
                }
            };
        });

})(window.angular);
