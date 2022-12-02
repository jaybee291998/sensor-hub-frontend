(function(){
    'use strict';
    angular
        .module('sensorhub.home.controllers')
        .controller('HomeController', HomeController);

        HomeController.$inject = ['$scope', '$location', 'Authentication'];

        function HomeController($scope, $location, Authentication){
            if(Authentication.authenticatedOrRedirect())return;
            console.log('INSIDE HOME CONTROLLER');
            let vm = this;
            $scope.account = Authentication.getAuthenticatedAccount()['account_details']['email'];

            vm.logout = logout;

            function logout(){
                Authentication.unAuthenticate();
                $location.path('/login');
            }
        }
})();