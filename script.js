$(document).ready(function() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext('2d');
    const loadImage = document.getElementById("uploadImageButton");
    const combineImage = document.getElementById("combineButton");
    let sup1 = new SuperGif({ gif: document.getElementById('dataStore') } );
    var timeouts = [];
    let delay = 200;

    loadImage.onclick = function () {
        sup1.load(function(){
            showPreview()
        })
        document.getElementById("uploaded-image").src="./assets/logo.jpg";
    }

    combineImage.onclick = function (){
        if (canvas.width == 0 || canvas.height == 0){
            alert("Please first upload a image")
        } else {
            download();
        }
    }

    function showPreview(){
        // Set the size of the display canvas to that of original GIF
        canvas.width = sup1.get_canvas().width;
        canvas.height = sup1.get_canvas().height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let grabLimit = sup1.get_length();

        // clear all timeOuts
        for (var i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        //quick reset of the timer array
        timeouts = [];
        // Begin Animation Loop
        animate(0, grabLimit);
    }

    function download(){
        // Number of screenshots to take == number of frames in the original GIF
        // Milliseconds. 500 = half a second, should gives animation function 50 extra milliseconds to load (for Chrome)
        // e.g. the setTimeout of enterLoop is 200, then this grabRate should be 300
        var grabRate  = delay + 50;
        var count     = 0;
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
            var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
            var p = document.createElement('p'); // is a node
            p.innerHTML = '<img src="' + data_url + '"/>\n';
            document.getElementsByTagName('body')[0].appendChild(p);
        }

        // Implementation of Image Grabbing
        var grabber = setInterval(function(){
            count++;
            if (count>grabLimit) {
                clearInterval(grabber);
                showResults();
            } else {
                encoder.addFrame(ctx);
            }
        }, grabRate);
    }

// Function to drive the canvas display of combined images
    function animate(index, length){
        logo_image = new Image();
        logo_image.src = document.getElementById("uploaded-image").src;
        logo_image.onload = function(){
            const frame_image_src = sup1.get_canvas().toDataURL();
            frame_image = new Image();
            frame_image.src = frame_image_src;
            frame_image.onload = function(){
                ctx.drawImage(frame_image, 0, 0);
                ctx.drawImage(logo_image, parseInt($("#image-x-location").val()), parseInt($("#image-y-location").val()));
                try
                {
                    sup1.move_to(index);
                }
                catch(e)
                {
                    console.log("sup1 Updated without quitting a method " + sup1);
                }
                index++;
                timeouts.push( setTimeout(function() {
                    animate(index % length, length);
                }, delay) );
            }
        }
    }
})