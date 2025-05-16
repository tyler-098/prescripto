import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const ArticlePage = () => {
    const { backendUrl } = useContext(AppContext);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/articles`); // No token required
                const data = await response.json();
                console.log('API Response:', data); // Debug the response structure
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

    if (loading) return <div>Loading articles...</div>;
    if (error) return <div>Error: {error}</div>;

    const approvedArticles = articles.filter(article => article.isApproved);

    return (
        <div className="article-page p-4">
            <h1 className="text-2xl font-bold mb-4">All Health Articles</h1>
            <div className="articles-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedArticles.map((article) => (
                    <div key={article._id} className="article-card mb-4">
                        {article.urlToImage ? (
                            <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="w-full h-60 object-cover mb-2 cursor-pointer"
                                onClick={() => window.open(article.url, '_blank')}
                            />
                        ) : (
                            <div
                                className="w-full h-60 bg-gray-300 flex justify-center items-center text-white cursor-pointer"
                                onClick={() => window.open(article.url, '_blank')}
                            >
                                No Image Available
                            </div>
                        )}
                        <h2
                            className="text-xl font-semibold mb-2 cursor-pointer"
                            onClick={() => window.open(article.url, '_blank')}
                        >
                            {article.title || "No Title Available"}
                        </h2>
                        <p className="text-sm text-gray-600 mb-2">{article.source || "No Source Available"}</p>
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            Read more
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArticlePage;