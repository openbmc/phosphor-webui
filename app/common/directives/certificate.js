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
            $scope.uploadCertificate = function(cert) {
              console.log('uploading');
              APIUtils.addNewCertificate(cert.file, cert.location)
                  .then(
                      function(data) {
                        toastService.success(
                            cert.Description + ' was uploaded.');
                        $scope.reload();
                      },
                      function(error) {
                        toastService.error(
                            'Unable to upload ' + cert.Description);
                        console.log(JSON.stringify(error));
                      });
            };
            $scope.replaceCertificate = function(certificate) {
              var f =
                  document.getElementById('upload_' + certificate.Description)
                      .files[0];
              var r = new FileReader();
              r.onloadend = function(e) {
                var data = {};
                data.CertificateString = e.target.result;
                data.CertificateUri = certificate['@odata.id'];
                APIUtils.replaceCertificate(data).then(
                    function(data) {
                      toastService.success(cert.Description + ' was replaced.');
                      $scope.reload();
                    },
                    function(error) {
                      console.log(JSON.stringify(error));
                      toastService.error(
                          'Unable to replace ' + cert.Description);
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
