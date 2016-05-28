angular.module('amblr.routeManage', [])
  .controller('routeManage', function ($scope, $rootScope, $ionicModal, $ionicSideMenuDelegate, $filter, Routes, POIs) {
    $scope.disableSave = false;
    $scope.userID = null;
    $scope.availRoutes = [];
    $scope.currentRoute = null;
    $scope.routePOIs = [];
    
    $ionicModal.fromTemplateUrl('../../templates/routeManageModal.html', {
      scope: $scope,
      animation: 'slide-in-up',
      // backdropClickToClose: true,
      // hardwareBackButtonClose: true
    })
      .then(function (modal) {
        $scope.modal = modal;
      });

    $scope.showRouteManageModal = function () {
      Routes.getRoutes().then(function (routes) {
        $scope.availRoutes = routes;
        $scope.userID = $rootScope.userID;
        $scope.modal.show();
      });
    }

    $scope.hideRouteManageModal = function () {
      $scope.modal.hide();
      $scope.resetSelected();
    }

    $scope.selectRoute = function (routeID) {
      var selectedRoute = $filter('filter')($scope.availRoutes, { '_id': routeID })[0];

      /* filter and order by the route POIs order */      
      $scope.routePOIs = POIs.getRoutePOIs(selectedRoute);
      
      $scope.currentRoute = selectedRoute;
    }
    
    $scope.resetSelected = function () {
      $scope.currentRoute = null;
      $scope.currentRouteName = null;
      $scope.routePOIs = [];
    }

    $scope.removePOI = function (poiID) {
      for (var i = 0; i < $scope.currentRoute.POIs.length; i++) {
        if ($scope.currentRoute.POIs[i] === poiID) {
          var removedPOI = $scope.currentRoute.POIs.splice(i, 1);
          $scope.routePOIs.splice($scope.routePOIs.indexOf(removedPOI), 1);
          break;
        }  
      }
      
      Routes.updateRoute($scope.currentRoute).then(function (route) {
        $scope.currentRoute = route;
      });
    }

    $scope.onDropComplete = function (data, event, target) {
      /* splice out the one we want to move */
      if (target === data.poiID) {
        /* dropping to same location so bail */
        return;
      }
      
      var sourceIndex = $scope.currentRoute.POIs.indexOf(data.poiID);
      var targetIndex = $scope.currentRoute.POIs.indexOf(target);
      var tempPOIStorage =  $scope.currentRoute.POIs.splice(sourceIndex, 1)[0];
      
      if (target !== null) {
        if (targetIndex >= sourceIndex) {
          targetIndex--;
        }
        
        $scope.currentRoute.POIs.splice(targetIndex, 0, tempPOIStorage);
      } else {
        /* dropping to end so just push into array */
        $scope.currentRoute.POIs.push(tempPOIStorage);
      }

      // refresh route
      $scope.selectRoute($scope.currentRoute._id);
    };

    $scope.saveSelected = function () {
      $scope.disableSave = true;
      Routes.updateRoute($scope.currentRoute).then(function (route) {
        $rootScope.$broadcast('reloadPOIs');
        $scope.hideRouteManageModal();
        $scope.disableSave = false;
      });
    };

    $scope.removeRoute = function (routeID) {
      if (!routeID) {
        return;
      }
      
      Routes.deleteRoute(routeID).then(function (result) {
        $scope.showRouteManageModal();
      }).catch(function (error) {
        console.log('Error: while deleting route', error)
      });
    }

  });