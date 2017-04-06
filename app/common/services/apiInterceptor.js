/**
 * api Interceptor
 *
 * @module app/common/services/apiInterceptor
 * @exports apiInterceptor
 * @name apiInterceptor

 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.services')
        .service('apiInterceptor', ['$q', '$rootScope', 'dataService', function($q, $rootScope, dataService){
            return {
                'request': function(config){
                    dataService.loading = true;
                    config.timeout = 10000;
                    return config;
                },
                'response': function(response){
                    dataService.loading = false;

                    //not interested in template requests
                    if(!/^https?\:/i.test(response.config.url)){
                        return response;
                    }

                    dataService.last_updated = new Date();
                    if(response == null){
                        dataService.server_unreachable = true;
                    }else{
                        dataService.server_unreachable = false;
                    }

                    if(response && response.status == 'error' &&
                       dataService.path != '/login'){
                        $rootScope.$emit('timedout-user', {});
                    }

                    return response;
                },
                'responseError': function(rejection){
                    dataService.server_unreachable = true;
                    dataService.loading = false;
                    if(dataService.path != '/login'){
                        $rootScope.$emit('timedout-user', {});
                    }
                    return $q.reject(rejection);
                }
            };
        }]);

})(window.angular);