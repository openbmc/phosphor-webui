/**
 * Controller for firmware
 *
 * @module app/configuration
 * @exports firmwareController
 * @name firmwareController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('firmwareController', [
    '$scope', '$window', 'APIUtils', 'dataService', '$location',
    '$anchorScroll', 'Constants', '$interval', '$q', '$timeout', '$interpolate',
    'ngToast',
    function(
        $scope, $window, APIUtils, dataService, $location, $anchorScroll,
        Constants, $interval, $q, $timeout, $interpolate, ngToast) {
      $scope.dataService = dataService;

      // Scroll to target anchor
      $scope.gotoAnchor = function() {
        $location.hash('upload');
        $anchorScroll();
      };

      $scope.firmwares = [];
      $scope.bmcActiveVersion = '';
      $scope.hostActiveVersion = '';
      $scope.activate_confirm = false;
      $scope.delete_image_id = '';
      $scope.delete_image_version = '';
      $scope.activate_image_id = '';
      $scope.activate_image_version = '';
      $scope.activate_image_type = '';
      $scope.priority_image_id = '';
      $scope.priority_image_version = '';
      $scope.priority_from = -1;
      $scope.priority_to = -1;
      $scope.confirm_priority = false;
      $scope.file_empty = true;
      $scope.uploading = false;
      $scope.activate = {reboot: true};

      var pollActivationTimer = undefined;
      var pollDownloadTimer = undefined;

      $scope.error = {modal_title: '', title: '', desc: '', type: 'warning'};

      $scope.activateImage = function(imageId, imageVersion, imageType) {
        $scope.activate_image_id = imageId;
        $scope.activate_image_version = imageVersion;
        $scope.activate_image_type = imageType;
        $scope.activate_confirm = true;
      };

      function waitForActive(imageId) {
        var deferred = $q.defer();
        var startTime = new Date();
        pollActivationTimer = $interval(function() {
          APIUtils.getActivation(imageId).then(
              function(state) {
                //@TODO: display an error message if image "Failed"
                if (((/\.Active$/).test(state.data)) ||
                    ((/\.Failed$/).test(state.data))) {
                  $interval.cancel(pollActivationTimer);
                  pollActivationTimer = undefined;
                  deferred.resolve(state);
                }
              },
              function(error) {
                $interval.cancel(pollActivationTimer);
                pollActivationTimer = undefined;
                console.log(error);
                deferred.reject(error);
              });
          var now = new Date();
          if ((now.getTime() - startTime.getTime()) >=
              Constants.TIMEOUT.ACTIVATION) {
            $interval.cancel(pollActivationTimer);
            pollActivationTimer = undefined;
            console.log('Time out activating image, ' + imageId);
            deferred.reject(
                'Time out. Image did not activate in allotted time.');
          }
        }, Constants.POLL_INTERVALS.ACTIVATION);
        return deferred.promise;
      }

      $scope.activateConfirmed = function() {
        APIUtils.activateImage($scope.activate_image_id)
            .then(
                function(state) {
                  $scope.loadFirmwares();
                  return state;
                },
                function(error) {
                  console.log(JSON.stringify(error));
                  ngToast.danger('Unable to activate image');
                })
            .then(function(activationState) {
              waitForActive($scope.activate_image_id)
                  .then(
                      function(state) {
                        $scope.loadFirmwares();
                      },
                      function(error) {
                        console.log(JSON.stringify(error));
                        ngToast.danger('Unable to activate image');
                      })
                  .then(function(state) {
                    if ($scope.activate.reboot &&
                        ($scope.activate_image_type == 'BMC')) {
                      // Despite the new image being active, issue,
                      // https://github.com/openbmc/openbmc/issues/2764, can
                      // cause a system to brick, if the system reboots before
                      // the service to set the U-Boot variables is complete.
                      // Wait 10 seconds before rebooting to ensure this service
                      // is complete. This issue is fixed in newer images, but
                      // the user may be updating from an older image that does
                      // not that have this fix.
                      // TODO: remove this timeout after sufficient time has
                      // passed.
                      $timeout(function() {
                        APIUtils.bmcReboot(
                            function(response) {},
                            function(error) {
                              console.log(JSON.stringify(error));
                              ngToast.danger('Unable to reboot BMC');
                            });
                      }, 10000);
                    }
                    if ($scope.activate.reboot &&
                        ($scope.activate_image_type == 'Host')) {
                      // If image type being activated is a host image, the
                      // current power status of the server determines if the
                      // server should power on or reboot.
                      if ($scope.isServerOff()) {
                        powerOn();
                      } else {
                        warmReboot();
                      }
                    }
                  });
            });
        $scope.activate_confirm = false;
      };
      function powerOn() {
        dataService.setUnreachableState();
        APIUtils.hostPowerOn()
            .then(function(response) {
              return response;
            })
            .then(function(lastStatus) {
              return APIUtils.pollHostStatusTillOn();
            })
            .catch(function(error) {
              console.log(JSON.stringify(error));
              ngToast.danger(Constants.MESSAGES.POWER_OP.POWER_ON_FAILED);
            });
      };
      function warmReboot() {
        $scope.uploading = true;
        dataService.setUnreachableState();
        APIUtils.hostReboot()
            .then(function(response) {
              return response;
            })
            .then(function(lastStatus) {
              return APIUtils.pollHostStatusTilReboot();
            })
            .catch(function(error) {
              console.log(JSON.stringify(error));
              ngToast.danger(Constants.MESSAGES.POWER_OP.WARM_REBOOT_FAILED);
            });
      };
      $scope.isServerOff = function() {
        return dataService.server_state === Constants.HOST_STATE_TEXT.off;
      };

      $scope.upload = function() {
        if ($scope.file) {
          $scope.uploading = true;
          APIUtils.uploadImage($scope.file)
              .then(
                  function(response) {
                    $scope.uploading = false;
                    ngToast.success(
                        'Image file "' + $scope.file.name +
                        '" has been uploaded');
                    $scope.file = '';
                    $scope.loadFirmwares();
                  },
                  function(error) {
                    $scope.uploading = false;
                    console.log(error);
                    ngToast.danger('Unable to upload image file');
                  });
        }
      };

      // TODO: openbmc/openbmc#1691 Add support to return
      // the id of the newly created image, downloaded via
      // tftp. Polling the number of software objects is a
      // near term solution.
      function waitForDownload() {
        var deferred = $q.defer();
        var startTime = new Date();
        pollDownloadTimer = $interval(function() {
          var now = new Date();
          if ((now.getTime() - startTime.getTime()) >=
              Constants.TIMEOUT.DOWNLOAD_IMAGE) {
            $interval.cancel(pollDownloadTimer);
            pollDownloadTimer = undefined;
            deferred.reject(
                new Error(Constants.MESSAGES.POLL.DOWNLOAD_IMAGE_TIMEOUT));
          }

          APIUtils.getFirmwares().then(
              function(response) {
                if (response.data.length === $scope.firmwares.length + 1) {
                  $interval.cancel(pollDownloadTimer);
                  pollDownloadTimer = undefined;
                  deferred.resolve(response.data);
                }
              },
              function(error) {
                $interval.cancel(pollDownloadTimer);
                pollDownloadTimer = undefined;
                deferred.reject(error);
              });
        }, Constants.POLL_INTERVALS.DOWNLOAD_IMAGE);

        return deferred.promise;
      }

      $scope.download = function() {
        if (!$scope.download_host || !$scope.download_filename) {
          ngToast.danger('TFTP server IP address and file name are required!');
          return false;
        }

        $scope.downloading = true;
        APIUtils.getFirmwares()
            .then(function(response) {
              $scope.firmwares = response.data;
            })
            .then(function() {
              return APIUtils
                  .downloadImage($scope.download_host, $scope.download_filename)
                  .then(function(downloadStatus) {
                    return downloadStatus;
                  });
            })
            .then(function(downloadStatus) {
              return waitForDownload();
            })
            .then(
                function(newFirmwareList) {
                  $scope.download_host = '';
                  $scope.download_filename = '';
                  $scope.downloading = false;
                  ngToast.success('Download complete');
                  $scope.loadFirmwares();
                },
                function(error) {
                  console.log(error);
                  ngToast.danger(
                      'Image file from TFTP server "' + $scope.download_host +
                      '" could not be downloaded');
                  $scope.downloading = false;
                });
      };

      $scope.changePriority = function(imageId, imageVersion, from, to) {
        $scope.priority_image_id = imageId;
        $scope.priority_image_version = imageVersion;
        $scope.priority_from = from;
        $scope.priority_to = to;
        $scope.confirm_priority = true;
      };

      $scope.confirmChangePriority = function() {
        $scope.loading = true;
        APIUtils.changePriority($scope.priority_image_id, $scope.priority_to)
            .then(function(response) {
              $scope.loading = false;
              if (response.status == 'error') {
                ngToast.danger('Unable to update boot priority');
              } else {
                $scope.loadFirmwares();
              }
            });
        $scope.confirm_priority = false;
      };
      $scope.deleteImage = function(imageId, imageVersion) {
        $scope.delete_image_id = imageId;
        $scope.delete_image_version = imageVersion;
        $scope.confirm_delete = true;
      };
      $scope.confirmDeleteImage = function() {
        $scope.loading = true;
        APIUtils.deleteImage($scope.delete_image_id).then(function(response) {
          $scope.loading = false;
          if (response.status == 'error') {
            ngToast.danger('Unable to delete image');
          } else {
            $scope.loadFirmwares();
          }
        });
        $scope.confirm_delete = false;
      };
      $scope.fileNameChanged = function() {
        $scope.file_empty = false;
      };

      $scope.filters = {bmc: {imageType: 'BMC'}, host: {imageType: 'Host'}};

      $scope.loadFirmwares = function() {
        APIUtils.getFirmwares().then(function(result) {
          $scope.firmwares = result.data;
          $scope.bmcActiveVersion = result.bmcActiveVersion;
          $scope.hostActiveVersion = result.hostActiveVersion;
        });
      };

      $scope.loadFirmwares();
    }
  ]);
})(angular);
