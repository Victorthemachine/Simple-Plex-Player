/**
 * Load and render documents
 */
class ResourceLoaderJS {
  constructor(nativeResourceLoader) {
    this.nativeResourceLoader = nativeResourceLoader;
    this.domParser = new DOMParser();
  }

  getDocument(name, data) {
    //if file begins with an 'x' then proceed to request
    if (name.indexOf('x') === 0) {
      const serverRoot = localStorage.getItem("serverRoot");
      const accessToken = localStorage.getItem("accessToken");
      if(data.indexOf('?') === -1) {
        var token = "?" + "X-Plex-Token=" + accessToken;
      } else {
        var token = "&" + "X-Plex-Token=" + accessToken;
      }
      var fullURL = serverRoot + data + token;

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

      /**
       * A function that is set as the XMLHTTPRequest's onload callback to replace
       * the loading template with the document that has been loaded.
       */
      function onSuccess() {
        data = request.response;
      }

      /**
       * Defines correct URL from paths and adjusts them in JSON
       */
      if (name.indexOf('p') === 1) {
        switch(name) {
            case 'xpuMain.xml' :
                var justKey = localStorage.getItem("key");
                var path = serverRoot + "/library/sections/" + justKey + "/recentlyAdded?X-Plex-Token=" + localStorage.getItem("accessToken");
                const partialRequest = new XMLHttpRequest();
                partialRequest.open("GET", path, false);
                partialRequest.setRequestHeader("X-Plex-Product", "ATV");
                partialRequest.setRequestHeader("X-Plex-Client-Identifier", "test");
                partialRequest.setRequestHeader("X-Plex-Version", "1");
                partialRequest.setRequestHeader("Accept", "application/json");
                partialRequest.responseType = "json";
                partialRequest.onload = onSuccess;
                partialRequest.send();

                /*
                * A function that is set as the XMLHTTPRequest's onload callback to replace
                * the loading template with the document that has been loaded.
                */
                function onSuccess() {
                    var recentJSON = partialRequest.response;
                    recentJSON.MediaContainer.Metadata.forEach(el => {
                        var temp = el.thumb;
                        el.thumb = serverRoot + "/photo/:/transcode?height=308&amp;width=308&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");
                    });
                    var sectionName = recentJSON.MediaContainer.Metadata[0].librarySectionTitle;
                    recentJSON["librarySectionTitle"] = sectionName;
                    data["Albums"] = recentJSON.MediaContainer;
                }
                data.MediaContainer.Hub.forEach(el => {
                    if(el.type === "clip") {
                        el.Metadata.forEach(elem =>{
                          var temp = elem.thumb;
                          elem.thumb = serverRoot + "/photo/:/transcode?height=308&amp;width=308&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");
                        });
                        data["Videos"] = el;
                    }
                })
                break;
          case 'xpuArtists.xml' :
                data.MediaContainer.Metadata.forEach(el =>{
                     var temp = el.thumb;
                     el.thumb = serverRoot + "/photo/:/transcode?height=308&amp;width=308&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");;
                });
                break;
          case 'xpuVideoGrid.xml' :
               data.MediaContainer.Metadata.forEach(el =>{
                 var temp = el.thumb;
                 el.thumb = serverRoot + "/photo/:/transcode?height=308&amp;width=308&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");;
               });
               break;
          case 'xpuOneArtist.xml' :
                data["fullURL"] = localStorage.getItem("temp");
                data.MediaContainer.Metadata.forEach(el =>{
                  var temp = el.thumb;
                  el.thumb = serverRoot + "/photo/:/transcode?height=500&amp;width=500&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");
                });
                data.MediaContainer.thumb = serverRoot + "/photo/:/transcode?height=500&amp;width=500&amp;url=" + data.MediaContainer.thumb + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");
                break;
          case 'xpuGrid.xml' :
                data.MediaContainer.Metadata.forEach(el =>{
                  var temp = el.thumb;
                  el.thumb = serverRoot + "/photo/:/transcode?height=500&amp;width=500&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");;
                });
                break;
          case 'xpuGridRecent.xml' :
                data.MediaContainer.Metadata.forEach(el =>{
                  var temp = el.thumb;
                  el.thumb = serverRoot + "/photo/:/transcode?height=308&amp;width=308&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");;
                });
                break;
          case 'xpudTracks.xml' :
                localStorage.setItem("jsonString", JSON.stringify(data));
                data.MediaContainer.Metadata.forEach(el =>{
                     var thumb = el.thumb;
                     el.thumb = serverRoot + thumb + token;
                    var temp = el.Media[0].Part[0].key;
                  el.Media[0].Part[0].key = encodeURI(localStorage.getItem("serverRoot") + temp + "?" + localStorage.getItem("clientID") + "X-Plex-Token=" + localStorage.getItem("accessToken"));
                 });
                 var thumbOther = data.MediaContainer.thumb;
                 data.MediaContainer.thumb = serverRoot + thumbOther + token;
                 var adjustKey = localStorage.getItem("serverRoot") + data.MediaContainer.Metadata[0].parentKey + "/children?" + "X-Plex-Token=" + localStorage.getItem("accessToken");
                 data.MediaContainer.parentTitle = adjustKey;
                 break;
        }
      }

      /**
       * Formats duration correctly
       */
      if (name.indexOf('d') === 3) {
        data.MediaContainer.Metadata.forEach(el =>{
          var temp = el.duration;
          el.duration = (temp/1000).toFixed(0);
          /**
           https://stackoverflow.com/a/38598724
           sectrostr from Dillon
           */
          function sectostr(time) {
             return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
          }
          el.duration = sectostr(el.duration);
        });
      }
    }
    //Prepare document and render it with JSON
    data = data || {};
     if(name === "searchResults.xml") {
     if(data != localStorage.getItem("searchKey")) {
       data.MediaContainer.Metadata.forEach(el =>{
         var temp = el.thumb;
         el.thumb = localStorage.getItem("serverRoot") + "/photo/:/transcode?height=308&amp;width=308&amp;url=" + temp + "&amp;X-Plex-Token=" + localStorage.getItem("accessToken");
       });
      }
     }
    //parsing via mustache
    var docString = this.nativeResourceLoader.loadBundleResource(name);
    var rendered = Mustache.render(docString, data);
    return this.domParser.parseFromString(rendered, "application/xml");
  }
}
