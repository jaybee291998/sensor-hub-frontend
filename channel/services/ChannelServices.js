(function(){
    'use strict';

    angular
        .module('sensorhub.channel.services')
        .factory('Channel', Channel);
    Channel.$inject = ['$http'];

    function Channel($http){
        let Channel = {
            create: create,
            retrieveAll: retrieveAll,
        };

        return Channel;

        function create(channelData){
            return $http.post('http://127.0.0.1:8000/channel/channel-list-api/', channelData)
                .then(channelCreateSuccessFn, channelCreateErrorFn);

            function channelCreateSuccessFn(data, status, headers, config){
                console.log("create channel success");
                return data;
            }

            function channelCreateErrorFn(data, status, headers, config){
                console.log("create channel failed");
                return data;
            }
        }

        function retrieveAll(){
            return $http.get('http://127.0.0.1:8000/channel/channel-list-api/')
                .then(channelRetrieveAllSuccessFn, channelRetrieveAllErrorFn);

            function channelRetrieveAllSuccessFn(values){
                console.log("Channel Retrieve All Success");
                return values;
            }

            function channelRetrieveAllErrorFn(response){
                console.log(response);
                return response;
            }
        }
    }
    
})();