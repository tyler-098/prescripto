import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  urlToImage: String,
  source: { type: String, required: true },
  url: { type: String, required: true }, // External URL to original article
  publishedAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: true },
  type: { type: String, default: 'curated' }
});

export default mongoose.model("Article", articleSchema);