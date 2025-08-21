const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Serve static files (images, HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// API endpoint to get image data from gallery folder
app.get('/api/images', async (req, res) => {
  try {
    const galleryPath = path.join(__dirname, 'gallery');
    const folders = await fs.readdir(galleryPath, { withFileTypes: true });
    const images = [];

    for (const folder of folders) {
      if (folder.isDirectory()) {
        const tag = folder.name;
        const folderPath = path.join(galleryPath, tag);
        const files = await fs.readdir(folderPath);
        
        for (const file of files) {
          if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
            images.push({
              src: `/gallery/${tag}/${file}`,
              tag: tag,
              description: ``,
            });
          }
        }
      }
    }

    res.json(images);
  } catch (error) {
    console.error('Error reading gallery:', error);
    res.status(500).json({ error: 'Failed to load images' });
  }
});

// API endpoint to get unique tags
app.get('/api/tags', async (req, res) => {
  try {
    const galleryPath = path.join(__dirname, 'gallery');
    const folders = await fs.readdir(galleryPath, { withFileTypes: true });
    const tags = folders
      .filter(folder => folder.isDirectory())
      .map(folder => folder.name);
    res.json(tags);
  } catch (error) {
    console.error('Error reading tags:', error);
    res.status(500).json({ error: 'Failed to load tags' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});