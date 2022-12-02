(function(){
    'use strict';

    angular
        .module('sensorhub.config')
        .config(config);

    config.$inject = ['$locationProvider'];

    /**
     * 
     */
    function config($locationProvider){
        console.log("Box");
        // $locationProvider.html5Mode(true);
        // $locationProvider.hashPrefix('!');
    }
})();