/**
 * Controller for Certificate Management
 *
 * @module app/configuration
 * @exports certificateController
 * @name certificateController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.configuration').controller('certificateController', [
    '$scope', 'APIUtils', '$q', 'Constants',
    function($scope, APIUtils, $q, Constants) {
      $scope.loading = true;
      $scope.certificates = [];

      $scope.loadCertificates = function() {
        $scope.certificates = [];
        $scope.loading = true;
        APIUtils.getCertificateLocations().then(
            function(data) {
              var promises = [];
              var locations = data.Links.Certificates;
              for (var i in locations) {
                var location = locations[i];
                promises.push(getCertificatePromise(location['@odata.id']));
              }
              $q.all(promises).finally(function() {
                addEmptyCertTypes();
                $scope.loading = false;
              });
            },
            function(error) {
              console.log(JSON.stringify(error));
              $scope.loading = false;
            });
      };
      var getCertificatePromise = function(url) {
        var promise = APIUtils.getCertificate(url).then(
            function(data) {
              var certificate = data;
              isExpiring(certificate);
              $scope.certificates.push(certificate);
            },
            function(error) {
              console.log(JSON.stringify(error));
            });
        return promise;
      };
      var isExpiring = function(certificate) {
        // if ValidNotAfter is less than or equal to 30 days from today
        // (2592000000), isExpiring. If less than or equal to 0, is expired.
        var difference = certificate.ValidNotAfter - new Date();
        if (difference <= 0) {
          certificate.isExpired = true;
        } else if (difference <= 2592000000) {
          certificate.isExpiring = true;
        } else {
          certificate.isExpired = false;
          certificate.isExpiring = false;
        }
      };
      var addEmptyCertTypes = function() {
        // add certificate types that are not returned by certificate service
        // but are available to upload
        var types = $scope.certificates.map(function(a) {
          return a.Description;
        });
        var typesNotUploaded =
            Constants.CERTIFICATE_TYPES.filter(function(type) {
              return !types.includes(type.Description);
            });
        $scope.certificates = $scope.certificates.concat(typesNotUploaded);
      };

      $scope.getDays = function(endDate) {
        // finds number of days until end date
        var ms = endDate - new Date();
        return Math.floor(ms / (24 * 60 * 60 * 1000));
      };

      $scope.loadCertificates();
    }
  ]);
})(angular);
