import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ResultDisplayProps {
    isLoading: boolean;
    images: string[] | null;
    error: string | null;
    onClose: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, images, error, onClose }) => {
    const handleDownload = (image: string, index: number) => {
        if (!image) return;
        const link = document.createElement('a');
        link.href = image;
        const fileExtension = image.split(';')[0].split('/')[1] || 'png';
        link.download = `baby-prediction-${index + 1}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasImages = images && images.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative transform transition-all animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl z-10">&times;</button>
                <div className="w-full rounded-lg flex items-center justify-center bg-gray-100 min-h-[300px]">
                    {isLoading && (
                        <div className="text-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-gray-600 font-medium">AI is dreaming up your baby...</p>
                            <p className="text-sm text-gray-500 mt-1">This can take a moment.</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="text-center text-red-500 p-4">
                            <p className="font-bold">Generation Failed</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    )}
                    {hasImages && !isLoading && (
                         <div className={`grid gap-4 w-full ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} p-2 max-h-[70vh] overflow-y-auto`}>
                             {images.map((image, index) => (
                                 <div key={index} className="flex flex-col items-center gap-2">
                                     <img src={image} alt={`Generated baby ${index + 1}`} className="w-full object-cover rounded-lg shadow-md aspect-square" />
                                     <button 
                                         onClick={() => handleDownload(image, index)} 
                                         className="w-full max-w-[200px] inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors text-sm"
                                     >
                                         <i className="fas fa-download mr-2"></i>
                                         Download Variation {index + 1}
                                     </button>
                                 </div>
                             ))}
                         </div>
                    )}
                </div>
                 <div className="text-center mt-4 flex justify-center gap-4">
                     <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors">
                         Close
                     </button>
                 </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};