/**
 * Controller for power-usage
 *
 * @module app/serverControl
 * @exports powerUsageController
 * @name powerUsageController
 */


window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('serverSSDController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
	  //$scope.export_name = 'ssdInformation.json';
	  var ssdData = [];	
	  strSSDinfo = "<table id='ssdinfo' width='100%' border='1' cellpadding='0' cellspacing='0'>"+
		"<tr><td colspan='3'><b>SSD Information</b></td></tr>"+
		"<tr><td><b>ssd addr:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>ssd type:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>link speed:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>status:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>cfg width:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>link width:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>par id:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>inserted:</b></td><td><b></b></td></tr>"+
		"<tr><td><b>link status:</b></td><td><b></b></td></tr></table>";
	  
	  $scope.loadSensorData = function() {
        $scope.loading = true;
        APIUtils.getAllSensorStatus(function(data, originalData) {
			for(var j = 0; j < 24; j++) {
				var flag = "Ssd" + j +1;				
				for(var i = 0; i < data.length; i++) {
					if(data[i].search_text.indexof(flag) > -1) { 
						ssdData[j] = data[i]; 
						break;
					}
				}	
			}								  
            $scope.loading = false;
        });
      };
	  
	  $scope.loadSensorData();
	  
	    $scope.showSSDData(num) {		  
			
			var ssd_addr = ssdData[num].value >>> 27 & 0x1f;
			var ssd_type = ssdData[num].value >>> 24 & 0x07;
			var link_sp = ssdData[num].value >>> 20 & 0x0f;
			var state = ssdData[num].value >>> 16 & 0x0f;
			var cfg_wd = ssdData[num].value >>> 12 & 0x0f;
			var link_wd = ssdData[num].value >>> 8 & 0x0f;
			var par_id = ssdData[num].value >>> 2 & 0x0f;
			var inserted = ssdData[num].value >>> 1 & 0x01;
			var link_st = ssdData[num].value & 0x01;
				
			var tableid = "ssdinfo";							
			document.getElementById(tableid).rows[1].cells[1].innerHTML = ssd_addr;
			document.getElementById(tableid).rows[2].cells[1].innerHTML = ssd_type;
			document.getElementById(tableid).rows[3].cells[1].innerHTML = link_sp;
			document.getElementById(tableid).rows[4].cells[1].innerHTML = state;
			document.getElementById(tableid).rows[5].cells[1].innerHTML = cfg_wd;
			document.getElementById(tableid).rows[6].cells[1].innerHTML = link_wd;
			document.getElementById(tableid).rows[7].cells[1].innerHTML = par_id;
			document.getElementById(tableid).rows[8].cells[1].innerHTML = inserted;
			document.getElementById(tableid).rows[9].cells[1].innerHTML = link_st;
	    };	  

    }
  ]);
})(angular);