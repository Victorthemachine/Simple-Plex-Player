/*
 * Manages user input
 * Determine right action for the created event and manipulate input data if necessary
 */
class EventHandler {
  constructor(presenter) {
    this._presenter = presenter;
    this.handleEvent = this.handleEvent.bind(this);
  }

  addEventHandlersToDoc(doc) {
    doc.addEventListener("select", this.handleEvent);
  }

//MARK: HANDLE EVENTS
  /**
   * When action happens in application, this method handles it.
   * Mainly it determines how to relay attributes for further action, in some cases data manipulation is needed.
   */
  handleEvent(event) {
    var element = event.target;
    //initialize all attributes
    var template = element.getAttribute("template");
    var presentation = element.getAttribute("presentation");
    var data = element.getAttribute("data");
    var action = element.getAttribute("action");
    var key = element.getAttribute("key");
    var type = element.getAttribute("type");
    var artistKey = element.getAttribute("artistKey");
    var docID = element.getAttribute("docID"); //Identifier for which actions should be taken with the document

    if(artistKey != "") {
      localStorage.setItem("artistKey", artistKey);
    }
    
    switch(docID) {
        case '0':
          return;
        break;
        case '4':
          localStorage.setItem("searchKey", data);
          break;
        case '5':
          var temporary = data.replace(data.substring(26,29), localStorage.getItem("artistKey"));
          var fullURL = localStorage.getItem("serverRoot") + "/library/sections/" + localStorage.getItem("key") + temporary + "&X-Plex-Token=" + localStorage.getItem("accessToken");

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
            var JSONObj = request.response;
            var array = [];
            JSONObj.MediaContainer.Metadata.forEach(el => {
            var obj = new Object();
            var temp = encodeURI(localStorage.getItem("serverRoot") + el.Media[0].Part[0].key + "?" + localStorage.getItem("clientID") + "X-Plex-Token=" + localStorage.getItem("accessToken"));
            //due to some issue with apple player and plex playback, url has to be partially decoded
            var find = "&amp;";
            var re = new RegExp(find, 'g');
            obj["mediaURL"] = temp.replace(re, '&');
            obj["title"] = el.title;
            obj["subtitle"] = el.parentTitle;
            obj["img"] =  localStorage.getItem("serverRoot") + "/photo/:/transcode?height=308&width=308&url=" + el.thumb + "&X-Plex-Token=" + localStorage.getItem("accessToken");
            array.push(obj);
            })
            data = JSON.stringify(array);
          }
          break;
        case '7':
            //handles attributes for search results, this has to be done so that we can reuse same searchResults template
            switch(type) {
                case 'album':
                    template = "xpudTracks.xml";
                    presentation = "push";
                break;
                case'artist':
                    template = "xpuOneArtist.xml";
                    presentation = "push";
                break;
                case 'track':
                    var fullURL = localStorage.getItem("serverRoot") + data + "?X-Plex-Token=" + localStorage.getItem("accessToken");
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
                    function onSuccess() {
                        var parse = request.response;
                        var obj = new Object();
                        //due to some issue with apple player and plex playback, url has to be partially decoded
                        var find = "&amp;";
                        var re = new RegExp(find, 'g');
                        var fixPath = encodeURI(localStorage.getItem("serverRoot") + parse.MediaContainer.Metadata[0].Media[0].Part[0].key + "?" + localStorage.getItem("clientID") + "X-Plex-Token=" + localStorage.getItem("accessToken"));
                        obj["mediaURL"] = fixPath.replace(re, '&');
                        obj["img"] = localStorage.getItem("serverRoot") + "/photo/:/transcode?height=308&width=308&url=" + parse.MediaContainer.Metadata[0].thumb + "&X-Plex-Token=" + localStorage.getItem("accessToken");
                        obj["title"] = parse.MediaContainer.Metadata[0].title;
                        obj["subtitle"] = parse.MediaContainer.Metadata[0].parentTitle;
                        obj["description"] = parse.MediaContainer.Metadata[0].summary;
                        var arr = [];
                        arr.push(obj);
                        data = arr;
                    }
                    docID = "0"
                    template = "letMePass";
                    presentation = "playAudio"
                break;
            }
    }
      
    if(key != "") {
      localStorage.setItem("key", key);
    }

    if(action === "getText") {
      var currentDoc = getActiveDocument();
      var textFields = currentDoc.getElementsByTagName("textField");

      for (var i = 0; i < textFields.length; ++i) {
        var textField = textFields.item(i);
      }

      var keyboard = textField.getFeature("Keyboard");

      if(template === "password.xml") {
          localStorage.setItem("plex_user", keyboard.text);
          data = new Object();
          data["plexUser"] = localStorage.getItem("plex_user");
      }

      if (template === "loginTransition.xml") {
        localStorage.setItem("plex_password", keyboard.text);
        getToken();
        var obj = new Object();
        if(localStorage.getItem("accessToken") === undefined) {
          obj["title"] = "Sorry login failed";
          obj["description"] = "Your username or password were incorrect, please try again";
          obj["buttonTitle"] = "OK";
          obj["template"] = "";
          obj["presentation"] = "dismiss";
          obj["dataToRelay"] = "";
        } else {
          obj["title"] = "Login succesfull!";
          obj["description"] = "Welcome " + localStorage.getItem("username");
          obj["avatar"] = localStorage.getItem("avatar");
          obj["buttonTitle"] = "Proceed";
          obj["template"] = "xpHome.xml";
          obj["presentation"] = "logPush";
          obj["dataToRelay"] = "/library/sections";
        }
        data = obj;
      }
    }

    if(template.indexOf('u') === 2) {
        switch(template) {
            case 'xpuMain.xml':
                var path = "/hubs/";
                break;
            case 'xpuGrid.xml':
                data = localStorage.getItem("key");
                var path = "/library/sections/" + data + "/albums/";
                break;
            case 'xpuOneArtist.xml':
                var path = data ;
                localStorage.setItem("temp", path);
                break;
            case 'xpuArtists.xml':
                data = localStorage.getItem("key");
                var path = "/library/sections/" + data + "/all/";
                break;
            case 'xpuGridRecent.xml':
                data = localStorage.getItem("key");
                var path = "/library/sections/" + data + "/recentlyAdded/";
                break;
            case 'xpuMenuBar.xml':
                var path = "/library/sections/" + key + "/";
                if ((type) && type!="artist") {
                  template="xpuVideoGrid.xml" ;
                  path = path + "all/"
                }
                break;
            case 'xpudTracks.xml':
                var path = data;
                break;
        }
        this._presenter.present(template, path, presentation, this, element);
    } else {
        this._presenter.present(template, data, presentation, this, element);
    }
}
}

//MARK: TOKENS
/**
 * Use user credentials to attempt to get authentication token.
 * If succesfull, it gets saved in local storage.
 */
var getToken = function() {
  const username = localStorage.getItem("plex_user");
  const password = localStorage.getItem("plex_password");

  const url = 'https://plex.tv/users/sign_in.json';
  const request = new XMLHttpRequest();

  request.open('POST', url, false);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  request.setRequestHeader('X-Plex-Client-Identifier', 'AppleTV');
  request.setRequestHeader('X-Plex-Client-Device', 'AppleTV');
  request.setRequestHeader('X-Plex-Product', 'PlexPlayer');
  request.setRequestHeader('X-Plex-Version', '1');
  request.onreadystatechange = () => {
    if(request.readyState === 4 && request.status === 201) {
      const data = JSON.parse(request.responseText);
      const authToken = data.user.authToken;
      if (authToken) {
        localStorage.setItem("avatar", data.user.thumb)
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("authToken", authToken);
        getAccessToken();
      }
    }
  };
  request.send('user[login]=' + username + '&user[password]='+ password);
}

/**
 * Gets called upon succesfully obtaining authentication token.
 * Gets access token required to access files and navigate directories on the server.
 */
var getAccessToken = function() {
    
    const token = localStorage.getItem("authToken");
    const url = 'https://plex.tv/pms/resources/?X-Plex-Token=' + token + '&includeHttps=1';
    const request = new XMLHttpRequest();

    request.open('GET', url, false);
    request.setRequestHeader('X-Plex-Client-Identifier', 'AppleTV');
    request.setRequestHeader('X-Plex-Client-Device', 'AppleTV');
    request.setRequestHeader('X-Plex-Product', 'PlexPlayer');
    request.setRequestHeader('X-Plex-Version', '1');

    request.onreadystatechange = () => {
      if(request.status === 0 || (request.status < 400 && request.status >= 200)) {
        var x, i, xmlDoc, txt, serverRootNormal;
        xmlDoc = request.responseXML;
        txt = "";
        serverRootNormal = "";
          serverRootRemote = "";
        x = xmlDoc.getElementsByTagName('Device');
        for (i = 0; i < 1; i++) {
           txt += x.item(i).getAttribute('accessToken');
          serverRootNormal += x.item(i).getAttribute('');
        }
        x = xmlDoc.getElementsByTagName('Connection');
        var haveAdress = false;
        var haveOtherAdress = false;
        for (i = 0; i < x.length; i++) {
          var check = "";
          check += x.item(i).getAttribute("uri");
            console.log(check);
          if(check.includes("direct:32400") === true && haveAdress === false) {
            haveAdress = true;
            serverRootNormal += check;
              console.log(serverRootNormal);
          }
          if(check.includes("direct:34443") === true && haveOtherAdress === false) {
            haveOtherAdress = true;
            serverRootRemote += check;
            console.log(serverRootRemote);
          }
        }
      }
      var otherURI = serverRootRemote;
      var accessToken = txt;
      var uri = serverRootRemote;
      if (accessToken) {
          localStorage.setItem("serverRoot", serverRootRemote);
        localStorage.setItem("accessToken", accessToken);
      }
    };
    request.send('');
}

//MARK: UTIL
var createAlert = function(title, description) {
  var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <alertTemplate>
        <title>${title}</title>
        <description>${description}</description>
        <button presentation="dismiss">
          <text>Dismiss</text>
        </button>
      </alertTemplate>
    </document>`

  var parser = new DOMParser();
  var alertDoc = parser.parseFromString(alertString, "application/xml");
  return alertDoc
};
