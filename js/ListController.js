var ListController = {

    init: function () {
        console.log("ListController.init()");
    },


    setResults: function (addresses) {
        ListController.clear();

        //  Display the table rows dynamically.

        var s = "";

        s += "<thead><tr><th>#</th><th>Address</th><th>Neighborhood</th><th>Zip Code</th><th>Parcel</th><tr></thead><tbody>";

        addresses.forEach(function(addressEntry){
                s += "<tr>";
                s += "<td>" + addressEntry.addressId + "</td>";
                s += "<td>" + addressEntry.fullAddress + "</td>";
                s += "<td>" + addressEntry.mailingNeighborhood + "</td>";
                s += "<td>" + addressEntry.zipCode + "</td>";
                s += "<td>" + addressEntry.spatialParcelPID + "</td>";
                s += "</tr>";
        });

        s += "</tbody>";

        d3.select(".table").html(s);

        d3.selectAll("tbody tr").data(addresses).on("mouseover", function(){
            d3.select(this).style("background-color", "green");
        }).on("mouseout", function(){
            d3.select(this).style("background-color", "white");
        }).on("click", function(d){
            highlightAddress(d);
        });
    },


    highlightAddress: function (addressObject) {
        //TODO: find the result with this addressId, and highlight it
    },


    clear: function () {
        //TODO: clear results grid
    }

}