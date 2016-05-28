angular.module('amblr.routeFilter', [])
  .controller('routeFilter', function ($scope, $rootScope, $ionicModal, $ionicSideMenuDelegate, Routes, POIs) {
    $scope.availRoutes = [];
    $scope.filteredRoute = null;

    $ionicModal.fromTemplateUrl('../../templates/routeFilterModal.html', {
      scope: $scope,
      animation: 'slide-in-up',
      // backdropClickToClose: true,
      // hardwareBackButtonClose: true
    })
      .then(function (modal) {
        $scope.modal = modal;
      });

    $scope.showFilterModal = function () {
      Routes.getRoutes().then(function (routes) {
        $scope.availRoutes = routes;
        $scope.modal.show();
      });
    }

    $scope.showRoutesNearMe = function() {
      Routes.filterRoutesByDistance($rootScope.coordinates).then(function(routes) {

        return routes
      })
    }

    $scope.hideFilterModal = function () {
      $scope.modal.hide();
    }

    $scope.setRoute = function (routeID) {
      // if there are directions set on the map
      if ($rootScope.directionsDisplay) {
        Routes.clearDirections(); // clear them before setting a new route
      }
      $scope.filteredRoute = routeID;
      if (routeID) {
        for (var i = 0; i < $scope.availRoutes.length; i++) {
          if ($scope.availRoutes[i]['_id'] === routeID) {
            POIs.setRouteFilter($scope.availRoutes[i]);
            break;
          }
        }
      } else {
        POIs.setRouteFilter(null);
      }
      $rootScope.$broadcast('reloadPOIs');
      $scope.modal.hide();
      routeID && Routes.getDirections(routeID);
    }
  });