var rootUrl = "http://localhost:8080/";
var authUrl = "http://localhost:8080/"; //9001
var bookUrl = "http://localhost:8080/"; //9002
var orderUrl= "http://localhost:8080/"; //9003;
var notifyUrl= "http://localhost:8080/"; //9004;

var myApp = angular.module("myApp", ['ngRoute']);
myApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/users', {
            templateUrl: 'partials/users.html',
            controller: 'UserController'
        })
        .when('/books', {
            templateUrl: 'partials/books/list.html',
            controller: 'BookController'
        })
        .when('/addbook', {
            templateUrl: 'partials/books/addbook.html',
            controller: 'BookController'
        })
        .when('/orders', {
            templateUrl: 'partials/orders/list.html',
            controller: 'OrderController'
        })
        .when('/myorders', {
            templateUrl: 'partials/orders/myorders.html',
            controller: 'UserOrderController'
        })
        .otherwise({
            templateUrl: 'partials/login.html',
            controller: 'MainController'
        });

    // configure html5 
    // $locationProvider.html5Mode(true);
});
myApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

function getUser() {
    return JSON.parse(localStorage.getItem("LOGGED_IN_USER"));
}

myApp.controller("MainController", function ($rootScope, $scope, $http, $httpParamSerializer, $location) {

    $scope.username = "guest";
    $scope.password = "guest123";

    $rootScope.LOGGED_IN_USER = getUser();



    $scope.getUser = function () {
        return JSON.parse(localStorage.getItem("LOGGED_IN_USER"));
    }

    $scope.login = function () {

        var formData = { "username" : $scope.username , "password" : $scope.password };
        
         //Get Access Token
         var credentials = {
            "username": $scope.username,
            "password": $scope.password,
            "grant_type": "password"
        };


       /* $http.post( userUrl +"auth-service/users/login", formData).then (function(response){
            console.log("Login Response:" + JSON.stringify(response.data));
            alert(JSON.stringify(response.data));
           
        });*/

        $scope.fetchToken(credentials);

    }

    $scope.fetchToken = function (formData) {

        var bearerToken = btoa("c1:s1"); //clientid:clientsecret		
        var req = {
            method: 'POST',
            url: authUrl + "auth-service/oauth/token",
            headers: {
                "Authorization": "Basic " + bearerToken,
                "Content-type": "application/x-www-form-urlencoded; charset=utf-8"

            },
            data: $httpParamSerializer(formData)
        };
        console.log(JSON.stringify(req));

        $http(req).then(function (response) {

            $scope.invalid_login = false;
            var data =  response.data ; //{ "access_token": response.data.access_token };
            $scope.getCurrentUser(data.access_token);

            localStorage.setItem("LOGGED_IN_USER", JSON.stringify(data));
            $rootScope.LOGGED_IN_USER = data;
            console.log(JSON.stringify(response.data));
            
            $location.path("/books");

        }).catch(function (data) {
            console.log("Invalid Login:" + JSON.stringify(data));
            $scope.invalid_login = true;
        });
    }

    $scope.getCurrentUser = function (token) {
        
                $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        
                $http.get(authUrl + "auth-service/currentuser").then(function (response) {
                    console.log(JSON.stringify(response.data));
                    $rootScope.currentuser = response.data;
                });
        
    }

    $scope.logout = function () {

        $rootScope.LOGGED_IN_USER = null;
        localStorage.clear();
        $location.path("/");

    }

});
myApp.controller("BookController", function ($rootScope, $scope, $http, $location ) {
    var user = getUser();

    $scope.getBooks = function () {
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + (user != null ? user.access_token : '');
        $http.get(bookUrl + "book-service/books").then(function (response) {
            $scope.books = response.data;
        });
    };

    $scope.addBook = function () {
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + (user != null ? user.access_token : '');
        $http.post(bookUrl + "book-service/books", $scope.book).then(function (response) {
            console.log("Add Book:" + JSON.stringify(response.data));
            $location.path("/books");
        });
    };

});

myApp.controller("OrderController", function ($rootScope, $scope, $http) {
    var user = getUser();
    $scope.getOrders = function () {

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + (user != null ? user.access_token : '');
        $http.get(orderUrl + "order-service/orders").then(function (response) {
            $scope.orders = response.data;
        });
    };

});

myApp.controller("UserOrderController", function ($rootScope, $scope, $http) {
    var user = getUser();
    $scope.getOrders = function () {

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + (user != null ? user.access_token : '');
        $http.get(orderUrl + "order-service/orders/myorders").then(function (response) {
            $scope.orders = response.data;
        });
    };

});


myApp.controller("UserController", function ($rootScope, $scope, $http, $httpParamSerializer) {

    var user = getUser();

    $scope.init = function () {
        $scope.getUsers();
    }

    $scope.getUsers = function () {
    
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + (user != null ? user.access_token : '');

        $http.get(authUrl + "auth-service/users").then(function (response) {
            console.log(JSON.stringify(response.data));
            $scope.users = response.data;
        });
    }

});
