(function(){
    'use strict';

    angular
        .module('sensorhub.channel.directives')
        .directive('myChart', MyChart);

        MyChart.$inject = ['ChartUtil'];

        function MyChart(){
            function controller($scope){
                $scope.divID = Math.floor(Math.random()*1000);
                $scope.chartDiv = document.getElementById('$scope.divID');
                console.log($scope.chartDataset);
            }

            let directive = {
                restrict: 'E',
                scope: {
                    chartDataset: '=dataset',
                },
                templateUrl: 'channel/pages/chart.html',
                controller: ['$scope', controller],
            };

            return directive;
        }
})();