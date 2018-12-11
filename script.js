$(document).ready(function() {
    const canvas = document.getElementById("myCanvas");
    const memeCanvas = document.getElementById("memeCanvas");
    const ctx = canvas.getContext('2d');
    const downloadButton = document.getElementById("downloadButton");
    const combineButton = document.getElementById("combineButton");
    const fileButton = document.getElementById("file_upload_input");
    const catGif = document.getElementById("cat-gif");
    let sup1 = new SuperGif({gif: document.getElementById('dataStore')});
    var timeouts = [];
    var selectedDelay = 80;
    var displayedDelay = null;
    var shouldEnd = false;
    let currentImage = new Image();
    currentImage.src = "./assets/logo.jpg";

    var loading_src = "./assets/icons/loading-icon.gif";

    const backendGIF = document.getElementById("backend-gif");
    const frontendIMG = document.getElementById("frontend-img");

    // On click of combine button
    combineButton.onclick = function () {
        backendGIF.src = catGif.src;
        backendGIF.width = catGif.width * 2;
        backendGIF.height = catGif.height * 2;
        currentImage.src = memeCanvas.toDataURL();
        frontendIMG.src = currentImage.src;
        frontendIMG.width = currentImage.width * 2;
        frontendIMG.height = currentImage.height * 2;
        displayedDelay = selectedDelay
        sup1.load_url(backendGIF.src,
            function (){
                    setTimeout(function () {
                    showPreview();
                }, displayedDelay)
            });

    };

    fileButton.onchange = function (e) {
        if (this.files && this.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                currentImage.onload = function () {
                    memeCanvas.style.width = '90%';
                    memeCanvas.style.height= '90%';
                    memeCanvas.getContext('2d').clearRect(0, 0, memeCanvas.width, memeCanvas.height);
                    memeCanvas.getContext('2d').drawImage(currentImage, 0, 0, currentImage.width, currentImage.height,
                        0,0,memeCanvas.width, memeCanvas.height);
                    currentImage.src = memeCanvas.toDataURL();
                };
                currentImage.src = e.target.result
            };

            reader.readAsDataURL(this.files[0]);
        }
    };

    // Click to download
    downloadButton.onclick = function () {
        download();
    };

    // Shows the combined canvas without download
    function showPreview() {
        // Set the size of the display canvas to that of original GIF
        canvas.width = sup1.get_canvas().width;
        canvas.height = sup1.get_canvas().height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let grabLimit = sup1.get_length();

        // Clear all timeOuts
        for (var i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        // Quick reset of the timer array
        timeouts = [];
        // Begin Animation Loop
        animate(0, grabLimit);
    }

    function setDelay(url){
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                gif = new GIF(arrayBuffer);
                var frames = gif.decompressFrames(true);
                selectedDelay = frames[0].delay
            }
        };

        oReq.send(null);
    }

    // To download image
    function download() {
        // Number of screenshots to take == number of frames in the original GIF
        // Milliseconds. 500 = half a second, should gives animation function 50 extra milliseconds to load (for Chrome)
        // e.g. the setTimeout of enterLoop is 200, then this grabRate should be 300
        var grabRate = displayedDelay;
        var count = 0;
        let grabLimit = sup1.get_length();

        // Start GIFEncoder to Capture Individual PNGs
        var encoder = new GIFEncoder();
        //0  -> loop forever, 1+ -> loop n times then stop
        encoder.setRepeat(0);
        //go to next frame every n milliseconds
        encoder.setDelay(grabRate);
        encoder.start();

        function showResults() {
            console.log('Finishing');
            encoder.finish();
            var binary_gif = encoder.stream().getData();
            var data_url = 'data:image/gif;base64,' + encode64(binary_gif);

            var link = document.createElement("a");
            link.download = "CatHub-Image" + data_url;
            link.href = data_url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            delete link;
            // var p = document.createElement('p'); // is a node
            // p.innerHTML = '<img src="' + data_url + '"/>\n';
            // document.getElementsByTagName('body')[0].appendChild(p);
        }

        // Implementation of Image Grabbing
        var grabber = setInterval(function () {
            count++;
            if (count > grabLimit) {
                clearInterval(grabber);
                showResults();
            } else {
                encoder.addFrame(ctx);
            }
        }, grabRate);
    }

    // Function to drive the canvas display of combined images
    function animate(index, length) {
        if (shouldEnd) {
            return;
        }
        logo_image = new Image();
        logo_image.src = currentImage.src;
        // logo_image.width = Math.floor(currentImage.width / 4);
        // logo_image.height = Math.floor(currentImage.height / 4);
        logo_image.onload = function () {
            const frame_image_src = sup1.get_canvas().toDataURL();
            frame_image = new Image();
            frame_image.src = frame_image_src;
            frame_image.onload = function () {
                ctx.drawImage(frame_image, 0, 0);
                ctx.drawImage(logo_image, parseInt($("#image-x-location").val()), parseInt($("#image-y-location").val()), Math.floor(currentImage.width / 2), Math.floor(currentImage.height / 2));
                try {
                    sup1.move_to(index);
                    index++;
                    recurse(index, length);
                }
                catch (e) {
                    // Force it
                    sup1.move_to(index);
                    index++;
                    recurse(index, length);
                    console.log("forced through a gif frame change " + index);
                }
            }
        }
    }

    function recurse(index, length) {
        timeouts.push(setTimeout(function () {
            animate(index % length, length);
        }, displayedDelay));
    }


    // For giphy api
    // Change the buttonname, inputquery, imagediv, loadingquery to use
    var apikey = '9wz9zYZz33IU6hIZv7Vr9r6aBp2lmq2k';
    var list = [];
    var cur = -1;
    var imagediv = "cat-gif";

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
        };
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
        xmlHttp.send(null);
    }

    /*
    * The following functions are what do the work for retrieving and displaying gifs
    * that we search for.
    */

    function getGif(query) {
        console.log(query);
        $("#gif-search-input").val(query);
        query = query.replace(' ', '+');
        var params = { 'api_key': apikey, 'q': query};
        params = encodeQueryData(params);

        // api from https://github.com/Giphy/GiphyAPI#search-endpoint

        httpGetAsync('http://api.giphy.com/v1/gifs/search?' + params, function(data) {
            var gifs = JSON.parse(data);
            list = gifs.data;
            var rand = Math.floor(Math.random() * gifs.data.length);
            cur = rand;
            var gifurl = list[cur].images.fixed_width.url;
            var gifMeta = list[cur].images.fixed_width;
            var img = document.getElementById(imagediv);
            var ratio = parseFloat(gifMeta.width)/parseFloat(gifMeta.height);
            if (parseFloat(gifMeta.width) > parseFloat(gifMeta.height)) {
                img.style.width = "90%";
                img.style.height = (90.0/ratio)+"%";
            } else {
                img.style.height = "90%";
                img.style.width = (90.0*ratio)+'%';
            }
            img.src=gifurl;
            setDelay(gifurl);
            list.push(gifurl);
            console.log(gifs.data);
        });
    }

    function previous(){
        // console.log(cur, list.length);
        if (cur <= 0){
            cur = list.length - 2;
        } else{
            cur = cur - 1;
        }
        var gifurl = list[cur].images.fixed_width.url;
        var gifMeta = list[cur].images.fixed_width;
        var img = document.getElementById(imagediv);
        var ratio = parseFloat(gifMeta.width)/parseFloat(gifMeta.height);
        if (parseFloat(gifMeta.width) > parseFloat(gifMeta.height)) {
            img.style.width = "90%";
            img.style.height = (90.0/ratio)+"%";
        } else {
            img.style.height = "90%";
            img.style.width = (90.0*ratio)+'%';
        }
        document.getElementById(imagediv).src=gifurl;
    }

    function next(){
        // console.log(cur, list.length);
        if (cur >= list.length-2){
            cur = 0
        } else {
            cur = cur + 1;
        }
        var gifurl = list[cur].images.fixed_width.url;
        var gifMeta = list[cur].images.fixed_width;
        var img = document.getElementById(imagediv);
        var ratio = parseFloat(gifMeta.width)/parseFloat(gifMeta.height);
        if (parseFloat(gifMeta.width) > parseFloat(gifMeta.height)) {
            img.style.width = "90%";
            img.style.height = (90.0/ratio)+"%";
        } else {
            img.style.height = "90%";
            img.style.width = (90.0*ratio)+'%';
        }
        document.getElementById(imagediv).src=gifurl;
    }

    var keyword = localStorage.getItem('cat_type');
    getGif( keyword+ " cat");

    $("#search-btn").on("click", function() {
        document.getElementById(imagediv).src = loading_src;
        InputQuery = $("#gif-search-input").val() + " cat";
        getGif(InputQuery);
    });

    $("#lucky-btn").on("click", function(){
        document.getElementById(imagediv).src = loading_src;
        getGif("cat");
    });

    $("#next-icon").on("click", function(){
        document.getElementById(imagediv).src = loading_src;
        next();
    });

    $("#prev-icon").on("click", function(){
        document.getElementById(imagediv).src = loading_src;
        previous();
    });


    function getPosition(element) {
        const {top, left, width, height} = element.getBoundingClientRect();
        return {x: top, y: left};
    }

    function getDistanceBetweenElements(a, b){
        const aPosition = getPosition(a);
        const bPosition = getPosition(b);
        const left = (bPosition.x - aPosition.x) / 4;
        const top = (bPosition.y - aPosition.y) / 4;
        var string = "x: " + left + "; y:" + top;
        return [left, top];
    }

    $("#frontend-img").draggable({containment: $("#backend-gif")})
        .mouseup(function(){
        // debugger
        console.log("boom")
        var a = getDistanceBetweenElements(backendGIF, frontendIMG);
        document.getElementById("image-x-location").value = a[1].toString();
        document.getElementById("image-y-location").value = a[0].toString();
    });
});






