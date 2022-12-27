(function(){
    'use strict';

    angular.module('sensorhub', [
        'ngCookies',
        'sensorhub.config',
        'sensorhub.routes',
        'sensorhub.authentication',
        'sensorhub.home',
        'sensorhub.channel',
        'sensorhub.util',
    ]);

    angular
        .module('sensorhub.config', []);

    angular
        .module('sensorhub.routes', ['ngRoute']);
    
    angular
        .module('sensorhub')
        .run(run);

    run.$inject = ['$http', 'Authentication'];

    /**
     * @name run
     * @desc update authorization header to send authentication token
     */
    function run($http, Authentication){
        if(Authentication.isAuthenticated()){
            Authentication.setAuthorizationHeader();
            console.log("Authenticated");
            console.log(Authentication.getAuthenticatedAccount());
        }else{
            console.log("Not Authenticated");
        }
    }
})();