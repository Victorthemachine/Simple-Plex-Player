/**
 * Currently unused, possible future implementation
 */
class RequestHandler {
  constructor() {
  }
}

function loadFromRequest(serverPath) {
    const serverRoot = localStorage.getItem("serverRoot");
    if(serverPath.indexOf('?') === -1) {
        var token = "?X-Plex-Token=" + localStorage.getItem("accessToken");
    } else {
        var token = "&X-Plex-Token=" + localStorage.getItem("accessToken");
    }

    var url = serverRoot + serverPath + token;
    const request = new XMLHttpRequest();
    
a    request.open("GET", url, true);
    request.setRequestHeader('X-Plex-Client-Identifier', 'AppleTV');
    request.setRequestHeader('X-Plex-Client-Device', 'AppleTV');
    request.setRequestHeader('X-Plex-Product', 'PlexPlayer');
    request.setRequestHeader('X-Plex-Version', '1');
    request.setRequestHeader("Accept", "application/json");

    request.responseType = "json";
    request.onload = return request.json;
    request.onerror = createAlert;
    request.send();
    
    function onSuccess() {
        return request.json;
    }
}
