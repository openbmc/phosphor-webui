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
        .module('app.common.services', [])
        .service('Constants', function () {
            return {
                API_CREDENTIALS: {
                    host_storage_key: 'API_HOST_KEY',
                    default_protocol: 'https'
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
                SEVERITY_TO_HEALTH_MAP:{
                    Emergency: 'Critical',
                    Alert: 'Critical',
                    Critical: 'Critical',
                    Error: 'Warning',
                    Warning: 'Warning',
                    Notice: 'Good',
                    Debug: 'Good',
                    Informational: 'Good'
                },
                SEVERITY_TO_PRIORITY_MAP:{
                    Emergency: 'High',
                    Alert: 'High',
                    Critical: 'High',
                    Error: 'High',
                    Warning: 'Medium',
                    Notice: 'Low',
                    Debug: 'Low',
                    Informational: 'Low'
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
                },
                SERVER_HEALTH: {
                    critical: 'Critical',
                    warning: 'Warning',
                    good: 'Good',
                    unknown: 'Unknown'
                },
                SENSOR_SORT_ORDER: [
                   'xyz.openbmc_project.Sensor.Value.Unit.DegreesC',
                   'xyz.openbmc_project.Sensor.Value.Unit.RPMS',
                   'xyz.openbmc_project.Sensor.Value.Unit.Meters',
                   'xyz.openbmc_project.Sensor.Value.Unit.Volts',
                   'xyz.openbmc_project.Sensor.Value.Unit.Amperes',
                   'xyz.openbmc_project.Sensor.Value.Unit.Joules',
                   'xyz.openbmc_project.Sensor.Value.Unit.Meters'
                ],
                SENSOR_SORT_ORDER_DEFAULT: 8,
                FIRMWARE: {
                  ACTIVATE_FIRMWARE: 'xyz.openbmc_project.Software.Activation.RequestedActivations.Active',
                  FUNCTIONAL_OBJPATH: '/xyz/openbmc_project/software/functional'
                },
               POLL_INTERVALS: {
                  ACTIVATION: 5000
                },
               TIMEOUT: {
                  ACTIVATION: 1000 * 60 * 10, // 10 mins
                },
                MESSAGES: {
                  SENSOR: {
                    NO_SENSOR_DATA: 'There are no sensors found.',
                    CRITICAL_NO_SENSOR_DATA: 'There are no sensors in Critical state.',
                    WARNING_NO_SENSOR_DATA: 'There are no sensors in Warning state.'
                  }
                }
            };
        });

})(window.angular);
