import React from 'react';

interface FacialFeatureVisualizerProps {
    highlightedFeature: string | null;
    featureColors: Record<string, string>;
}

export const FacialFeatureVisualizer: React.FC<FacialFeatureVisualizerProps> = ({ highlightedFeature, featureColors }) => {
    
    const getHighlightStyle = (feature: string) => ({
        fill: highlightedFeature === feature ? featureColors[feature] : 'transparent',
        opacity: highlightedFeature === feature ? 0.6 : 0,
        transition: 'fill 0.2s ease-in-out, opacity 0.2s ease-in-out',
    });

    return (
        <div className="relative w-full max-w-[250px] aspect-square" aria-hidden="true">
             <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Base Face Shape */}
                <path d="M 100, 190 C 40, 190, 10, 150, 10, 100 C 10, 50, 40, 10, 100, 10 C 160, 10, 190, 50, 190, 100 C 190, 150, 160, 190, 100, 190 Z" fill="#FFDFC4" stroke="#4A4A4A" strokeWidth="1.5" />

                {/* Highlight Layers */}
                <path d="M 40, 60 Q 100, 30, 160, 60 L 160, 20 Q 100, 5, 40, 20 Z" style={getHighlightStyle('forehead')} />
                <path d="M 40, 20 L 25, 50 L 15, 90 L 25, 110 L 40, 80 Z" style={getHighlightStyle('temples')} />
                <path d="M 160, 20 L 175, 50 L 185, 90 L 175, 110 L 160, 80 Z" style={getHighlightStyle('temples')} />
                <path d="M 175, 80 Q 195, 100, 175, 120 L 185, 110 L 185, 90 Z" style={getHighlightStyle('ears')} />
                <path d="M 25, 80 Q 5, 100, 25, 120 L 15, 110 L 15, 90 Z" style={getHighlightStyle('ears')} />
                <path d="M 60, 70 Q 100, 75, 140, 70 C 135, 60, 100, 60, 65, 60 Z" style={getHighlightStyle('eyebrows')} />
                <rect x="92" y="72" width="16" height="10" style={getHighlightStyle('glabella')} />
                <ellipse cx="75" cy="90" rx="18" ry="12" style={getHighlightStyle('eyes')} />
                <ellipse cx="125" cy="90" rx="18" ry="12" style={getHighlightStyle('eyes')} />
                <path d="M 55, 102 C 65, 112, 85, 112, 95, 102" style={{...getHighlightStyle('underEyes'), stroke: 'none', fill: getHighlightStyle('underEyes').fill }} />
                <path d="M 105, 102 C 115, 112, 135, 112, 145, 102" style={{...getHighlightStyle('underEyes'), stroke: 'none', fill: getHighlightStyle('underEyes').fill }} />
                <path d="M 90, 100 L 110, 100 L 105, 125 L 95, 125 Z" style={getHighlightStyle('nose')} />
                <path d="M 80, 125 C 85, 130, 85, 135, 80, 140" style={{ ...getHighlightStyle('nasolabialArea'), stroke: 'none', fill: getHighlightStyle('nasolabialArea').fill }} />
                <path d="M 120, 125 C 115, 130, 115, 135, 120, 140" style={{ ...getHighlightStyle('nasolabialArea'), stroke: 'none', fill: getHighlightStyle('nasolabialArea').fill }} />
                <ellipse cx="60" cy="130" rx="25" ry="30" style={getHighlightStyle('cheeks')} />
                <ellipse cx="140" cy="130" rx="25" ry="30" style={getHighlightStyle('cheeks')} />
                <path d="M 30,100 C 50,90 70,95 70,120 C 70,100 50,85 30,90 Z" style={getHighlightStyle('cheekbones')} />
                <path d="M 170,100 C 150,90 130,95 130,120 C 130,100 150,85 170,90 Z" style={getHighlightStyle('cheekbones')} />
                <path d="M 80, 155 Q 100, 165, 120, 155 Q 100, 160, 80, 155 Z" style={getHighlightStyle('mouth')} />
                <path d="M 60, 160 C 80, 185, 120, 185, 140, 160 Q 100, 175, 60, 160 Z" style={getHighlightStyle('jawline')} />

                {/* Features (drawn on top of highlights) */}
                <path d="M 25, 80 Q 5, 100, 25, 120" fill="#FFDFC4" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 175, 80 Q 195, 100, 175, 120" fill="#FFDFC4" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="75" cy="90" rx="15" ry="10" fill="white" stroke="#4A4A4A" strokeWidth="1.5" />
                <circle cx="75" cy="90" r="5" fill="#4A4A4A" />
                <ellipse cx="125" cy="90" rx="15" ry="10" fill="white" stroke="#4A4A4A" strokeWidth="1.5" />
                <circle cx="125" cy="90" r="5" fill="#4A4A4A" />
                <path d="M 60, 70 Q 75, 65, 90, 70" fill="none" stroke="#4A4A4A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 110, 70 Q 125, 65, 140, 70" fill="none" stroke="#4A4A4A" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 95, 110 C 100, 115, 105, 110" fill="none" stroke="#4A4A4A" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 85, 155 Q 100, 160, 115, 155" fill="none" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
                 <path d="M 60, 103 C 70, 108, 85, 108, 90, 103" fill="none" stroke="#FFAF87" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
                 <path d="M 110, 103 C 115, 108, 130, 108, 140, 103" fill="none" stroke="#FFAF87" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
             </svg>
        </div>
    );
};
