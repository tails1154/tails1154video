const express = require('express');
const fs = require('fs').promises; // nice promise

const app = express()
const video = []
const port = 4756 // Change this to the port you want to listen on if you want.


//async functions
async function saveVideo(data, name) {
    try {
        await fs.writeFile(name + ".mp4", data)
    } catch (err) {
        console.error("saveVideo() failed.", err)
    }
}


async function getVideo(name) {
    try {
        return await fs.readFile(name + ".mp4");
    } catch (err) {
        console.error("Error while getting video:", err);
    }
}



app.get('/api/videos', (req, res) => {
    console.log("Got request for /videos");
    res.send(video);
});


app.post('/api/publish/:name', (req, res) => {
    console.log("Got request for /api/publish");
    const videoname = req.params.name;
    saveVideo(req.body, videoname); // Save the video to a file
    video.push(videoname); // Now we can push so users don't get a unfinished video file.
    res.status(200).send("OK");
});



app.get('/api/videos/:name', (req, res) => {
    console.log("Got request for /api/video/:name");
    const videoname = req.params.name;
    //getVideo(videoname)
    res.set('Content-Type', 'video/mp4');
    res.send(getVideo(videoname));
    res.status(200);
})



app.listen(port, () => {
    console.log(`Tails1154 Video listening on port ${port}`)
})
