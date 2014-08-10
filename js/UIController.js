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

        $("#txtSearch").on('keypress', function (event) {
            if (event.which == '13') {
                $("#btnSearch").click();
            }
        });

        //handle window resizing
        $(window).on('resize', function (event) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                map.resize();
            }, 500);
        });
    },

    setLoading : function (isLoading) {
        if (isLoading) {
            map.setMapCursor("wait");
            $("#imgLoadingSpinner").show();
        }
        else {
            map.setMapCursor("default");
            $("#imgLoadingSpinner").hide();
        }
    }
};
