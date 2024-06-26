const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Updated Azure Function URL and key
const functionAppUrl = "https://tamizhselvan-fun-app.azurewebsites.net/api/HttpTrigger3?code=7JKZHH3jYm2Fr79OLxzLp4CJNaS6leYpZ2HwU46u_iD1AzFuI0k4xg%3D%3D";
const functionKey = "fo-wnnp4kfSN1YWZhUBNtZWdHgr8LJ7WRkz-eHBv3nvKAzFumXQ6fg==";

app.post("/generate", async (req, res) => {
    const { prompt, size, style, quality } = req.body;

    try {
        const response = await axios.post(
            functionAppUrl,
            { prompt, size, style, quality },
            { headers: { 'x-functions-key': functionKey, 'Content-Type': 'application/json' } }
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error calling Azure Function:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
