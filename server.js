const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // nice promise
const multer = require('multer');



const app = express()
const videodata = []
const video = []
const port = 4756 // Change this to the port you want to listen on if you want.
// app.use(express.raw({ type: '*/*', limit: '100mb' })); // <-- Add this!
app.use('/api/legacy/publish/:name', bodyParser.raw({ type: 'video/3gpp', limit: '500gb' }));
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
        await fs.writeFile(name + ".3gp", data);
        console.log('Video saved successfully');
    } catch (err) {
        console.error("saveVideo() failed.", err);
    }
}


async function getVideo(name) {
    try {
        return await fs.readFile(name + ".3gp");
    } catch (err) {
        console.error("Error while getting video:", err);
    }
}


//API Endpoints
app.get('/api/videos', (req, res) => {
    console.log("Got request for /videos");
    res.status(200).json(video);
});

app.get('/upload', (req, res) => {
    res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>Upload Video</title>
    </head>
    <body>
    <h1>Upload a Video</h1>

    <form action="/api/publish" method="POST" enctype="multipart/form-data">
    <input type="text" name="videoname" placeholder="Enter video name" required>
    <br><br>
    <input type="file" name="file" accept="video/3gpp" required>
    <br><br>
    <button type="submit">Upload Video</button>
    </form>

    </body>
    </html>
    `);
});
// This version is too new
// app.get('/upload', (req, res) => {
//     console.log("Got request for /upload");
//     res.status(200).send(`
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//     <meta charset="UTF-8">
//     <title>Upload Video</title>
//     </head>
//     <body>
//     <h1>Upload a Video</h1>
//
//     <form id="uploadForm" enctype="multipart/form-data">
//     <input type="text" id="videoName" placeholder="Enter video name" required>
//     <br><br>
//     <input type="file" id="fileInput" accept="video/3gpp" required>
//     <br><br>
//     <button type="submit">Upload Video</button>
//     </form>
//
//     <script>
//     const form = document.getElementById('uploadForm');
//
//     form.addEventListener('submit', async (e) => {
//         e.preventDefault();
//
//         const videoName = document.getElementById('videoName').value;
//         const fileInput = document.getElementById('fileInput').files[0];
//
//         if (!videoName || !fileInput) {
//             alert("Please enter a video name and select a file.");
//             return;
//         }
//
//         const formData = new FormData();
//         formData.append('file', fileInput);
//
//                           try {
//                               const response = await fetch(\`/api/publish/\${encodeURIComponent(videoName)}\`, {
//                                   method: 'POST',
//                                   body: formData
//                               });
//
//                               if (response.ok) {
//                                   alert("Video uploaded successfully!");
//                               } else {
//                                   alert("Failed to upload video.");
//                               }
//                           } catch (error) {
//                               console.error('Upload error:', error);
//                               alert("Error uploading video.");
//                           }
//     });
//     </script>
//     </body>
//     </html>
//     `);
// })
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
app.post('/api/legacy/publish/:name', async (req, res) => {
    try {
        console.log("Got request for /api/legacy/publish");

        const videoname = req.params.name;

        if (!req.body) {
            console.log("No req.body.");
            res.status(400).send("NOFILE");
            return;
        }
        await saveVideo(req.body, videoname);
        video.push(videoname);
        res.status(200).send("OK");

    } catch (err) {
        console.error("Error in /api/legacy/publish:", err);
        res.status(500).send("ERROR");
    }
});
// POST /api/publish/:name expecting a file upload (field: 'file')
app.post('/api/publish/:name', upload.single('file'), async (req, res) => {
    try {
        console.log("Got request for /api/publish");

        const videoname = req.params.name;
        if (req.body.videoname) {
              videoname = req.body.videoname;
        }
        if (!req.file) {
            res.status(400).send("No file uploaded.");
            console.log("No file uploaded.");
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
    res.set('Content-Type', 'video/3gpp');
    // const videodata = await getVideo(videoname)
    // res.send(videodata);
    res.sendFile(__dirname + "/" + videoname + ".3gp");
    res.status(200);
    } catch (err) {
        console.error("/api/videos/:name failed:", err);
        res.status(500).send("ERROR");
    }
});



app.listen(port, () => {
    console.log(`Tails1154 Video listening on port ${port}`)
})
