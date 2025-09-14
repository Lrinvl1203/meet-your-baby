import React, { useState } from 'react';
import type { DetailedPercentages, FacialFeaturePercentage } from '../types';
import { FacialFeatureVisualizer } from './FacialFeatureVisualizer';

interface DetailedComparisonFormProps {
    percentages: DetailedPercentages;
    setPercentages: React.Dispatch<React.SetStateAction<DetailedPercentages>>;
}

const features = [
  { key: 'forehead', label: 'Forehead (이마)' },
  { key: 'eyebrows', label: 'Eyebrows (눈썹)' },
  { key: 'glabella', label: 'Glabella (미간)' },
  { key: 'eyes', label: 'Eyes (눈)' },
  { key: 'underEyes', label: 'Under Eyes (애교살)' },
  { key: 'temples', label: 'Temples (관자놀이)' },
  { key: 'nose', label: 'Nose (코)' },
  { key: 'nasolabialArea', label: 'Nasolabial Area (코 옆)' },
  { key: 'cheeks', label: 'Cheeks (뺨)' },
  { key: 'cheekbones', label: 'Cheekbones (광대뼈)' },
  { key: 'mouth', label: 'Mouth (입)' },
  { key: 'jawline', label: 'Jaw & Chin (턱)' },
  { key: 'ears', label: 'Ears (귀)' },
];

const FEATURE_COLORS: Record<string, string> = {
  forehead: '#ff6961',
  eyebrows: '#ffb480',
  glabella: '#f8f38d',
  eyes: '#42d6a4',
  underEyes: '#08cad1',
  temples: '#59adf6',
  nose: '#9d94ff',
  nasolabialArea: '#c780e8',
  cheeks: '#ff92c2',
  cheekbones: '#a2d2ff',
  mouth: '#ffb3de',
  jawline: '#ffdfb8',
  ears: '#b0e0e6'
};


const FeatureSlider: React.FC<{
    featureKey: string;
    label: string;
    values: FacialFeaturePercentage;
    onChange: (feature: string, values: FacialFeaturePercentage) => void;
    onHover: (featureKey: string | null) => void;
}> = ({ featureKey, label, values, onChange, onHover }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const momPercentage = parseInt(e.target.value, 10);
        onChange(featureKey, { mom: momPercentage, dad: 100 - momPercentage });
    };

    return (
        <div onMouseEnter={() => onHover(featureKey)} onMouseLeave={() => onHover(null)}>
            <label className="capitalize block text-sm font-medium text-gray-600 mb-2">{label}</label>
            <input
                type="range"
                min="0"
                max="100"
                value={values?.mom || 50}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Dad: {values?.dad || 50}%</span>
                <span>Mom: {values?.mom || 50}%</span>
            </div>
        </div>
    );
};

export const DetailedComparisonForm: React.FC<DetailedComparisonFormProps> = ({ percentages, setPercentages }) => {
    const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

    const handleFeatureChange = (feature: string, values: FacialFeaturePercentage) => {
        setPercentages(prev => ({
            ...prev,
            [feature]: values,
        }));
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 p-3 bg-gray-50 rounded-lg border">
            <div className="flex-1 space-y-4 max-h-[400px] md:max-h-80 overflow-y-auto pr-2">
                {features.map(feature => (
                    <FeatureSlider
                        key={feature.key}
                        featureKey={feature.key}
                        label={feature.label}
                        values={percentages[feature.key]}
                        onChange={handleFeatureChange}
                        onHover={setHoveredFeature}
                    />
                ))}
            </div>
            <div className="flex-1 flex items-center justify-center p-4 bg-white rounded-lg shadow-inner min-h-[250px]">
                <FacialFeatureVisualizer 
                    highlightedFeature={hoveredFeature}
                    featureColors={FEATURE_COLORS} 
                />
            </div>
        </div>
    );
};
