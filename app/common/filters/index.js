window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.filters', [])
        .filter('unResolvedCount', function () {
            return function (data) {
               data = data.filter(function(item){
                  return item.Resolved == 0;
               });
               return data.length;
            }
        });

})(window.angular);
