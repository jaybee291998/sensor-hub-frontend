(function(){
    'use strict';
    angular
        .module('sensorhub.authentication.controllers')
        .controller('RegisterController', RegisterController);

        RegisterController.$inject = ['$location', '$scope', 'Authentication'];

        function RegisterController($location, $scope, Authentication){
            if(Authentication.isAuthenticated()){
                $location.path('/');
                return;
            };
            console.log("INSIDE REGISTER")

            let vm = this;

            vm.register = register;

            function register(){
                if(validateForm()){
                    let p = Authentication.register(vm.email, vm.password);
                    p.then(function(response){
                        if(response.status < 200 || response.status > 299){
                            // error
                            $scope.error = response.data;
                        }else{
                            console.log("success");
                            $scope.message = `account with email ${response.data.email}`;
                        }
                    })
                } 
            }

            function validateForm(){
                let isFormValid = true;
                if(vm.password != vm.confirmPassword){
                    isFormValid = false;
                    $scope.error = "password must match";
                }

                return isFormValid;
            }
        }
})();