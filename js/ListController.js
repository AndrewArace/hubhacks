var ListController = {

    init: function () {
        console.log("ListController.init()");
    },


    setResults: function (addresses) {
      alert("ListController: todo: set " + addresses.length + " results...");
        ListController.clear();
    },


    highlightAddress: function (addressObject) {
        //TODO: find the result with this addressId, and highlight it
    },


    clear: function () {
        //TODO: clear results grid
    }

}
