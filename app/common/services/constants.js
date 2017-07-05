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
                    host: 'https://9.3.164.177',
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
                    LOG_ITEMS_PER_PAGE: 4
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
                SENSOR_DATA_TEMPLATE: {
                    sensors: [
                        {
                           type: 'fan',
                           title: 'Fan Speed',
                           key_search: 'fan_tach',
                           display_headers: ['Fan Speed(RPM)', 'Reading', 'State'],
                           sensor_row: {
                                title: 'Fan Speed ',
                                reading: ' rpms',
                                status: '',
                                indicator: ''
                           }
                        },
                        {
                           type: 'temperature',
                           title: 'Temperature',
                           'key_search': 'temperature',
                           display_headers: ['Temperature (DegreesC)', 'Reading', 'State'],
                           sensor_row: {
                                title: 'Temperature ',
                                reading: ' degreeC',
                                status: '',
                                indicator: ''
                           }
                        },
                        {
                           type: 'altitude',
                           title: 'Altitude',
                           'key_search': 'altitude',
                           display_headers: ['Altitude (Meters)', 'Reading', 'State'],
                           sensor_row: {
                                title: 'Altitude ',
                                reading: ' Meters',
                                status: '',
                                indicator: ''
                           }
                        },
                        {
                           type: 'voltage',
                           title: 'Voltage',
                           'key_search': 'voltage',
                           display_headers: ['Temperature (Volts)', 'Reading', 'State'],
                           sensor_row: {
                                title: 'Voltage ',
                                reading: ' volts',
                                status: '',
                                indicator: ''
                           }
                        },
                        {
                           type: 'current',
                           title: 'Current',
                           'key_search': 'current',
                           display_headers: ['Current (Amperes)', 'Reading', 'State'],
                           sensor_row: {
                                title: 'Current ',
                                reading: ' amperes',
                                status: '',
                                indicator: ''
                           }
                        },
                        {
                           type: 'power',
                           title: 'Power',
                           'key_search': 'power',
                           display_headers: ['Power (Watts)', 'Reading', 'State'],
                           sensor_row: {
                                title: 'Power ',
                                reading: ' watts',
                                status: '',
                                indicator: ''
                           }
                        },
                        {
                           type: 'energy',
                           title: 'Energy',
                           'key_search': 'energy',
                           display_headers: ['Energy (Joules)', 'Reading', 'State'],
                           sensor_row: {
                                title: 'Energy ',
                                reading: ' joules',
                                status: '',
                                indicator: ''
                           }
                        }
                    ]
                }
            };
        });

})(window.angular);
