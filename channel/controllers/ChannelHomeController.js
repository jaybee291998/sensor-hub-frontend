(function(){
    'use strict';
    angular
        .module('sensorhub.channel.controllers')
        .controller('ChannelHomeController', ChannelHomeController);

        ChannelHomeController.$inject = ['$scope', '$location', '$routeParams', 'Authentication', 'Channel'];

        function ChannelHomeController($scope, $location, $routeParams, Authentication, Channel){
            if(Authentication.authenticatedOrRedirect())return;
            $scope.channel_id = $routeParams.channel_id;
            $scope.name = $routeParams.channel_id;
            let p = Channel.retrieveAllFields($routeParams.channel_id);
            p.then(function(value){
                if(value.status < 200 || value.status > 299){
                    $scope.error = value.data.message;
                    console.log(value);
                }else{
                    console.log(value);
                    $scope.fields = value.data;
                }
            });

        }
})();