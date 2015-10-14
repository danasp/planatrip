var allPath = []; // array contain all marker on the path
var markersArray=[]; // two last markered point
var markerObj = {"markers":{}, "firstLast": {}}; // object for link marker to 1 or 2 polyline. 
var openedInfoWindow; // opened Info Window

function initialize() {
  
    var mapOptions = {
        center: new google.maps.LatLng(55.7512, 37.6184),
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('google-maps'), mapOptions);

    google.maps.event.addDomListener(map, 'click', function(event) {
        
        var marker = placeMarker(event.latLng)
    
        if (markersArray.length > 2 ) {
            markersArray.splice(0,1);
        };
        var ABRoute = []
    
        if (markersArray.length > 1) {
            ABRoute = [markersArray[0].getPosition(), markersArray[1].getPosition()]
            routeCalculation(ABRoute);
        };
    });    
};

function isArray(arr) {

    return arr.constructor.toString().indexOf("Array") > -1;
};

function placeMarker(eventInst, isWaypoint, seq) {

    var location = eventInst;
    
    try {
        location.lat()
    } catch(err) {
        if (err.name == "TypeError") {
            eventInst = eventInst.slice(1, -1).split(',');
            location = new google.maps.LatLng(eventInst[0], eventInst[1]);
        }
    }
    //if (location === undefined) {
    //    eventInst = eventInst.slice(1, -1).split(',');
    //    location = new google.maps.LatLng(eventInst[0], eventInst[1]);
    //};

    reverseGeocode(location);

    var markerOption = {
        map: map,
        position: location,
        draggable: true,
        opacity: 0.8
    }
    var marker = new google.maps.Marker(markerOption);

    if (isWaypoint) {
        allPath.splice(seq, 0, marker);

    } else {
        markersArray.push(marker);
        allPath.push(marker);
        markerObj["firstLast"]["last_marker"] = marker.getPosition().toString();
    };

    google.maps.event.addDomListener(marker, 'click', openInfoWinForMarker);
    google.maps.event.addDomListener(marker, 'dragstart', function() {
        initPosition = marker.getPosition();
    });
    google.maps.event.addDomListener(marker, 'dragend', dragMarker);

    return marker;
    //google.maps.event.addDomListener(marker, 'mouseout', function(){infoWin.close()})


    function openInfoWinForMarker() {
        
        markerPosition = this.getPosition();
        // check if Info Window already has been opened
        if (openedInfoWindow) {
            openedInfoWindow.close();
        };
        
        infoWinProperty = {
                content: "<div><a href='#' id='deleteMarker'>Удалить точку</a></div>" //\
                         //"<div><a href='javascript:closeRoute(markerPosition);'>Замкнуть маршрут</a></div>" //\
        };
        $(document).on('click', '#deleteMarker',  function(){ 
            
            var deletedMarker = deleteMarker(markerPosition); 
            param = {key: deletedMarker}
            var deletedPolylines = deletePolylines(param);
            var recalc = true;
            if (deletedPolylines != -1) {
                routeCalculation(deletedPolylines, recalc);
            };
            return false; });
        
        var infoWin = new google.maps.InfoWindow(infoWinProperty);
        openedInfoWindow = infoWin;
        infoWin.open(map, this)
    };

    var initPosition; // for save start position before marker was dragged

    function dragMarker() {

        var endPosition = this.getPosition();
        
        reverseGeocode(endPosition);
        
        var isReCalcRoute = true;
        
        var param = {key: initPosition.toString(), isDraged: true, newKey: endPosition.toString()}
        var pointCoordinate = deletePolylines(param);

        if (isArray(pointCoordinate[0])) {
        //if (Array.isArray(pointCoordinate[0])) {
            for (var i = 0; i < pointCoordinate.length; i++) {
                routeCalculation(pointCoordinate[i], isReCalcRoute);
            }
        } else {
            routeCalculation(pointCoordinate, isReCalcRoute);
        };
    };
};


function geocode(address) {

    var geocoder = new google.maps.Geocoder()
    geocoder.geocode( {'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            placeMarker(results[0].geometry.location);
            if (markersArray.length > 2 ) {
                markersArray.splice(0,1);
            };
            var ABRoute = []
    
            if (markersArray.length > 1) {
                ABRoute = [markersArray[0].getPosition(), markersArray[1].getPosition()]
                routeCalculation(ABRoute);
            };
        } else {
            alert(status);
        };
    });
};

function reverseGeocode(latLng) {

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'location': latLng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            res = results[0].formatted_address;
            displayCurrentPath(res);
        } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) { 
            res = "Адрес не найден"
            displayCurrentPath(res);
        } else {
            alert(status);
         };
    });
};

function displayCurrentPath(address) {

    $('#cur_path_div').append('<div id=cpp>' + address + 
        '<img id="close_btn" src="/static/img/ic_close_black_18px.svg"/></div>')
}

function closeRoute(clickedMarkerPosition) {

    var endPoint;
    for (var i = 0; i <= (allPath.length-1); i++) {
        if (allPath[i].getPosition() == clickedMarkerPosition){
            endPoint = i;
            markersArray.push(allPath[i]);
            if (markersArray.length > 2 ) {
                markersArray.splice(0,1);
            };
            ABRoute = [markersArray[0].getPosition(), markersArray[1].getPosition()]
            return ABRoute;
        };
    };
};

function deleteMarker(clickedMarkerPosition){
    /*Find index position of marker for deletion and delete it from map. 
      Then delete 2 polyline between this marker and calculate new route
      if last marker was deleted change markersArray's value [0] and [1] 
      to allPath[-2] and allPath[-1] respectively
    */
    //var delMarkerIndex;

    for (var i = 0; i < allPath.length; i++) {
        
        if (allPath[i].getPosition() == clickedMarkerPosition) {
            allPath[i].setMap(null);
            var deletedMarker = allPath[i].getPosition()
            allPath.splice(i,1);
            
            //if (deletedMarker.toString() == markerObj["firstLast"]["last_marker"]) {
            //}

            if (i == allPath.length) // check if i is a last Marker on a route.
            {
                markersArray[markersArray.length - 1] = allPath[allPath.length - 1];
                markersArray[markersArray.length - 2] = allPath[allPath.length - 2];
            }
            
            return deletedMarker;
            break;
        }; 
    };
};

function deletePolylines(param) { //key, isDraged, newKey, withoutReCalc) {
    /*
    Delete 2 polyline around deleted marker and return points for drawing new polyline
    */
    var key = param.key;
    var newKey = param.newKey;
    var isDraged = param.isDraged || false;
    var withoutReCalc = param.withoutReCalc || false;

    var oldPolyline = markerObj["markers"][key];
    
    for (var i = 0; i < markerObj["markers"][key].length; i++) {
        markerObj["markers"][key][i].setMap(null);
    };
    delete markerObj["markers"][key];
    
    if (withoutReCalc) {
        return true;
    }
    // create new marker point in markerObj after dragging marker 
    var isTerminalPoint;
    if (oldPolyline.length > 1) {
        isTerminalPoint = false;
    } else { 
        isTerminalPoint = true;
    };

    if (isDraged){
        markerObj["markers"][newKey] = [];
    };
    var prop;
    var pointA;
    var pointB;
    var pointAFinded = false;
    var pointBFinded = false;
    
    for (prop in markerObj["markers"]) {
        if (pointAFinded && pointBFinded) break;

        for (var j = 0; j < markerObj["markers"][prop].length; j++) {
            if (oldPolyline[0].getPath().getArray().toString() == markerObj["markers"][prop][j].getPath().getArray().toString()) {
                markerObj["markers"][prop].splice(j, 1);
                pointA = prop;
                pointAFinded = true;
                break;
            } else if (isTerminalPoint == false && oldPolyline[1].getPath().getArray().toString() == markerObj["markers"][prop][j].getPath().getArray().toString()) {
                markerObj["markers"][prop].splice(j, 1);
                pointB = prop;
                pointBFinded = true;
                break;
            };
        };
    };
    var a;
    
    if (isDraged && isTerminalPoint == false) {
        pointC = newKey
        ac = [pointA, pointC];
        cb = [pointC, pointB];
        a = [ac, cb];
    } else if (isDraged && isTerminalPoint) {
        pointC = newKey;
        a = [pointA, pointC];
    } else if (isTerminalPoint){
        a = -1;
    } else {
        a = [pointA, pointB];
    };
    return a;
};

function deleteSinglePolyline(polyline, markersLatLng) {
/*
    Get polyline object, delete it from map and from markerObj.
*/  
    polyline.setMap(null);
    var markerA = markersLatLng[0].toString();
    var marAArray = markerObj["markers"][markerA];
    var markerB = markersLatLng[1].toString();
    var marBArray = markerObj["markers"][markerB]

    for (var i = 0; i < marAArray.length; i++) {
        if (marAArray[i] == polyline) {
            markerObj["markers"][markerA].splice(i,1);
        };
    };
    for (var j = 0; j < marBArray.length; j++) {
        if (marBArray[j] == polyline) {
            markerObj["markers"][markerB].splice(j,1);
        };
    };
};


function findStartEndPolylinePoints(polyline) {
/*
    Get polyline object and find start and end points of this polyline.
    Return start and end points array containing LatLng objects. 
*/
    var pointA, pointB;
    for (prop in markerObj["markers"]) {
        if (pointA && pointB) break;
        for (var i = 0; i < markerObj["markers"][prop].length; i++) {
            if (markerObj["markers"][prop][i] === polyline) {
                if (pointA) {
                    pointB = prop;
                    break;
                };
                pointA = prop
            };
        };
    };
    
    var aArray = pointA.slice(1,-1).split(',');
    var aLat = parseFloat(aArray[0]);
    var aLng = parseFloat(aArray[1]);
    var aLatLng = new google.maps.LatLng(aLat, aLng)
    
    var bArray = pointB.slice(1,-1).split(',');
    var bLat = parseFloat(bArray[0]);
    var bLng = parseFloat(bArray[1]);
    var bLatLng = new google.maps.LatLng(bLat, bLng);


    startEndPoints = [aLatLng, bLatLng]
    return startEndPoints;
};

function routeCalculation(path, isRecalc, isAddWaypoint, waypoint, oldPoint) {
/*
Take two point in the path param, calculate path between them and return all points in the path. IF can't find path return
start point and end point as points in the path.  
*/
    
    var polylinePoints;
    var directionsService = new google.maps.DirectionsService();
    //var request;
    var encodeDecode = google.maps.geometry.encoding;
    done = false;
    var request = {
            origin: path[0],
            destination: path[1],
            travelMode: google.maps.TravelMode.DRIVING
            //unitSystem: UnitSystem.METRIC
        };
    directionsService.route(request, function(result, status) {

        
        var a = [];
        if (status == google.maps.DirectionsStatus.OK) {
            polylinePoints = encodeDecode.decodePath(result.routes[0].overview_polyline);            
            var lineColor = "#20B2AA"; //LightSeaGreen
            var isVisible = true;
            polyline = drawPolyline(polylinePoints, lineColor, isVisible);
            
            param = {
                    "polyline" : polyline,
                    "polylinePoints" : polylinePoints, 
                    "recalc" : isRecalc,
                    "path" : path, 
                    "isAddWaypoint" : isAddWaypoint,
                    "waypoint" : waypoint,
                    "oldPoint" : path[0]
            }
            connectPolylineToMarker(param);
            done = true;

        } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
            
            if (isRecalc){
                var aCoord = path[0].slice(1,-1).split(","); /* replace Array [ "(66.09055138825454, 48.37500214576721)", "(66.58438125245459, 81.94922089576721)" ] 
                                                            to ["66.09055138825454"," 48.37500214576721"]*/
                var aLat = parseFloat(aCoord[0]); /*convert ["66.09055138825454"," 48.37500214576721"]
                                                to 2 float number 66.09055138825454 and 48.37500214576721*/
                var aLng = parseFloat(aCoord[1]);
                var bCoord = path[1].slice(1,-1).split(","); /* replace Array [ "(66.09055138825454, 48.37500214576721)", "(66.58438125245459, 81.94922089576721)" ]
                                                        to ["66.58438125245459"," 81.94922089576721"]*/
                var bLat = parseFloat(bCoord[0]); //convert ["66.58438125245459"," 81.94922089576721"] 
                var bLng = parseFloat(bCoord[1]); //to 2 float number 66.58438125245459 and 81.94922089576721
                var A = new google.maps.LatLng(aLat, aLng);
                var B = new google.maps.LatLng(bLat, bLng);
                
                path = [A,B];
            };

            var lineColor = "#FF6347"; //Tomato
            var isVisible = true;
            var polyline = drawPolyline(path, lineColor, isVisible);
            
            param = {
                    "polyline" : polyline,
                    "polylinePoints" : path, 
                    "recalc" : isRecalc,
                    "isAddWaypoint" : isAddWaypoint,
                    "waypoint" : waypoint,
                    "oldPoint" : path[0]
            };

            connectPolylineToMarker(param);//polyline, path, isRecalc);
            done = true;
        } else {
            alert(status);
            done = true;
        };
    });
    var intervalId = setInterval(function(){
            $("div").remove('#info-onMap');
            if (done) {
                //document.getElementById("info-onMap").innerHTML = ""
                clearInterval(intervalId)
                //$("#spinner > div").removeClass("is-active")
                //$("div").remove('.mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active');
            } else {
                //document.getElementById("info-onMap").innerHTML = "Расчет маршрута"
                //$("#spinner > div").addClass("is-active")
                $("#content").append("<div id='info-onMap'>Расчет маршрута</div>")
            };
        }, 50);
};

function drawPolyline(path, color, isVisible) {

    if (isVisible === undefined) isVisible = false;
    
    polylineOption = {
        map: map,
        path: path,
        strokeColor: color,
        strokeWeight: 5,
        geodesic: true,
        //draggable: true,
        visible: isVisible
    }

    var polyline = new google.maps.Polyline(polylineOption);
    
    google.maps.event.addDomListener(polyline, 'click', function(event) {    

        se = findStartEndPolylinePoints(polyline)
        deleteSinglePolyline(polyline, se);

        var isAddWaypoint = true;
        var marker;
        var markerA;
        var markerB;
        var seq, seq1, seq2;
        for (var i = 0; i < allPath.length; i++) {
            //if (allPath[i].getPosition().toString() == se[0].toString()) {
            if (allPath[i].getPosition().equals(se[0])) {
                seq1 = i;
                markerA = allPath[i];

            } else if (allPath[i].getPosition().equals(se[1])) {
                seq2 = i;
                markerB = allPath[i];
            };
        };
        if (seq1 > seq2) {
            seq = seq1;
        } else if (seq1 < seq2) {
            seq = seq2;
        };

        marker = placeMarker(event.latLng, isAddWaypoint, seq);
        var recalc = false;
        
        var waypoint = marker.getPosition();
        var oldPoint = se[0]
        
        routeCalculation([se[0], marker.getPosition()], recalc, isAddWaypoint, waypoint, oldPoint);
        
        oldPoint = se[1]
        routeCalculation([se[1], marker.getPosition()], recalc, isAddWaypoint, waypoint, oldPoint);
        
    });
    return polyline;
}

function connectPolylineToMarker(param){//polyline, path, recalc, markerCoordForDificultRoute, isAddWaypoint, startEndPoints){
   /*
    Если маршрут сложный (google.maps.DirectionsStatus.OK), то координаты маркера и координаты начала Polyline
    могут не совпадать. Для этого случая используется параметр markerCoordForDificultRoute, в котором передаются координаты
    маркера. 
    В параметре path находятся все точки, необходимые для отрисовки маршрута, полученные от DirectionsService.
    */
    var polyline = param.polyline;
    var path = param.polylinePoints;
    var recalc = param.recalc || false;
    var markerCoordForDificultRoute = param.path;
    var isAddWaypoint = param.isAddWaypoint || false;
    var waypoint = param.waypoint;
    var oldPoint = param.oldPoint;
    var key; 

    if (isAddWaypoint == false) {
        if (recalc == false){
            for (var i = 0; i < markersArray.length; i++) {
                key = markersArray[i].getPosition().toString();
                if (markerObj["markers"][key] === undefined){
                    markerObj["markers"][key] = [];
                };
                markerObj["markers"][key].push(polyline);
            };
        } else if (recalc && markerCoordForDificultRoute){
            
            for (var i = 0; i < markerCoordForDificultRoute.length; i++) {
                markerObj["markers"][markerCoordForDificultRoute[i]].push(polyline);
            }
        } else if (recalc) {
            
            for (var i = 0; i < path.length; i++) {
                markerObj["markers"][path[i]].push(polyline);
            };
        };
    
    } else if (isAddWaypoint){
        
        markerObj["markers"][oldPoint].push(polyline);

        if (markerObj["markers"][waypoint.toString()] === undefined){
            markerObj["markers"][waypoint.toString()] = [];
        }
        markerObj["markers"][waypoint.toString()].push(polyline);
    };

    var jsonData = prepareData();
    placeDataInForm(jsonData);

};

function prepareData() {
    
    var encodeDecode = google.maps.geometry.encoding;
    var data = {};
    data["markers"] = {};
    data["firstLast"] = {};
     //data["firstLast"]["last_marker"] = {};
    for (var prop in markerObj["markers"]){
        if (data["markers"][prop] === undefined) { data["markers"][prop] = []; }
        
        for (var i = 0; i < markerObj["markers"][prop].length; i++) {
            var rawData =  markerObj["markers"][prop][i].getPath();
            var encodeData = encodeDecode.encodePath(rawData);
            data["markers"][prop].push(encodeData);
        };
    };
    //data["firstLast"]["last_marker"] = allPath[allPath.length - 1].getPosition().toString();
    data["firstLast"]["last_marker"] = markerObj["firstLast"]["last_marker"];
    return JSON.stringify(data);
}

function placeDataInForm(data) {

    if (document.getElementById("id_route_data") != null) {
        document.getElementById("id_route_data").value = data;
    };
};

function drawSavedPath(data){

    for (var mar in markerObj["markers"]) {
        dm = deleteMarker(mar);
        param = {key: dm, withoutReCalc: true};
        deletePolylines(param);
    };

    markerObj["markers"] = {};
    markerObj["firstLast"] = {};
    markersArray = []; // already cleared previously functions(deleteMarker), but for sure clear Array again
    allPath = []; // already cleared previously functions (deleteMarker), but for sure clear Array again

    var marker;
    var encodeDecode = google.maps.geometry.encoding;
    var data = JSON.parse(data);
    var data_decoded = {};
    var polyline;
    var color = "#6495ED";
    var isVisible = true;


    for (var prop in data["markers"]) {
        data_decoded[prop] = [];
        for (var i = 0; i < data["markers"][prop].length; i++) {
            data_decoded[prop][i] = encodeDecode.decodePath(data["markers"][prop][i]);
        };
    };

    for (var prop in data_decoded) {
        markerObj["markers"][prop] = [];
        marker = placeMarker(prop);
        //allPath.push(marker)
        if (markersArray.length > 2 ) {
            markersArray.splice(0,1);
        };
    };

    for (var m = 0; m < allPath.length; m++) {
        if (allPath[m].getPosition().toString() == data["firstLast"]["last_marker"]) {
            markersArray.splice(0,1);
            markersArray[1] = allPath[m];
            markerObj["firstLast"]["last_marker"] = allPath[m].getPosition().toString();
        }
    }

    for (var prop in data_decoded) {

        for (var j = 0; j < data_decoded[prop].length; j++) {
            latLng = data_decoded[prop][j];
            polyline = drawPolyline(latLng, color, isVisible);
            markerObj["markers"][prop].push(polyline);
            data_decoded[prop].splice(j, 1);
            
            for (key in data_decoded) {
                
                for (var k = 0; k < data_decoded[key].length; k++) {
                    
                    if (latLng.toString() == data_decoded[key][k].toString()) {
                        markerObj["markers"][key].push(polyline);
                        data_decoded[key].splice(k, 1);
                    };
                };
            };
        };
    };
};


google.maps.event.addDomListener(window, 'load', initialize);



/*
function loadScript(){
    var script = document.createElement("script");
    script.src = "http://maps.googleapis.com/maps/api/js?callback=initialize&language=ru";
    script.src = "http://maps.googleapis.com/maps/api/js?language=ru";
    document.getElementsByTagName("head")[0].appendChild(script);
    initialize()
}

window.onload = loadScript;
*/






