angular.module('amblr.leftnav', ['ngDraggable'])
.controller('LeftMenuNav', function($scope, $ionicSideMenuDelegate, $http, $rootScope, ENV) {

  $scope.loggedIn = false;
  
  $scope.isLoggedIn = function() {
    $http.get(ENV.apiEndpoint + '/checklogin')
      .success(function(data) {
        $rootScope.loggedIn = data;
      })
      .error(function(data) {
        console.log('error: ' + data);
      });
  };

  $scope.showMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
    $scope.isLoggedIn();
  };
  
  $scope.$on('draggable:end', function (target, event) {
    /* only trigger for dropMarker draggable:end event */
    if (event.data && event.data.type === 'dropMarker') {
      // hardcoded offset to 27 px
      $scope.$broadcast('newMarkerDrop', event.x, event.y - 27);
    }  
  });
});