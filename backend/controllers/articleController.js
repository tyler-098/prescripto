import axios from 'axios';
import Article from '../models/articleModel.js';
import cloudinary from 'cloudinary';
import * as cheerio from 'cheerio';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const fetchHealthArticles = async (req, res) => {
  try {
    res.status(200).json({ message: 'Fetch health articles logic here' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApprovedArticles = async (req, res) => {
  try {
    console.log('Querying approved articles from database...');
    const articles = await Article.find({ isApproved: true });
    console.log('Found articles:', articles.length);
    res.status(200).json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching approved articles:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadImageFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// articleController.js
export const addArticle = async (req, res) => {
  try {
    const { title, source, url, urlToImage } = req.body;
    const aToken = req.headers.atoken;

    if (!aToken) {
      return res.status(401).json({ success: false, message: 'Admin authorization required' });
    }

    if (!title || !source || !url || !urlToImage) {
      return res.status(400).json({ success: false, message: 'All fields, including an image, are required' });
    }

    let uploadedUrlToImage = urlToImage;
    // Check if urlToImage is an external URL (not a Cloudinary URL)
    if (urlToImage && typeof urlToImage === 'string' && urlToImage.match(/^https?:\/\//) && !urlToImage.includes('cloudinary.com')) {
      console.log('Downloading external image from:', urlToImage);
      try {
        const response = await axios.get(urlToImage, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        uploadedUrlToImage = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }).end(buffer);
        });
        console.log('Uploaded external image to Cloudinary:', uploadedUrlToImage);
      } catch (error) {
        console.error('Error uploading external image to Cloudinary:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary' });
      }
    } else if (urlToImage.includes('cloudinary.com')) {
      console.log('Using provided Cloudinary URL:', urlToImage);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid image URL' });
    }

    const article = new Article({
      title,
      urlToImage: uploadedUrlToImage,
      source,
      url,
      isApproved: true,
      publishedAt: new Date(),
      type: 'curated',
    });

    await article.save();
    res.status(201).json({ success: true, message: 'Article added successfully', article });
  } catch (error) {
    console.error('Error adding article:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchArticleMetadata = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    console.log(`Starting metadata fetch for URL: ${url}`);
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempt ${attempt} to fetch ${url}`);
        response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/',
          },
          timeout: 15000,
          maxRedirects: 5,
        });
        console.log(`Successfully fetched URL on attempt ${attempt}`);
        break;
      } catch (error) {
        console.warn(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
      }
    }

    const $ = cheerio.load(response.data);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'No Title';
    let imageUrl = $('meta[property="og:image"]').attr('content') || $('img').first().attr('src');

    if (!imageUrl) {
      console.warn('No image found in metadata');
    } else {
      console.log('Found image URL:', imageUrl);
    }

    const metadata = {
      success: true,
      metadata: {
        title,
        urlToImage: imageUrl || null,
        source: new URL(url).hostname.replace('www.', ''),
        url,
      },
    };
    console.log('Sending metadata response:', metadata);
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Metadata Fetch Error:', error.message, error.stack);
    res.status(500).json({ success: false, message: `Failed to fetch metadata: ${error.message}` });
  }
};