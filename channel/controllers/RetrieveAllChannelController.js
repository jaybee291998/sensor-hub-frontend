(function(){
    'use strict';
    angular
        .module('sensorhub.channel.controllers')
        .controller("RetrieveAllChannelController", RetrieveAllChannelController);

        RetrieveAllChannelController.$inject = ['$scope', '$location', 'Channel', 'Authentication'];

        function RetrieveAllChannelController($scope, $location, Channel, Authentication){
            if(Authentication.authenticatedOrRedirect())return;
            
            let vm = this;

            let p = Channel.retrieveAll();
            p.then(function(value){
                if(value.status < 200 || value.status > 299){
                    $scope.error = value.data.message;
                    console.log(value);
                }else{
                    console.log(value);
                    $scope.channels = value.data;
                }
            })

        }
})();