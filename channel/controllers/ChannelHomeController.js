(function(){
    'use strict';
    angular
        .module('sensorhub.channel.controllers')
        .controller('ChannelHomeController', ChannelHomeController);

        ChannelHomeController.$inject = ['$scope', '$location', '$routeParams', 'Authentication', 'Channel', 'DateUtil', 'ChartUtil'];

        function ChannelHomeController($scope, $location, $routeParams, Authentication, Channel, DateUtil, ChartUtil){
            if(Authentication.authenticatedOrRedirect())return;
            $scope.channel_id = $routeParams.channel_id;
            $scope.name = $routeParams.channel_id;
            $scope.show_chart = true;
            $scope.table_data;
            $scope.field_names = [];
            $scope.actual_field_names = [];
            $scope.number_of_hours = 1;
            let field_data;
            $scope.channel_entries;
            let cleaned_data = {};
            $scope.options = [
                {name:"1 hour", value:1},
                {name:"2 hours", value:2},
                {name:"3 hours", value:3},
                {name:"4 hours", value:4},
                {name:"5 hours", value:5},
                {name:"6 hours", value:6},
                {name:"7 hours", value:7},
                {name:"8 hours", value:8},
                {name:"9 hours", value:9},
                {name:"10 hours", value:10},
            ];
            $scope.table_data = [];
            let show_table_triggered = false;
            function get_data(){
                let p = retrieveAllFields()
                .then(retrieveChannelEntries)
                .then(init2);
                return p;
            }

            function retrieveAllFields(){
                let p = Channel.retrieveAllFields($routeParams.channel_id);
                p.then(function(value){
                    if(value.status < 200 || value.status > 299){
                        $scope.error = value.data.message;
                        console.log(value);
                    }else{
                        console.log(value);
                        $scope.fields = value.data;
                        $scope.actual_field_names = [];
                        $scope.fields.forEach(field => $scope.actual_field_names.push(field.name));
                        $scope.actual_field_names.push('timestamp');
                        // console.log($scope.actual_field_names);
                        field_data = value.data;
                    }
                });
                return p;
            }

            function retrieveChannelEntries(){
                let p = Channel.retrieveAllChannelEntries($routeParams.channel_id, $scope.number_of_hours);
                p.then(function(value){
                    if(value.status < 200 || value.status > 299){
                        $scope.error = value.data.message;
                        // console.log(value);
                    }else{
                        // console.log(value);
                        $scope.channel_entries = value.data;
                        // convert timestamp into a more readbale format
                        $scope.channel_entries.forEach(channel_entry => {
                            channel_entry['timestamp'] = DateUtil.processDateStr(channel_entry['timestamp']);
                            // to loop all through all the fields we just need to find the length of field data
                            for(let field_num = 1; field_num <= field_data.length; field_num++){
                                // the data of each field is origially a tring so we need to convert it into float
                                channel_entry[`field${field_num}`] = parseFloat(channel_entry[`field${field_num}`]);
                            }
                            
                        });
                        $scope.field_names = [];
                        // console.log($scope.table_data);
                        for(let key in value.data[0]){
                            $scope.field_names.push(key);
                        }
                        // console.log($scope.field_names);
                    }
                });
                return p;
            }
            const make_chart = ChartUtil.make_chart
            let chartDiv = document.getElementById('canvas_div_id');

            const init2 = () => {
                // initialize the datastructure used to seprate each field into their own arrray
                field_data.forEach(field_data => {
                    cleaned_data[field_data.name] = {data:[]};
                });
                let timestamp_data = [];
                // basically for every field add their value to their own array
                $scope.channel_entries.forEach(channelEntry => {
                    let field_num = 1;
                    // field data contains the actual name of the fields, in the proper order
                    // meaning the first field corresponds to field1
                    field_data.forEach(field_data => {
                        // the data from the server is like this [{field1:'', field2:'',...,fieldn:''}]
                        // so to access it we need to do it this way
                        cleaned_data[field_data.name]['data'].push(channelEntry[`field${field_num}`]);
                        field_num++;
                    });
                    timestamp_data.push(channelEntry['timestamp'].slice(-10));
                });
                // console.log(cleaned_data);

                // generate the charts
                field_data.forEach(field_data => {
                    let data = {data:cleaned_data[field_data.name]['data'], labels:timestamp_data};
                    let chart = make_chart(data, field_data.name, field_data.name, chartDiv);
                    cleaned_data[field_data.name]['chart'] = chart;
                });

                $scope.widgets = [];
                field_data.forEach(field_data => {
                    let field_name = field_data.name;
                    let data = {name:field_name, value:cleaned_data[field_name]['data'].at(-1)}
                    $scope.widgets.push(data);
                });
                $scope.latest_time = timestamp_data.at(-1);

                console.log($scope.widget);
            }

            const deleteCharts = () =>{
                field_data.forEach(field_data => {
                    cleaned_data[field_data.name]['chart'].destroy();
                });
                chartDiv.innerHTML = "";
            }

            $scope.test = () => {
                console.log($scope.number_of_hours);
                deleteCharts();
                get_data()
                .then(()=>{
                    if(!$scope.show_chart){
                        $scope.table_data = $scope.channel_entries;
                        show_table_triggered = true;
                    }
                });
            }

            get_data();

            $scope.toggle = () => {
                $scope.show_chart = !$scope.show_chart;
                if(!$scope.show_chart){
                    $scope.table_data = $scope.channel_entries;
                    show_table_triggered = true;
                }

            }
        }
})();