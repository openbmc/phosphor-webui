/**
 * Controller for Certificate Management
 *
 * @module app/configuration
 * @exports certificateController
 * @name certificateController
 */

window.angular &&
  (function(angular) {
    'use strict';

    angular.module('app.configuration').controller('certificateController', [
      '$scope',
      'APIUtils',
      '$q',
      'Constants',
      'toastService',
      function($scope, APIUtils, $q, Constants, toastService) {
        $scope.loading = false;
        $scope.certificates = [];
        $scope.availableCertificateTypes = [];
        $scope.addCertificateModal = false;
        $scope.newCertificate = {};
        $scope.submitted = false;

        $scope.loadCertificates = function() {
          $scope.certificates = [];
          $scope.availableCertificateTypes = Constants.CERTIFICATE_TYPES;
          $scope.loading = true;
          // Use Certificate Service to get the locations of all the certificates,
          // then add a promise for fetching each certificate
          APIUtils.getCertificateLocations().then(
            function(data) {
              const promises = [];
              const locations = data.Links.Certificates;
              for (const i in locations) {
                const location = locations[i];
                promises.push(getCertificatePromise(location['@odata.id']));
              }
              $q.all(promises)
                .catch(function(error) {
                  toastService.error('Failed to load certificates.');
                  console.log(JSON.stringify(error));
                })
                .finally(function() {
                  $scope.loading = false;
                });
            },
            function(error) {
              $scope.loading = false;
              $scope.availableCertificateTypes = [];
              toastService.error('Failed to load certificates.');
              console.log(JSON.stringify(error));
            }
          );
        };

        $scope.uploadCertificate = function() {
          if ($scope.newCertificate.file.name.split('.').pop() !== 'pem') {
            toastService.error('Certificate must be a .pem file.');
            return;
          }
          $scope.addCertificateModal = false;
          APIUtils.addNewCertificate(
            $scope.newCertificate.file,
            $scope.newCertificate.selectedType
          ).then(
            function(data) {
              toastService.success(
                $scope.newCertificate.selectedType.Description +
                  ' was uploaded.'
              );
              $scope.newCertificate = {};
              $scope.loadCertificates();
            },
            function(error) {
              toastService.error(
                $scope.newCertificate.selectedType.Description +
                  ' failed upload.'
              );
              console.log(JSON.stringify(error));
            }
          );
        };

        var getCertificatePromise = function(url) {
          const promise = APIUtils.getCertificate(url).then(function(data) {
            const certificate = data;
            isExpiring(certificate);
            updateAvailableTypes(certificate);
            $scope.certificates.push(certificate);
          });
          return promise;
        };

        var isExpiring = function(certificate) {
          // if ValidNotAfter is less than or equal to 30 days from today
          // (2592000000), isExpiring. If less than or equal to 0, is expired.
          const difference = certificate.ValidNotAfter - new Date();
          if (difference <= 0) {
            certificate.isExpired = true;
          } else if (difference <= 2592000000) {
            certificate.isExpiring = true;
          } else {
            certificate.isExpired = false;
            certificate.isExpiring = false;
          }
        };

        var updateAvailableTypes = function(certificate) {
          // TODO: at this time only one of each type of certificate is allowed.
          // When this changes, this will need to be updated.
          // Removes certificate type from available types to be added.
          $scope.availableCertificateTypes = $scope.availableCertificateTypes.filter(
            function(type) {
              return type.Description !== certificate.Description;
            }
          );
        };

        $scope.getDays = function(endDate) {
          // finds number of days until certificate expiration
          const ms = endDate - new Date();
          return Math.floor(ms / (24 * 60 * 60 * 1000));
        };

        $scope.loadCertificates();
      },
    ]);
  })(angular);
