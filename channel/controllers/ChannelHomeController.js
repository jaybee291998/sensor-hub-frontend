(function(){
    'use strict';
    angular
        .module('sensorhub.channel.controllers')
        .controller('ChannelHomeController', ChannelHomeController);

        ChannelHomeController.$inject = ['$scope', '$location', '$routeParams', '$interval', '$timeout', 'Authentication', 'Channel', 'DateUtil', 'ChartUtil'];

        function ChannelHomeController($scope, $location, $routeParams, $interval, $timeout, Authentication, Channel, DateUtil, ChartUtil){
            if(Authentication.authenticatedOrRedirect())return;
            $scope.channel_id = $routeParams.channel_id;
            $scope.name = $routeParams.channel_id;
            $scope.show_chart = true;
            $scope.table_data;
            $scope.actual_field_names = [];
            $scope.number_of_hours = 1;
            $scope.channel_entries = null;
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
                {name:"10 days", value:10*24},
            ];
            $scope.table_data = [];
            $scope.table_header;
            $scope.widgets;
            let timestamps;
            let chartData;
            let uplotChartData;
            let uplotTimestamps;
            let show_table_triggered = false;
            let notificationData;
            $scope.chartData = null;
            $scope.notificationEnabled;
            $scope.showNotificationForm;
            $scope.checkBoxModel;
            $scope.selectedFields = [];
            $scope.notificationTitle="";
            $scope.editNotificationForm = false;
            let get_update_interval = $interval(getUpdate, 1*1000);

            let stop_update_interval = () =>{
                if(angular.isDefined(get_update_interval)){
                    $interval.cancel(get_update_interval);
                    get_update_interval = undefined;
                }
            }

            $scope.$on('$destroy', ()=>{
                stop_update_interval();
                deleteCharts(chartData, chartDiv);
                deleteUPlotCharts(uplotChartData, uplotChartDiv);
            });

            function showNotification(channel_entry){
                Notification.requestPermission().then(perm =>{
                    if(perm === "granted"){
                        // let notificationData = JSON.parse(localStorage.getItem(`notificationSetting${$scope.channel_id}`));
                        let body = "";
                        notificationData.selectedFields.forEach(field_name => {
                            body += 
                            `${field_name}: ${channel_entry[field_name]}, `;
                        });
                        console.log(body);
                        const notification = new Notification(notificationData.title, {
                            body: body,
                            data:{},
                            tag: 'hey',
                            icon: '/images/my-logo.JPG'
                        })

                        notification.addEventListener('close', e => console.log("close"));

                        // setTimeout(()=>{
                        //     notification.close();
                        // }, 10*1000);
                    }else{

                    }
                });
            }
            function getUpdate(){
                let last_entry = $scope.channel_entries.at(-1).timestamp;
                let p = Channel.retrieveChannelEntryUpdate($scope.channel_id, last_entry)
                .then((new_raw_channel_entries)=>{
                    if(new_raw_channel_entries.data.length == 0) return;
                    let new_channel_entries = processRawChannelEntries(new_raw_channel_entries.data, $scope.actual_field_names);
                    console.log(`last entry: ${last_entry}`);
                    console.log(new_channel_entries);
                    new_channel_entries.forEach(new_channel_entry => $scope.channel_entries.push(new_channel_entry));
                    $scope.widgets = getWidgetData($scope.actual_field_names, $scope.channel_entries.at(-1));
                    updateCharts(chartData, new_channel_entries, $scope.actual_field_names);
                    updateUPlotCharts(chartData, new_channel_entries, $scope.actual_field_names);
                    if($scope.notificationEnabled) showNotification($scope.channel_entries.at(-1));
                });
                return p;
            }
            function getData(){
                let p = Promise.all([
                    Channel.retrieveAllFields($routeParams.channel_id),
                    Channel.retrieveAllChannelEntries($routeParams.channel_id, $scope.number_of_hours),
                ]).then(values => {
                    let raw_field_data = values[0].data;
                    let raw_channel_entries = values[1].data;
                    // console.log(raw_channel_entries);
                    $scope.actual_field_names = getFieldNames(raw_field_data);
                    $scope.table_header = getFieldNames(raw_field_data);
                    $scope.table_header.push('timestamp')
                    // $scope.selectedFields = $scope.actual_field_names;
                    // console.log($scope.actual_field_names);
                    $scope.channel_entries = processRawChannelEntries(raw_channel_entries, $scope.actual_field_names);
                    $scope.widgets = getWidgetData($scope.actual_field_names, $scope.channel_entries.at(-1));
                    timestamps = getTimestamps($scope.channel_entries);
                    uplotTimestamps = getUPlotTimeStamps($scope.channel_entries);
                    chartData = getChartData($scope.channel_entries, $scope.actual_field_names, timestamps);
                    uplotChartData = getChartDataForUPlot($scope.channel_entries, $scope.actual_field_names); 
                    generateCharts(chartData, chartDiv);
                    generateUPlotChart(uplotChartData, uplotChartDiv, uplotTimestamps);
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

            function getChartDataForUPlot(channel_entries, field_names){
                let mychartData = {};
                field_names.forEach(field_name => {
                    let data = channel_entries.map(channelEntry => parseFloat(channelEntry[field_name]))
                    mychartData[field_name] = {
                        data: data,
                        name: field_name,
                        id: field_name,
                        chart: null
                    };
                });
                return mychartData;
            }
            function generateUPlotChart(uplotChartData, uplotChartDiv, uplotTimestamps){
                for(let key in uplotChartData){
                    let c = uplotChartData[key];
                    let chart = ChartUtil.make_u_plot_chart(c.data, c.name, c.name, uplotChartDiv, uplotTimestamps);
                    c['chart'] = chart; 
                }
            }
            function updateCharts(chart_data, new_channel_entries, field_names){
                if(chart_data==null) return;
                let new_timestamps = getTimestamps(new_channel_entries);
                new_timestamps.forEach(new_timestamp => timestamps.push(new_timestamp));
                field_names.forEach(field_name => {
                    let new_data = new_channel_entries.map(new_channel_entry => new_channel_entry[field_name]);
                    updateChart(chartData, field_name, {data:new_data, labels:new_timestamps});
                })
            }
            /**
             * 
             * @param {*} chart_data [{name:{data:[], name:'', id:'',chart:chart}}, ...]
             * @param {*} chart_name 
             * @param {*} new_data {data:[], labels:[]}
             */
            function updateChart(chart_data, chart_name, new_data){
                if(chart_data == null) return;
                let chart_dataset = chart_data[chart_name];
                new_data.data.forEach(d => {
                    chart_dataset.data.data.push(d);
                    // chart_dataset.chart.data.datasets.forEach(dataset=>dataset.data.push(d));
                });
                new_data.labels.forEach(l=>{
                    // chart_dataset.data.labels.push(l);
                    // chart_dataset.chart.data.labels.push(l);
                })

                chart_dataset.chart.update();
            }
            const deleteCharts = (chartData, chartDiv) =>{
                for(let key in chartData){
                    chartData[key]['chart'].destroy();
                }
                chartDiv.innerHTML = "";
            }
            function updateUPlotCharts(chart_data, new_channel_entries, field_names){
                if(chart_data==null) return;
                let new_timestamps = getUPlotTimeStamps(new_channel_entries);
                new_timestamps.forEach(new_timestamp => uplotTimestamps.push(new_timestamp));
                field_names.forEach(field_name => {
                    let new_data = new_channel_entries.map(new_channel_entry => new_channel_entry[field_name]);
                    updateUPlotChart(uplotChartData, field_name, new_data);
                })
            }
            /**
             * 
             * @param {*} chart_data [{name:{data:[], name:'', id:'',chart:chart}}, ...]
             * @param {*} chart_name 
             * @param {*} new_data {data:[], labels:[]}
             */
            function updateUPlotChart(uplotChartData, chart_name, new_data){
                if(uplotChartData == null) return;
                let chart_dataset = uplotChartData[chart_name];
                new_data.forEach(d => {
                    chart_dataset.data.push(d);
                    // chart_dataset.chart.data.datasets.forEach(dataset=>dataset.data.push(d));
                });
                // new_data.labels.forEach(l=>{
                //     // chart_dataset.data.labels.push(l);
                //     // chart_dataset.chart.data.labels.push(l);
                // })

                chart_dataset.chart.setData([uplotTimestamps, chart_dataset.data]);
            }
            const deleteUPlotCharts = (chartData, chartDiv) =>{
                for(let key in chartData){
                    chartData[key]['chart'].destroy();
                }
                uplotChartDiv.innerHTML = "";
            }
            function processRawChannelEntries(raw_channel_entries, field_names){
                if(raw_channel_entries == null) return;
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

            function getUPlotTimeStamps(channelEntries) {
                return channelEntries.map(channelEntry => new Date(channelEntry['timestamp']).getTime() / 1000);
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

            $scope.test = () => {
                console.log($scope.number_of_hours);
                deleteCharts(chartData, chartDiv);
                deleteUPlotCharts(uplotChartData, uplotChartDiv);
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

            $scope.toggleNotification = () => {
                Notification.requestPermission();
                $scope.notificationEnabled = !(localStorage.getItem(`notificationEnabled${$scope.channel_id}`) === 'true');
                console.log(`Notification Enabled: ${$scope.notificationEnabled}`);
                localStorage.setItem(`notificationEnabled${$scope.channel_id}`, $scope.notificationEnabled);
                // console.log($scope.notificationEnabled);
                $scope.showNotificationForm = (localStorage.getItem(`notificationSetting${$scope.channel_id}`) === null && $scope.notificationEnabled);
                // console.log(localStorage.getItem('notificationSetting'));
            }

            function init(){
                $scope.notificationEnabled = localStorage.getItem(`notificationEnabled${$scope.channel_id}`) === 'true';
                console.log(`Notification Enbaled: ${$scope.notificationEnabled}`);
                console.log(`local storage: ${localStorage.getItem(`notificationEnabled${$scope.channel_id}`)}`);
                $scope.showNotificationForm = localStorage.getItem(`notificationSetting${$scope.channel_id}`) === null && $scope.notificationEnabled;
                console.log(`Show form: ${$scope.showNotificationForm}`);
            }

            $scope.toggleSelection = field_name => {
                let idx = $scope.selectedFields.indexOf(field_name);

                if(idx > -1){
                    $scope.selectedFields.splice(idx, 1);
                }else{
                    $scope.selectedFields.push(field_name);
                }

                console.log($scope.selectedFields);
            }

            $scope.saveNotificationSettings = () => {
                // data validation here
                let error = false;
                if($scope.notificationTitle.length <= 0){
                    $scope.notificationFormTitleErr = "Please enter a title";
                    error = true;
                }
                if($scope.selectedFields.length == 0) {
                    $scope.notificationFormSelectionErr = "Please select atleast one field";
                    error = true;
                }
                if(error){
                    $timeout(()=>{
                        $scope.notificationFormTitleErr = "";
                        $scope.notificationFormSelectionErr = "";
                    }, 2000);
                    console.log("Error in form");
                    return;
                }

                let data = {
                    title:$scope.notificationTitle,
                    selectedFields: $scope.selectedFields
                };
                localStorage.setItem(`notificationSetting${$scope.channel_id}`, JSON.stringify(data));
                $scope.showNotificationForm = false;
                $scope.editNotificationForm = false;
                $scope.loadNotificationSetting();
                console.log(data);
                
            }

            $scope.loadNotificationSetting = () =>{
                // let notificationData = JSON.parse(localStorage.getItem(`notificationSettings${$scope.channel_id}`));
                notificationData = JSON.parse(localStorage.getItem(`notificationSetting${$scope.channel_id}`));
                console.log(notificationData);
                if(notificationData != null){
                    $scope.notificationTitle = notificationData.title;
                    $scope.selectedFields = notificationData.selectedFields;
                }
            }

            $scope.toggleEdit =() => {
                console.log($scope.editNotificationForm);
                $scope.editNotificationForm = !$scope.editNotificationForm;
            }
            // $scope.toggleNotification();
            init();
            getData();     
            let chartDiv = document.getElementById('canvas_div_id');
            $scope.loadNotificationSetting();
            let uplotChartDiv = document.getElementById('uplot-chart');
        }
})();