window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('certificate', [
    'APIUtils',
    function(APIUtils) {
      return {
        'restrict': 'E',
        'template': require('./certificate.html'),
        'scope': {'cert': '=', 'reload': '&'},
        'controller': [
          '$scope', 'APIUtils', 'toastService',
          function($scope, APIUtils, toastService) {
            var certificateType = 'PEM';
            $scope.replaceCertificate = function(certificate) {
              if (certificate.file.name.split('.').pop() !==
                  certificateType.toLowerCase()) {
                toastService.error(
                    'Certificate must be replaced with a .pem file ');
                return;
              }
              var f =
                  document
                      .getElementById(
                          'upload_' + certificate.Description + certificate.Id)
                      .files[0];
              var r = new FileReader();
              r.onloadend = function(e) {
                var data = {};
                data.CertificateString = e.target.result;
                data.CertificateUri = {'@odata.id': certificate['@odata.id']};
                data.CertificateType = certificateType;
                APIUtils.replaceCertificate(data).then(
                    function(data) {
                      toastService.success(
                          certificate.Description + ' was replaced.');
                      $scope.reload();
                    },
                    function(error) {
                      console.log(error);
                      toastService.error(
                          'Unable to replace ' + certificate.Description);
                      $scope.loading = false;
                    });
              };
              r.readAsBinaryString(f);
            };
          }
        ]
      };
    }
  ]);
})(window.angular);
