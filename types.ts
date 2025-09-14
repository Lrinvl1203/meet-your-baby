export interface ImageData {
    base64: string;
    mimeType: string;
    preview: string;
}

export interface ImageWithAge {
    id: string;
    imageData: ImageData;
    age?: string; // For father's or mother's separate photos
    fatherAge?: string; // For together photos
    motherAge?: string; // For together photos
}

export type Gender = 'Male' | 'Female';

export type ComparisonType = 'simple' | 'detailed';

export interface FacialFeaturePercentage {
    mom: number;
    dad: number;
}

export type DetailedPercentages = Record<string, FacialFeaturePercentage>;

export interface GenerateBabyFaceParams {
    fatherImages?: ImageWithAge[];
    motherImages?: ImageWithAge[];
    togetherImages?: ImageWithAge[];
    ethnicity?: string;
    nationality?: string;
    childNumber: number;
    gender: Gender;
    comparisonType: ComparisonType;
    age: string;
    numberOfImages: number;
    simplePercentages: FacialFeaturePercentage;
    detailedPercentages: DetailedPercentages;
}