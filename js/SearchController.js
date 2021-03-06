﻿//var gridStreets;
//var gridAddresses;
var SearchController = {

    init: function () {
        console.log("SearchController.init()");
        this.initUIActions();
    },

    initUIActions: function () {
        console.log("SearchController.initUIActions()");

        $("#btnSearch").button().click(function (event) {

            MapController.clearMap();
            var searchString = $("#txtSearch").val();

            if (searchString == "" || searchString == null) {
                //no empty searches please
                return;
            }

            if (Math.floor(searchString) == searchString && $.isNumeric(searchString)) {
                //no int only searching please.
                return;
            }

            SearchController.searchSAM(searchString);
        });
    },


    searchSAMBuilding: function (buildingId) {
        var url = searchServiceBuilding.replace("{0}", buildingId);

        UIController.setLoading(true);
        $.getJSON(url, function (data) {
                if (data && data.length == 1) {
                    ListController.setResults(data, " address in building");
                }
                else {
                    ListController.setResults(data, " addresses in building");
                }
                MapController.setResults(data);
            }
        ).always(function () {
            UIController.setLoading(false);
        });
    },


    searchSAM: function (searchString) {
        var url = searchService.replace("{0}", searchString);

        UIController.setLoading(true);

        $.getJSON(url, function (data) {
            $("#tabMain").show("fold");

            if (data && data.length == 1) {
                ListController.setResults(data.addressResults, " address found");
            }
            else {
                ListController.setResults(data.addressResults, " addresses found");
            } 
            MapController.setResults(data.addressResults);

        }).always(function () {
            UIController.setLoading(false);
            $("#txtSearch").focus();
        });
    }
};
