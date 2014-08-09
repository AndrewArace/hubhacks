var ListController = {

    init: function () {
        console.log("ListController.init()");
    },

    setResults: function (addresses) {
        ListController.clear();

        //  Display the table rows dynamically.

        var s = "";

        s += "<thead><tr><th>#</th><th>Address</th><th>Neighborhood</th><th>Zip Code</th><th>Parcel</th><tr></thead><tbody>";

        addresses.forEach(function (addressEntry) {
            s += "<tr>";
            s += "<td>" + addressEntry.addressId + "</td>";
            s += "<td>" + addressEntry.fullAddress + "</td>";
            s += "<td>" + addressEntry.mailingNeighborhood + "</td>";
            s += "<td>" + addressEntry.zipCode + "</td>";
            s += "<td>" + addressEntry.spatialParcelPID + "</td>";
            s += "</tr>";
        });

        s += "</tbody>";

        d3.select(".result-table").html(s);

        d3.selectAll("tbody tr").data(addresses).on("mouseover", function () {
            d3.select(this).style("background-color", "green").style("cursor", "pointer");
        }).on("mouseout", function () {
            d3.select(this).style("background-color", "white");
        }).on("click", function (d) {
            // Update data
            ListController.highlightAddress(d);
            MapController.highlightAddress(d);
            d3.select(".confirmation-address-id").html("<p>" + d.addressId + "</p>");
            d3.select(".confirmation-full-address").html("<p>" + d.fullAddress + "</p>");
            d3.select(".confirmation-mailing-neighborhood").html("<p>" + d.mailingNeighborhood + "</p>");
            d3.select(".confirmation-zip-code").html("<p>" + d.zipCode + "</p>");
            d3.select(".confirmation-spatial-parcel-pid").html("<p>" + d.spatialParcelPID + "</p>");
        });
    },


    highlightAddress: function (addressObject) {
        console.log("Highlight address!");
    },

    clear: function () {
        //TODO: clear results grid
    }

}
