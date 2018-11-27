
window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('powerUsageController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
      $scope.loading = false;
	  $scope.ssdInfo = [];
	  $scope.slotInfo = [];
	  	    
	    function showSSDData(ssdData) {
			//console.log("44444444");
			//console.log(ssdData);
			for(var num = 0; num < ssdData.length; num++) {
				//console.log("555555");
				var ssdAddr = ssdData[num].value >>> 27 & 0x1f;
				var ssdType = ssdData[num].value >>> 24 & 0x07;
				var linkSpeed = ssdData[num].value >>> 20 & 0x0f;
				var state = ssdData[num].value >>> 16 & 0x0f;
				var cfgWidth = ssdData[num].value >>> 12 & 0x0f;
				var linkWidth = ssdData[num].value >>> 8 & 0x0f;
				var parId = ssdData[num].value >>> 2 & 0x0f;
				var Inserted = ssdData[num].value >>> 1 & 0x01;
				var linkStatus = ssdData[num].value & 0x01;				
				//console.log(ssdData[num].title);				
				$scope.ssdInfo.push(Object.assign(
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
				}, 
				{title: ssdData[num].title}));
			}
			
	    };	 
			
		function showSlotData(slotData) {
			for(var num = 0; num < slotData.length; num++) {
				var present = slotData[num].value >>> 31 & 0x01;
				var slotAddr = slotData[num].value >>> 27 & 0x0f;
				var cableType = slotData[num].value >>> 24 & 0x07;
				var linkActive = slotData[num].value >>> 23 & 0x01;
				var linkWidth = slotData[num].value >>> 19 & 0x0f;
				var linkStatus = slotData[num].value >>> 16 & 0x07;
				var parId = slotData[num].value >>> 8 & 0x0f;
				var state = slotData[num].value >>> 4 & 0x0f;
				var uspOrDsp = slotData[num].value & 0x0f;
				
				$scope.slotInfo.push(Object.assign(
				{
					present: present,
					slot_addr: slotAddr,
					cable_type: cableType,
					link_active: linkActive,
					link_wd: linkWidth,
					link_st: linkStatus,
					par_id: parId,
					status: state,
					usp_or_dsp: uspOrDsp,
				},
				{title: slotData[num].title}));
			}
			
		};
		
	  $scope.getSensorData = function() {
		var ssdData = [];
		var slotData = [];
		$scope.loading = true;		
        APIUtils.getAllSensorStatus(function(data, originalData) {
			//console.log("11111111111");
			//console.log(data);
			//$scope.data = data;
			for(var j = 0; j < 24; j++) {
				var ssd = "ssd"+(j + 1);
				var slot = "slot"+(j + 1);
				for(var i = 0; i < data.length; i++) {
					//console.log("2222222");
					//console.log(data);
					//console.log(ssd);
					if(data[i].search_text.indexOf(ssd) != -1) { 
					    //console.log("3333333");
						//ssdData.push(data[i]);
						ssdData[j] = data[i];
						//break;
					}
					if(data[i].search_text.indexOf(slot) != -1) {
						slotData[j] = data[i];
					}
				}	
			}
			showSSDData(ssdData);	
			showSlotData(slotData);			
            $scope.loading = false;
        });
      };
	  
	  $scope.getSensorData();
    }
  ]);
})(angular);
