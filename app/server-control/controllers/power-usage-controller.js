
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
			console.log("showSSDData");
			console.log(ssdData);
			var ssdAddr = 0, ssdType = 0, linkSpeed = 0, state = 0, cfgWidth = 0;
			var linkWidth = 0, Resered = 0, parId = 0, Inserted = 0, linkStatus = 0;
			var ssdTypeText = "", ssdAddrText = "", stateText = "", linkSpeedText = "", linkWidthText = "";
			var cfgWidthText = "", linkStatusText = "", InsertedText = "", parIdText = "", ReseredText = "";
			for(var num = 0; num < ssdData.length; num++) {
				ssdAddr = ssdData[num].value >>> 27 & 0x1f;
				ssdType = ssdData[num].value >>> 24 & 0x07;
				linkSpeed = ssdData[num].value >>> 20 & 0x0f;
				state = ssdData[num].value >>> 16 & 0x0f;
				cfgWidth = ssdData[num].value >>> 12 & 0x0f;
				linkWidth = ssdData[num].value >>> 8 & 0x0f;
				Resered = ssdData[num].value >>> 6 & 0x03;
				parId = ssdData[num].value >>> 2 & 0x0f;
				Inserted = ssdData[num].value >>> 1 & 0x01;
				linkStatus = ssdData[num].value & 0x01;				
				
				if(ssdType == 0){
					ssdTypeText = "U.2";
				}else {
					ssdTypeText = "M.2";
				}
				
				switch(slotAddr) {
					case 1: 
						ssdAddrText = "SSD slot1"; 
						break;
					case 2: 
					    ssdAddrText = "SSD slot2";
					    break;
					case 3: 
						ssdAddrText = "SSD slot3"; 
						break;
					case 4: 
					    ssdAddrText = "SSD slot4";
					    break;
					case 5: 
						ssdAddrText = "SSD slot5"; 
						break;
					case 6: 
					    ssdAddrText = "SSD slot6";
					    break;
					case 7: 
						ssdAddrText = "SSD slot7"; 
						break;
					case 8: 
					    ssdAddrText = "SSD slot8";
					    break;
					case 9: 
						ssdAddrText = "SSD slot9"; 
						break;
					case 10: 
					    ssdAddrText = "SSD slot10";
					    break;
					case 11: 
						ssdAddrText = "SSD slot11"; 
						break;
					case 12: 
						ssdAddrText = "SSD slot12"; 
						break;
					case 13: 
					    ssdAddrText = "SSD slot13";
					    break;
					case 14: 
						ssdAddrText = "SSD slot14"; 
						break;
					case 15: 
					    ssdAddrText = "SSD slot15";
					    break;
					case 16: 
						ssdAddrText = "SSD slot16"; 
						break;
					case 17: 
					    ssdAddrText = "SSD slot17";
					    break;
					case 18: 
						ssdAddrText = "SSD slot18"; 
						break;
					case 19: 
					    ssdAddrText = "SSD slot19";
					    break;
					case 20: 
						ssdAddrText = "SSD slot20"; 
						break;
					case 21: 
					    ssdAddrText = "SSD slot21";
					    break;
					case 22: 
						ssdAddrText = "SSD slot22"; 
						break;
					case 23: 
					    ssdAddrText = "SSD slot23";
					    break;
					case 24: 
						ssdAddrText = "SSD slot24"; 
						break;
					default: 
					    ssdAddrText = "none SSD";
				}
				
				switch(state) {
					case 0:
						stateText = "SSD is ok";
						break;
					case 1:
						stateText = "SSD is absent";
						break;
					case 2:
						stateText = "SSD is poweroff";
						break;
					case 3:
						stateText = "SSD is not link";
						break;
					case 4:
						stateText = "SSD is unbind to a P2P";
						break;
					case 5:
						stateText = "SSD is poweron";
						break;	
					case 6:
						stateText = "Get SSD status fail";
						break;
					case 15:
						stateText ="status value is invalid";
					default:
						stateText = "value error!";
				}
				
				switch(linkSpeed) {
					case 0:
						linkSpeedText = "SSD is not link";
						break;
					case 1:
						linkSpeedText = "speed is 2.5G";
						break;
					case 2:
						linkSpeedText = "speed is 5.0G";
						break;
					case 3:
						linkSpeedText = "speed is 8.0G";
						break;
					case 4:
						linkSpeedText = "speed is 16G";
						break;
					case 5:
						linkSpeedText = "speed is unknown";
						break;	
					default:
						linkSpeedText = "value error!";
				}
				
				switch(linkWidth) {
					
				}
				
				switch(cfgWidth) {
					case 0:
						cfgWidthText = "SSD is not link";
						break;
					case 1:
						cfgWidthText = "Link width is x1.";
						break;
					case 2:
						cfgWidthText = "Link width is x2.";
						break;
					case 3:
						cfgWidthText = "Link width is x4.";
						break;
					case 4:
						cfgWidthText = "Link width is x8.";
						break;
					case 5:
						cfgWidthText = "Link width is x12.";
						break;	
					case 6:
						cfgWidthText = "Link width is x16.";
						break;
					case 7:
						cfgWidthText = "Link width is x32.";
						break;
					case 8:
						cfgWidthText = "Link width is unknown";
						break;	
					default:
						cfgWidthText = "value error!";
				}
				
				if(linkStatus == 0) {
					linkStatusText = "SSD link up fail";
				}else{
					linkStatusText = "SSD link up success";
				}
				
				if(Inserted){
					InsertedText = "SSD is not present";
				}else{
					InsertedText = "SSD is present";
				}
				
				
				$scope.ssdInfo.push(Object.assign(
				{
					ssd_addr: ssdAddrText,
					ssd_type: ssdTypeText,
					link_sp: linkSpeedText,
					status: stateText,
					cfg_wd: cfgWidthText,
					link_wd: linkWidthText,
					resered: ReseredText,
					par_id: parIdText,
					inserted: InsertedText,
					link_st: linkStatusText,
				}, 
				{title: ssdData[num].title}));
			}
			
	    };	 
			
		function showSlotData(slotData) {
			console.log("showSlotData");
			console.log(slotData);
			var present = 0, slotAddr = 0, cableType = 0, linkActive = 0, linkWidth = 0;
			var linkStatus = 0, invalid = 0, parId = 0, state = 0, uspOrDsp = 0;
			var presentText = "", slotAddrText = "", cableTypeText = "", linkWidthText = "", linkStatusText = ""; 
			var linkActiveText = "", invalidText = "", uspOrDspText = "", parIdText = "", stateText = "";
			
			for(var num = 0; num < slotData.length; num++) {
				var present = slotData[num].value >>> 31 & 0x01;
				var slotAddr = slotData[num].value >>> 27 & 0x0f;
				var cableType = slotData[num].value >>> 24 & 0x07;
				var linkActive = slotData[num].value >>> 23 & 0x01;
				var linkWidth = slotData[num].value >>> 19 & 0x0f;
				var linkStatus = slotData[num].value >>> 16 & 0x07;
				var invalid = slotData[num].value >>> 12 & 0x0f;;
				var parId = slotData[num].value >>> 8 & 0x0f;
				var state = slotData[num].value >>> 4 & 0x0f;
				var uspOrDsp = slotData[num].value & 0x0f;
				
				if(present == 0) {
					presentText = "cable absent";
				} else {
					presentText = "cable present";
				}
				
				switch(slotAddr) {
					case 1: 
						slotAddrText = "cable slot1"; 
						break;
					case 2: 
					    slotAddrText = "cable slot2";
					    break;
					case 3: 
						slotAddrText = "cable slot3"; 
						break;
					case 4: 
					    slotAddrText = "cable slot4";
					    break;
					case 5: 
						slotAddrText = "cable slot5"; 
						break;
					case 6: 
					    slotAddrText = "cable slot6";
					    break;
					case 7: 
						slotAddrText = "cable slot7"; 
						break;
					case 8: 
					    slotAddrText = "cable slot8";
					    break;
					case 9: 
						slotAddrText = "cable slot9"; 
						break;
					case 10: 
					    slotAddrText = "cable slot10";
					    break;
					case 11: 
						slotAddrText = "cable slot11"; 
						break;
					default: 
					    slotAddrText = "none cable";
				}
				
				switch(linkWidth) {
					case 0:
						linkWidthText = "SSD not link";
						break;
					case 1:
						linkWidthText = "width is x1";
						break;
					case 2:
						linkWidthText = "width is x2";
						break;
					case 3:
						linkWidthText = "width is x4";
						break;
					case 4:
						linkWidthText = "width is x8";
						break;
					case 5:
						linkWidthText = "width is x12";
						break;	
					case 6:
						linkWidthText = "width is x16";
						break;
					case 7:
						linkWidthText = "width is x32";
						break;	
					case 8:
						linkWidthText = "width unknow";
						break;
					default:
						linkWidthText = "value error!";
				}
				
				switch(linkStatus) {
					case 0:
						linkStatusText = "link ok";
						break;
					case 1:
						linkStatusText = "absent";
						break;
					case 2:
						linkStatusText = "link fail";
						break;
					case 3:
						linkStatusText = "not link";
						break;
					case 4:
						linkStatusText = "invalid";
						break;
					default:
						linkStatusText = "value error!";
				}
				
				if(linkActive == 0) {
					linkActiveText = "not link active";
				}else if (linkActive == 1) {
					linkActiveText = "link active";
				}else{
					linkActiveText = "value error!";
				}
				
				if(invalid == 0) {
					invalidText = "physical port is valid";
				}else if(invalid == 0x0f) {
					invalidText = "physical port is invalid";
				}else{
					invalidText = "value error!";
				}
				
				if(uspOrDsp == 0x0f) {
					uspOrDspText = "fail or abnormal";
				}else if(uspOrDsp == 1) {
					uspOrDspText = "upstream port";
				}else if(uspOrDsp == 2) {
					uspOrDspText = "downstream port";
				}else{
					uspOrDspText = "value error!";
				}
				
				if(state == 0){
					stateText = "valid cable";
				}else if(state == 0x0f) {
					stateText = "invalid cable";
				}else{
					stateText = "valeu error!";
				}
				
				
				$scope.slotInfo.push(Object.assign(
				{
					present: presentText,
					slot_addr: slotAddrText,
					cable_type: cableTypeText,
					link_active: linkActiveText,
					link_wd: linkWidthText,
					link_st: linkStatusText,
					invalid: invalidText,
					par_id: parIdText,
					status: stateText,
					usp_or_dsp: uspOrDspText,
				},
				{title: slotData[num].title}));
			}
			
		};
		
	  $scope.getSensorData = function() {
		var ssdData = [];
		var slotData = [];
		$scope.loading = true;		
        APIUtils.getAllSensorStatus(function(data, originalData) {
			for(var j = 0; j < 24; j++) {
				var ssd = "Switch Ssd"+(j + 1);
				var slot = "Switch Slot"+(j + 1);
				for(var i = 0; i < data.length; i++) {
					if(data[i].title == ssd) { 
						ssdData[j] = data[i];
					    console.log("getSensorData");
						console.log("ssdData[j]");
						//break;
					}else if(data[i].title == slot) {
						slotData[j] = data[i];
						console.log("slotData[j]");
					}else{
						continue;
					}
					//if(data[i].search_text.indexOf(slot) != -1) {
					//	slotData[j] = data[i];
					//}
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
