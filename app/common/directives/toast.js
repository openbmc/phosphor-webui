/*!
 * This was taken from ngToast and modified
 * ngToast v2.0.0 (http://tameraydin.github.io/ngToast)
 * Copyright 2016 Tamer Aydin (http://tamerayd.in)
 * Licensed under MIT (http://tameraydin.mit-license.org/)
 */

(function(window, angular, undefined) {
'use strict';

angular.module('toast.provider', []).provider('toast', [
  function() {
    var messages = [], messageStack = [];


    function Message(msg) {
      var id = Math.floor(Math.random() * 1000);
      while (messages.indexOf(id) > -1) {
        id = Math.floor(Math.random() * 1000);
      }

      this.id = id;

      angular.extend(this, msg);
    }

    this.$get = [function() {
      var _createWithClassName = function(className, msg) {
        var msgTitle = (className === 'danger') ? 'Error' : 'Success!';
        msg = (typeof msg === 'object') ? msg : {title: msgTitle, content: msg};
        msg.className = className;

        return this.create(msg);
      };

      return {
        messages: messages,
        dismiss: function(id) {
          if (id) {
            for (var i = messages.length - 1; i >= 0; i--) {
              if (messages[i].id === id) {
                messages.splice(i, 1);
                messageStack.splice(messageStack.indexOf(id), 1);
                return;
              }
            }

          } else {
            while (messages.length > 0) {
              messages.pop();
            }
            messageStack = [];
          }
        },
        create: function(msg) {
          msg = (typeof msg === 'object') ? msg : {content: msg};

          // max number of toasts
          if (messageStack.length >= 6) {
            this.dismiss(messageStack[0]);
          }

          var newMsg = new Message(msg);
          messages['unshift'](newMsg);
          messageStack.push(newMsg.id);

          return newMsg.id;
        },
        success: function(msg) {
          return _createWithClassName.call(this, 'success', msg);
        },
        error: function(msg) {
          return _createWithClassName.call(this, 'danger', msg);
        }
      };
    }];
  }
]);
})(window, window.angular);

(function(window, angular) {
'use strict';

angular.module('toast.directives', ['toast.provider'])
    .run([
      '$templateCache',
      function($templateCache) {
        $templateCache.put(
            'toast/toast.html',
            '<div class="ng-toast ng-toast--top ng-toast--right ng-toast--animate-fade">' +
                '<ul class="ng-toast__list">' +
                '<toast-message ng-repeat="message in messages" ' +
                'message="message">' +
                '<span class="title" ng-bind-html="message.title"></span>' +
                '<br>' +
                '<span ng-bind-html="message.content"></span>' +
                '</toast-message>' +
                '</ul>' +
                '</div>');
        $templateCache.put(
            'toast/toastMessage.html',
            '<li class="ng-toast__message"' +
                'ng-mouseenter="onMouseEnter()"' +
                'ng-mouseleave="onMouseLeave()">' +
                '<div class="alert toastMessage alert-dismissible alert-{{message.className}}"> ' +
                '<button type="button" class="close" ' +
                'ng-bind-html="\'&times;\'" ' +
                'ng-click="dismiss()">' +
                '</button>' +
                '<span ng-transclude></span>' +
                '</div>' +
                '</li>');
      }
    ])
    .directive(
        'toast',
        [
          'toast', '$templateCache',
          function(toast, $templateCache) {
            return {
              replace: true,
              restrict: 'EA',
              templateUrl: 'toast/toast.html',
              compile: function(tElem, tAttrs) {
                if (tAttrs.template) {
                  var template = $templateCache.get(tAttrs.template);
                  if (template) {
                    tElem.replaceWith(template);
                  }
                }
                return function(scope) {
                  scope.messages = toast.messages;
                };
              }
            };
          }
        ])
    .directive('toastMessage', [
      '$timeout', 'toast',
      function($timeout, toast) {
        return {
          replace: true,
          transclude: true,
          restrict: 'EA',
          scope: {message: '='},
          controller: [
            '$scope', 'toast',
            function($scope, toast) {
              $scope.dismiss = function() {
                toast.dismiss($scope.message.id);
              };
            }
          ],
          templateUrl: 'toast/toastMessage.html',
          link: function(scope, element, attrs, ctrl, transclude) {
            element.attr('data-message-id', scope.message.id);

            var dismissTimeout;

            scope.cancelTimeout = function() {
              $timeout.cancel(dismissTimeout);
            };


            // set timeout
            scope.startTimeout = function() {
              dismissTimeout = $timeout(function() {
                toast.dismiss(scope.message.id);
              }, 10000);
            };

            scope.onMouseEnter = function() {
              scope.cancelTimeout();
            };

            scope.onMouseLeave = function() {
              scope.startTimeout();
            };


            scope.startTimeout();

            element.bind('click', function() {
              toast.dismiss(scope.message.id);
              scope.$apply();
            });
          }
        };
      }
    ]);
})(window, window.angular);

(function(window, angular) {
'use strict';

angular.module('toast', ['ngSanitize', 'toast.directives', 'toast.provider']);
})(window, window.angular);
