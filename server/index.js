const express = require('express'); 
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { instagramGetUrl } = require('instagram-url-direct');

const app = express(); 

app.use(express.json());
app.use(cors()); 

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/download', async (req, res) => { 
    const url = req.body.url; 
    
    if (!url || !url.includes('instagram.com')) {
        return res.status(400).json({ success: false, message: 'Invalid Instagram URL provided.' });
    }

    try { 
        // Using instagram-url-direct to extract media
        let links = await instagramGetUrl(url);
        
        if (links && links.url_list && links.url_list.length > 0) {
            // Prefer video if available
            let mediaUrl = links.url_list[0]; // fallback
            
            if (links.media_details && links.media_details.length > 0) {
                // Find first video
                const video = links.media_details.find(m => m.type === 'video');
                if (video && video.url) {
                    mediaUrl = video.url;
                } else if (links.media_details[0].url) {
                    mediaUrl = links.media_details[0].url;
                }
            }

            res.status(200).json({ 
                success: true, 
                mediaUrl: `/api/stream?url=${encodeURIComponent(mediaUrl)}` 
            });
        } else {
            res.status(404).json({ success: false, message: 'Could not find media. Ensure the post is public.' });
        }
    } catch(e) { 
        console.error("Scraping Error:", e); 
        res.status(500).json({ success: false, message: 'Internal Server Error. Instagram might be blocking requests.' }); 
    } 
}); 

// Helper route to proxy the download so it triggers a "Save As" dialogue
const https = require('https');

app.get('/api/stream', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('No URL provided');

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
    };

    https.get(targetUrl, options, (streamRes) => {
        const contentType = streamRes.headers['content-type'] || 'application/octet-stream';
        const isVideo = contentType.includes('video') || targetUrl.includes('.mp4');
        const ext = isVideo ? 'mp4' : 'jpg';
        
        res.setHeader('Content-Disposition', `attachment; filename="instafetch_${Date.now()}.${ext}"`);
        res.setHeader('Content-Type', isVideo ? 'video/mp4' : contentType);
        
        // Adding Content-Length allows the browser to show progress and download much faster!
        if (streamRes.headers['content-length']) {
            res.setHeader('Content-Length', streamRes.headers['content-length']);
        }

        streamRes.pipe(res);
    }).on('error', (err) => {
        console.error('Streaming error:', err);
        res.status(500).send('Failed to stream media');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
    console.log(`Server running at http://localhost:${PORT}`); 
});
