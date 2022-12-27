(function(){
    'use strict';
    angular
        .module('sensorhub.channel.controllers')
        .controller('ChannelHomeController', ChannelHomeController);

        ChannelHomeController.$inject = ['$scope', '$location', '$routeParams', 'Authentication', 'Channel', 'DateUtil'];

        function ChannelHomeController($scope, $location, $routeParams, Authentication, Channel, DateUtil){
            if(Authentication.authenticatedOrRedirect())return;
            $scope.channel_id = $routeParams.channel_id;
            $scope.name = $routeParams.channel_id;
            $scope.show_chart = true;
            $scope.table_data;
            $scope.field_names = [];
            $scope.actual_field_names = [];
            let field_data;
            let channel_entries;
            let sample_data;
            let cleaned_data = {};
            function get_data(){
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
                        console.log($scope.actual_field_names);
                        field_data = value.data;
                        p = Channel.retrieveAllChannelEntries($routeParams.channel_id, $scope.number_of_hours);
                        p.then(function(value){
                            if(value.status < 200 || value.status > 299){
                                $scope.error = value.data.message;
                                console.log(value);
                            }else{
                                console.log(value);
                                channel_entries = value.data;
                                $scope.table_data = value.data.map(channel_entry => {
                                    let new_element = {...channel_entry};
                                    new_element.timestamp = processDateStr(new_element.timestamp);
                                    return new_element;
                                });
                                $scope.field_names = [];
                                console.log($scope.table_data);
                                for(let key in value.data[0]){
                                    $scope.field_names.push(key);
                                }
                                console.log($scope.field_names);
                                init2();
                                // $scope.fields = value.data;
            
                            }
                        });
                    }
                });
            }

            const convert_date = DateUtil.convert_date;
            const convert_time = DateUtil.convert_time;
            const processDateStr = DateUtil.processDateStr;

            const make_chart = (chart_data, label, id) => {
                // create a new canvas inside the canvas div
                const canvasDiv = document.createElement('div');
                const ctx = document.createElement('canvas');
                ctx.id = id;
                
                // create the dataset that will be used by the chart
                let dataset = {
                    label: label,
                    data: chart_data.data,
                    backgroundColor: getRandomColors(chart_data.data.length),
                    borderWidth: 1
                }
    
                // the actual chart object
                var myChart = new Chart(ctx,{
                    type: "line",
                    data: {
                        labels: chart_data.labels,
                        datasets: [dataset]
                    },
                    options:{
                        scales:{
                            y:{
                                // beginAtZero:true
                            }
                        }
                    }
                });
    
                canvasDiv.appendChild(ctx);
                chartDiv.appendChild(canvasDiv);

                return myChart;
    
            }
            // generate a random rgba color
            const randomColor = () => {
                var o = Math.round, r = Math.random, s = 255;
                return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
            }
            // get an array of random rgba colors
            const getRandomColors = size => {
                var colors = []
                for(var i = 0; i < size; i++){
                    colors.push(randomColor());
                }
                return colors;
            }
            let chartDiv = document.getElementById('canvas_div_id');

            const init2 = () => {
                sample_data = channel_entries;
                field_data.forEach(field_data => {
                    cleaned_data[field_data.name] = {data:[]};
                });
                let timestamp_data = [];
                sample_data.forEach(channelEntry => {
                    let field_num = 1;
                    field_data.forEach(field_data => {
                        cleaned_data[field_data.name]['data'].push(parseFloat(channelEntry[`field${field_num}`]));
                        field_num++;
                    });
                    timestamp_data.push(convert_time(channelEntry['timestamp'].slice(11,19)));
                });
                console.log(cleaned_data);

                field_data.forEach(field_data => {
                    let data = {data:cleaned_data[field_data.name]['data'], labels:timestamp_data};
                    let chart = make_chart(data, field_data.name, field_data.name);
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

            $scope.number_of_hours = 1;
            

            $scope.test = () => {
                console.log($scope.number_of_hours);
                deleteCharts();
                get_data();
            }

            get_data();

            $scope.toggle = () => {
                $scope.show_chart = !$scope.show_chart;
            }
        }
})();