import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import type { ImageWithAge, ImageData } from '../types';

interface MultiImageUploaderProps {
    title: string;
    onImagesChange: (images: ImageWithAge[]) => void;
    mode: 'separate' | 'together';
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ title, onImagesChange, mode }) => {
    const [images, setImages] = useState<ImageWithAge[]>([]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImagesList: ImageWithAge[] = [...images];
        
        Array.from(files).forEach(file => {
             if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const base64String = result.split(',')[1];
                    if (base64String) {
                        const newImage: ImageWithAge = {
                            id: `${Date.now()}-${Math.random()}`,
                            imageData: {
                                base64: base64String,
                                mimeType: file.type,
                                preview: result,
                            },
                            age: '',
                            fatherAge: '',
                            motherAge: '',
                        };
                        newImagesList.push(newImage);
                        setImages(newImagesList);
                        onImagesChange(newImagesList);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        // Reset file input to allow uploading the same file again
        event.target.value = '';

    }, [images, onImagesChange]);

    const handleAgeChange = (id: string, ageType: 'age' | 'fatherAge' | 'motherAge', value: string) => {
        const updatedImages = images.map(img =>
            img.id === id ? { ...img, [ageType]: value } : img
        );
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };
    
    const handleRemoveImage = (id: string) => {
        const filteredImages = images.filter(img => img.id !== id);
        setImages(filteredImages);
        onImagesChange(filteredImages);
    };

    return (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            
            {images.length > 0 && (
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                    {images.map((image) => (
                        <div key={image.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
                            <img src={image.imageData.preview} alt="preview" className="h-16 w-16 object-cover rounded-md" />
                            <div className="flex-grow">
                                {mode === 'separate' ? (
                                    <div>
                                        <label htmlFor={`age-${image.id}`} className="text-xs font-medium text-gray-500">Age in this photo</label>
                                        <input
                                            type="number"
                                            id={`age-${image.id}`}
                                            value={image.age || ''}
                                            onChange={(e) => handleAgeChange(image.id, 'age', e.target.value)}
                                            className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            placeholder="e.g., 28"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div>
                                            <label htmlFor={`father-age-${image.id}`} className="text-xs font-medium text-gray-500">Father's Age</label>
                                            <input
                                                type="number"
                                                id={`father-age-${image.id}`}
                                                value={image.fatherAge || ''}
                                                onChange={(e) => handleAgeChange(image.id, 'fatherAge', e.target.value)}
                                                className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="e.g., 32"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`mother-age-${image.id}`} className="text-xs font-medium text-gray-500">Mother's Age</label>
                                            <input
                                                type="number"
                                                id={`mother-age-${image.id}`}
                                                value={image.motherAge || ''}
                                                onChange={(e) => handleAgeChange(image.id, 'motherAge', e.target.value)}
                                                className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="e.g., 30"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => handleRemoveImage(image.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

             <div className="mt-2 text-center">
                 <input
                     type="file"
                     id={`file-upload-${title.replace(/\s+/g, '-')}`}
                     className="hidden"
                     accept="image/*"
                     multiple
                     onChange={handleFileChange}
                 />
                 <label htmlFor={`file-upload-${title.replace(/\s+/g, '-')}`} className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <UploadIcon />
                     <span className="ml-2">{images.length > 0 ? 'Add More Photos' : 'Select Photo(s)'}</span>
                 </label>
             </div>
        </div>
    );
};