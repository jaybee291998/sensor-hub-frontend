(function(){
   'use strict';
   
   angular.module('sensorhub.authentication', [
        'sensorhub.authentication.services',
        'sensorhub.authentication.controllers'
   ]);

   angular.module('sensorhub.authentication.services', ['ngCookies']);
   angular.module('sensorhub.authentication.controllers', []);
})();