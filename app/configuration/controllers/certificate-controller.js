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
    '$scope', 'APIUtils', '$q', 'Constants', 'toastService', '$timeout',
    function($scope, APIUtils, $q, Constants, toastService, $timeout) {
      $scope.loading = false;
      $scope.certificates = [];
      $scope.availableCertificateTypes = [];
      $scope.allCertificateTypes = Constants.CERTIFICATE_TYPES;
      $scope.addCertificateModal = false;
      $scope.addCSRModal = false;
      $scope.newCertificate = {};
      $scope.newCSR = {};
      $scope.submitted = false;
      $scope.csrSubmitted = false;
      $scope.csrCode = '';
      $scope.displayCSRCode = false;
      $scope.keyBitLength = Constants.CERTIFICATE.KEY_BIT_LENGTH;
      $scope.keyUsage = Constants.CERTIFICATE.KEY_USAGE;
      $scope.keyPairAlgorithm = Constants.CERTIFICATE.KEY_PAIR_ALGORITHM;
      $scope.keyCurveId = Constants.CERTIFICATE.KEY_CURVE_ID;
      $scope.countryList = Constants.COUNTRIES;


      $scope.loadCertificates = function() {
        $scope.certificates = [];
        $scope.availableCertificateTypes = Constants.CERTIFICATE_TYPES;
        $scope.loading = true;
        // Use Certificate Service to get the locations of all the certificates,
        // then add a promise for fetching each certificate
        APIUtils.getCertificateLocations().then(
            function(data) {
              var promises = [];
              var locations = data.Links.Certificates;
              for (var i in locations) {
                var location = locations[i];
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
            });
      };

      $scope.uploadCertificate = function() {
        if ($scope.newCertificate.file.name.split('.').pop() !== 'pem') {
          toastService.error('Certificate must be a .pem file.');
          return;
        }
        $scope.addCertificateModal = false;
        APIUtils
            .addNewCertificate(
                $scope.newCertificate.file, $scope.newCertificate.selectedType)
            .then(
                function(data) {
                  toastService.success(
                      $scope.newCertificate.selectedType.Description +
                      ' was uploaded.');
                  $scope.newCertificate = {};
                  $scope.loadCertificates();
                },
                function(error) {
                  toastService.error(
                      $scope.newCertificate.selectedType.Description +
                      ' failed upload.');
                  console.log(JSON.stringify(error));
                });
      };

      var getCertificatePromise = function(url) {
        var promise = APIUtils.getCertificate(url).then(function(data) {
          var certificate = data;
          isExpiring(certificate);
          updateAvailableTypes(certificate);
          $scope.certificates.push(certificate);
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

      // add optional name
      $scope.names = [];
      $scope.addOptionalRow = function() {
        $scope.names.push({Value: ''})
      };

      // remove optional name row
      $scope.deleteOptionalRow = function(index) {
        $scope.names.splice(index, 1);
        if ($scope.names.length == 0) {
          $scope.names = [];
        }
      };


      // create a CSR object to send to the backend
      $scope.getCSRCode = function() {
        var addCSR = {};
        let alternativeNames = $scope.names.map(name => name.Value);

        // if user provided a first alternative name then push to alternative
        // names array
        $scope.newCSR.firstAlternativeName ?
            alternativeNames.push($scope.newCSR.firstAlternativeName) :
            $scope.newCSR.firstAlternativeName = '';


        addCSR.CertificateCollection = {
          '@odata.id': $scope.newCSR.certificateCollection.location
        };
        addCSR.CommonName = $scope.newCSR.commonName;
        addCSR.ContactPerson = $scope.newCSR.contactPerson || '';
        addCSR.City = $scope.newCSR.city;
        addCSR.AlternativeNames = alternativeNames || [];
        addCSR.ChallengePassword = $scope.newCSR.challengePassword || '';
        addCSR.Email = $scope.newCSR.emailAddress || '';
        addCSR.Country = $scope.newCSR.countryCode.code;
        addCSR.Organization = $scope.newCSR.organization;
        addCSR.OrganizationalUnit = $scope.newCSR.companyUnit;
        addCSR.KeyCurveId = $scope.newCSR.keyCurveId || '';
        addCSR.KeyBitLength = $scope.newCSR.keyBitLength
        addCSR.KeyPairAlgorithm = $scope.newCSR.keyPairAlgorithm || '';
        addCSR.KeyUsage = $scope.newCSR.keyUsage || [];
        addCSR.State = $scope.newCSR.state;

        APIUtils.createCSRCertificate(addCSR).then(
            function(data) {
              $scope.displayCSRCode = true;
              $scope.csrCode = data;
            },
            function(error) {
              $scope.addCSRModal = false;
              toastService.error(
                  'Unable to generate CSR. Log out and try again.');
              $scope.resetModal()
              console.log(JSON.stringify(error));
            })
      };

      // resetting the modal when user clicks cancel/closes the
      // modal
      $scope.resetCSRModal = function() {
        $scope.addCSRModal = false;
        $scope.displayCSRCode = false;
        $scope.newCSR.certificateCollection = $scope.selectOption;
        $scope.newCSR.commonName = '';
        $scope.newCSR.contactPerson = '';
        $scope.newCSR.city = '';
        $scope.names = [];
        $scope.newCSR.challengePassword = '';
        $scope.newCSR.emailAddress = '';
        $scope.newCSR.countryCode = '';
        $scope.newCSR.keyCurveId = '';
        $scope.newCSR.firstAlternativeName = '';
        $scope.newCSR.keyBitLength = $scope.selectOption;
        $scope.newCSR.keyPairAlgorithm = $scope.selectOption;
        $scope.newCSR.keyUsage = [];
        $scope.newCSR.organization = '';
        $scope.newCSR.companyUnit = '';
        $scope.newCSR.state = '';
      };

      // copies the CSR code
      $scope.copySuccess = function(event) {
        $scope.copied = true;
        $timeout(function() {
          $scope.copied = false;
        }, 5000);
      };
      $scope.copyFailed = function(err) {
        console.log(JSON.stringify(err));
      };


      var updateAvailableTypes = function(certificate) {
        // TODO: at this time only one of each type of certificate is allowed.
        // When this changes, this will need to be updated.
        // Removes certificate type from available types to be added.
        $scope.availableCertificateTypes =
            $scope.availableCertificateTypes.filter(function(type) {
              return type.Description !== certificate.Description;
            });
      };

      $scope.getDays = function(endDate) {
        // finds number of days until certificate expiration
        var ms = endDate - new Date();
        return Math.floor(ms / (24 * 60 * 60 * 1000));
      };

      $scope.loadCertificates();
    }
  ]);
})(angular);
