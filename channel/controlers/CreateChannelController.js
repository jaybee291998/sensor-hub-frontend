(function(){
    'use strict';

    angular
        .module('sensorhub.channel.controllers')
        .controller('CreateChannelController', CreateChannelController);

        CreateChannelController.$inject = ['Authentication', 'Channel', '$scope'];

        function CreateChannelController(Authentication, Channel, $scope){
            if(Authentication.authenticatedOrRedirect())return;
            console.log("INSIDE CREATE CHANNEL CONTROLLER");
            let vm = this;

            vm.create = create;

            function create(){
                console.log({name:vm.name, description:vm.description});
                let p = Channel.create({name:vm.name, description:vm.description});
                p.then(function(response){
                    if(response.status < 200 || response.status > 299){
                        // error
                        $scope.error = response.data;
                    }else{
                        console.log("success");
                        $scope.message = `channel with email ${response.data}`;
                        console.log(response.data)
                    }
                });
            }
        }
})();