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

            //temp testing
            var obj = {"segmentId":1,"segmentFrom":1.0,"segmentTo":2.0,"permitId":"73f892da-ee9c-4c1a-8aa2-25cc7ad018de"}
            $.ajax({
                type: "POST",
                url: "/api/samsegment",
                data: obj,
                dataType: "json",
                traditional: true
            });

            gridStreets.fnClearTable();
            gridAddresses.fnClearTable();

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

    searchSAM: function (searchString) {
        var url = searchService.replace("{0}", searchString);

        $("#txtSearch").prop("disabled", true);
        $("#btnSearch").prop("disabled", true);
        $("#imgLoadingSpinner").show();

        $.getJSON(url, function (data) {
            $("#tabMain").show("fold");

            var streetLength = 0;
            var addressLength = 0;

            if (!data)
                return;

            if (data.streetResults != null) {
                gridStreets.fnAddData(data.streetResults, true);
                streetLength = data.streetResults.length;
            }

            var strString = "Streets ({0})".replace("{0}", streetLength);
            $("#txtStreetTabTitle").text(strString);

            if (data.addressResults != null) {
                gridAddresses.fnAddData(data.addressResults, true);
                addressLength = data.addressResults.length;
            }

            var addrString = "Addresses ({0})".replace("{0}", addressLength);
            $("#txtAddressTabTitle").text(addrString);

            //have to re add the click events every time the search results are repopulated.
            $("#dgAddresses tbody tr").click(function (event) {
                UIController.rowHighlight($(this), gridAddresses);

                var selectedItem = gridAddresses.fnGetData(this);
                if (selectedItem != null) {
                    MapController.zoomAndCenterToAddress(selectedItem, true, true, true);
                }
            });

            $("#dgStreets tbody tr").click(function (event) {
                UIController.rowHighlight($(this), gridStreets);

                var selectedItem = gridStreets.fnGetData(this);
                if (selectedItem != null) {
                    MapController.zoomAndCenterToStreet(selectedItem, true, true, true);
                }
            });

        }).always(function () {
            $("#txtSearch").prop("disabled", false);
            $("#btnSearch").prop("disabled", false);
            $("#imgLoadingSpinner").hide();
        });
    }
};
