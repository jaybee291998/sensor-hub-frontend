(function(){
    'use strict';

    angular
        .module('sensorhub.channel.directives')
        .directive('myChannel', channel);


        function channel($location){
            function controller($scope, $location){
                $scope.select = function(id){
                    console.log("went to " + id);
                    $location.path('channel/'+id);
                }
            }
            let directive = {
                restrict: 'E',
                scope: {
                    channelInfo: "=info"
                },
                templateUrl: 'channel/pages/channel.html',
                controller: ['$scope', '$location', controller]
            }

            return directive;
        }
})();