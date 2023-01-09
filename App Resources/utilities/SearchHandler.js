/*
 * MARK: Handles search
 */
class SearchHandler {

  constructor(resourceLoader) {
    this._resourceLoader = resourceLoader;
    this._addSearchHandlerToDoc =
      this._addSearchHandlerToDoc.bind(this);
  }

  registerDocForSearch(doc) {
    this._addSearchHandlerToDoc(doc);
  }

    /**
     * Setup listener when there is new user input
     */
  _addSearchHandlerToDoc(doc) {
    var searchFields = doc.getElementsByTagName('searchField');
    for (var i = 0; i < searchFields.length; ++i) {
      var searchField = searchFields.item(i);
      var keyboard = searchField.getFeature("Keyboard");
      keyboard.onTextChange =
        this._handleSearch.bind(this, keyboard, doc);
    }
  }
    
  /**
   * Gets called by listner, requests search and presents results
   */
  _handleSearch(keyboard, doc) {
    var searchString = keyboard.text;
    var results;
    if (searchString.length) {
      if(searchString === "") {
         searchString = "{0}"; //default value for no arguments upon launch of search
      };
      var fullURL = localStorage.getItem("serverRoot") + "/library/sections/" + localStorage.getItem("key") + "/" + localStorage.getItem("searchKey") + "&query=" + searchString + "&X-Plex-Token=" + localStorage.getItem("accessToken");
      // Setup an XMLHttpRequest to load the document from the given URL.
      const request = new XMLHttpRequest();
      request.open("GET", fullURL, false);
      request.setRequestHeader("X-Plex-Product", "ATV");
      request.setRequestHeader("X-Plex-Client-Identifier", "test");
      request.setRequestHeader("X-Plex-Version", "1");
      request.setRequestHeader("Accept", "application/json");
      request.responseType = "json";
      request.onload = onSuccess;
      request.send();
        
      /*
       * A function that is set as the XMLHTTPRequest's onload callback to replace
       * the loading template with the document that has been loaded.
       */
      function onSuccess() {
        results = request.response;
      }
    }
    var resultNodes = this._renderResults(results); //rendered doc
    var currentDoc = getActiveDocument(); //old document pushed to screen to be updated
    var searchResults = currentDoc.getElementById("results"); //section to be updated in old doc
    var searchFields = currentDoc.getElementsByTagName('searchField');
    for (var i = 0; i < searchFields.length; ++i) {
      var searchField = searchFields.item(i);
    }
    //make sure that we have the search document
    if (!searchField) {
      var elem = currentDoc.getElementsById("results");
      var feature = elem.parentNode.getFeature("MenuBarDocument");
      currentDoc = feature.getDocument(elem);  // todo: check for feature existing?
      searchField = currentDoc.getElementsByTagName("searchField");
      searchResults = currentDoc.getElementsById("results");
    }
    var newResults = resultNodes.getElementById("results"); //section from new doc with updated data
    if (newResults && newResults.childElementCount>0) {
      searchResults.innerHTML = newResults.innerHTML;
    } else {
      while (searchResults.firstChild) {
        searchResults.removeChild(searchResults.firstChild);
      }
    }
  }
    
  /**
   * Prepares rendered document
   */
  _renderResults(results, doc) {
    var resourceLoader = this._resourceLoader;
    var rendered = resourceLoader.getDocument("searchResults.xml", results);
    
    return rendered;
  }

}
