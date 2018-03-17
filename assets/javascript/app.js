$(function () {
    //-- firebase is pulling an error. but im not sure what it is .
    //-- is is still updating but it is giving an error for the default not being set. 
    //-- tried to get this error from showing but to no avail.
    var config = {
        apiKey: "AIzaSyCMPJAebkYT6GhtKhzrTmGuL2InwwbEnwE",
        authDomain: "my-other-roadtrip-bd.firebaseapp.com",
        databaseURL: "https://my-other-roadtrip-bd.firebaseio.com",
        projectId: "my-other-roadtrip-bd",
        storageBucket: "my-other-roadtrip-bd.appspot.com",
        messagingSenderId: "1022651492776"
      };
      firebase.initializeApp(config);
    //   App.initializeApp(app);

    initMap();

});


var parsedLat = null;
var parsedLng = null;
var foodResults = [];
var gasResults = [];


$("#button-1").on("click", function () {
    event.preventDefault();
    // getFood(parsedLat, parsedLng);
    // displayGasList(parsedLat, parsedLng);
    mapCreation(parsedLat, parsedLng);

});

function initMap() {

    var database = firebase.database();

    var location = $(this).attr("dataLocation");
    var queryURL = "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyARYyZkZLUQZOyJQU7cMku9y1ypSjCz5iE";


    // https://maps.googleapis.com/maps/api/js?key=AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk&callback=initMap

    // https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBn5ySae8mKDqxCbjeeF8qw16nylIjhUu0&callback=initMap


    $.ajax({
        url: queryURL,
        method: "POST"

    }).then(function (response) {
        database.ref().push(response.location);
    });

    database.ref().limitToLast(1).on("child_added", function (childSnapshot) {
        var locationLat = childSnapshot.val().lat;
        var locationLng = childSnapshot.val().lng;

        parsedLat = parseFloat(locationLat);
        parsedLng = parseFloat(locationLng);
    });

}

function mapCreation(parsedLat, parsedLng) {
    var userLatLng = {
        lat: parsedLat,
        lng: parsedLng
    };

    var options = {
        zoom: 12,
        center: userLatLng
    }
    var map = new google.maps.Map(document.getElementById('map'), options);
    var marker = new google.maps.Marker({
        position: userLatLng,

        map: map,
        icon: 'assets/images/markers/darkgreenU.png '

    });
    var infoWindow = new google.maps.InfoWindow({
        content: '<h3>This is a test message!</h3>'
    })

    marker.addListener('click', function () {
        infoWindow.open(map, marker);
    })


    addMarker(userLatLng);

    function addMarker(coords) {
        var marker = new google.maps.Marker({
            position: coords,
            map: map,
            icon: 'assets/images/markers/darkgreenU.png '

        });
    }
}


$("#foodSubmit").on("click", function (event) {
    event.preventDefault();
    getFood(parsedLat, parsedLng);
    mapCreation(parsedLat, parsedLng);
});

$("#foodFormsubmit").on("click", function (event) {
    event.preventDefault();

    getFood(parsedLat, parsedLng);
    mapCreation(parsedLat, parsedLng);
    $("#restInput").val("");
});



function getFood(lati, long) {
    var userInput = $("#restInput").val().trim();

    var foodQueryURL = "https://developers.zomato.com/api/v2.1/search";
    foodQueryURL += '?' + $.param({
        'lat': lati,
        'lon': long,
        'sort': "real_distance",
        'start': 0,
        'q': userInput
    });

    $.ajax({
        url: foodQueryURL,
        headers: { "user-key": "347df1f1ac7c392cc9a8c55d2bbf3ed3" },
        method: 'GET'
    }).then(function (resp) {

        // console.log("food: " ,foodResults);
        foodResults = [];
        $("#food").empty();
        for (i = 0; i < 5; i++) {
            // console.log("for loop");
            console.log(resp.restaurants[i]);
            var restaurantCords = {
                lat: parseInt(resp.restaurants[i].restaurant.location.latitude),
                lng: parseInt(resp.restaurants[i].restaurant.location.longitude)
            };
//-- trying to get the markers to populate on the map in this for loop but im not having luck with it.
//-- keep getting error that SetMap not an instance of Map...
//-- not sure why this is happening still.
        //     foodResults.push(restaurantCords);

        //     var marker = new google.maps.Marker({
        //         position: restaurantCords,
        
                
        //         map: map,
        //         icon: 'assets/images/markers/darkgreenU.png '
        
        //     });
        //     var infoWindow = new google.maps.InfoWindow({
        //         content: '<h3>This is a test message!</h3>'
        //     })
        
        //     marker.addListener('click', function () {
        //         infoWindow.open(map, marker);
        //     })
        // setMap();
        // marker.setMap(map);
        
            addMarker(restaurantCords);
        
            function addMarker(coords) {
                var marker = new google.maps.Marker({
                    position: coords,
                    map: map,
                    icon: 'assets/images/markers/darkgreenU.png '
        
                });
            }



            var resName = $("<dt>").text(resp.restaurants[i].restaurant.name);
            var resLocation = resp.restaurants[i].restaurant.location.address;

            var resCuisine = resp.restaurants[i].restaurant.cuisines
            var price_range = resp.restaurants[i].restaurant.price_range;
            var currency = resp.restaurants[i].restaurant.currency;

            var rangePrice = currency.repeat(price_range);

            var resRating = $("<span>").text(resp.restaurants[i].restaurant.user_rating.aggregate_rating);
            var ratingText = resp.restaurants[i].restaurant.user_rating.rating_text;
            var ratingColor = resp.restaurants[i].restaurant.user_rating.rating_color;
            var resVotes = resp.restaurants[i].restaurant.user_rating.votes;

            resRating.css("color", "#" + ratingColor);


            var resTyLoc = $("<dd>").append(resCuisine + " &#9679; " + resLocation).addClass("mb-0");

            var resRatePrice = $("<dd>");
            resRatePrice.append(resRating, " " + ratingText + " (" + resVotes + " votes)" + " &#9679; " + rangePrice);

            var list = $("<dl>").append(resName, resTyLoc, resRatePrice);
            $("#food").append(list);
        }
        // console.log(foodResults);

        foodResults.forEach(function (res) {

            var marker = new google.maps.Marker({
                position: res,
                map: map,
                icon: 'assets/images/markers/darkgreenU.png '

            });

            var infoWindow = new google.maps.InfoWindow({
                content: '<h3>This is a test message!</h3>'
            })

            marker.addListener('click', function () {
                infoWindow.open(map, marker);
            })


            addMarker(userLatLng);
        })

     });
}

$("#gasStation").on("click", function (event) {
    event.preventDefault();
    $("#station").empty();//clear button
    displayGasList(parsedLat, parsedLng);
    mapCreation(parsedLat, parsedLng);
}); // close onClick


var displayGasList = function (lati, long) {

    var apiUrl = "http://api.mygasfeed.com/stations/radius/" + lati + "/" + long + "/25/reg/distance/dfoh89ze54.json";
    $.ajax({
        url: apiUrl,
        method: 'GET'
    }).then(function (response) {
        var gasList = response.stations;

        $("#gas").empty();  // clear box

        // create list
        for (var i = 0; i < 5; i++) {
            var gasLatitude = gasList[i].lat;

            var gasLongitude = gasList[i].lng;

            var gasName = $("<dt>").text(gasList[i].station);

            var gasDistance = $("<dd>").text(gasList[i].distance).addClass("mb-0");


            var gasZip = gasList[i].zip;

            var gasAddress = $("<dd>").text(gasList[i].address).addClass("mb-0");

            var gasCity = gasList[i].city;


            var gasLoc = $("<dd>").text(gasCity + " " + gasZip).addClass("mb-0");


            var gasPrice = $("<dd>").text("Regular: " + gasList[i].reg_price).addClass("mb-0");

            var dieselPrice = $("<dd>").text("Diesel: " + gasList[i].diesel_price).addClass("mb-0");



            var gasDesc = $("<dl>").append(gasName, gasDistance, gasAddress, gasLoc, gasPrice, dieselPrice);
            $("#gas").append(gasDesc);


        }
    });
}