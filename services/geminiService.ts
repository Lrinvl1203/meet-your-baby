
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateBabyFaceParams, DetailedPercentages, ImageWithAge } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const featureKeyToNameMap: Record<string, string> = {
    forehead: 'Forehead',
    eyebrows: 'Eyebrows',
    glabella: 'Glabella (between eyebrows)',
    eyes: 'Eyes (shape, eyelids, color)',
    underEyes: 'Under-eye Area (Aegyo Sal)',
    temples: 'Temples',
    nose: 'Nose (bridge, tip, nostrils)',
    nasolabialArea: 'Nasolabial Area (sides of nose)',
    cheeks: 'Cheeks',
    cheekbones: 'Cheekbones',
    mouth: 'Mouth (lips, philtrum, corners)',
    jawline: 'Jawline and Chin',
    ears: 'Ears',
};


const buildPrompt = (params: GenerateBabyFaceParams): string => {
    const { gender, age, childNumber, comparisonType, simplePercentages, detailedPercentages, ethnicity, nationality } = params;

    let prompt = `Analyze the provided photos of a father and a mother, taken at various ages. Based on all their facial features across these different life stages, generate a highly realistic portrait of their child.`;

    const parentDetails = [];
    if (ethnicity) parentDetails.push(`- **Ethnicity/Race:** ${ethnicity}`);
    if (nationality) parentDetails.push(`- **Nationality:** ${nationality}`);

    if (parentDetails.length > 0) {
        prompt += `\n\n**Parent's Details:**\n${parentDetails.join('\n')}`;
    }

    prompt += `

**Child's Details:**
- **Gender:** ${gender}
- **Age:** ${age}
- **This is their:** ${childNumber === 1 ? '1st' : childNumber === 2 ? '2nd' : childNumber === 3 ? '3rd' : `${childNumber}th`} child.

**Resemblance Instructions:**
`;

    if (comparisonType === 'simple') {
        prompt += `- The child should have an overall resemblance of **${simplePercentages.mom}% to the mother** and **${simplePercentages.dad}% to the father**. Blend their features accordingly to achieve this overall mix.`;
    } else {
        prompt += 'Create the child\'s face by combining the parents\' features with the following specific percentages for each facial area:\n';
        for (const feature in detailedPercentages) {
            const featureName = featureKeyToNameMap[feature] || feature;
            const { mom, dad } = detailedPercentages[feature];
            prompt += `- **${featureName}:** ${mom}% Mother's features, ${dad}% Father's features.\n`;
        }
    }
    
    prompt += "\nSynthesize all this information to create a cohesive and natural-looking portrait of the child as described. Do not include any text, labels, or annotations on the image itself. The output should be only the child's face."

    return prompt;
};

export const generateBabyFace = async (params: GenerateBabyFaceParams): Promise<string[]> => {
    const { fatherImages, motherImages, togetherImages, numberOfImages } = params;
    
    const finalPrompt = buildPrompt(params);
    const parts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [];

    if (togetherImages && togetherImages.length > 0) {
        togetherImages.forEach(img => {
            parts.push({
                inlineData: { data: img.imageData.base64, mimeType: img.imageData.mimeType },
            });
            let ageText = "This photo contains both the father and mother";
            if(img.fatherAge && img.motherAge) {
                ageText += `, taken when the father was around age ${img.fatherAge} and the mother was around age ${img.motherAge}.`;
            } else if (img.fatherAge) {
                ageText += `, taken when the father was around age ${img.fatherAge}.`;
            } else if (img.motherAge) {
                ageText += `, taken when the mother was around age ${img.motherAge}.`;
            } else {
                ageText += '.';
            }
            parts.push({ text: ageText });
        });
    } else if (fatherImages && fatherImages.length > 0 && motherImages && motherImages.length > 0) {
        fatherImages.forEach(img => {
            parts.push({
                inlineData: { data: img.imageData.base64, mimeType: img.imageData.mimeType },
            });
            parts.push({ text: `This is the father at age ${img.age || 'unknown'}.` });
        });
        motherImages.forEach(img => {
            parts.push({
                inlineData: { data: img.imageData.base64, mimeType: img.imageData.mimeType },
            });
            parts.push({ text: `This is the mother at age ${img.age || 'unknown'}.` });
        });
    } else {
        throw new Error('You must provide photos for the selected mode.');
    }

    parts.push({ text: finalPrompt });

    try {
        const generatedImages: string[] = [];
        for (let i = 0; i < (numberOfImages || 1); i++) {
            const response = await ai.models.generateContent({
                model: 'models/gemini-2.5-flash-image-preview',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            let imageFound = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    imageFound = true;
                    break; 
                }
            }

            if (!imageFound) {
                 for (const part of response.candidates[0].content.parts) {
                    if(part.text) {
                        throw new Error(`The model returned a text response instead of an image: ${part.text}`);
                    }
                }
                throw new Error('No image was generated by the model for one of the requests.');
            }
        }
        
        return generatedImages;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error('Failed to generate baby face. The model may be unable to process the request.');
    }
};
