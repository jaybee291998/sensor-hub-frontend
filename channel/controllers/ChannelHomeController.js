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
            $scope.table_header;
            // $scope.widgets;
            let timestamps;
            let chartData;
            let show_table_triggered = false;
            let raw_channel_entries;
            let raw_field_data;
            let data;
            $scope.chartData;
            function get_data(){
                i();
                let p = retrieveAllFields()
                .then(retrieveChannelEntries)
                // .then(init2);
                return p;
            }

            function getData(){
                let p = Promise.all([
                    Channel.retrieveAllFields($routeParams.channel_id),
                    Channel.retrieveAllChannelEntries($routeParams.channel_id, $scope.number_of_hours),
                ]).then(values => {
                    raw_field_data = values[0].data;
                    raw_channel_entries = values[1].data;
                    $scope.actual_field_names = getFieldNames(raw_field_data);
                    $scope.table_header = getFieldNames(raw_field_data);
                    $scope.table_header.push('timestamp')

                    $scope.channel_entries = processRawChannelEntries(raw_channel_entries, $scope.actual_field_names);
                    $scope.widgets = getWidgetData($scope.actual_field_names, $scope.channel_entries.at(-1));
                    timestamps = getTimestamps($scope.channel_entries);
                    chartData = getChartData($scope.channel_entries, $scope.actual_field_names, timestamps);
                    generateCharts(chartData, chartDiv);
                    // apply digest cycle, because for some reason its not triggered
                    $scope.$apply();
                });
                return p;
                
            }
            function generateCharts(chartData, chartDiv){
                for(let key in chartData){
                    let c = chartData[key];
                    let chart = ChartUtil.make_chart(c.data, c.name, c.name, chartDiv);
                    c['chart'] = chart; 
                }
            }
            function getChartData(channel_entries, field_names, timestamps){
                let chartData = {};
                field_names.forEach(field_name => {
                    let data = channel_entries.map(channelEntry => channelEntry[field_name])
                    chartData[field_name] = {
                        data: {data:data, labels:timestamps},
                        name: field_name,
                        id: field_name,
                        chart: null
                    };
                });
                return chartData;
            }
            const deleteCharts = (chartData, chartDiv) =>{
                for(let key in chartData){
                    chartData[key]['chart'].destroy();
                }
                chartDiv.innerHTML = "";
            }
            function processRawChannelEntries(raw_channel_entries, field_names){
                let keys = getRawChannelEntriesKey(raw_channel_entries);
                return raw_channel_entries.map(channelEntry => {
                    let newChannelEntry = {};
                    for(let i = 0; i < field_names.length; i++){
                        let new_field_name = field_names[i];
                        let old_field_name = keys[i];
                        newChannelEntry[new_field_name] = parseFloat(channelEntry[old_field_name]);
                    }
                    newChannelEntry['timestamp'] = DateUtil.processDateStr(channelEntry['timestamp']);
                    return newChannelEntry;
                })
            }

            function getTimestamps(channelEntries){
                return channelEntries.map(channelEntry => channelEntry['timestamp'].slice(-11));
            }

            function getFieldNames(field_data){
                let field_names=[];
                field_data.forEach(field=>field_names.push(field.name));
                return field_names;
            }

            function getRawChannelEntriesKey(rawChannelEntries){
                return Object.keys(rawChannelEntries[0]);
            }

            function getWidgetData(field_names, latest_channel_entry){
                let widgets = []
                field_names.forEach(field_name => {
                    let data = {name:field_name, value:latest_channel_entry[field_name]};
                    widgets.push(data);
                });
                $scope.latest_time = latest_channel_entry['timestamp'];
                // console.log(widgets);
                return widgets;
            }
            getData();     
            let chartDiv = document.getElementById('canvas_div_id');

            $scope.test = () => {
                console.log($scope.number_of_hours);
                deleteCharts(chartData, chartDiv);
                getData()
                .then(()=>{
                    if(!$scope.show_chart){
                        $scope.table_data = $scope.channel_entries;
                        show_table_triggered = true;
                    }
                });
            }

            $scope.toggle = () => {
                $scope.show_chart = !$scope.show_chart;
                if(!$scope.show_chart){
                    $scope.table_data = $scope.channel_entries;
                    show_table_triggered = true;
                }

            }
        }
})();