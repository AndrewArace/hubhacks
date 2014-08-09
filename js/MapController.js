var map;
var maxZoomLevel = 9;

var MapController = {

    init: function () {
        console.log("MapController.init()");
        this.initMap();
    },

    initMap: function () {
        console.log("MapController.initMap()");

        //graphics layer definitions
        this.glStreetHighlight = new esri.layers.GraphicsLayer();
        this.glAddressHighlight = new esri.layers.GraphicsLayer();
        this.glMapClickHighlight = new esri.layers.GraphicsLayer();
        this.glBuildingHighlight = new esri.layers.GraphicsLayer();

        //geometry service
        this.geomService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

        //symbology
        this.symStreet = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("blue"), 3);
        this.symAddress = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("black"), 1));
        this.symAddress.setColor(new dojo.Color("red"));

        //address info template
        this.infoAddress = new esri.InfoTemplate("Address ${addressId}", "Address: ${fullAddress}<br>" +
            "Neighborhood: ${mailingNeighborhood}, ${zipCode}<br>"
            + "Parcel ID: ${spatialParcelPID}<br>"
            + "<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#myModal'>Confirm Location</button>"
            + "");

        //map and layers
        
        var defaultExtent = new esri.geometry.Extent({ xmin: 758267.6416778979, ymin: 2949455.6614452596, xmax: 791305.8361223424, ymax: 2961122.3281119266, spatialReference: { wkid: 2249 } });
        map = new esri.Map("mapDiv", {
            extent: defaultExtent
        });

        var baselayer = new esri.layers.ArcGISTiledMapServiceLayer("http://maps.cityofboston.gov/ArcGIS/rest/services/SAM/maint_tool/MapServer");
        map.addLayer(baselayer);

        var ortholayer = new esri.layers.ArcGISTiledMapServiceLayer("http://hubmaps2.cityofboston.gov/ArcGIS/rest/services/image_services/ortho_2008_spf_tiled/MapServer");
        ortholayer.setVisibility(false);
        map.addLayer(ortholayer);

        //graphics layers
        map.addLayer(this.glStreetHighlight);
        map.addLayer(this.glAddressHighlight);
        map.addLayer(this.glMapClickHighlight);
        map.addLayer(this.glBuildingHighlight);

        dojo.connect(map, "onClick", this.handleMapClick);
        //dojo.connect(map, "onExtentChange", function (et) {
        //    console.log(et.toJson());
        //});

        dojo.connect(this.glAddressHighlight, "onClick", this.handleAddressPointClick);
        dojo.connect(this.glAddressHighlight, "onMouseOver", function () { map.setMapCursor("pointer"); });
        dojo.connect(this.glAddressHighlight, "onMouseOut", function () { map.setMapCursor("default"); });



        //map dijits
        var geoLocate = new esri.dijit.LocateButton({
            map: map
        }, "LocateButton");
        geoLocate.startup();
        /*
        var home = new esri.dijit.HomeButton({
            map: map
        }, "HomeButton");
        home.startup();

        var ortho = new esri.dijit.OrthoButton({
            mapService: ortholayer,
            serviceVisible : false
        }, "OrthoButton");
        ortho.startup();
        */
        map.resize();
    },

    //SB
    doBIDSearch: function (buildingID) {
        SearchController.searchSAMBuilding(buildingID);
    },


    doSAMSearchSpatial: function (geom) {

        var queryTask = new esri.tasks.QueryTask("http://maps.cityofboston.gov/ArcGIS/rest/services/SAM/LIVE_SAM_ADDRESS/MapServer/0");

        //initialize query
        query = new esri.tasks.Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = "0=0";
        query.geometry = geom;


        queryTask.on("complete", function (fs) {
            //alert("found " + fs.featureSet.features.length.toString() + " results!");

            var addresses = new Array();
            for (var i = 0; i < fs.featureSet.features.length; i++) {

                var f = fs.featureSet.features[i];
                var j = {};
                j.addressId = f.attributes.BUILDING_ID;
                j.fullAddress = f.attributes.FULL_ADDRESS;
                j.zipCode = f.attributes.ZIP_CODE;
                j.mailingNeighborhood = f.attributes.MAILING_NEIGHBORHOOD;
                j.spatialParcelPID = f.attributes.PARCEL;
                j.xCoord = f.attributes.X_COORD;
                j.yCoord = f.attributes.Y_COORD;
                addresses.push(j);

                //{
                //  "addressId":1234,
                //  "fullAddress":"21 Ainsworth St",
                //  "xCoord":753634.177065596,
                //  "yCoord":2930402.91973303,
                //  "mailingNeighborhood":"Roslindale",
                //  "zipCode":"02131",
                //  "relationshipType":1,
                //  "constrId":110891,
                //  "improvementId":110891,
                //  "streetNumber":"21",
                //  "isRange":false,
                //  "rangeFrom":null,
                //  "rangeFromSort":0.0,
                //  "rangeTo":null,
                //  "rangeToSort":0.0,
                //  "unit":null,
                //  "spatialParcelPID":"2004623000",
                //  "spatialParcelId":78401,
                //  "streetId":40,
                //  "fullStreetName":"Ainsworth St",
                //  "wardId":20,
                //  "precinct":"2007"
                //}
            }

            ListController.setResults(addresses);
            MapController.setResults(addresses);
            UIController.setLoading(false);

        })
        queryTask.execute(query);

    },

    ignoreMapclick: false,
    lastClickEvent: null,

    //map click
    handleMapClick: function (evt) {
        if (MapController.ignoreMapclick) {
            return;
        }
        UIController.setLoading(true);
        //search for building at location
        var queryTask = new esri.tasks.QueryTask("http://maps.cityofboston.gov/ArcGIS/rest/services/SAM/maint_tool/MapServer/11");

        //initialize query
        query = new esri.tasks.Query();
        query.returnGeometry = true;
        query.outFields = ["BID"];
        query.where = "0=0";
        query.geometry = evt.mapPoint;
        MapController.lastClickEvent = evt;

        queryTask.on("complete", function (fs) {
            var resultFeatures = fs.featureSet.features;
            if (resultFeatures != null && resultFeatures.length > 0) {
                //if found building search for SAM addresses

                var b = resultFeatures[0];
                var buildingID = b.attributes.BID;

                MapController.doBIDSearch(buildingID);
                UIController.setLoading(false);
                return;
            }
            else {
                MapController.doSAMBufferSearch(MapController.lastClickEvent);
            }

        });

        queryTask.execute(query);
    },


    doSAMBufferSearch: function (evt) {
        //if no building, do buffer of input point
        var geometry = evt.mapPoint;

        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
        symbol = new esri.symbol.PictureMarkerSymbol({ "angle": 0, "xoffset": 2, "yoffset": 8, "type": "esriPMS", "url": "http://static.arcgis.com/images/Symbols/Basic/RedShinyPin.png", "imageData": "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", "contentType": "image/png", "width": 18, "height": 18 });
        var graphic = new esri.Graphic(geometry, symbol);

        MapController.glMapClickHighlight.clear();
        MapController.glMapClickHighlight.add(graphic);

        //setup the buffer parameters
        var params = new esri.tasks.BufferParameters();
        params.distances = [100];//todo, config

        //params.bufferSpatialReference = new esri.SpatialReference({ wkid: 102100 });
        params.outSpatialReference = map.spatialReference;
        params.unit = esri.tasks.GeometryService.UNIT_FOOT;

        params.geometries = [geometry];
        MapController.geomService.buffer(params, function (res) {
            //search SAM database within buffer
            MapController.doSAMSearchSpatial(res[0]);
        });
    },


    handleAddressPointClick: function (clickedPoint) {
        MapController.ignoreMapclick = true;
        setTimeout(function () {
            MapController.ignoreMapclick = false;
        }, 500);
        if (clickedPoint && clickedPoint.graphic && clickedPoint.graphic.attributes) {
            ListController.highlightAddress(clickedPoint.graphic.attributes);
        }
    },


    //draw functions
    drawStreetPolyline: function (feature, bDrawOnMap, bClearMap) {
        if (bDrawOnMap) {

            if (bClearMap) {
                MapController.glStreetHighlight.clear();
            }

            feature.setSymbol(MapController.symStreet);
            MapController.glStreetHighlight.add(feature);
        }
    },


    setResults: function (addresses) {
        MapController.clearMap();
        $.each(addresses, function (index, value) {
            MapController.drawAddress(value);
        });

        if (addresses.length > 0) {
            var ext = esri.graphicsExtent(MapController.glAddressHighlight.graphics);
            ext.spatialReference = map.spatialReference;
            if (ext.getWidth() > 0) {
                map.setExtent(ext, true);
            }
            else {
                var geo = MapController.glAddressHighlight.graphics[0].geometry;
                geo.spatialReference = map.spatialReference;
                map.centerAndZoom(MapController.glAddressHighlight.graphics[0].geometry, maxZoomLevel);
            }
        }
    },


    clearMap: function () {
        MapController.glAddressHighlight.clear();
        MapController.glStreetHighlight.clear();
        MapController.glBuildingHighlight.clear();
        MapController.glMapClickHighlight.clear();
        map.graphics.clear();
        map.infoWindow.hide();
    },


    drawAddress: function (address) {
        var pt = new esri.geometry.Point(address.xCoord, address.yCoord);
        var g = new esri.Graphic(pt, MapController.symAddress, address, this.infoAddress);

        MapController.drawPoint(g);
    },


    highlightAddress: function (addressObject) {
        var pt = new esri.geometry.Point(addressObject.xCoord, addressObject.yCoord);
        pt.spatialReference = map.spatialReference;
        var g = new esri.Graphic(pt, MapController.symAddress, addressObject, this.infoAddress);
        MapController.drawPoint(g);
        map.infoWindow.setTitle(g.getTitle());
        map.infoWindow.setContent(g.getContent());
        map.infoWindow.show(pt);
        map.centerAndZoom(pt, maxZoomLevel);
    },


    drawPoint: function (feature) {
        feature.setSymbol(MapController.symAddress);
        MapController.glAddressHighlight.add(feature);
    },

    //query functions
    handleStreetQueryError: function (err) {
        console.log(err);
    }

};
