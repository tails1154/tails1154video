const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // nice promise
const multer = require('multer');



const app = express()
const videodata = []
const video = []
const port = 4756 // Change this to the port you want to listen on if you want.
// app.use(express.raw({ type: '*/*', limit: '100mb' })); // <-- Add this!
app.use('/api/publish/:name', bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));
const upload = multer({ storage: multer.memoryStorage() }); // Keep file in memory for easy saving
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
    res.json(video);
});

/*
app.post('/api/publish/:name', async (req, res) => {
    try {
    console.log("Got request for /api/publish");
    const videoname = req.params.name;
    await saveVideo(req.body, videoname); // Save the video to a file
    video.push(videoname); // Now we can push so users don't get a unfinished video file.
    res.status(200).send("OK");
    } catch (err) {
        console.error("/api/publish/:name failed:", err);
        res.status(500).send("ERROR");
    }
});*/
// POST /api/publish/:name expecting a file upload (field: 'file')
app.post('/api/publish/:name', upload.single('file'), async (req, res) => {
    try {
        console.log("Got request for /api/publish");

        const videoname = req.params.name;

        if (!req.file) {
            res.status(400).send("No file uploaded.");
            return;
        }

        await saveVideo(req.file.buffer, videoname);
        video.push(videoname);
        res.status(200).send("OK");
    } catch (err) {
        console.error("/api/publish/:name failed:", err);
        res.status(500).send("ERROR");
    }
});


app.get('/api/videos/:name', async (req, res) => {
    try {
    console.log("Got request for /api/video/:name");
    const videoname = req.params.name;
    //getVideo(videoname)
    res.set('Content-Type', 'video/mp4');
    const videodata = await getVideo(videoname)
    res.send(videodata);
    res.status(200);
    } catch (err) {
        console.error("/api/videos/:name failed:", err);
        res.status(500);
    }
});



app.listen(port, () => {
    console.log(`Tails1154 Video listening on port ${port}`)
})
