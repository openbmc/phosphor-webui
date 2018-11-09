/**
 * Controller for power-usage
 *
 * @module app/serverControl
 * @exports powerUsageController
 * @name powerUsageController
 */

window.angular && (function(angular) {
  'use strict';

  angular.module('app.serverControl').controller('powerUsageController', [
    '$scope', '$window', 'APIUtils', 'dataService',
    function($scope, $window, APIUtils, dataService) {
      $scope.dataService = dataService;
	  $scope.export_name = 'ssdInformation.json';
	  
	  $scope.loadSSDInfo = function() {
		$scope.loading = true;
		APIUtils.getSSDInfo( function(data, originalData) {
			$scope.data = data;
			$scope.originalData = originalData;
			$scope.export_data = JSON.stringify(originalData);
			$scope.loading = false;
		} )
		
	  };
	  
	$scope.loadSSDInfo();
	
    }
  ]);
})(angular);