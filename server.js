const express = require('express');
const fs = require('fs').promises; // nice promise

const app = express()
const video = []
const port = 4756 // Change this to the port you want to listen on if you want.
app.use(express.raw({ type: '*/*', limit: '100mb' })); // <-- Add this!

//async functions
// async function saveVideo(data, name) {
//     try {
//         await fs.writeFile(name + ".mp4", data)
//     } catch (err) {
//         console.error("saveVideo() failed.", err)
//     }
// }
async function saveVideo(data, name) {
    try {
        if (!data || data.length === 0) {
            console.error("Received empty data in saveVideo()");
            return;
        }
        console.log("Saving video with data of length:", data.length);
        await fs.writeFile(name + ".mp4", data);
        console.log('Video saved successfully');
    } catch (err) {
        console.error("saveVideo() failed.", err);
    }
}


async function getVideo(name) {
    try {
        return await fs.readFile(name + ".mp4");
    } catch (err) {
        console.error("Error while getting video:", err);
    }
}


//API Endpoints
app.get('/api/videos', (req, res) => {
    console.log("Got request for /videos");
    res.send(video);
});


app.post('/api/publish/:name', (req, res) => {
    try {
    console.log("Got request for /api/publish");
    const videoname = req.params.name;
    saveVideo(req.body, videoname); // Save the video to a file
    video.push(videoname); // Now we can push so users don't get a unfinished video file.
    res.status(200).send("OK");
    } catch (err) {
        console.error("/api/publish/:name failed:", err);
        res.status(500).send("ERROR");
    }
});



app.get('/api/videos/:name', (req, res) => {
    try {
    console.log("Got request for /api/video/:name");
    const videoname = req.params.name;
    //getVideo(videoname)
    res.set('Content-Type', 'video/mp4');
    res.send(await getVideo(videoname));
    res.status(200);
    } catch (err) {
        console.error("/api/videos/:name failed:", err);
        res.status(500);
    }
})



app.listen(port, () => {
    console.log(`Tails1154 Video listening on port ${port}`)
})
