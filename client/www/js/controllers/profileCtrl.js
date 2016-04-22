angular.module('amblr.profile', [])
  .controller('ProfileCtrl', function($scope, $rootScope, $ionicModal, $filter, User, Routes, POIs) {

    $scope.allRoutes = [];
    $scope.allPOIs = [];

    // routes created by user
    $scope.myRoutes = [];

    // POIs created by user
    $scope.myPOIs = [];

    $ionicModal.fromTemplateUrl('../../templates/profile.html', {
      scope: $scope,
      animation: 'slide-in-up',
      })
      .then(function (modal) {
        $scope.modal = modal;
      });

      $scope.showUserProfileModal = function () {
        Routes.getRoutes().then(function (routes) {
          $scope.allRoutes = routes;
          console.log('allRoutes retrieved: ', $scope.allRoutes);

          for (var r = 0; r < $scope.allRoutes.length; r++) {
            var route = $scope.allRoutes[r];
            if (route.userID === $rootScope.userID) {
              $scope.myRoutes.push(route);
            }
          }
        });

        POIs.getPOIs().then(function(pois) {
          $scope.allPOIs = pois.data;
          console.log('allPOIs retrieved: ', $scope.allPOIs);

          for (var i = 0; i < $scope.allPOIs.length; i++) {
            var poi = $scope.allPOIs[i];
            if (poi.userID === $rootScope.userID) {
              $scope.myPOIs.push(poi);
            }
          }
          $scope.modal.show();
        });
       }

      $scope.hideUserProfileModal = function () {
        $scope.modal.hide();
      }

      $scope.setUserRoute = function (routeID) {
        $scope.myRoute = routeID;
        POIs.setRouteFilter(routeID);
        $rootScope.$broadcast('reloadPOIs');
        $scope.modal.hide();
      }
  });