const fs = require('fs').promises;
const path = require('path');

async function generateImagesJson() {
  const galleryPath = path.join(__dirname, 'gallery');
  const images = [];

  try {
    const folders = await fs.readdir(galleryPath, { withFileTypes: true });
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const tag = folder.name;
        const folderPath = path.join(galleryPath, tag);
        const files = await fs.readdir(folderPath);
        for (const file of files) {
          if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
            images.push({
              src: `gallery/${tag}/${file}`,
              tag: tag,
              description: ``,
            });
          }
        }
      }
    }
    await fs.writeFile('images.json', JSON.stringify(images, null, 2));
    console.log('images.json generated successfully');
  } catch (error) {
    console.error('Error generating images.json:', error);
  }
}

generateImagesJson();