/**
 * userModel
 *
 * @module app/common/services/userModel
 * @exports userModel
 * @name userModel

 * @version 0.0.1
 */

window.angular && (function (angular) {
    'use strict';

    angular
        .module('app.common.services')
        .service('userModel', ['APIUtils',function(APIUtils){
            return {
                fakeLogin: function(callback){
                    sessionStorage.setItem('LOGIN_ID', 'FAKE_ID');
                },
                login : function(username, password, callback){
                    APIUtils.login(username, password, function(response, error){
                        if(response && 
                           response.status == APIUtils.API_RESPONSE.SUCCESS_STATUS){
                            sessionStorage.setItem('LOGIN_ID', username);
                            callback(true);
                        }else{
                            callback(false, error);
                        }
                    });
                },
                isLoggedIn : function(){
                    if(sessionStorage.getItem('LOGIN_ID') === null){
                        return false;
                    }
                    return true;
                },
                logout : function(callback){
                    APIUtils.logout(function(response, error){
                        if(response &&
                           response.status == APIUtils.API_RESPONSE.SUCCESS_STATUS){
                            sessionStorage.removeItem('LOGIN_ID');
                            callback(true);
                        }else if(response.status == APIUtils.API_RESPONSE.ERROR_STATUS){
                            callback(false);
                        }else{
                            callback(false, error);
                        }
                    });
                }
            };
        }]);

})(window.angular);