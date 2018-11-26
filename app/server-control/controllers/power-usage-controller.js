
window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('powerUsageController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
      $scope.loading = false;
	  $scope.ssdInfo = [];
	  	    
	    function showSSDData(ssdData) {
			for(var num = 0; num < ssdData.length; num++) {
				var ssdAddr = ssdData[num].value >>> 27 & 0x1f;
				var ssdType = ssdData[num].value >>> 24 & 0x07;
				var linkSpeed = ssdData[num].value >>> 20 & 0x0f;
				var state = ssdData[num].value >>> 16 & 0x0f;
				var cfgWidth = ssdData[num].value >>> 12 & 0x0f;
				var linkWidth = ssdData[num].value >>> 8 & 0x0f;
				var parId = ssdData[num].value >>> 2 & 0x0f;
				var Inserted = ssdData[num].value >>> 1 & 0x01;
				var linkStatus = ssdData[num].value & 0x01;
			
				ssdInfo.push(Object.assign(
				{
					ssd_addr: ssdAddr,
					ssd_type: ssdType,
					link_sp: linkSpeed,
					status: state,
					cfg_wd: cfgWidth,
					link_wd: linkWidth,
					par_id: parId,
					inserted: Inserted,
					link_st: linkStatus,
					title: title
				}, 
				ssdData[num].title));
			}
			console.log(ssdInfo);	//
	    };	  
		
	  $scope.getSensorData = function() {
		var ssdData = [];
		$scope.loading = true;		
        APIUtils.getAllSensorStatus(function(data, originalData) {
			for(var j = 0; j < 24; j++) {
				var flag = "Ssd"+(j + 1);				
				for(var i = 0; i < data.length; i++) {
					if(data[i].search_text.indexOf(flag) > -1) { 
						ssdData[j] = data[i];
						break;
					}
				}	
			}
			console.log(ssdData);	//
			showSSDData(ssdData);			
            $scope.loading = false;
        });
      };
	  $scope.getSensorData();
    }
  ]);
})(angular);
