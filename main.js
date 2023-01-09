//# sourceURL=main.js

//
//  DPlayer
//
//  Created by David Mitić on 26/04/2020.
//  Copyright © 2020 David Mitić. All rights reserved.
//

/*
 * This file provides an example skeletal stub for the server-side implementation 
 * of a TVML application.
 *
 * A javascript file such as this should be provided at the tvBootURL that is 
 * configured in the AppDelegate of the TVML application. Note that  the various 
 * javascript functions here are referenced by name in the AppDelegate. This skeletal 
 * implementation shows the basic entry points that you will want to handle 
 * application lifecycle events.
 */

/**
 * @description The onLaunch callback is invoked after the application JavaScript 
 * has been parsed into a JavaScript context. The handler is passed an object 
 * that contains options passed in for launch. These options are defined in the
 * swift or objective-c client code. Options can be used to communicate to
 * your JavaScript code that data and as well as state information, like if the 
 * the app is being launched in the background.
 *
 * The location attribute is automatically added to the object and represents 
 * the URL that was used to retrieve the application JavaScript.
 */
App.onLaunch = function(options) {
  evaluateScripts(options.initialJSDependencies, function(success){
    if (success) {
      var resourceLoader = new ResourceLoaderJS(NativeResourceLoader.create());
      var searchHandler = new SearchHandler(resourceLoader);
      var presenter = new Presenter(resourceLoader, searchHandler);
      var eventHandler = new EventHandler(presenter);
      localStorage.setItem("key", "");
                  //Wipe data to test login
    //===================UTIL=====================
        localStorage.removeItem("plex_user")
      localStorage.removeItem("plex_password")
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("serverRoot");
      localStorage.removeItem("clientID"); 
    //===================UTIL=====================
      setupMediaPathComponents();
      console.log("============INIT==============");
      console.log(localStorage.getItem("plex_user"));
      console.log(localStorage.getItem("plex_password"));
      console.log(localStorage.getItem("authToken"));
      console.log(localStorage.getItem("accessToken"));
      console.log(localStorage.getItem("serverRoot"));
      console.log(localStorage.getItem("clientID"));
      console.log("==============================");
      //If access token is present => user is signed in, otherwise push sign in form
      if(localStorage.getItem("accessToken") === undefined) {
        presenter.present("email.xml", null, "push", eventHandler);
      } else {
        presenter.present("xpHome.xml", "/library/sections/", "push", eventHandler);
      }
    } else {
      var alert = createAlert("Evaluate Scripts Error", "There was an error attempting to evaluate the external JavaScript files.");
      navigationDocument.presentModal(alert);
      throw ("Playback Example: unable to evaluate scripts.");
    }
  });
};

var createAlert = function(title, description) {
  var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <alertTemplate>
        <title>${title}</title>
        <description>${description}</description>
      </alertTemplate>
    </document>`

  var parser = new DOMParser();
  var alertDoc = parser.parseFromString(alertString, "application/xml");
  return alertDoc
};

/**
 * Setup clientID is needed for file request and playback
 */
function setupMediaPathComponents() {
    const myDeviceName = Device.vendorIdentifier.substring(0, Device.vendorIdentifier.indexOf('-'));
    const myDeviceModel = encodeURIComponent(Device.model);
    var temp ="X-Plex-Device=" + myDeviceModel + "&amp;X-Plex-Device-Name=" + myDeviceName + "&amp;X-Plex-Platform=tvOS&amp;X-Plex-Client-Identifier=AppleTV&amp;X-Plex-Product=PlexPlayer&amp;X-Plex-Version=1&amp;";
    localStorage.setItem("clientID", temp);
}

function pushLoadingTemplate() {
    var template = '<document><loadingTemplate><activityIndicator><text>Loading</text></activityIndicator></loadingTemplate></document>';
    var templateParser = new DOMParser();
    var parsedTemplate = templateParser.parseFromString(template, "application/xml");
    navigationDocument.pushDocument(parsedTemplate);
}

function pushPage(document) {
    var currentDoc = getActiveDocument();
    if (currentDoc.getElementsByTagName("loadingTemplate").item(0) == null) {
        navigationDocument.pushDocument(document);
    } else {
        navigationDocument.replaceDocument(document, currentDoc);
    }
}

function shuffleArray(array) {
    var counter = array.length;
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);
        counter--;
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

/**
 * Handles audio media playback, requiers JSON string, optional value shuffle will randomize items
 */
function playAudio(data, shuffle) {
    var player = new Player();
    if(typeof data == "object") {
        //to ensure that all data are correctly formated
        data = JSON.stringify(data);
    }
    var validJSON = data.replace ("},]", "}]"); //Make a valid JSON by removing trailing comma
    var jsonString = JSON.parse(validJSON);
    
    player.playlist = new Playlist();
    let counter = 0;
    
    if (shuffle) {
      var arr = [];
      jsonString.forEach(element => {
        var song = new MediaItem('audio', element.mediaURL);
        song.title = element.title;
        song.subtitle = element.subtitle;
        song.description = element.description;
        song.artworkImageURL = element.img;
                           
        arr.push(song);
        counter++;
      })
      arr = shuffleArray(arr);
      arr.forEach(item => { player.playlist.push(item) }) ;
    }
    else {
        jsonString.forEach(element => {
          var song = new MediaItem('audio', element.mediaURL);
          song.title = element.title;
          song.subtitle = element.subtitle;
          song.description = element.description;
          song.artworkImageURL = element.img;
                                       
          player.playlist.push(song);
         
          counter++;
        })
    }
    player.play();
  
}
/**
 * Handles playback of video files, requires JSON string or object
 */
function playVideo(data) {

    var player = new Player();
    var validJSON = data.replace ("},]", "}]"); //Make a valid JSON by removing trailing comma
    var jsonString = JSON.parse(validJSON);
    
    player.playlist = new Playlist();
    let counter = 0;
    
    jsonString.forEach(element => {
        var encodedURL = localStorage.getItem("serverRoot") + element.mediaURL + "?" + localStorage.getItem("clientID") + "X-Plex-Token=" + localStorage.getItem("accessToken");
        //due to some issue with apple player and plex playback, url has to be partially decoded
        var find = "&amp;";
        var re = new RegExp(find, 'g');
        var fullURL = encodedURL.replace(re, '&');

        var video = new MediaItem('video', fullURL);
        video.title = element.title;
        video.subtitle = element.subtitle;
        video.description = element.description;
        video.artworkImageURL = element.img;

        player.playlist.push(video);

        counter++;
    })

    player.play();
}
