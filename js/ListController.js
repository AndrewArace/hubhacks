var ListController = {

    init: function () {
        console.log("ListController.init()");
    },

    setResults: function (addresses) {
        ListController.clear();

        //  Display the table rows dynamically.

        var s = "";

        addresses.forEach(function (addressEntry) {
            s += "<li class='address-items'><strong>";
            s += "<span class='glyphicon glyphicon-map-marker'></span>" 
            s += addressEntry.fullAddress + ", ";
            s += addressEntry.mailingNeighborhood + ", Boston ";
            s += addressEntry.zipCode;
            s += "</strong></li><hr/>";
        });

        d3.select(".result-table").html(s);

        d3.selectAll("ul li").data(addresses).on("mouseover", function () {
            d3.select(this).style("background-color", "rgba(200, 200, 200, 0.5)").style("cursor", "pointer");
        }).on("mouseout", function () {
            d3.select(this).style("background-color", "white");
        }).on("click", function (d) {
            // Update data
            ListController.highlightAddress(d);
            MapController.highlightAddress(d);
            d3.select(".confirmation-full-address").html("<p>" + d.fullAddress + "</p>");
            d3.select(".confirmation-mailing-neighborhood").html("<p>" + d.mailingNeighborhood + "</p>");
            d3.select(".confirmation-zip-code").html("<p>" + d.zipCode + "</p>");
            d3.select(".confirmation-spatial-parcel-pid").html("<p>" + d.spatialParcelPID + "</p>");
        });
    },


    highlightAddress: function (addressObject) {
        
    },

    clear: function () {
        //TODO: clear results grid
    }

}
