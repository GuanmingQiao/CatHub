// Need to include jquery-3.1.0.min.js
// Change the buttonname, inputquery, imagediv, loadingquery to use


var apikey = 'dc6zaTOxFJmzC';

$(document).ready(function() {
  
  /* 
  * The following two functions are used for making the API call using
  * pure Javascript. I wouldn't worry about the details
  */

  function encodeQueryData(data)
  {
     var ret = [];
     for (var d in data)
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
     return ret.join("&");
  }

  function httpGetAsync(theUrl, callback)
  {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              callback(xmlHttp.responseText);
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous 
      xmlHttp.send(null);
  }

  /*
  * The following functions are what do the work for retrieving and displaying gifs
  * that we search for.
  */

  function getGif(query) {
    console.log(query);
    query = query.replace(' ', '+');
    var params = { 'api_key': apikey, 'q': query};
    params = encodeQueryData(params);

    // api from https://github.com/Giphy/GiphyAPI#search-endpoint 

    httpGetAsync('http://api.giphy.com/v1/gifs/search?' + params, function(data) {
      var gifs = JSON.parse(data);
      var rand = Math.floor(Math.random() * gifs.data.length);
      var gif = gifs.data[rand].images.fixed_width.url;
      $("#IMAGEDIV").html("<img src='" + gif + "'>");
      console.log(gifs.data);
    });
  }

  getGif("LOADINGQUERY");
  $("#BUTTONNAME").on("click", function() {
    var query = $("#INPUTQUERY").val();
    getGif(query);
  });
})
