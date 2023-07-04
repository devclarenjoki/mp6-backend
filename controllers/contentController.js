const sharp = require('sharp');
const Content = require('../models/ContentModel');

// Upload content
exports.uploadContent = async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;
    const thumbnailUrl = await generateThumbnail(fileUrl); // Await the generateThumbnail function

    const content = await Content.create({
      title,
      description,
      fileUrl,
      thumbnailUrl,
      seller: req.user.userId, // Assuming the user ID is stored in the req.user object after authentication
    });

    res.status(201).json({ message: 'Content uploaded successfully', content });
  } catch (error) {
    console.log(error, 'error')
    res.status(500).json({ error: 'An error occurred while uploading content' });
  }
};

// Helper function to generate a thumbnail
async function generateThumbnail(fileUrl) {
  try {
    const thumbnailPath = fileUrl + '-thumbnail.jpg';

    await sharp(fileUrl)
      .resize(200, 200)
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.log(error, 'error');
    throw new Error('Failed to generate thumbnail');
  }
}