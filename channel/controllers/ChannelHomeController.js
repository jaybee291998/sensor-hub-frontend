(function(){
    'use strict';
    angular
        .module('sensorhub.channel.controllers')
        .controller('ChannelHomeController', ChannelHomeController);

        ChannelHomeController.$inject = ['$scope', '$location', '$routeParams', 'Authentication', 'Channel'];

        function ChannelHomeController($scope, $location, $routeParams, Authentication, Channel){
            if(Authentication.authenticatedOrRedirect())return;
            const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            $scope.channel_id = $routeParams.channel_id;
            $scope.name = $routeParams.channel_id;
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
                        field_data = value.data;
                        p = Channel.retrieveAllChannelEntries($routeParams.channel_id, $scope.number_of_hours);
                        p.then(function(value){
                            if(value.status < 200 || value.status > 299){
                                $scope.error = value.data.message;
                                console.log(value);
                            }else{
                                console.log(value);
                                channel_entries = value.data;
                                init2();
                                // $scope.fields = value.data;
            
                            }
                        });
                    }
                });
            }


            // convert raw timestamp into a more huma readbable format
            function convert_date(raw_date){
                const year_str = raw_date.substr(0, 4);
                const month_str = raw_date.substr(5, 2);
                const day_str = raw_date.substr(8, 2);

                return `${months[parseInt(month_str)]} ${day_str}, ${year_str}`
            }

            function convert_time(raw_time){
                let hour = parseInt(raw_time.substr(0, 2));
                let timestamp = 'AM';
                if(hour > 12){
                    timestamp = 'PM';
                    hour -= 12;
                }

                return `${hour}${raw_time.slice(2)} ${timestamp}`;
            }

            function processDateStr(date_str){
                const date = convert_date(date_str.slice(0, 10));
                const time = convert_time(date_str.slice(11, 19));

                return `${date} ${time}`;
            }

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

            const init = () =>{
                sample_data = channel_entries.slice(-200);
                // console.log(sample_data);
                let temperature_data = [];
                let humidity_data = [];
                let date_data = [];
                let pressure_data = [];
                sample_data.forEach(channelEntry => {
                    temperature_data.push(parseFloat(channelEntry["field1"]));
                    humidity_data.push(parseFloat(channelEntry['field2']));
                    date_data.push(convert_time(channelEntry['timestamp'].slice(11, 19)));
                    pressure_data.push(parseFloat(channelEntry['field3']));
                });
                // console.log(date_data);
                let data = {data:temperature_data, labels:date_data};
                make_chart(data, "temperature", "id");
                data['data'] = humidity_data;
                make_chart(data, "humidity", "h");
                data['pressure'] = pressure_data;
                let myChart = make_chart(data, "pressure", "p");

                // myChart.destroy();
            }

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
        }
})();