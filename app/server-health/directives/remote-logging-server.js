window.angular && (function(aungular) {
  'use strict';

  angular.module('app.common.directives').directive('remoteLoggingServer', [
    'APIUtils',
    function(APIUtils) {
      return {
        'restrict': 'E',
        'template': require('./remote-logging-server.html'),
        'controller': [
          '$scope', '$uibModal', 'toastService',
          function($scope, $uibModal, toastService) {
            var modalTemplate = `
            <div role="dialog" class="uib-modal__content  remote-logging-server__modal">
              <span class="icon  icon__close  float-right" ng-click="$close()"></span>
              <div class="modal-header">
                <h2 class="modal-title">{{activeModalProps.title}}</h2>
              </div>
              <div ng-if="activeModal !== 2" class="modal-body">
                <form name="form">
                  <label for="remoteServerIP">Hostname or IP Address</label>
                  <input id="remoteServerIP" type="text" required name="hostname"
                    ng-model="remoteServerForm.hostname" />
                  <div ng-if="form.hostname.$invalid" class="form__validation-message">
                    <span ng-show="form.hostname.$error.required">Value required</span>
                  </div>
                  <label for"remoteServerPort">Port</label>
                  <p class="label__helper-text">Value must be between 0 – 65535</p>
                  <input id="remoteServerPort" type="number" required name="port"
                    min="0" max="65535" ng-model="remoteServerForm.port"/>
                  <div ng-if="form.port.$invalid" class="form__validation-message">
                    <span ng-show="form.port.$error.required">Value required</span>
                    <span ng-show="form.port.$error.min || form.port.$error.max">
                    Value must be between 0 – 65535
                    </span>
                  </div>
                </form>
              </div>
              <div ng-if="activeModal === 2" class="modal-body">
                <p>Are you sure you want to remove remote logging server
                 {{remoteServer.hostname}}?</p>
              </div>
              <div class="modal-footer">
                <button class="button btn-secondary" ng-click="$close();">
                  Cancel</button>
                <button class="button btn-primary" ng-click="$close(activeModal)">
                  {{activeModalProps.actionLabel}}</button>
              </div>
            </div>`;

            const modalActions = {
              ADD: 0,
              EDIT: 1,
              REMOVE: 2,
              properties: {
                0: {
                  title: 'Add remote logging server',
                  actionLabel: 'Add',
                  successMessage: 'Connected to remote logging server.',
                  errorMessage: 'Unable to connect to server.'
                },
                1: {
                  title: 'Edit remote logging server',
                  actionLabel: 'Save',
                  successMessage: 'Remote logging server updated.',
                  errorMessage: ''
                },
                2: {
                  title: 'Remove logging server',
                  actionLabel: 'Remove',
                  successMessage: 'Remote logging server removed.',
                  errorMessage: ''
                }
              }
            }

            $scope.activeModal;
            $scope.activeModalProps;

            $scope.remoteServer;
            $scope.remoteServerForm;

            var addServer = function() {
              // Add server API call
              $scope.loading = true;
              setTimeout(() => {
                $scope.loading = false;
                toastService.success($scope.activeModalProps.successMessage);
              }, 200);
            }

            var editServer = function() {
              // Edit server API call
              toastService.success($scope.activeModalProps.successMessage);
            }

            var removeServer = function() {
              // Remove server API call
              $scope.remoteServer = undefined;
              setFormValues();
              toastService.success($scope.activeModalProps.successMessage);
            }

            var setFormValues = function() {
              $scope.remoteServerForm = {...$scope.remoteServer};
              // $scope.form.$setPristine();
            }

            this.$onInit = function() {
              // Load remote logging server
              $scope.remoteServer = {};
              $scope.remoteServer.hostname = '9.3.185.33';
              $scope.remoteServer.port = 1234;
              $scope.remoteServer.status = true;
              setFormValues();
            }

            $scope.initModal = function(type) {
              if(type === undefined) { return; }
              $scope.activeModal = type;
              $scope.activeModalProps = modalActions.properties[type];
              var modalInstance = $uibModal.open({
                template: modalTemplate,
                windowTopClass: 'uib-modal',
                scope: $scope,
              });
              modalInstance.result.then(function(action) {
                switch (action) {
                  case modalActions.ADD:
                    addServer();
                    break;
                  case modalActions.EDIT:
                    editServer();
                    break;
                  case modalActions.REMOVE:
                    removeServer();
                    break;
                  default:
                    setFormValues();
                }
              }).catch(function() {
                // reset form when modal overlay clicked
                // and modal closes
                setFormValues();
              })
            }

          }]
      }
    }
  ])
})(window.angular);