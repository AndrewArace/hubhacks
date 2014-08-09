//var gridStreets;
//var gridAddresses;
var SearchController = {

    init: function () {
        console.log("SearchController.init()");
        this.initUIActions();
    },

    initUIActions: function () {
        console.log("SearchController.initUIActions()");

        $("#btnSearch").button().click(function (event) {

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

        $("#imgLoadingSpinner").show();
        $.getJSON(url, function (data) {
            ListController.setResults(data);
            MapController.setResults(data);
            }
        ).always(function () {
            $("#imgLoadingSpinner").hide();
        });
    },


    searchSAM: function (searchString) {
        var url = searchService.replace("{0}", searchString);

        $("#txtSearch").prop("disabled", true);
        $("#btnSearch").prop("disabled", true);
        $("#imgLoadingSpinner").show();

        $.getJSON(url, function (data) {
            $("#tabMain").show("fold");

            var streetLength = 0;

            if (!data)
                return;

            ListController.setResults(data.addressResults);
            MapController.setResults(data.addressResults);

        }).always(function () {
            $("#txtSearch").prop("disabled", false);
            $("#btnSearch").prop("disabled", false);
            $("#imgLoadingSpinner").hide();
        });
    }
};
