window.angular &&
  (function(angular) {
    'use strict';

    angular.module('app.common.directives').directive('certificate', [
      'APIUtils',
      function(APIUtils) {
        return {
          restrict: 'E',
          template: require('./certificate.html'),
          scope: {cert: '=', reload: '&'},
          controller: [
            '$scope',
            'APIUtils',
            'toastService',
            function($scope, APIUtils, toastService) {
              const certificateType = 'PEM';
              $scope.replaceCertificate = function(certificate) {
                $scope.loading = true;
                if (
                  certificate.file.name.split('.').pop() !==
                  certificateType.toLowerCase()
                ) {
                  toastService.error(
                    'Certificate must be replaced with a .pem file.'
                  );
                  return;
                }
                const file = document.getElementById(
                  'upload_' + certificate.Description + certificate.Id
                ).files[0];
                const reader = new FileReader();
                reader.onloadend = function(e) {
                  const data = {};
                  data.CertificateString = e.target.result;
                  data.CertificateUri = {'@odata.id': certificate['@odata.id']};
                  data.CertificateType = certificateType;
                  APIUtils.replaceCertificate(data).then(
                    function(data) {
                      $scope.loading = false;
                      toastService.success(
                        certificate.Description + ' was replaced.'
                      );
                      $scope.reload();
                    },
                    function(error) {
                      console.log(error);
                      $scope.loading = false;
                      toastService.error(
                        'Unable to replace ' + certificate.Description
                      );
                    }
                  );
                };
                reader.readAsBinaryString(file);
              };
            },
          ],
        };
      },
    ]);
  })(window.angular);
