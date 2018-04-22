/**
 * Controller for kvm
 *
 * @module app/kvm
 * @exports kvmController
 * @name kvmController
 * @version 0.1.0
 */

import RFB from '@novnc/novnc/core/rfb.js';
import { init_logging as main_init_logging } from '@novnc/novnc/core/util/logging.js';


window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.kvm')
        .controller('kvmController', [
            '$scope',
            '$location',
            '$window',
            '$log',
            function ($scope, $location, $window, $log) {
                $scope.desktopName = "";
                var rfb;

                $scope.$on("$destroy", function () {
                    if (rfb) {
                        rfb.disconnect();
                    }
                });

                function updateDesktopName(rfb, name) {
                    $scope.desktopName = name;
                };

                function sendCtrlAltDel() {
                    rfb.sendCtrlAltDel();
                    return false;
                };

                function connected(e) {
                    $log.debug("RFB Connected");
                }
                function disconnected(e) {
                    $log.debug("RFB disconnected");
                }

                var host = $location.host();
                var port = $location.port();
                var target = angular.element(document.querySelector('#noVNC_container'))[0];
                main_init_logging("debug");
                try {
                    rfb = new RFB(target,
                        "wss://" + host + ":" + port + "/kvmws", {});

                    rfb.addEventListener("connect", connected);
                    rfb.addEventListener("disconnect", disconnected);
                    rfb.addEventListener("desktopname", updateDesktopName);
                } catch (exc) {
                    $log.error(exc);
                    updateState(null, 'fatal', null, 'Unable to create RFB client -- ' + exc);
                    return; // don't continue trying to connect
                };

                function status(text, level) {
                    var status_bar = angular.element(document.querySelector('#noVNC_status_bar'))[0];
                    // Need to check if the status bar still exists.  On page change, it gets destroyed
                    // when we swap to a different view.  The system will disconnect async
                    if (status_bar) {
                        status_bar.textContent = text;
                    }

                    var status = angular.element(document.querySelector('#noVNC_status'))[0];
                    switch (level) {
                        case 'normal':
                        case 'warn':
                        case 'error':
                            break;
                        default:
                            level = "warn";
                    }
                    if (status) {
                        status.setAttribute("class", "noVNC_status_" + level);
                    }
                };
            }
        ]
        );

})(angular);