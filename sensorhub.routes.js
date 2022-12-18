(function() {
    'use strict';

    angular
        .module('sensorhub.routes')
        .config(config);

    config.$inject = ['$routeProvider'];
    
    function config($routeProvider){
        $routeProvider
            .when('/login', {
                controller: 'LoginController',
                controllerAs: 'vm',
                templateUrl: 'authentication/pages/login.html'
            })
            .when('/register', {
                controller: 'RegisterController',
                controllerAs: 'vm',
                templateUrl: 'authentication/pages/register.html'
            })
            .when('/', {
                controller: 'HomeController',
                controllerAs: 'vm',
                templateUrl: 'home/pages/home.html'
            })
            .when('/channel/create', {
                controller: 'CreateChannelController',
                controllerAs: 'vm',
                templateUrl: 'channel/pages/create-channel.html'
            })
            .when('/channel/list', {
                controller: 'RetrieveAllChannelController',
                controllerAs: 'vm',
                templateUrl: 'channel/pages/list-channel.html'
            })
            .when('/channel/:channel_id', {
                controller: 'ChannelHomeController',
                controllerAs: 'vm',
                templateUrl: 'channel/pages/channel-home.html'
            })
            .when('/channel/:channel_id/create', {
                controller: 'CreateFieldController',
                controllerAs: 'vm',
                templateUrl: 'channel/pages/create-field.html'
            })
            .otherwise('/');
    }
})();