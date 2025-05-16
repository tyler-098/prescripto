import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import { AppContext } from '../context/AppContext';

const ArticleSelection = () => {
    const { backendUrl } = useContext(AppContext);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/articles`);
                const data = await response.json();
                console.log('API Response:', data);
                if (response.ok) {
                    const articleList = Array.isArray(data.articles) ? data.articles : Array.isArray(data) ? data : [];
                    setArticles(articleList);
                } else {
                    throw new Error(data.message || 'Failed to fetch articles');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [backendUrl]);

    if (loading) {
        return (
            <div className="article-selection p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-700">Featured Health Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    const approvedArticles = articles.filter(article => article.isApproved);
    const currentTime = new Date().getTime(); // Use timestamp for rotation
    const rotationIndex = Math.floor(currentTime / (1000 * 60)) % Math.ceil(approvedArticles.length / 3); // Rotate hourly
    const previewArticles = approvedArticles.slice(rotationIndex * 3, (rotationIndex * 3) + 3); // Show exactly 3 articles

    const handleImageClick = (articleId) => {
        navigate(`/article/${articleId}`); // Navigate to individual article page
    };

    const handleDescriptionClick = (articleId) => {
        navigate(`/article/${articleId}`); // Navigate to individual article page
    };

    return (
        <div className="article-selection p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b-2 border-gray-300 pb-2">Featured Health Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previewArticles.map((article) => (
                    <div
                        key={article._id}
                        className="transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden"
                    >
                        <ArticleCard
                            article={article}
                            onImageClick={() => handleImageClick(article._id)}
                            onDescriptionClick={() => handleDescriptionClick(article._id)}
                            onSiteClick={() => (window.location.href = article.url)}
                        />
                    </div>
                ))}
            </div>
            <Link
                to="/article"
                className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300 font-medium text-sm uppercase tracking-wide"
            >
                See All Articles →
            </Link>
        </div>
    );
};

export default ArticleSelection;