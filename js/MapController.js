var map;
var maxZoomLevel = 9;
var segmentsService = "http://support.geonetics.com/ArcGIS2/rest/services/sam_lrs_segments/MapServer";

var MapController = {

    init: function () {
        console.log("MapController.init()");
        this.initMap();
    },

    initMap: function () {
        console.log("MapController.initMap()");

        //graphics layer definitions
        this.glStreetHighlight = new esri.layers.GraphicsLayer();
        this.glSegmentHighlight = new esri.layers.GraphicsLayer();
        this.glAddressHighlight = new esri.layers.GraphicsLayer();

        //geometry service
        this.geomService = new esri.tasks.GeometryService("http://support.geonetics.com/ArcGIS2/rest/services/Geometry/GeometryServer");

        //symbology
        this.symStreet = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("blue"), 3);
        this.symAddress = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("black"), 1));
        this.symAddress.setColor(new dojo.Color("red"));

        //address info template
        this.infoAddress = new esri.InfoTemplate("Location", "Full Address: ${fullAddress}<br>"+
            "Address Id: ${addressId}<br>"+
            "");

        //map and layers
        map = new esri.Map("mapDiv");
        //var baselayer = new esri.layers.ArcGISTiledMapServiceLayer("http://hubmaps2.cityofboston.gov/ArcGIS/rest/services/SAM/maint_tool/MapServer");
        var baselayer = new esri.layers.ArcGISTiledMapServiceLayer("http://maps.cityofboston.gov/ArcGIS/rest/services/SAM/maint_tool/MapServer");
        map.addLayer(baselayer);

        //var ortholayer = new esri.layers.ArcGISTiledMapServiceLayer("http://hubmaps2.cityofboston.gov/ArcGIS/rest/services/image_services/ortho_2008_spf_tiled/MapServer");
        var ortholayer = new esri.layers.ArcGISTiledMapServiceLayer("http://hubmaps2.cityofboston.gov/ArcGIS/rest/services/image_services/ortho_2008_spf_tiled/MapServer");
        ortholayer.setVisibility(false);
        map.addLayer(ortholayer);

        //graphics layers
        map.addLayer(this.glStreetHighlight);
        map.addLayer(this.glSegmentHighlight);
        map.addLayer(this.glAddressHighlight);

        dojo.connect(map, "onClick", this.handleMapClick);

        //map dijits
        var home = new esri.dijit.HomeButton({
            map: map
        }, "HomeButton");
        home.startup();

        var ortho = new esri.dijit.OrthoButton({
            mapService: ortholayer,
            serviceVisible : false
        }, "OrthoButton");
        ortho.startup();

        map.resize();
    },

    //map click
    handleMapClick: function(evt) {

        return;
        var clickedpoint = evt.mapPoint;
        var jsonclickedpoint = clickedpoint.toJson();

        //are there multiple segments here?
        var geometries = esri.getGeometries(MapController.glPermitHighlight.graphics);

        if (geometries.length <= 0) {
            return;
        }

        var jsongeometries = [];
        $.each(geometries, function (index, element) {
            jsongeometries.push(element.toJson());
        });

        //MapController.geomService.intersect(geometries, clickedpoint, function (resultGeometries) {
        //var jsondata = JSON.stringify(clickedpoint.toJson());
        $.ajax({
            type: "POST",
            //the url where you want to sent the userName and password to
            url: arcgiswrapperService,
            dataType: "json",
            async: false,
            //json object to sent to the authentication url
            data: { point: jsonclickedpoint, lines: jsongeometries },
            success: function (evt) {
                alert('hi');
            },
            error: function (evt) {
                alert('there was an error');
            }
        });

        //});

        //if there are, popup a datagrid with multiple segments in it

    },

    //segment query function
    zoomAndCenterToPermit: function (permit, bZoomIn, bDrawOnMap, bClearMap) {

        //get and build the segments associated to this permit
        $.getJSON(lrspermitByPermitGUID.replace("{0}", permit.PermitGUID), function (result) {
            //build segment id where clause
            var ids = "";
            $.each(result, function (index, element) {
                if (ids.length != 0) {
                    ids = ids + ",";
                }
                ids = ids + element.segmentId;
            });

            var q = new esri.tasks.Query();
            var qt = new esri.tasks.QueryTask(segmentsService + "/0");


            q.returnGeometry = true;
            q.where = "SEGMENT_ID in ({0})".replace("{0}", ids);

            qt.execute(q, function (results) {

                if (results != null && results.features != null && results.features.length <= 0) {
                    return;
                }

                //draw the permit address point
                if(permit.PropertyAddress != null) {
                    var mp = new esri.geometry.Point(permit.PropertyAddress.GpsX, permit.PropertyAddress.GpsY, map.spatialReference);
                    var g = new esri.Graphic(mp, MapController.symAddress);
                    MapController.drawPoint(g, true, false);
                }

                //loop on all the features
                var ext;
                $.each(results.features, function (index, element) {

                    element.setSymbol(MapController.symPermitTypes[permit.CalculatedPermitType]);
                    //element.setInfoTemplate(MapController.infoSegment);
                    element.setAttributes(permit);

                    //draw
                    if (index == 0) {
                        MapController.drawSegmentPolyline(element, bDrawOnMap, bClearMap);
                    }
                    else {
                        MapController.drawSegmentPolyline(element, bDrawOnMap, false);
                    }


                    if (ext == null) {
                        ext = element.geometry.getExtent();
                    }
                    else {
                        ext.union(element.geometry.getExtent());
                    }
                });

                //center / zoom
                if (bZoomIn) {
                    map.setExtent(ext);
                }

            });

        });
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

        //make a new feature
        var pt = new esri.geometry.Point(address.xCoord, address.yCoord);
        var g = new esri.Graphic(pt, MapController.symAddress, address, this.infoAddress);

        //draw
        MapController.drawPoint(g, bDrawOnMap, bClearMap);

        map.infoWindow.setTitle(g.getTitle());
        map.infoWindow.setContent(g.getContent());

        map.infoWindow.show(pt);
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

    drawPoint: function (feature, bDrawOnMap, bClearMap) {
        if (bDrawOnMap) {

            if (bClearMap) {
                MapController.glAddressHighlight.clear();
            }

            feature.setSymbol(MapController.symAddress);
            MapController.glAddressHighlight.add(feature);
        }
    },

    drawSegmentPolyline: function (feature, bDrawOnMap, bClearMap) {
        if (bDrawOnMap) {

            if (bClearMap) {
                MapController.glPermitHighlight.clear();
            }

            MapController.glPermitHighlight.add(feature);
        }
    },

    //query functions

    handleStreetQueryError: function (err) {
        console.log(err);
    },

    //geometry serivce functions
    getPolylineIntersections: function(polylines, polyline, handler) {

        esri.config.defaults.geometryService.intersect(polylines, polyline, handler, function (error) {

            console.log(error);

        });

    }

};
