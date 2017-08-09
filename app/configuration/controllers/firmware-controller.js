/**
 * Controller for firmware
 *
 * @module app/configuration
 * @exports firmwareController
 * @name firmwareController
 * @version 0.1.0
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.configuration')
        .controller('firmwareController', [
                '$scope',
                '$window',
                'APIUtils',
                'dataService',
                '$location',
                '$anchorScroll',
                function ($scope, $window, APIUtils, dataService, $location, $anchorScroll) {
                    $scope.dataService = dataService;

                    //Scroll to target anchor
                    $scope.gotoAnchor = function () {
                        $location.hash('upload');
                        $anchorScroll();
                    };

                    $scope.firmwares = [];
                    $scope.bmcActiveVersion = "";
                    $scope.hostActiveVersion = "";
                    $scope.display_error = false;
                    $scope.confirm_upload_image = false;
                    $scope.reboot_confirm = false;
                    $scope.preserve_settings_confirm = false;
                    $scope.delete_image_id = "";
                    $scope.activate_image_id = "";
                    $scope.file_empty = true;
                    $scope.uploading = false;

                    $scope.error = {
                        modal_title: "",
                        title: "",
                        desc: "",
                        type: "warning"
                    };

                    $scope.activateImage = function(imageId){
                        $scope.activate_image_id = imageId;
                        $scope.preserve_settings_confirm = true;
                    }

                    $scope.displayError = function(data){
                        $scope.error = data;
                        $scope.display_error = true;
                    }

                    $scope.preserveSettingsConfirmed = function(){
                        //show progress..callapi..hide..iferror..show error
                        $scope.preserve_settings_confirm = false;
                    }

                    $scope.confirmWarmReboot = function(){
                        $scope.reboot_confirm = false;
                    }

                    $scope.upload = function(){
                        if(!$scope.file_empty){
                            $scope.confirm_upload_image = true;
                        }
                    }
                    $scope.confirmUpload = function(){
                        $scope.uploading = true;
                        APIUtils.uploadImage($scope.file, function(response){
                            $scope.uploading = false; 
                            if(response.status == 'error'){
                                $scope.displayError({
                                    modal_title: response.data.description,
                                    title: response.data.description,
                                    desc: response.data.exception,
                                    type: 'Error'
                                });
                            }else{
                                $scope.loadFirmwares();
                            }
                        });
                        $scope.confirm_upload_image = false;
                    }

                    $scope.deleteImage = function(imageId){
                        $scope.delete_image_id = imageId;
                        $scope.confirm_delete = true;
                    }
                    $scope.confirmDeleteImage = function(imageId){
                        $scope.confirm_delete = false;
                    }

                    $scope.fileNameChanged = function(){
                        $scope.file_empty = false;
                    }

                    $scope.uploading = false;
                    $scope.filters = {
                        bmc: {
                            imageType: 'BMC'
                        },
                        host: {
                            imageType: 'Host'
                        }
                    };

                    $scope.loadFirmwares = function(){
                        APIUtils.getFirmwares().then(function(result){
                           $scope.firmwares = result.data;
                           $scope.bmcActiveVersion = result.bmcActiveVersion;
                           $scope.hostActiveVersion = result.hostActiveVersion;
                        });
                    }

                    $scope.loadFirmwares();
                }
            ]
        );

})(angular);
