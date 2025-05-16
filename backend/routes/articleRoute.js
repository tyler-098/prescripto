import express from 'express';
import { fetchHealthArticles, getApprovedArticles, addArticle, fetchArticleMetadata } from '../controllers/articleController.js';
import multer from 'multer';
import authAdmin from '../middlewares/authAdmin.js';

const articleRouter = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage for file uploads

// Public route for fetching approved articles
articleRouter.get('/', getApprovedArticles); // No authAdmin for public access

// Admin-protected routes
articleRouter.use('/add-article', authAdmin); // Apply authAdmin only to add-article
articleRouter.use('/fetch-article-metadata', authAdmin); // Apply authAdmin only to fetch-article-metadata

// Existing GET route (can be public or protected based on needs)
articleRouter.get('/fetch', fetchHealthArticles); // Run manually or automate later

// POST routes with multer and authAdmin applied above
articleRouter.post('/add-article', upload.single('image'), addArticle);
articleRouter.post('/fetch-article-metadata', fetchArticleMetadata);

export default articleRouter;