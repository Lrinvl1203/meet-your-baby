
import React, { useState, useCallback } from 'react';
import { MultiImageUploader } from './components/MultiImageUploader';
import { DetailedComparisonForm } from './components/DetailedComparisonForm';
import { ResultDisplay } from './components/ResultDisplay';
import { BabyIcon } from './components/icons/BabyIcon';
import type { DetailedPercentages, ImageWithAge, ComparisonType, Gender } from './types';
import { generateBabyFace } from './services/geminiService';

type InputMode = 'separate' | 'together';
type GenerationMode = 'singleAge' | 'ageProgression';

const initialDetailedPercentages: DetailedPercentages = {
    forehead: { mom: 50, dad: 50 },
    eyebrows: { mom: 50, dad: 50 },
    glabella: { mom: 50, dad: 50 },
    eyes: { mom: 50, dad: 50 },
    underEyes: { mom: 50, dad: 50 },
    temples: { mom: 50, dad: 50 },
    nose: { mom: 50, dad: 50 },
    nasolabialArea: { mom: 50, dad: 50 },
    cheeks: { mom: 50, dad: 50 },
    cheekbones: { mom: 50, dad: 50 },
    mouth: { mom: 50, dad: 50 },
    jawline: { mom: 50, dad: 50 },
    ears: { mom: 50, dad: 50 },
};

const presetAges = [
    '3 months old', '6 months old', '1 year old', '2 years old', 
    '3 years old', '4 years old', '5 years old'
];

const App: React.FC = () => {
    const [inputMode, setInputMode] = useState<InputMode>('separate');
    const [fatherImages, setFatherImages] = useState<ImageWithAge[]>([]);
    const [motherImages, setMotherImages] = useState<ImageWithAge[]>([]);
    const [togetherImages, setTogetherImages] = useState<ImageWithAge[]>([]);

    const [ethnicity, setEthnicity] = useState<string>('');
    const [nationality, setNationality] = useState<string>('');

    const [childNumber, setChildNumber] = useState<number>(1);
    const [gender, setGender] = useState<Gender>('Female');
    
    const [generationMode, setGenerationMode] = useState<GenerationMode>('singleAge');
    
    // States for singleAge mode
    const [babyAge, setBabyAge] = useState<string>('Newborn');
    const [customAge, setCustomAge] = useState<string>('');
    const [numberOfImages, setNumberOfImages] = useState<number>(1);

    // State for ageProgression mode
    const [ageProgressionCount, setAgeProgressionCount] = useState<number>(1);
    const [selectedPresetAges, setSelectedPresetAges] = useState<string[]>([]);
    
    const [comparisonType, setComparisonType] = useState<ComparisonType>('simple');
    const [simplePercentages, setSimplePercentages] = useState({ mom: 50, dad: 50 });
    const [detailedPercentages, setDetailedPercentages] = useState<DetailedPercentages>(initialDetailedPercentages);

    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showResult, setShowResult] = useState<boolean>(false);

    const handlePresetAgeToggle = (age: string) => {
        setSelectedPresetAges(prev =>
            prev.includes(age)
                ? prev.filter(a => a !== age)
                : [...prev, age]
        );
    };

    const handleGenerate = useCallback(async () => {
        if ((inputMode === 'separate' && (fatherImages.length === 0 || motherImages.length === 0)) || (inputMode === 'together' && togetherImages.length === 0)) {
            setError('Please upload at least one photo for each required category.');
            return;
        }

        setError(null);
        setIsLoading(true);
        setGeneratedImages(null);
        setShowResult(true);

        const commonParams = {
            fatherImages: inputMode === 'separate' ? fatherImages : undefined,
            motherImages: inputMode === 'separate' ? motherImages : undefined,
            togetherImages: inputMode === 'together' ? togetherImages : undefined,
            ethnicity,
            nationality,
            childNumber,
            gender,
            comparisonType,
            simplePercentages,
            detailedPercentages,
        };

        try {
            if (generationMode === 'singleAge') {
                const age = babyAge === 'custom' ? `${customAge} years old` : babyAge;
                const results = await generateBabyFace({
                    ...commonParams,
                    age,
                    numberOfImages,
                });
                setGeneratedImages(results);
            } else { // ageProgression mode
                if (selectedPresetAges.length === 0) {
                    setError('Please select at least one age for age progression.');
                    setIsLoading(false);
                    return;
                }
                const allGeneratedImages: string[] = [];
                for (const age of selectedPresetAges) {
                    const resultsForAge = await generateBabyFace({
                        ...commonParams,
                        age,
                        numberOfImages: ageProgressionCount,
                    });
                    allGeneratedImages.push(...resultsForAge);
                    // Update state progressively for better UX
                    setGeneratedImages([...allGeneratedImages]);
                }
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [
        inputMode, fatherImages, motherImages, togetherImages, ethnicity, nationality, 
        childNumber, gender, comparisonType, babyAge, customAge, numberOfImages, 
        simplePercentages, detailedPercentages, generationMode, ageProgressionCount, selectedPresetAges
    ]);

    const isGenerateDisabled = isLoading || 
        (inputMode === 'separate' && (fatherImages.length === 0 || motherImages.length === 0)) || 
        (inputMode === 'together' && togetherImages.length === 0) ||
        (generationMode === 'ageProgression' && selectedPresetAges.length === 0);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-10">
            <div className="w-full max-w-6xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight flex items-center justify-center gap-3">
                        <BabyIcon />
                        AI Baby Face Predictor
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">See what your future baby might look like!</p>
                </header>

                <main className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">How would you like to upload photos?</h3>
                        <div className="flex justify-center bg-gray-100 p-1.5 rounded-full w-full max-w-sm mx-auto">
                            <button
                                onClick={() => setInputMode('separate')}
                                className={`w-1/2 py-2 text-sm font-medium rounded-full transition-colors ${inputMode === 'separate' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Separate Photos
                            </button>
                            <button
                                onClick={() => setInputMode('together')}
                                className={`w-1/2 py-2 text-sm font-medium rounded-full transition-colors ${inputMode === 'together' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Photo Together
                            </button>
                        </div>
                    </div>

                    {inputMode === 'separate' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <MultiImageUploader title="Father's Photos" onImagesChange={setFatherImages} mode="separate" />
                            <MultiImageUploader title="Mother's Photos" onImagesChange={setMotherImages} mode="separate" />
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto mb-8">
                           <MultiImageUploader title="Parents' Photos Together" onImagesChange={setTogetherImages} mode="together" />
                        </div>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t pt-8 border-gray-200">
                        {/* Column 1: Family Details */}
                        <div className="space-y-6">
                             <h3 className="font-semibold text-gray-700 text-lg">Family Details</h3>
                            <div className="space-y-4 p-3 bg-gray-50 rounded-lg border">
                                <h4 className="font-medium text-gray-600 text-sm">Parents' Info</h4>
                                <div>
                                    <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-600 mb-1">Ethnicity / Race</label>
                                    <input type="text" id="ethnicity" value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., East Asian, Caucasian"/>
                                </div>
                                <div>
                                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-600 mb-1">Nationality</label>
                                    <input type="text" id="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Korean, American"/>
                                </div>
                            </div>
                            <div className="space-y-4 p-3 bg-gray-50 rounded-lg border">
                                <h4 className="font-medium text-gray-600 text-sm">Baby's Info</h4>
                                <div>
                                    <label htmlFor="childNumber" className="block text-sm font-medium text-gray-600 mb-1">Which child is this?</label>
                                    <input type="number" id="childNumber" value={childNumber} onChange={(e) => setChildNumber(Math.max(1, parseInt(e.target.value, 10)))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center space-x-2"><input type="radio" name="gender" value="Male" checked={gender === 'Male'} onChange={() => setGender('Male')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"/><span>Male</span></label>
                                        <label className="flex items-center space-x-2"><input type="radio" name="gender" value="Female" checked={gender === 'Female'} onChange={() => setGender('Female')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"/><span>Female</span></label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Generation Option</label>
                                    <div className="flex flex-col sm:flex-row gap-2 p-1 bg-gray-200 rounded-lg">
                                        <button onClick={() => setGenerationMode('singleAge')} className={`flex-1 p-2 text-sm rounded-md transition-colors ${generationMode === 'singleAge' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
                                            Fixed Age
                                        </button>
                                        <button onClick={() => setGenerationMode('ageProgression')} className={`flex-1 p-2 text-sm rounded-md transition-colors ${generationMode === 'ageProgression' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
                                            Age Progression
                                        </button>
                                    </div>
                                </div>
                                {generationMode === 'singleAge' ? (
                                    <>
                                        <div>
                                            <label htmlFor="babyAge" className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                                            <select id="babyAge" value={babyAge} onChange={(e) => setBabyAge(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                                <option>Newborn</option>
                                                <option>1 year old</option>
                                                <option>2 years old</option>
                                                <option value="custom">Custom age</option>
                                            </select>
                                            {babyAge === 'custom' && (
                                                <input type="number" placeholder="Enter age in years" value={customAge} onChange={e => setCustomAge(e.target.value)} className="mt-2 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="numberOfImages" className="block text-sm font-medium text-gray-600 mb-1">Number of photos to generate (1-4)</label>
                                            <input 
                                                type="number" 
                                                id="numberOfImages" 
                                                value={numberOfImages} 
                                                onChange={(e) => setNumberOfImages(Math.max(1, Math.min(4, parseInt(e.target.value, 10) || 1)))} 
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                min="1"
                                                max="4"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Select Ages to Generate</label>
                                            <p className="text-xs text-gray-500 mb-2">Choose one or more ages for which you want to generate photos.</p>
                                            <div className="flex flex-wrap gap-2">
                                                {presetAges.map(age => {
                                                    const isSelected = selectedPresetAges.includes(age);
                                                    return (
                                                        <button
                                                            key={age}
                                                            type="button"
                                                            onClick={() => handlePresetAgeToggle(age)}
                                                            className={`px-3 py-1.5 rounded-full font-medium transition-colors text-xs border ${
                                                                isSelected
                                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {age.replace(' old', '')}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="ageProgressionCount" className="block text-sm font-medium text-gray-600 mb-1">Number of photos per age (1-2)</label>
                                            <input 
                                                type="number" 
                                                id="ageProgressionCount" 
                                                value={ageProgressionCount} 
                                                onChange={(e) => setAgeProgressionCount(Math.max(1, Math.min(2, parseInt(e.target.value, 10) || 1)))} 
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                min="1"
                                                max="2"
                                            />
                                        </div>
                                    </>
                                )}
                                <hr className="border-gray-200 -mx-3 my-4" />
                                <h4 className="font-medium text-gray-600 text-sm mb-2">Resemblance Details</h4>
                                {comparisonType === 'simple' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Overall Resemblance</label>
                                        <input type="range" min="0" max="100" value={simplePercentages.mom} onChange={(e) => setSimplePercentages({ mom: parseInt(e.target.value), dad: 100 - parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                                            <span>Dad: {simplePercentages.dad}%</span>
                                            <span>Mom: {simplePercentages.mom}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <DetailedComparisonForm percentages={detailedPercentages} setPercentages={setDetailedPercentages} />
                                )}
                            </div>
                        </div>

                        {/* Column 2: Prediction Type */}
                        <div className="space-y-4">
                             <h3 className="font-semibold text-gray-700 text-lg">Prediction Type</h3>
                             <div className="flex flex-col gap-2 p-3 bg-gray-100 rounded-lg">
                                 <label className="flex items-center p-3 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"><input type="radio" name="comparisonType" value="simple" checked={comparisonType === 'simple'} onChange={() => setComparisonType('simple')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 mr-3"/><div><span className="font-medium">Simple</span><p className="text-xs text-gray-500">Overall resemblance percentage.</p></div></label>
                                 <label className="flex items-center p-3 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"><input type="radio" name="comparisonType" value="detailed" checked={comparisonType === 'detailed'} onChange={() => setComparisonType('detailed')} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 mr-3"/><div><span className="font-medium">Detailed</span><p className="text-xs text-gray-500">Feature-by-feature resemblance.</p></div></label>
                             </div>
                        </div>
                    </div>
                    
                    <div className="text-center border-t pt-8 border-gray-200">
                        <button onClick={handleGenerate} disabled={isGenerateDisabled} className="w-full max-w-xs inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                            {isLoading ? 'Generating...' : 'Predict Baby\'s Face'}
                        </button>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
                    </div>
                </main>

                {showResult && (
                    <ResultDisplay
                        isLoading={isLoading}
                        images={generatedImages}
                        error={error}
                        onClose={() => setShowResult(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
