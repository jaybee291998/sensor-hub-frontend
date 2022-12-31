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
            retrieveAllChannelEntries: retrieveAllChannelEntries,
            retrieveChannelEntryUpdate: retrieveChannelEntryUpdate,
            createField: createField,
            createFields: createFields
        };

        return Channel;

        function create(channelData){
            return $http.post(`${myapi_link}/channel/channel-list-api/`, channelData)
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
            return $http.get(`${myapi_link}/channel/channel-list-api/`)
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
            return $http.get(`${myapi_link}/channel/field-list/`+channel_id)
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

        function retrieveAllChannelEntries(channel_id, number_of_hours){
            return $http.get(`${myapi_link}/channel/${channel_id}/?number_of_hours=${number_of_hours}`)
                .then(retrieveSuccessFn, retrieveErrorFn);

            function retrieveSuccessFn(values){
                console.log("retrieve all channel entries success");
                return values;
            }

            function retrieveErrorFn(response){
                console.log("failed to retrieve channel entries");
                console.log(response);
                return response;
            }
        }

        function retrieveChannelEntryUpdate(channel_id, last_timestamp){
            return $http.get(`${myapi_link}/channel/${channel_id}/?last_entry=${last_timestamp}`)
                .then(response => response, response => response);
        }

        function createField(fieldData){
            return $http.post(`${myapi_link}/channel/field-list/`+fieldData.channel_id+"/", fieldData)
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
            return $http.post(`${myapi_link}/channel/field-list/`+channel_id+"/?bulk=true", fieldsData)
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