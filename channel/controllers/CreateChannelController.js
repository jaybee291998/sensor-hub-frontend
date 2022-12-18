(function(){
    'use strict';

    angular
        .module('sensorhub.channel.controllers')
        .controller('CreateChannelController', CreateChannelController);

        CreateChannelController.$inject = ['Authentication', 'Channel', '$scope', '$location'];

        function CreateChannelController(Authentication, Channel, $scope, $location){
            if(Authentication.authenticatedOrRedirect())return;
            console.log("INSIDE CREATE CHANNEL CONTROLLER");
            let vm = this;

            vm.create = create;
            vm.add = add;
            vm.removeField = removeField;
            $scope.fields = [];


            function create(){
                let p = Channel.create({name:vm.name, description:vm.description});
                p.then(function(response){
                    if(response.status < 200 || response.status > 299){
                        // error
                        $scope.error = response.data;
                    }else{
                        console.log("success");
                        $scope.message = `channel with email ${response.data}`;
                        console.log(response.data)
                        createFields(response.data.id);
                    }
                });
            }

            function createFields(channel_id){
                let fields = $scope.fields.map(field => {
                    return {name:field.name, channel:channel_id};
                });
                let p = Channel.createFields(fields, channel_id);
                p.then(function(response){
                    if(response.status < 200 || response.status > 299){
                        // error
                        $scope.error = response.data;
                    }else{
                        // console.log(response.data);
                        $scope.message = `channel with email ${response.data}`;
                        console.log(response.data)
                        $location.path('channel/list');
                    }
                });
            }
            let index = 0;
            function add(){
                $scope.fields.push({id:index, name:""});
                index++;
            }

            function removeField(id){
                $scope.fields = $scope.fields.filter(field => field.id !== id);
            }
        }
})();