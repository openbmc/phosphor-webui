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
    '$scope', 'APIUtils', 'dataService', '$location', '$anchorScroll',
    'Constants', '$interval', '$q', 'toastService', '$sce', '$uibModal',
    function(
        $scope, APIUtils, dataService, $location, $anchorScroll, Constants,
        $interval, $q, toastService, $sce, $uibModal) {
      $scope.dataService = dataService;

      // Scroll to target anchor
      $scope.gotoAnchor = function() {
        $location.hash('upload');
        $anchorScroll();
      };

      $scope.tableData = [];
      $scope.tableHeader =
          [{label: 'Next Boot'}, {label: 'Image State'}, {label: 'Version'}];
      $scope.activeSystemImages;

      $scope.firmwares = [];

      $scope.file_empty = true;
      $scope.uploading = false;
      $scope.activate = {reboot: true};

      var pollActivationTimer = undefined;
      var pollDownloadTimer = undefined;
      let nextBootImage;

      function waitForActive(imageId) {
        var deferred = $q.defer();
        var startTime = new Date();
        pollActivationTimer = $interval(function() {
          APIUtils.getActivation(imageId).then(
              function(state) {
                let imageStateActive = (/\.Active$/).test(state.data);
                let imageStateFailed = (/\.Failed$/).test(state.data);
                if (imageStateActive || imageStateFailed) {
                  $interval.cancel(pollActivationTimer);
                  pollActivationTimer = undefined;
                }
                if (imageStateActive) {
                  deferred.resolve(state);
                } else if (imageStateFailed) {
                  console.log('Image failed to activate: ', imageStateFailed);
                  toastService.error('Image failed to activate.');
                  deferred.reject(error);
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
      };

      const isServerOff = () => {
        return dataService.server_state === Constants.HOST_STATE_TEXT.off;
      };

      $scope.upload = function() {
        if ($scope.file) {
          $scope.uploading = true;
          APIUtils.uploadImage($scope.file)
              .then(
                  function(response) {
                    $scope.uploading = false;
                    toastService.success(
                        'Image file "' + $scope.file.name +
                        '" has been uploaded');
                    $scope.file = '';
                    $scope.loadFirmwares();
                  },
                  function(error) {
                    $scope.uploading = false;
                    console.log(error);
                    toastService.error('Unable to upload image file');
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
      };

      $scope.download = function() {
        if (!$scope.download_host || !$scope.download_filename) {
          toastService.error(
              'TFTP server IP address and file name are required!');
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
                  toastService.success('Download complete');
                  $scope.loadFirmwares();
                },
                function(error) {
                  console.log(error);
                  toastService.error(
                      'Image file from TFTP server "' + $scope.download_host +
                      '" could not be downloaded');
                  $scope.downloading = false;
                });
      };

      $scope.loadFirmwares = function() {
        APIUtils.getFirmwares().then(function(result) {
          const svg = require('../../assets/icons/icon-check.svg');
          const check =
              $sce.trustAsHtml(`<span class="icon__check-mark">${svg}<span>`);

          // Temporarily showing both System and BMC imageTypes
          // Currently after System imageType becomes functional once
          // the type is changed to 'BMC'. For now we will show System and BMC
          // images in a single table.
          const systemImageList = result.data.filter(
              image =>
                  image.imageType === 'System' || image.imageType === 'BMC')
          $scope.activeSystemImages =
              systemImageList
                  .filter(
                      image => (image.activationStatus === 'Active') ||
                          (image.activationStatus === 'Functional'))
                  .sort((a, b) => a.Priority - b.Priority);
          nextBootImage = $scope.activeSystemImages[0];
          $scope.tableData = systemImageList.map((image) => {
            // Only enable image delete action if the image activation
            // status is not Functional or Activating
            const deleteEnabled = image.activationStatus === 'Functional' ?
                false :
                image.activationStatus === 'Activating' ? false : true;
            image.actions = [{type: 'Delete', enabled: deleteEnabled}];

            if (image.activationStatus === 'Ready') {
              // If the activation status is 'Ready' (dirty) add the option to
              // activate image
              image.actions.unshift({type: 'Activate'})
            }
            const nextBoot =
                image.imageId === nextBootImage.imageId ? check : '';
            image.uiData = [nextBoot, image.activationStatus, image.Version];
            return image;
          });

          $scope.firmwares = result.data;
        });
      };

      $scope.onEmitRowAction = (value) => {
        switch (value.action) {
          case 'Delete':
            initDeleteModal(value.row);
            break;
          case 'Activate':
            initActivateModal(value.row)
            break;
          default:
        }
      };

      $scope.onClickChangeNextBoot = () => {
        initNextBootModal();
      };

      const checkHostOff = () => {
        const deferred = $q.defer();
        const start = new Date();
        const checkHostStatusInverval = $interval(() => {
          let now = new Date();
          let timePassed = now.getTime() - start.getTime();
          if (timePassed > Constants.TIMEOUT.HOST_OFF) {
            deferred.reject(Constants.MESSAGES.POLL.HOST_OFF_TIMEOUT);
            $interval.cancel(checkHostStatusInverval);
          }
          if (isServerOff()) {
            deferred.resolve();
            $interval.cancel(checkHostStatusInverval);
          }
        }, Constants.POLL_INTERVALS.POWER_OP);
        return deferred.promise;
      };

      const activateSystemImage = (imageId) => {
        return APIUtils.activateImage(imageId)
            .then(() => $scope.loadFirmwares())
            .then(() => waitForActive(imageId))
            .then(() => {
              toastService.success('Successfully activated image.');
              $scope.loadFirmwares();
            })
      };

      const deleteSystemImage = (imageId) => {
        APIUtils.deleteImage(imageId)
            .then(() => {
              toastService.success('Successfully deleted image.');
              $scope.loadFirmwares();
            })
            .catch(err => {
              console.log(err);
              toastService.error('Failed to delete image.');
            })
      };

      const changeImagePriority = (imageId) => {
        APIUtils.changePriority(imageId, 0).then((response) => {
          if (response.status == 'error') {
            toastService.error('Unable to update boot priority.');
          } else {
            toastService.success('Successfully changed boot priority.')
            $scope.loadFirmwares();
          }
        });
      };

      const initNextBootModal = () => {
        const template = require('./firmware-modal-next-boot.html');
        const functionalImage = $scope.activeSystemImages.find(
            image => image.activationStatus === 'Functional');
        const activeImage = $scope.activeSystemImages.find(
            image => image.activationStatus === 'Active');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controllerAs: 'modalCtrl',
              controller: function() {
                this.functionalImage = functionalImage;
                this.activeImage = activeImage;
                this.nextBootModel = nextBootImage.imageId;
                this.currentNextBootImageId = nextBootImage.imageId;
              }
            })
            .result
            .then((form) => {
              if (form.$valid) {
                const nextBootImageId = form.nextBoot.$modelValue;
                changeImagePriority(nextBootImageId);
              }
            })
            .catch(
                () => {
                    // do nothing
                })
      };

      const initDeleteModal = (image) => {
        const template = require('./firmware-modal-delete.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controllerAs: 'modalCtrl',
              controller: function() {
                this.imageVersion = image.Version;
              }
            })
            .result
            .then(() => {
              deleteSystemImage(image.imageId);
            })
            .catch(
                () => {
                    // do nothing
                })
      };

      const initActivateModal = (image) => {
        const template = require('./firmware-modal-activate.html');
        $uibModal
            .open({
              template,
              windowTopClass: 'uib-modal',
              ariaLabelledBy: 'dialog_label',
              controllerAs: 'modalCtrl',
              controller: function() {
                this.reboot = true;
              }
            })
            .result
            .then((reboot) => {
              if (reboot) {
                if (isServerOff()) {
                  activateSystemImage(image.imageId)
                      .then(() => APIUtils.bmcReboot())
                      .then(() => toastService.info('BMC is rebooting.'))
                } else {
                  // If host powered on, power off before reboot
                  activateSystemImage(image.imageId)
                      .then(() => APIUtils.hostPowerOff())
                      .then(() => checkHostOff())
                      .then(() => APIUtils.bmcReboot())
                      .then(() => toastService.info('BMC is rebooting.'))
                }
              } else {
                activateSystemImage(image.imageId)
              }
            })
            .catch(
                () => {
                    // do nothing
                })
      };

      $scope.loadFirmwares();
    }
  ]);
})(angular);
