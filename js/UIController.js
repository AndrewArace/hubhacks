var resizeTimer;
var gridMultiplePermits;
var UIController = {

    init: function () {
        console.log("UIController.init()");

        this.initUIActions();
    },

    //row click functions
    rowHighlight: function (curRow, curGrid) {
        if ($(curRow).hasClass('row_selected')) {
            $(curRow).removeClass('row_selected');
        }
        else {
            curGrid.$('tr.row_selected').removeClass('row_selected');
            $(curRow).addClass('row_selected');
        }
    },

    initUIActions: function () {
        console.log("UIController.initUIActions()");

        $("#imgLoadingSpinner").hide();

        //address header link handler
        $("#lblHeaderAddressInfo").click(function (event) {
            if (currentlySelectedPermit != null) {
                var addid = currentlySelectedPermit.PropertyAddress.Id;

                var url = addressService.replace("{0}", addid);
                $.getJSON(url, function (data) {
                    if (data == null) {
                        return;
                    }

                    MapController.zoomAndCenterToAddress(data, true, true, true);
                });
            }
        });

        $("#tabMain").tabs().hide();

        $("#txtSearch").on('keypress', function (event) {
            if (event.which == '13') {
                $("#btnSearch").click();
            }
        });

        //handle window resizing
        $(window).on('resize', function (event) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                console.log("window resize");
                map.resize();
                $("#dlgSearch").dialog("option", "position", { my: "left top", at: "right bottom", of: "#headerDiv" });
            }, 500);
        });

        $("#dlgSearch").dialog({
            width: 800
                , dialogClass: "NoCloseButton"
                , autoOpen: false
                , draggable: false
                , height: 400
                , collapsable: true
                , resizable: false
                , position: { my: "left top", at: "right bottom", of: "#headerDiv" }
        });

    },

    updateAddressHeaderInfo: function (fullAddress, addressId) {
        $("#lblHeaderAddressInfo").text(fullAddress);

        if (currentlySelectedPermit != null) {
            currentlySelectedPermit.PropertyAddress.Id = addressId;
        }
    }
};
