import React, { useContext, useState } from 'react';
import { assets1 } from '../../assets/assets1';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddArticle = () => {
    const [image, setImage] = useState(null); // File object or { preview: string } from metadata
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { backendurl, aToken, cloudinaryConfig } = useContext(AdminContext);

    // Debug the config at the point of use
    console.log('AddArticle cloudinaryConfig:', cloudinaryConfig);

    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
        console.error('Invalid Cloudinary configuration in AddArticle:', cloudinaryConfig);
        toast.error('Cloudinary configuration is not set. Contact the administrator.');
        return null; // Prevent rendering if config is invalid
    }

    const fetchMetadata = async () => {
        if (!url) {
            return toast.error('Please enter a URL');
        }
        setLoading(true);
        try {
            console.log('Fetching metadata for URL:', url, 'with token:', aToken);
            const { data } = await axios.post(backendurl + '/api/articles/fetch-article-metadata', { url }, {
                headers: { aToken },
                timeout: 60000, // 60 seconds
            });
            console.log('Metadata response:', data);
            if (data.success) {
                setTitle(data.metadata.title || '');
                setSource(data.metadata.source || '');
                setImage(data.metadata.urlToImage ? { preview: data.metadata.urlToImage } : null);
                if (!data.metadata.urlToImage) {
                    toast.warn('No image found in metadata; upload an image manually if needed.');
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Fetch metadata error:', error.response?.data || error.message);
            toast.error('Failed to fetch metadata. Check server logs or try a different URL.');
        } finally {
            setLoading(false);
        }
    };

    const onImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                toast.error('Invalid image type. Only JPG and PNG are allowed.');
                return;
            }
            setImage(file); // Set as File object for upload
        }
    };

    // AddArticle.jsx
    const uploadToCloudinary = async (imageData) => {
        console.log('uploadToCloudinary cloudinaryConfig:', cloudinaryConfig);
        const formData = new FormData();

        if (imageData instanceof File) {
            formData.append('file', imageData);
            try {
                const { data } = await axios.post(
                    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
                    formData,
                    {
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                        params: {
                            upload_preset: cloudinaryConfig.uploadPreset,
                        },
                    }
                );
                return data.secure_url;
            } catch (error) {
                console.error('Cloudinary upload error:', error.message, error.response?.data);
                throw new Error(`Cloudinary upload failed: ${error.message} - ${JSON.stringify(error.response?.data)}`);
            }
        }
        // If imageData is not a File, return the preview URL (from metadata) to be handled by the backend
        return imageData?.preview || null;
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (!title || !source || !url) {
            return toast.error('All fields are required');
        }
        if (!image) {
            return toast.error('Please select an image before adding the article');
        }
        setUploading(true);

        try {
            let urlToImage = null;
            if (image instanceof File) {
                console.log('Uploading local image to Cloudinary:', image.name);
                urlToImage = await uploadToCloudinary(image);
            } else {
                console.log('Using metadata image URL:', image.preview);
                urlToImage = image.preview; // Send the metadata image URL to the backend
            }
            console.log('Image URL to send:', urlToImage);

            const articleData = {
                title,
                source,
                url,
                urlToImage,
            };

            console.log('Submitting article data:', articleData);
            const { data } = await axios.post(backendurl + '/api/articles/add-article', articleData, {
                headers: { aToken },
            });

            if (data.success) {
                toast.success(data.message);
                setImage(null);
                setTitle('');
                setSource('');
                setUrl('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Submission error:', error.message, error.response?.data || error);
            toast.error(error.message || 'Failed to add article');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="m-5 w-full">
            <p className="mb-3 text-lg font-medium">Add Article</p>
            <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
                <div className="flex flex-col items-center gap-4 mb-8 text-gray-500">
                    {image && typeof image === 'object' ? (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center border rounded-lg overflow-hidden">
                            <img
                                className="h-full w-auto object-contain"
                                src={image.preview || (image instanceof File ? URL.createObjectURL(image) : assets1.upload_area)}
                                alt="Preview"
                            />
                        </div>
                    ) : (
                        <label
                            htmlFor="article-img"
                            className="flex flex-col items-center justify-center w-full h-40 bg-gray-100 border rounded-lg cursor-pointer"
                        >
                            <img className="w-16" src={assets1.upload_area} alt="Upload Placeholder" />
                            <p className="text-sm mt-2">Fetched article Image</p>
                        </label>
                    )}
                    <input onChange={onImageChange} type="file" id="article-img" hidden />
                    <button
                        type="button"
                        className="mt-2 bg-gray-300 px-4 py-2 rounded-full text-gray-700"
                        onClick={() => document.getElementById('article-img').click()}
                    >
                        {image ? 'Change Image' : 'Select Image'}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
                    <div className="w-full lg:flex-1 flex flex-col gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <p>Article URL</p>
                            <input
                                onChange={(e) => setUrl(e.target.value)}
                                value={url}
                                className="border rounded px-3 py-2"
                                type="url"
                                placeholder="https://example.com/article"
                                required
                            />
                            <button
                                type="button"
                                onClick={fetchMetadata}
                                className="bg-primary px-4 py-2 text-white mt-2 rounded-full"
                                disabled={loading}
                            >
                                {loading ? 'Fetching...' : 'Fetch Metadata'}
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <p>Article Title</p>
                            <input
                                onChange={(e) => setTitle(e.target.value)}
                                value={title}
                                className="border rounded px-3 py-2"
                                type="text"
                                placeholder="Title..."
                                required
                            />
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                            <p>Source</p>
                            <input
                                onChange={(e) => setSource(e.target.value)}
                                value={source}
                                className="border rounded px-3 py-2"
                                type="text"
                                placeholder="e.g., Forbes, Health-Everyday..."
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-primary px-8 py-3 text-white mt-4 rounded-full"
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Add Article'}
                </button>
            </div>
        </form>
    );
};

export default AddArticle;