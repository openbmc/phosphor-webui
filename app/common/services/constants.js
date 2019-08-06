/**
 * common Constant service
 *
 * @module app/common/services/constants
 * @exports Constants
 * @name Constants

 */

window.angular &&
  (function(angular) {
    'use strict';

    angular.module('app.common.services', []).service('Constants', function() {
      return {
        API_CREDENTIALS: {
          host_storage_key: 'API_HOST_KEY',
          default_protocol: 'https',
        },
        API_RESPONSE: {
          ERROR_STATUS: 'error',
          ERROR_MESSAGE: '401 Unauthorized',
          SUCCESS_STATUS: 'ok',
          SUCCESS_MESSAGE: '200 OK',
        },
        CERTIFICATE_TYPES: [
          {
            Description: 'HTTPS Certificate',
            location:
              '/redfish/v1/Managers/bmc/NetworkProtocol/HTTPS/Certificates',
          },
          {
            Description: 'LDAP Certificate',
            location: '/redfish/v1/AccountService/LDAP/Certificates',
          },
        ],
        HOST_STATE_TEXT: {
          on: 'Running',
          on_code: 'xyz.openbmc_project.State.Host.HostState.Running',
          off: 'Off',
          off_code: 'xyz.openbmc_project.State.Host.HostState.Off',
          error: 'Quiesced',
          error_code: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
          unreachable: 'Unreachable',
        },
        LED_STATE: {on: true, off: false},
        LED_STATE_TEXT: {on: 'on', off: 'off'},
        SEVERITY_TO_PRIORITY_MAP: {
          Emergency: 'High',
          Alert: 'High',
          Critical: 'High',
          Error: 'High',
          Warning: 'Medium',
          Notice: 'Low',
          Debug: 'Low',
          Informational: 'Low',
        },
        PAGINATION: {LOG_ITEMS_PER_PAGE: 25},
        HARDWARE: {
          component_key_filter: '/xyz/openbmc_project/inventory/system',
          parent_components: [
            /xyz\/openbmc_project\/inventory\/system\/chassis\/motherboard\/cpu\d+\//,
          ],
          uppercase_titles: ['cpu', 'dimm'],
        },
        SENSOR_UNIT_MAP: {
          'xyz.openbmc_project.Sensor.Value.Unit.RPMS': 'rpms',
          'xyz.openbmc_project.Sensor.Value.Unit.DegreesC': 'C',
          'xyz.openbmc_project.Sensor.Value.Unit.Volts': 'volts',
          'xyz.openbmc_project.Sensor.Value.Unit.Meters': 'meters',
          'xyz.openbmc_project.Sensor.Value.Unit.Watts': 'watts',
          'xyz.openbmc_project.Sensor.Value.Unit.Amperes': 'amperes',
          'xyz.openbmc_project.Sensor.Value.Unit.Joules': 'joules',
        },
        SERVER_HEALTH: {
          critical: 'Critical',
          warning: 'Warning',
          good: 'Good',
          unknown: 'Unknown',
        },
        SENSOR_SORT_ORDER: [
          'xyz.openbmc_project.Sensor.Value.Unit.DegreesC',
          'xyz.openbmc_project.Sensor.Value.Unit.RPMS',
          'xyz.openbmc_project.Sensor.Value.Unit.Meters',
          'xyz.openbmc_project.Sensor.Value.Unit.Volts',
          'xyz.openbmc_project.Sensor.Value.Unit.Amperes',
          'xyz.openbmc_project.Sensor.Value.Unit.Joules',
          'xyz.openbmc_project.Sensor.Value.Unit.Meters',
        ],
        SENSOR_SORT_ORDER_DEFAULT: 8,
        FIRMWARE: {
          ACTIVATE_FIRMWARE:
            'xyz.openbmc_project.Software.Activation.RequestedActivations.Active',
          FUNCTIONAL_OBJPATH: '/xyz/openbmc_project/software/functional',
        },
        POLL_INTERVALS: {
          ACTIVATION: 5000,
          DOWNLOAD_IMAGE: 5000,
          POWER_OP: 5000,
        },
        TIMEOUT: {
          ACTIVATION: 1000 * 60 * 10, // 10 mins
          DOWNLOAD_IMAGE: 1000 * 60 * 2, // 2 mins
          HOST_ON: 1000 * 60 * 5, // 5 mins
          HOST_OFF: 1000 * 60 * 5, // 5 mins
          HOST_OFF_IMMEDIATE: 1000 * 60 * 2, // 2 mins
        },
        MESSAGES: {
          POLL: {
            HOST_ON_TIMEOUT:
              'Time out. System did not reach Running state in allotted time.',
            HOST_OFF_TIMEOUT:
              'Time out. System did not reach Off state in allotted time.',
            HOST_QUIESCED: 'System is in Error state.',
            DOWNLOAD_IMAGE_TIMEOUT:
              'Time out. Did not download image in allotted time.',
          },
          POWER_OP: {
            POWER_ON_FAILED: 'Power On Failed',
            WARM_REBOOT_FAILED: 'Warm Reboot Failed',
            COLD_REBOOT_FAILED: 'Cold Reboot Failed',
            ORDERLY_SHUTDOWN_FAILED: 'Orderly Shutdown Failed',
            IMMEDIATE_SHUTDOWN_FAILED: 'Immediate Shutdown Failed',
          },
          SENSOR: {
            NO_SENSOR_DATA: 'There are no sensors found.',
            CRITICAL_NO_SENSOR_DATA: 'There are no sensors in Critical state.',
            WARNING_NO_SENSOR_DATA: 'There are no sensors in Warning state.',
            NORMAL_NO_SENSOR_DATA: 'There are no sensors in Normal state.',
          },
          ERROR_MESSAGE_DESC_TEMPLATE: '{{status}} - {{description}}',
        },
        POWER_CAP_TEXT: {unit: 'W', disabled: 'Not Enabled'},
        POWER_CONSUMPTION_TEXT: {
          'xyz.openbmc_project.Sensor.Value.Unit.Watts': 'W',
          'notavailable': 'Not Available',
        },
      };
    });
  })(window.angular);
