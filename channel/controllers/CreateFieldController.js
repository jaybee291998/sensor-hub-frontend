(function(){
    'use strict';

    angular
        .module('sensorhub.channel.controllers')
        .controller('CreateFieldController', CreateFieldController);

        CreateFieldController.$inject = ['$scope', '$location', '$routeParams', 'Authentication', 'Channel'];

        function CreateFieldController($scope, $location, $routeParams, Authentication, Channel){
            if(Authentication.authenticatedOrRedirect())return;

            let vm = this;

            vm.channel_id = $routeParams.channel_id;

            vm.create = create;

            function create(){
                // console.log({name:vm.name, description:vm.description});
                console.log({name:vm.name, channel_id:vm.channel_id});
                let p = Channel.createField({name:vm.name, channel_id:vm.channel_id});
                p.then(function(response){
                    if(response.status < 200 || response.status > 299){
                        // error
                        $scope.error = response.data;
                        console.log(response);
                    }else{
                        console.log("success");
                        $scope.message = `channel with email ${response.data}`;
                        console.log(response.data)
                        $location.path(`channel/${vm.channel_id}`)
                    }
                });
            }
        }
})();