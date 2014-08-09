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

        //geometry service
        this.geomService = new esri.tasks.GeometryService("http://support.geonetics.com/ArcGIS2/rest/services/Geometry/GeometryServer");

        //symbology
        this.symStreet = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("blue"), 3);
        this.symAddress = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("black"), 1));
        this.symAddress.setColor(new dojo.Color("red"));

        //address info template
        this.infoAddress = new esri.InfoTemplate("Address ${addressId}", "Address: ${fullAddress}<br>" +
            "Neighborhood: ${mailingNeighborhood}, ${zipCode}<br>" +
            "");

        //map and layers
        map = new esri.Map("mapDiv");
        var baselayer = new esri.layers.ArcGISTiledMapServiceLayer("http://maps.cityofboston.gov/ArcGIS/rest/services/SAM/maint_tool/MapServer");
        map.addLayer(baselayer);

        var ortholayer = new esri.layers.ArcGISTiledMapServiceLayer("http://hubmaps2.cityofboston.gov/ArcGIS/rest/services/image_services/ortho_2008_spf_tiled/MapServer");
        ortholayer.setVisibility(false);
        map.addLayer(ortholayer);

        //graphics layers
        map.addLayer(this.glStreetHighlight);
        map.addLayer(this.glAddressHighlight);

        dojo.connect(map, "onClick", this.handleMapClick);

        dojo.connect(this.glAddressHighlight, "onClick", this.handleAddressPointClick);

        //map dijits
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


    //map click
    handleMapClick: function (evt) {

    },


    handleAddressPointClick: function (clickedPoint) {
        if (clickedPoint && clickedPoint.graphic && clickedPoint.graphic.attributes) {
            console.log("highlight " + clickedPoint.graphic.attributes.addressId);
            ListController.highlightAddress(clickedPoint.graphic.attributes);
        }
    },

    //zoom functions
    zoomAndCenterToXY: function (xCoord, yCoord, bZoomIn) {
        if (xCoord == 0 && yCoord == 0) {
            return;
        }

        var mp = new esri.geometry.Point(xCoord, yCoord, map.spatialReference);

        if (bZoomIn) {
            map.centerAndZoom(mp, maxZoomLevel);
        }
        else {
            map.centerAt(mp);
        }
    },


    zoomAndCenterToAddress: function (address, bZoomIn, bDrawOnMap, bClearMap) {
        MapController.zoomAndCenterToXY(address.xCoord, address.yCoord, bZoomIn);

        //draw
        if (bClearMap) {
            MapController.clearMap();
        }
        if (bDrawOnMap) {
            //make a new feature
            var pt = new esri.geometry.Point(address.xCoord, address.yCoord);
            var g = new esri.Graphic(pt, MapController.symAddress, address, this.infoAddress);
            MapController.drawPoint(g);
            map.infoWindow.setTitle(g.getTitle());
            map.infoWindow.setContent(g.getContent());
            map.infoWindow.show(pt);
        }

    },


    zoomAndCenterToStreet: function (street, bZoomIn, bDrawOnMap, bClearMap) {
        //query the street to get to the geometry
        var q = new esri.tasks.Query();
        var qt = new esri.tasks.QueryTask("http://hubmaps2.cityofboston.gov/ArcGIS/rest/services/SAM/maint_tool/MapServer/7");

        q.returnGeometry = true;
        q.where = "SAM_STREET = {0}".replace("{0}", street.streetId);

        qt.execute(q,
            function (results) {
                if (results != null && results.features != null && results.features.length <= 0) {
                    return;
                }

                var firstStreetFeature = results.features[0];

                //center / zoom
                if (bZoomIn) {
                    map.setExtent(firstStreetFeature.geometry.getExtent());
                }

                //draw
                MapController.drawStreetPolyline(firstStreetFeature, bDrawOnMap, bClearMap);
            },
            MapController.handleStreetQueryError);
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
    },


    clearMap: function () {
        MapController.glAddressHighlight.clear();
        MapController.glStreetHighlight.clear();
        map.infoWindow.hide();
    },


    drawAddress: function (address) {
        var pt = new esri.geometry.Point(address.xCoord, address.yCoord);
        var g = new esri.Graphic(pt, MapController.symAddress, address, this.infoAddress);

        MapController.drawPoint(g);
    },


    highlightAddress: function (addressObject) {
        var pt = new esri.geometry.Point(addressObject.xCoord, addressObject.yCoord);
        var g = new esri.Graphic(pt, MapController.symAddress, addressObject, this.infoAddress);
        MapController.drawPoint(g);
        map.infoWindow.setTitle(g.getTitle());
        map.infoWindow.setContent(g.getContent());
        map.infoWindow.show(pt);
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
