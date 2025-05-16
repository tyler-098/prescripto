import React from 'react';

const ArticleCard = ({ article, onImageClick, onDescriptionClick, onSiteClick }) => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
                onClick={onImageClick}
            />
            <div className="p-3">
                <h3
                    className="text-lg font-medium text-gray-800 mb-2 cursor-pointer"
                    onClick={onDescriptionClick}
                >
                    {article.title}
                </h3>
                <p
                    className="text-blue-600 text-sm underline cursor-pointer"
                    onClick={onSiteClick}
                >
                    {article.source}
                </p>
            </div>
        </div>
    );
};

export default ArticleCard;