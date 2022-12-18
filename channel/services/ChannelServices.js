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
            retrieveAllFields: retrieveAllFields,
            createField: createField,
            createFields: createFields
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

        function retrieveAllFields(channel_id){
            return $http.get('http://127.0.0.1:8000/channel/field-list/'+channel_id)
                .then(retrieveSuccessFn, retrieveErrorFn);

            function retrieveSuccessFn(values){
                console.log("retrieve all fields success");
                return values;
            }

            function retrieveErrorFn(response){
                console.log("failed to retrieve fields");
                return response;
            }
        }

        function createField(fieldData){
            return $http.post('http://127.0.0.1:8000/channel/field-list/'+fieldData.channel_id+"/", fieldData)
                .then(createFieldSuccessFn, createFieldErrorFn);

            function createFieldSuccessFn(values){
                console.log("field creation success");
                return values;
            }

            function createFieldErrorFn(response){
                console.log("Failed to create field");
                return response;
            }
        }

        function createFields(fieldsData, channel_id){
            return $http.post('http://127.0.0.1:8000/channel/field-list/'+channel_id+"/?bulk=true", fieldsData)
                .then(createFieldSuccessFn, createFieldErrorFn);

            function createFieldSuccessFn(values){
                console.log("field creation success");
                return values;
            }

            function createFieldErrorFn(response){
                console.log("Failed to create field");
                return response;
            } 
        }
    }
    
})();