gifshot.createGIF({
    gifWidth: 200,
    gifHeight: 200,
    video: [
        './assets/catStock.gif'
    ],
    text:'CatHub',
    fontWeight: 'normal',
    fontSize: '16px',
    fontFamily: 'sans-serif',
    fontColor: '#ff0000 ',
    textAlign: 'center',
    textBaseline: 'top',
    interval: 0.1,
    numFrames: 10,
    frameDuration: 1,
    sampleInterval: 10,
    numWorkers: 2
},function(obj) {
    if(!obj.error) {
        var image = obj.image;
        animatedImage = document.createElement('img');
        animatedImage.src = image;
        document.body.appendChild(animatedImage);
    }
});