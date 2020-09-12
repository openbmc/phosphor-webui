/**
 * Directive for full-sreen element
 *
 * @module app/serverControl
 * @exports kvmWindowController
 * @name kvmWindowController
 */


window.angular && (function(angular) {
  'use strict';

  angular.module('app.common.directives').directive('fullscreenBtn', [
    '$document',
    function($document) {
      return {
        restrict: 'A',
        scope: {target: '@target', isFullscreen: '=?', onChange: '&'},
        link: function(scope, element, attrs) {
          var doc = $document[0];
          var onChange = function() {
            scope.$apply(function() {
              scope.isFullscreen = !!(
                  document.fullscreenElement || document.mozFullScreenElement ||
                  document.webkitFullscreenElement);
              scope.onChange({fullscreen: scope.isFullscreen});
            });
          };

          angular.forEach(['', 'moz', 'webkit'], function(prefix) {
            $document.bind(prefix + 'fullscreenchange', onChange);
          });

          element.bind('click', function(event) {
            event && event.preventDefault();

            var el;
            if (scope.target) {
              if (angular.isString(scope.target)) {
                el = doc.querySelector(scope.target);
              }
            } else {
              el = doc.documentElement;
            }

            if (!el) return;

            if (document.fullscreenElement ||     // alternative standard method
                document.mozFullScreenElement ||  // currently working methods
                document.webkitFullscreenElement ||
                document.msFullscreenElement) {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
              }
            } else {
              if (el.requestFullscreen) {
                el.requestFullscreen();
              } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
              } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
              } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
              }
            }
          });
        }
      };
    }
  ]);
})(window.angular);
