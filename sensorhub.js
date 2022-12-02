(function(){
    'use strict';

    angular.module('sensorhub', [
        'ngCookies',
        'sensorhub.config',
        'sensorhub.routes',
        'sensorhub.authentication',
        'sensorhub.home',
        'sensorhub.channel',
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
            $http.defaults.headers.common['Authorization'] = "Token " + Authentication.getAuthenticatedAccount().token;
        }
    }
})();