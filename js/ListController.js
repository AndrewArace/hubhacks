﻿var ListController = {

    init: function () {
        console.log("ListController.init()");
    },

    setResults: function (addresses, strLabel) {
        //  Display the table rows dynamically.

        var s = "";
        var count = 0;

        if(addresses === null)
        {
            s += "<ul class='result-table' id='no-result'>";
            s += "<li><h5 id='list-results'>No Results</h5>";
            s += "</li><hr/>";
            s += "</ul>";
        }
        else
        {
            if(addresses.length > 8)
            {
                s += "<ul class='result-table'>";
                s += "<li><h5 id='list-results'>" + addresses.length + strLabel + "<span id='clear-results'>Clear</span>" + "</h5>";
                s += "</li><hr/>";
            }
            else
            {
                s += "<ul class='result-table' id='no-result'>";
                s += "<li><h5 id='list-results'>" + addresses.length + strLabel + "<span id='clear-results'>Clear</span>" + "</h5>";
                s += "</li><hr/>";
            }

            addresses.forEach(function (addressEntry) {
                s += "<li class='address-items'><strong>";
                s += "<span class='glyphicon glyphicon-map-marker'></span>" 
                s += addressEntry.fullAddress + ", ";
                if(addressEntry.mailingNeighborhood === null) 
                { 
                    s += "Boston" + " "; 
                } 
                else 
                { 
                    s += addressEntry.mailingNeighborhood + " "; 
                }
                s += addressEntry.zipCode;
                s += "</strong></li><hr/>";
            });

            s += "</ul>";
        } 

        d3.select(".result-content").html(s);

        d3.select("#clear-results").on("mouseover", function () {
                d3.select(this).style("cursor", "pointer");
            }).on("click", function(){
            ListController.clear();
        });

        if(addresses !== null)
        {
            d3.selectAll("ul li.address-items").data(addresses).on("mouseover", function () {
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
                d3.select(".confirmation-sam-id").html("<p>" + d.addressId + "</p>");
            });
        }
    },


    highlightAddress: function (d) {
        d3.select(".confirmation-full-address").html("<p>" + d.fullAddress + "</p>");
        d3.select(".confirmation-mailing-neighborhood").html("<p>" + d.mailingNeighborhood + "</p>");
        d3.select(".confirmation-zip-code").html("<p>" + d.zipCode + "</p>");
        d3.select(".confirmation-spatial-parcel-pid").html("<p>" + d.spatialParcelPID + "</p>");
        d3.select(".confirmation-sam-id").html("<p>" + d.addressId + "</p>");
    },

    clear: function () {
        //TODO: clear results grid
        d3.select("ul.result-table").remove();
        MapController.clearMap();
    }

}
