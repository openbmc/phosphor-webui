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
                'Constants',
                function ($scope, $window, APIUtils, dataService, $location, $anchorScroll, Constants) {
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
                    $scope.activate_confirm = false;
                    $scope.delete_image_id = "";
                    $scope.delete_image_version = "";
                    $scope.activate_image_id = "";
                    $scope.activate_image_version = "";
                    $scope.priority_image_id = "";
                    $scope.priority_image_version = "";
                    $scope.priority_from = -1;
                    $scope.priority_to = -1;
                    $scope.confirm_priority = false;
                    $scope.file_empty = true;
                    $scope.uploading = false;

                    $scope.error = {
                        modal_title: "",
                        title: "",
                        desc: "",
                        type: "warning"
                    };

                    $scope.activateImage = function(imageId, imageVersion){
                        $scope.activate_image_id = imageId;
                        $scope.activate_image_version = imageVersion;
                        $scope.activate_confirm = true;
                    }

                    $scope.displayError = function(data){
                        $scope.error = data;
                        $scope.display_error = true;
                    }

                    $scope.activateConfirmed = function(){
                        $scope.uploading = true;
                        APIUtils.activateImage($scope.activate_image_id).then(function(response){
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
                        $scope.activate_confirm = false;
                    }

                    $scope.upload = function(){
                        if($scope.file) {
                            $scope.uploading = true;
                            APIUtils.uploadImage($scope.file).then(function(response){
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
                        }
                    }

                    $scope.download = function(){
                        $scope.downloading = true;
                        APIUtils.downloadImage($scope.download_host, $scope.download_filename).then(function(response){
                            var data = response.data;
                            $scope.downloading = false;
                            var headers = response.headers();

                            var filename = headers['x-filename'];
                            var contentType = headers['content-type'];

                            if(!headers['x-filename']){
                                filename = $scope.download_filename;
                            }

                            var linkElement = document.createElement('a');
                            try {
                                var blob = new Blob([data], { type: contentType });
                                var url = window.URL.createObjectURL(blob);

                                linkElement.setAttribute('href', url);
                                linkElement.setAttribute("download", filename);

                                var clickEvent = new MouseEvent("click", {
                                    "view": window,
                                    "bubbles": true,
                                    "cancelable": false
                                });
                                linkElement.dispatchEvent(clickEvent);
                            } catch (ex) {
                                console.log(ex);
                            }
                        });
                    }

                    $scope.changePriority = function(imageId, imageVersion, from, to){
                        $scope.priority_image_id = imageId;
                        $scope.priority_image_version = imageVersion;
                        $scope.priority_from = from;
                        $scope.priority_to = to;
                        $scope.confirm_priority = true;
                    }

                    $scope.confirmChangePriority = function(){
                        $scope.loading = true;
                        APIUtils.changePriority($scope.priority_image_id, $scope.priority_to).then(function(response){
                            $scope.loading = false;
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
                        $scope.confirm_priority = false;
                    }
                    $scope.deleteImage = function(imageId, imageVersion){
                        $scope.delete_image_id = imageId;
                        $scope.delete_image_version = imageVersion;
                        $scope.confirm_delete = true;
                    }
                    $scope.confirmDeleteImage = function(){
                        $scope.loading = true;
                        APIUtils.deleteImage($scope.delete_image_id).then(function(response){
                            $scope.loading = false;
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
