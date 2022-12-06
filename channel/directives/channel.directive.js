(function(){
    'use strict';

    angular
        .module('sensorhub.channel.directives')
        .directive('myChannel', channel);

        function channel(){
            let directive = {
                restrict: 'E',
                scope: {
                    channelInfo: "=info"
                },
                templateUrl: 'channel/pages/channel.html'
            }

            return directive;
        }
})();