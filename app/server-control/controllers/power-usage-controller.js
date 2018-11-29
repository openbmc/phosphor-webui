
window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('powerUsageController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
      $scope.loading = false;
	  $scope.ssdInfo = [];
	  $scope.slotInfo = [];
	  $scope.s9546Info = "";
	  $scope.cabledmodInfo = "";
	  $scope.swconfigInfo = "";
	  $scope.swstatusInfo = "";
	  		
	  $scope.changeStatus = function(flag){
		  if(flag == 'ssd'){
			  $scope.ssdFlag = true;
			  $scope.slotFlag = false;
			  $scope.s9546Flag = false;
			  $scope.cabledmodFlag = false;
			  $scope.swconfigFlag = false;
			  $scope.swstatusFlag = false;
		  }else if(flag == 'slot'){
			  $scope.ssdFlag = false;
			  $scope.slotFlag = true;
			  $scope.s9546Flag = false;
			  $scope.cabledmodFlag = false;
			  $scope.swconfigFlag = false;
			  $scope.swstatusFlag = false;
		  }else if(flag == 's9546'){
			  $scope.ssdFlag = false;
			  $scope.slotFlag = false;
			  $scope.s9546Flag = true;
			  $scope.cabledmodFlag = false;
			  $scope.swconfigFlag = false;
			  $scope.swstatusFlag = false;
		  }else if(flag == 'cabledmod'){
			  $scope.ssdFlag = false;
			  $scope.slotFlag = false;
			  $scope.s9546Flag = false;
			  $scope.cabledmodFlag = true;
			  $scope.swconfigFlag = false;
			  $scope.swstatusFlag = false;
		  }else if(flag == 'swconfig'){
			  $scope.ssdFlag = false;
			  $scope.slotFlag = false;
			  $scope.s9546Flag = false;
			  $scope.cabledmodFlag = false;
			  $scope.swconfigFlag = true;
			  $scope.swstatusFlag = false;
		  }else if(flag == 'swstatus'){
			  $scope.ssdFlag = false;
			  $scope.slotFlag = false;
			  $scope.s9546Flag = false;
			  $scope.cabledmodFlag = false;
			  $scope.swconfigFlag = false;
			  $scope.swstatusFlag = true;
		  }else{
			  $scope.ssdFlag = false;
			  $scope.slotFlag = false;
			  $scope.s9546Flag = false;
			  $scope.cabledmodFlag = false;
			  $scope.swconfigFlag = false;
			  $scope.swstatusFlag = false;
		  }
	  };	  
	  	    
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
				
				switch(ssdAddr) {
					case 1: 
						ssdAddrText = "slot1"; 
						break;
					case 2: 
					    ssdAddrText = "slot2";
					    break;
					case 3: 
						ssdAddrText = "slot3"; 
						break;
					case 4: 
					    ssdAddrText = "slot4";
					    break;
					case 5: 
						ssdAddrText = "slot5"; 
						break;
					case 6: 
					    ssdAddrText = "slot6";
					    break;
					case 7: 
						ssdAddrText = "slot7"; 
						break;
					case 8: 
					    ssdAddrText = "slot8";
					    break;
					case 9: 
						ssdAddrText = "slot9"; 
						break;
					case 10: 
					    ssdAddrText = "slot10";
					    break;
					case 11: 
						ssdAddrText = "slot11"; 
						break;
					case 12: 
						ssdAddrText = "slot12"; 
						break;
					case 13: 
					    ssdAddrText = "slot13";
					    break;
					case 14: 
						ssdAddrText = "slot14"; 
						break;
					case 15: 
					    ssdAddrText = "slot15";
					    break;
					case 16: 
						ssdAddrText = "slot16"; 
						break;
					case 17: 
					    ssdAddrText = "slot17";
					    break;
					case 18: 
						ssdAddrText = "slot18"; 
						break;
					case 19: 
					    ssdAddrText = "slot19";
					    break;
					case 20: 
						ssdAddrText = "slot20"; 
						break;
					case 21: 
					    ssdAddrText = "slot21";
					    break;
					case 22: 
						ssdAddrText = "slot22"; 
						break;
					case 23: 
					    ssdAddrText = "slot23";
					    break;
					case 24: 
						ssdAddrText = "slot24"; 
						break;
					default: 
					    ssdAddrText = "none";
				}
				
				switch(state) {
					case 0:
						stateText = "ok";
						break;
					case 1:
						stateText = "absent";
						break;
					case 2:
						stateText = "poweroff";
						break;
					case 3:
						stateText = "not link";
						break;
					case 4:
						stateText = "unbind to a P2P";
						break;
					case 5:
						stateText = "poweron";
						break;	
					case 6:
						stateText = "Get status fail";
						break;
					case 15:
						stateText ="status value is invalid";
					default:
						stateText = "value error!";
				}
				
				switch(linkSpeed) {
					case 0:
						linkSpeedText = "not link";
						break;
					case 1:
						linkSpeedText = "2.5G";
						break;
					case 2:
						linkSpeedText = "5.0G";
						break;
					case 3:
						linkSpeedText = "8.0G";
						break;
					case 4:
						linkSpeedText = "16G";
						break;
					case 5:
						linkSpeedText = "unknown";
						break;	
					default:
						linkSpeedText = "value error!";
				}
				
				switch(linkWidth) {
					case 0:
						linkWidthText = "not link";
						break;
					case 1:
						linkWidthText = " x1.";
						break;
					case 2:
						linkWidthText = "x2.";
						break;
					case 3:
						linkWidthText = "x4.";
						break;
					case 4:
						linkWidthText = "x8.";
						break;
					case 5:
						linkWidthText = "x12.";
						break;	
					case 6:
						linkWidthText = "x16.";
						break;
					case 7:
						linkWidthText = "x32.";
						break;
					case 8:
						linkWidthText = "unknown";
						break;	
					default:
						linkWidthText = "value error!";
				}
				
				if(linkStatus == 0){
					linkStatusText = "link fail";
				}else{
					linkStatusText = "link success";
				}
				
				if(Inserted == 0){
					InsertedText = "not present";
				}else{
					InsertedText = "present";
				}
				
				if(parId == 0x0f){
					parIdText = "partition info error";
				}else{
					parIdText = "normal";
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
			var slotStatus = 0;
			var slotStatusText = "";
			
			for(var num = 0; num < slotData.length; num++) {
				slotStatus = slotData[num].value & 0x01;
				if(slotStatus == 0){
					slotStatusText = "status ok";
				}else{
					slotStatusText = "status fail";
				}
				
				$scope.slotInfo.push(Object.assign(
				{
					slot_status: slotStatusText,
				},{title: slotData[num].title}));
			}
			
		};
		
		function showS9546Data(s9546Data){
			console.log("showS9546Data");
			console.log(s9546Data);
			var stateText = "";
			var state = s9546Data.value & 0x01;
			if(state == 0){
				stateText = "status ok";
			}else{
				stateText = "status fail";
			}
			
			$scope.s9546Info = Object.assign(
			{
				status: stateText,
			},{title: s9546Data.title});
		};
		
		function showCabledmodData(cabledmodData){
			console.log("showCabledmodData");
			console.log(cabledmodData);
			var cabledmodText = "";
			var cabledmod = cabledmodData.value & 0x01;
			if(cabledmod == 0){
				cabledmodText = "auto";
			}else{
				cabledmodText = "manual";
			}
			
			$scope.cabledmodInfo = Object.assign(
			{
				cabled_mod: cabledmodText,
			}, {title: cabledmodData.title});
		};
		
		function showSwconfigData(swconfigData){
			console.log("showSwconfigData");
			console.log(swconfigData);
			var swconfigText = "";
			var swconfig = swconfigData.value & 0x01;
			if(swconfig == 0){
				swconfigText = "enable EMA";
			}else{
				swconfigText = "disable EMA";
			}
			$scope.swconfigInfo = Object.assign(
			{
				EMA_status: swconfigText,
			}, {title: swconfigData.title});
		};
		
		function showSwstatusData(swstatusData){
			console.log("showSwstatusData");
			console.log(swstatusData);
			var swstatusText = "";
			var swstatus = swstatusData.value & 0x01;
			if(swstatus == 1){
				swstatusText = "MRPC status ok";
			}else{
				swstatusText = "MRPC status fail";
			}
			$scope.swstatusInfo = Object.assign(
			{
				MRPC_status: swstatusText,
			}, {title: swstatusData.title});
		};
		
	  $scope.getSensorData = function() {
		var ssdData = [];
		var slotData = [];
		var s9546Data = "";
		var cabledmodData = "";
		var swconfigData = "";
		var swstatusData = "";
		$scope.loading = true;		
        APIUtils.getAllSensorStatus(function(data, originalData) {
			for(var j = 0; j < 24; j++) {
				var ssd = "Switch Ssd"+(j + 1);
				var slot = "Switch Slot"+(j + 1);
				var s9546 = "Switch S9546";
				var cabledmod = "Switch Cabledmod";
				var swconfig = "Switch Swconfig";
				var swstatus = "Switch Swstatus";
				for(var i = 0; i < data.length; i++) {
					if(data[i].title == ssd) { 
						ssdData[j] = data[i];
					    console.log("getSensorData");
						console.log(ssdData[j]);
					}else if(data[i].title == slot) {
						slotData[j] = data[i];
						console.log(slotData[j]);
					}else if(data[i].title == s9546){
						s9546Data = data[i];
					}else if(data[i].title == cabledmod){
						cabledmodData = data[i];
					}else if(data[i].title == swconfig){
						swconfigData = data[i];
					}else if(data[i].title == swstatus){
						swstatusData = data[i];
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
			showS9546Data(s9546Data);
			showCabledmodData(cabledmodData);
			showSwconfigData(swconfigData);
			showSwstatusData(swstatusData);
            $scope.loading = false;
        });
      };
	  
	  /*function showSlotData(slotData) {
			console.log("showSlotData");
			console.log(slotData);
			var present = 0, slotAddr = 0, cableType = 0, linkActive = 0, linkWidth = 0;
			var linkStatus = 0, invalid = 0, parId = 0, state = 0, uspOrDsp = 0;
			var presentText = "", slotAddrText = "", cableTypeText = "", linkWidthText = "", linkStatusText = ""; 
			var linkActiveText = "", invalidText = "", uspOrDspText = "", parIdText = "", stateText = "";
			
			for(var num = 0; num < slotData.length; num++) {
				present = slotData[num].value >>> 31 & 0x01;
				slotAddr = slotData[num].value >>> 27 & 0x0f;
				cableType = slotData[num].value >>> 24 & 0x07;
				linkActive = slotData[num].value >>> 23 & 0x01;
				linkWidth = slotData[num].value >>> 19 & 0x0f;
				linkStatus = slotData[num].value >>> 16 & 0x07;
				invalid = slotData[num].value >>> 12 & 0x0f;;
				parId = slotData[num].value >>> 8 & 0x0f;
			    state = slotData[num].value >>> 4 & 0x0f;
				uspOrDsp = slotData[num].value & 0x0f;
				
				if(present == 0) {
					presentText = "cable is absent";
				} else {
					presentText = "cable is present";
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
						linkWidthText = "SSD is not link";
						break;
					case 1:
						linkWidthText = "link width is x1";
						break;
					case 2:
						linkWidthText = "link width is x2";
						break;
					case 3:
						linkWidthText = "link width is x4";
						break;
					case 4:
						linkWidthText = "link width is x8";
						break;
					case 5:
						linkWidthText = "link width is x12";
						break;	
					case 6:
						linkWidthText = "link width is x16";
						break;
					case 7:
						linkWidthText = "link width is x32";
						break;	
					case 8:
						linkWidthText = "link width unknow";
						break;
					default:
						linkWidthText = "value error!";
				}
				
				switch(linkStatus) {
					case 0:
						linkStatusText = "cable link ok";
						break;
					case 1:
						linkStatusText = "cable is absent";
						break;
					case 2:
						linkStatusText = "cable link fail";
						break;
					case 3:
						linkStatusText = "cable not link";
						break;
					case 4:
						linkStatusText = "value invalid";
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
			
		};*/
	  
	  $scope.getSensorData();
	  
    }
  ]);
})(angular);
