/*
 * Presents documents to user
 */
class Presenter {

  constructor(resourceLoader, searchHandler) {
    this._resourceLoader = resourceLoader;
    this._searchHandler = searchHandler;
  }

  present(template, data, presentation, eventHandler, sender) {

    if (presentation === 'dismiss') {
      navigationDocument.dismissModal();
      return;
    }
    
    if (presentation === 'playShuffledAudio') {
      playAudio(data, "1");
      return;
    }
    if (presentation === 'playAudio') {
      playAudio(data);
      return;
    }
    if (presentation === 'playVideo') {
      playVideo(data);
      return;
    }

    var doc = this._resourceLoader.getDocument(template, data);
    if(template === "searchResults.xml") {
      this._searchHandler.registerDocForSearch(doc);
    }

    if(eventHandler) {
      eventHandler.addEventHandlersToDoc(doc);
    }

    switch (presentation) {
      case 'modal':
          navigationDocument.presentModal(doc);
        break;
      case 'push':
          pushLoadingTemplate();
          pushPage(doc);
        break;
      case 'logPush':
          if(template === "xpHome.xml") {
            navigationDocument.clear();
          }
          pushPage(doc);
          if(template === "xpHome.xml") {
              navigationDocument.dismissModal();
          }
        break;
      case 'menuBar':
          this._presentMenuBarItem(doc, sender);
        break;
    }
  }

  _presentMenuBarItem(doc, menuItem) {
    var feature = menuItem.parentNode.getFeature("MenuBarDocument");
    if (feature) {
      var currentDoc = feature.getDocument(menuItem);
      if (!currentDoc) {
        feature.setDocument(doc, menuItem);
      }
    }
  }
}
