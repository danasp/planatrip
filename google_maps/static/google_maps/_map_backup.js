var directionsService = new google.maps.DirectionsService();
var allPath = []; // array contain all marker on the path
var markersArray=[]; // two last markered point
var polylinesArray = []; //all drawed routes on the map
var markerObj = {}; // object for link marker to 1 or 2 polyline. 
var waypointObj = {}; // object for link all waypoints to polyline
var openedInfoWindow; // opened Info Window

function initialize() {
  
    var mapOptions = {
        center: new google.maps.LatLng(55.7512, 37.6184),
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('google-maps'), mapOptions);

    google.maps.event.addDomListener(map, 'click', function(event) {
        
        marker = placeMarker(event)
        markersArray.push(marker);
        allPath.push(marker);
    
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

function placeMarker(eventInst) {

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
            deletedMarker = deleteMarker(markerPosition); 
            deletedPolylines = deletePolylines(deletedMarker);
            var recalc = true;
            routeCalculation(deletedPolylines, recalc);
            return false; });
        
        infoWin = new google.maps.InfoWindow(infoWinProperty);
        openedInfoWindow = infoWin;
        infoWin.open(map, this)
    };

    var initPosition; // for save start position before marker was dragged

    function dragMarker() {

        var endPosition = this.getPosition();
        isDraged = true;
        isReCalcRoute = true;
        
        var pointCoordinate = deletePolylines(initPosition.toString(), isDraged, endPosition.toString());
        if (isArray(pointCoordinate[0])) {
            for (var i = 0; i < pointCoordinate.length; i++) {
                routeCalculation(pointCoordinate[i], isReCalcRoute);
            }
        } else {
            routeCalculation(pointCoordinate, isReCalcRoute);
        };
    };

    var location = eventInst.latLng;
    
    if (location === undefined) {
        eventInst = eventInst.slice(1, -1).split(',');
        location = new google.maps.LatLng(eventInst[0], eventInst[1]);
    };

    var markerOption = {
        map: map,
        position: location,
        draggable: true,
        opacity: 0.8
    }
    var marker = new google.maps.Marker(markerOption);

    google.maps.event.addDomListener(marker, 'click', openInfoWinForMarker);
    google.maps.event.addDomListener(marker, 'dragstart', function() {
        initPosition = marker.getPosition();
    });
    google.maps.event.addDomListener(marker, 'dragend', dragMarker);

    return marker;
    //google.maps.event.addDomListener(marker, 'mouseout', function(){infoWin.close()})
};

function placeWaypoint(location){

    var markerOption = {
        map: map,
        position: location,
        draggable: true,
        opacity: 0.4
    }
    var marker = new google.maps.Marker(markerOption);

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

    for (var i = 0; i <= allPath.length; i++) {
        if (allPath[i].getPosition() == clickedMarkerPosition) {
            allPath[i].setMap(null);
            var deletedMarker = allPath[i].getPosition()
            allPath.splice(i,1);
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

function deletePolylines(key, isDraged, newKey) {
    /*
    Delete 2 polyline around deleted marker and return points for drawing new polyline
    */
    var oldPolyline = markerObj[key];
    for (var i = 0; i < markerObj[key].length; i++) {
        markerObj[key][i].setMap(null);
    };
    delete markerObj[key];
    // create new marker point in markerObj after dragging marker 
    if (isDraged){
        markerObj[newKey] = [];
    };
    var prop;
    var pointA;
    var pointB;
    var pointAFinded = false;
    var pointBFinded = false;
    
    for (prop in markerObj) {
        for (var j = 0; j < markerObj[prop].length; j++) {
            if (pointAFinded && pointBFinded){break};
            if (oldPolyline[0] === markerObj[prop][j]) {
                markerObj[prop].splice(j, 1);
                pointA = prop;
                pointAFinded = true;
                break;
            }else if(oldPolyline[1] === markerObj[prop][j]) {
                markerObj[prop].splice(j, 1);
                pointB = prop;
                pointBFinded = true;
                break;
            };
        };
    };
    var a;
    
    if (isDraged) {
        pointC = newKey
        ac = [pointA, pointC];
        cb = [pointC, pointB];
        a = [ac, cb];
    }else{
        a = [pointA, pointB];
    };
    return a;
};
        
function deleteSinglePolyline(polyline) {

    var pointA;
    var pointB;
    polyline.setMap(null);
    for (var prop in markerObj) {
        for (var i = 0; i < markerObj[prop].length; i++) {
            if (pointA && pointB) break;
            if (markerObj[prop][i] === polyline) {
                if (pointA === undefined) {
                    pointA = prop;
                    markerObj[prop].splice(i, 1);
                } else {
                    pointB = prop;
                    markerObj[prop].splice(i, 1);
                };
            };
        };
    };
    return [pointA, pointB];
}

function routeCalculation(markerToMarkerPath, recalc) {

    if (recalc === undefined) {
        recalc = false;
    }
    var request;
    var encodeDecode = google.maps.geometry.encoding;
        request = {
            origin: markerToMarkerPath[0],
            destination: markerToMarkerPath[1],
            travelMode: google.maps.TravelMode.DRIVING
            //unitSystem: UnitSystem.METRIC
            };

        directionsService.route(request, function(result,status) {
            var lineColor;
            if (status == google.maps.DirectionsStatus.OK) {
                lineColor = "#20B2AA"; //LightSeaGreen
                drawPolyline(encodeDecode.decodePath(result.routes[0].overview_polyline), lineColor, markerToMarkerPath, recalc);
            } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
                lineColor = "#FF6347"; //Tomato
                var line = markerToMarkerPath;
                var zero_reault = true;
                drawPolyline(line, lineColor, markerToMarkerPath, recalc, zero_reault);
            } else if (status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
                markersArray.splice(1,1);
                alert("Warning")
            } else {
                markersArray.splice(1,1);
                alert(status);
            };
        });
};

function drawPolyline(path, color, connectedPointCoordArray, recalc, zero_reault) {

    if (recalc === undefined) {
        recalc = false
    }
    
    if (recalc && zero_reault) {
    /*
    Make google.maps.LatLng objects from latLng string to use in polylineOption
    */
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
    } else {
        var path = path;       
    }
    polylineOption = {
        map: map,
        path: path,
        strokeColor: color,
        strokeWeight: 5,
        geodesic: true,
        draggable: true
    }

    var polyline = new google.maps.Polyline(polylineOption)
    var key;
    
    if (recalc == false){
        for (var i = 0; i < markersArray.length; i++) {
            key = markersArray[i].getPosition().toString();
            if (markerObj[key] === undefined){
                markerObj[key] = [];
            };
            markerObj[key].push(polyline);
        };
    } else {
        for (var i = 0; i < connectedPointCoordArray.length; i++) {
            markerObj[connectedPointCoordArray[i]].push(polyline);
        };
    };
    
    var jsonData = prepareData();
    placeDataInForm(jsonData);

    google.maps.event.addDomListener(polyline, 'rightclick', function(event) {
        alert("hello")
    });
};

function prepareData() {
    
    var encodeDecode = google.maps.geometry.encoding;
    var data = {}
    for (var prop in markerObj){
        if (data[prop] === undefined) data[prop] = [];
        
        for (var i = 0; i < markerObj[prop].length; i++) {
            var rawData =  markerObj[prop][i].getPath();
            var encodeData = encodeDecode.encodePath(rawData);
            data[prop].push(encodeData);

        };
    };
    return JSON.stringify(data);
}

function placeDataInForm(data) {

    document.getElementById("id_route_data").value = data;
}

function drawSavedPath(data){

    console.log("Initial Data", data);
    var encodeDecode = google.maps.geometry.encoding;
    markersArray = [];
    allPath = [];
    var data = JSON.parse(data)
    //console.log("JSON Parse Data", data);
    //var markers = [];
    
    var i = 0;
    var color = "#6495ED"; 
    for (var prop in data){
        //markers.push(prop);
        marker = placeMarker(prop);
        //markersArray.push(marker);
        allPath.push(marker);
        console.log(allPath);
        if (i % 2 != 0) {
            for (var j = 0; j < data[prop].length; j++) {
                var a = encodeDecode.decodePath(data[prop][j].toString());
                drawPolyline(a, color)
            };
        };
        i++;
    };
    console.log(markerObj);
    /*
    var i = 0;
    function loop(){
        
        setTimeout(function(){
            
            placeMarker(keys[i]);
            i++;
            if (i < keys.length) {
                loop();
            };
        }, 1000);
    };
    loop()*/     
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






