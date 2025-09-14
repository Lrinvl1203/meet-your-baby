// AI Baby Face Predictor - Vanilla JavaScript Implementation
// Author: Claude Code SuperClaude
// Date: 2025-09-14

class BabyFacePredictor {
    constructor() {
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.inputMode = 'separate';
        this.generationMode = 'singleAge';
        this.comparisonType = 'simple';

        // Image storage
        this.fatherImages = [];
        this.motherImages = [];
        this.togetherImages = [];

        // Settings
        this.settings = {
            ethnicity: '',
            nationality: '',
            childNumber: 1,
            gender: 'Female',
            babyAge: 'Newborn',
            customAge: '',
            numberOfImages: 1,
            ageProgressionCount: 1,
            selectedPresetAges: [],
            simplePercentages: { mom: 50, dad: 50 },
            detailedPercentages: this.initializeDetailedPercentages()
        };

        this.presetAges = [
            '3 months old', '6 months old', '1 year old', '2 years old',
            '3 years old', '4 years old', '5 years old'
        ];

        this.facialFeatures = [
            { key: 'forehead', label: 'Forehead (이마)', color: '#ff6961' },
            { key: 'eyebrows', label: 'Eyebrows (눈썹)', color: '#ffb480' },
            { key: 'glabella', label: 'Glabella (미간)', color: '#f8f38d' },
            { key: 'eyes', label: 'Eyes (눈)', color: '#42d6a4' },
            { key: 'underEyes', label: 'Under Eyes (애교살)', color: '#08cad1' },
            { key: 'temples', label: 'Temples (관자놀이)', color: '#59adf6' },
            { key: 'nose', label: 'Nose (코)', color: '#9d94ff' },
            { key: 'nasolabialArea', label: 'Nasolabial Area (코 옆)', color: '#c780e8' },
            { key: 'cheeks', label: 'Cheeks (뺨)', color: '#ff92c2' },
            { key: 'cheekbones', label: 'Cheekbones (광대뼈)', color: '#a2d2ff' },
            { key: 'mouth', label: 'Mouth (입)', color: '#ffb3de' },
            { key: 'jawline', label: 'Jaw & Chin (턱)', color: '#ffdfb8' },
            { key: 'ears', label: 'Ears (귀)', color: '#b0e0e6' }
        ];

        this.isLoading = false;
        this.currentHighlightedFeature = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkApiKey();
        this.createPresetAgeButtons();
        this.createDetailedSliders();
        this.updateUI();
    }

    initializeDetailedPercentages() {
        const percentages = {};
        this.facialFeatures?.forEach(feature => {
            percentages[feature.key] = { mom: 50, dad: 50 };
        }) || {};
        return percentages;
    }

    setupEventListeners() {
        // API Key management
        document.getElementById('save-api-key').addEventListener('click', () => this.saveApiKey());
        document.getElementById('change-api-key').addEventListener('click', () => this.changeApiKey());
        document.getElementById('api-key-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });

        // Mode selection
        document.getElementById('separate-mode').addEventListener('click', () => this.setInputMode('separate'));
        document.getElementById('together-mode').addEventListener('click', () => this.setInputMode('together'));

        // File uploads
        document.getElementById('father-files').addEventListener('change', (e) => this.handleFileUpload(e, 'father'));
        document.getElementById('mother-files').addEventListener('change', (e) => this.handleFileUpload(e, 'mother'));
        document.getElementById('together-files').addEventListener('change', (e) => this.handleFileUpload(e, 'together'));

        // Settings
        document.getElementById('ethnicity').addEventListener('input', (e) => this.updateSetting('ethnicity', e.target.value));
        document.getElementById('nationality').addEventListener('input', (e) => this.updateSetting('nationality', e.target.value));
        document.getElementById('child-number').addEventListener('change', (e) => this.updateSetting('childNumber', parseInt(e.target.value) || 1));

        // Gender
        document.querySelectorAll('input[name="gender"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.updateSetting('gender', e.target.value));
        });

        // Generation mode
        document.getElementById('single-age-btn').addEventListener('click', () => this.setGenerationMode('singleAge'));
        document.getElementById('age-progression-btn').addEventListener('click', () => this.setGenerationMode('ageProgression'));

        // Age settings
        document.getElementById('baby-age').addEventListener('change', (e) => this.updateBabyAge(e.target.value));
        document.getElementById('custom-age').addEventListener('input', (e) => this.updateSetting('customAge', e.target.value));
        document.getElementById('num-images').addEventListener('change', (e) => this.updateSetting('numberOfImages', Math.max(1, Math.min(4, parseInt(e.target.value) || 1))));
        document.getElementById('age-progression-count').addEventListener('change', (e) => this.updateSetting('ageProgressionCount', Math.max(1, Math.min(2, parseInt(e.target.value) || 1))));

        // Comparison type
        document.querySelectorAll('input[name="comparison-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.setComparisonType(e.target.value));
        });

        // Simple resemblance slider
        document.getElementById('simple-slider').addEventListener('input', (e) => this.updateSimplePercentages(parseInt(e.target.value)));

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => this.generateBabyFace());

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('close-results').addEventListener('click', () => this.closeModal());
        document.getElementById('result-modal').addEventListener('click', (e) => {
            if (e.target.id === 'result-modal') this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    checkApiKey() {
        if (this.apiKey) {
            document.getElementById('api-key-section').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        } else {
            document.getElementById('api-key-section').style.display = 'block';
            document.getElementById('main-app').style.display = 'none';
        }
    }

    saveApiKey() {
        const input = document.getElementById('api-key-input');
        const key = input.value.trim();

        if (!key) {
            this.showError('Please enter your API key');
            return;
        }

        this.apiKey = key;
        localStorage.setItem('geminiApiKey', key);
        input.value = '';
        this.checkApiKey();
        this.clearError();
    }

    changeApiKey() {
        this.apiKey = '';
        localStorage.removeItem('geminiApiKey');
        this.checkApiKey();
    }

    setInputMode(mode) {
        this.inputMode = mode;

        // Update button states
        document.getElementById('separate-mode').classList.toggle('active', mode === 'separate');
        document.getElementById('together-mode').classList.toggle('active', mode === 'together');

        // Show/hide upload sections
        document.getElementById('separate-upload').style.display = mode === 'separate' ? 'grid' : 'none';
        document.getElementById('together-upload').style.display = mode === 'together' ? 'block' : 'none';

        this.updateGenerateButton();
    }

    setGenerationMode(mode) {
        this.generationMode = mode;

        // Update button states
        document.getElementById('single-age-btn').classList.toggle('active', mode === 'singleAge');
        document.getElementById('age-progression-btn').classList.toggle('active', mode === 'ageProgression');

        // Show/hide options
        document.getElementById('single-age-options').style.display = mode === 'singleAge' ? 'block' : 'none';
        document.getElementById('age-progression-options').style.display = mode === 'ageProgression' ? 'block' : 'none';

        this.updateGenerateButton();
    }

    setComparisonType(type) {
        this.comparisonType = type;

        // Show/hide resemblance sections
        document.getElementById('simple-resemblance').style.display = type === 'simple' ? 'block' : 'none';
        document.getElementById('detailed-resemblance').style.display = type === 'detailed' ? 'block' : 'none';
        document.getElementById('face-visualizer').style.display = type === 'detailed' ? 'block' : 'none';
    }

    updateBabyAge(age) {
        this.updateSetting('babyAge', age);
        document.getElementById('custom-age-input').style.display = age === 'custom' ? 'block' : 'none';
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.updateGenerateButton();
    }

    updateSimplePercentages(momPercentage) {
        this.settings.simplePercentages = {
            mom: momPercentage,
            dad: 100 - momPercentage
        };

        document.getElementById('mom-percentage').textContent = `Mom: ${momPercentage}%`;
        document.getElementById('dad-percentage').textContent = `Dad: ${100 - momPercentage}%`;
    }

    createPresetAgeButtons() {
        const container = document.getElementById('preset-ages');
        container.innerHTML = '';

        this.presetAges.forEach(age => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'preset-age-btn';
            button.textContent = age.replace(' old', '');
            button.addEventListener('click', () => this.togglePresetAge(age));
            container.appendChild(button);
        });
    }

    togglePresetAge(age) {
        const index = this.settings.selectedPresetAges.indexOf(age);
        if (index > -1) {
            this.settings.selectedPresetAges.splice(index, 1);
        } else {
            this.settings.selectedPresetAges.push(age);
        }

        // Update button states
        document.querySelectorAll('.preset-age-btn').forEach((btn, i) => {
            const ageValue = this.presetAges[i];
            btn.classList.toggle('selected', this.settings.selectedPresetAges.includes(ageValue));
        });

        this.updateGenerateButton();
    }

    createDetailedSliders() {
        const container = document.getElementById('detailed-sliders');
        container.innerHTML = '';

        this.facialFeatures.forEach(feature => {
            const sliderDiv = document.createElement('div');
            sliderDiv.className = 'detailed-slider-item';
            sliderDiv.dataset.feature = feature.key;

            sliderDiv.innerHTML = `
                <label class="detailed-slider-label">${feature.label}</label>
                <input type="range" min="0" max="100" value="50" class="slider" data-feature="${feature.key}">
                <div class="detailed-percentages">
                    <span class="dad-percent">Dad: 50%</span>
                    <span class="mom-percent">Mom: 50%</span>
                </div>
            `;

            // Add event listeners
            const slider = sliderDiv.querySelector('.slider');
            slider.addEventListener('input', (e) => this.updateDetailedPercentage(feature.key, parseInt(e.target.value)));

            sliderDiv.addEventListener('mouseenter', () => this.highlightFeature(feature.key, feature.color));
            sliderDiv.addEventListener('mouseleave', () => this.highlightFeature(null));

            container.appendChild(sliderDiv);
        });
    }

    updateDetailedPercentage(featureKey, momPercentage) {
        const dadPercentage = 100 - momPercentage;
        this.settings.detailedPercentages[featureKey] = { mom: momPercentage, dad: dadPercentage };

        const sliderItem = document.querySelector(`[data-feature="${featureKey}"]`);
        if (sliderItem) {
            sliderItem.querySelector('.mom-percent').textContent = `Mom: ${momPercentage}%`;
            sliderItem.querySelector('.dad-percent').textContent = `Dad: ${dadPercentage}%`;
        }
    }

    highlightFeature(featureKey, color = null) {
        // Remove previous highlights
        document.querySelectorAll('.detailed-slider-item').forEach(item => {
            item.classList.remove('highlighted');
        });

        document.querySelectorAll('.feature-highlight').forEach(highlight => {
            highlight.classList.remove('active');
            highlight.style.fill = 'transparent';
        });

        if (featureKey) {
            // Highlight slider
            const sliderItem = document.querySelector(`[data-feature="${featureKey}"]`);
            if (sliderItem) {
                sliderItem.classList.add('highlighted');
            }

            // Highlight face feature
            const faceHighlight = document.getElementById(`${featureKey}-highlight`);
            if (faceHighlight) {
                faceHighlight.classList.add('active');
                faceHighlight.style.fill = color || '#4f46e5';
            }
        }

        this.currentHighlightedFeature = featureKey;
    }

    async handleFileUpload(event, type) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const targetArray = type === 'father' ? this.fatherImages :
                           type === 'mother' ? this.motherImages :
                           this.togetherImages;

        for (let file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const imageData = await this.processImageFile(file);
                    const imageWithAge = {
                        id: `${Date.now()}-${Math.random()}`,
                        imageData,
                        age: '',
                        fatherAge: '',
                        motherAge: ''
                    };
                    targetArray.push(imageWithAge);
                } catch (error) {
                    console.error('Error processing image:', error);
                    this.showError('Failed to process image file');
                }
            }
        }

        this.renderPreviews(type);
        this.updateGenerateButton();
        event.target.value = '';
    }

    async processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                const base64String = result.split(',')[1];
                resolve({
                    base64: base64String,
                    mimeType: file.type,
                    preview: result
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    renderPreviews(type) {
        const containerId = `${type}-previews`;
        const container = document.getElementById(containerId);
        const images = type === 'father' ? this.fatherImages :
                      type === 'mother' ? this.motherImages :
                      this.togetherImages;

        container.innerHTML = '';

        images.forEach(image => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'preview-item';

            const img = document.createElement('img');
            img.src = image.imageData.preview;
            img.className = 'preview-image';
            img.alt = 'preview';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'preview-content';

            if (type === 'together') {
                contentDiv.innerHTML = `
                    <div class="age-input-group">
                        <div class="age-input-double">
                            <label class="text-xs font-medium text-gray-500">Father's Age</label>
                            <input type="number" value="${image.fatherAge}" placeholder="e.g., 32"
                                   class="form-input" onchange="app.updateImageAge('${image.id}', 'fatherAge', this.value)">
                        </div>
                        <div class="age-input-double">
                            <label class="text-xs font-medium text-gray-500">Mother's Age</label>
                            <input type="number" value="${image.motherAge}" placeholder="e.g., 30"
                                   class="form-input" onchange="app.updateImageAge('${image.id}', 'motherAge', this.value)">
                        </div>
                    </div>
                `;
            } else {
                contentDiv.innerHTML = `
                    <div class="age-input-single">
                        <label class="text-xs font-medium text-gray-500">Age in this photo</label>
                        <input type="number" value="${image.age}" placeholder="e.g., 28"
                               class="form-input" onchange="app.updateImageAge('${image.id}', 'age', this.value)">
                    </div>
                `;
            }

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            removeBtn.onclick = () => this.removeImage(image.id, type);

            previewDiv.appendChild(img);
            previewDiv.appendChild(contentDiv);
            previewDiv.appendChild(removeBtn);
            container.appendChild(previewDiv);
        });
    }

    updateImageAge(imageId, ageType, value) {
        const allImages = [...this.fatherImages, ...this.motherImages, ...this.togetherImages];
        const image = allImages.find(img => img.id === imageId);
        if (image) {
            image[ageType] = value;
        }
    }

    removeImage(imageId, type) {
        if (type === 'father') {
            this.fatherImages = this.fatherImages.filter(img => img.id !== imageId);
        } else if (type === 'mother') {
            this.motherImages = this.motherImages.filter(img => img.id !== imageId);
        } else {
            this.togetherImages = this.togetherImages.filter(img => img.id !== imageId);
        }

        this.renderPreviews(type);
        this.updateGenerateButton();
    }

    updateGenerateButton() {
        const button = document.getElementById('generate-btn');
        const hasRequiredImages = (this.inputMode === 'separate' && this.fatherImages.length > 0 && this.motherImages.length > 0) ||
                                 (this.inputMode === 'together' && this.togetherImages.length > 0);

        const hasAgeProgression = this.generationMode !== 'ageProgression' || this.settings.selectedPresetAges.length > 0;

        const isEnabled = hasRequiredImages && hasAgeProgression && !this.isLoading;

        button.disabled = !isEnabled;
        button.querySelector('span').textContent = this.isLoading ? 'Generating...' : "Predict Baby's Face";
    }

    async generateBabyFace() {
        if (this.isLoading) return;

        // Validate inputs
        if ((this.inputMode === 'separate' && (this.fatherImages.length === 0 || this.motherImages.length === 0)) ||
            (this.inputMode === 'together' && this.togetherImages.length === 0)) {
            this.showError('Please upload at least one photo for each required category.');
            return;
        }

        if (this.generationMode === 'ageProgression' && this.settings.selectedPresetAges.length === 0) {
            this.showError('Please select at least one age for age progression.');
            return;
        }

        this.isLoading = true;
        this.clearError();
        this.showModal();
        this.updateGenerateButton();

        try {
            let generatedImages = [];

            if (this.generationMode === 'singleAge') {
                const age = this.settings.babyAge === 'custom' ?
                           `${this.settings.customAge} years old` :
                           this.settings.babyAge;

                const results = await this.callGeminiAPI({
                    age,
                    numberOfImages: this.settings.numberOfImages
                });
                generatedImages = results;
            } else {
                // Age progression mode
                for (const age of this.settings.selectedPresetAges) {
                    const resultsForAge = await this.callGeminiAPI({
                        age,
                        numberOfImages: this.settings.ageProgressionCount
                    });
                    generatedImages.push(...resultsForAge);

                    // Update results progressively
                    this.displayResults(generatedImages);
                }
            }

            this.displayResults(generatedImages);

        } catch (error) {
            console.error('Generation error:', error);
            this.showErrorState(error.message || 'Failed to generate baby face. Please try again.');
        } finally {
            this.isLoading = false;
            this.updateGenerateButton();
        }
    }

    async callGeminiAPI(params) {
        const { age, numberOfImages } = params;

        const prompt = this.buildPrompt(age);
        const parts = [];

        // Add images
        if (this.inputMode === 'together' && this.togetherImages.length > 0) {
            this.togetherImages.forEach(img => {
                parts.push({
                    inline_data: {
                        data: img.imageData.base64,
                        mime_type: img.imageData.mimeType
                    }
                });

                let ageText = "This photo contains both the father and mother";
                if (img.fatherAge && img.motherAge) {
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
        } else if (this.fatherImages.length > 0 && this.motherImages.length > 0) {
            this.fatherImages.forEach(img => {
                parts.push({
                    inline_data: {
                        data: img.imageData.base64,
                        mime_type: img.imageData.mimeType
                    }
                });
                parts.push({ text: `This is the father at age ${img.age || 'unknown'}.` });
            });

            this.motherImages.forEach(img => {
                parts.push({
                    inline_data: {
                        data: img.imageData.base64,
                        mime_type: img.imageData.mimeType
                    }
                });
                parts.push({ text: `This is the mother at age ${img.age || 'unknown'}.` });
            });
        }

        parts.push({ text: prompt });

        const generatedImages = [];

        for (let i = 0; i < numberOfImages; i++) {
            // Rate limiting: 요청 간 최소 간격 (4초)
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{ parts }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);

                // 할당량 초과 에러 특별 처리
                if (response.status === 429 || errorText.includes('quota') || errorText.includes('rate limit') || errorText.includes('billing')) {
                    throw new Error(`⚠️ API 할당량 초과!\n\n해결방법:\n1. 새 API 키 생성 (Google AI Studio)\n2. 24시간 후 재시도\n3. 유료 플랜 고려\n\n자세한 정보: https://ai.google.dev/gemini-api/docs/rate-limits`);
                }

                let error;
                try {
                    error = JSON.parse(errorText);
                } catch {
                    error = { error: { message: errorText } };
                }
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
                throw new Error('No image generated by the model');
            }

            let imageFound = false;
            for (const part of data.candidates[0].content.parts) {
                if (part.inline_data) {
                    generatedImages.push(`data:${part.inline_data.mime_type};base64,${part.inline_data.data}`);
                    imageFound = true;
                    break;
                }
            }

            if (!imageFound) {
                // Check for text response
                for (const part of data.candidates[0].content.parts) {
                    if (part.text) {
                        throw new Error(`The model returned a text response instead of an image: ${part.text}`);
                    }
                }
                throw new Error('No image was generated by the model for one of the requests.');
            }
        }

        return generatedImages;
    }

    buildPrompt(age) {
        let prompt = `Analyze the provided photos of a father and a mother, taken at various ages. Based on all their facial features across these different life stages, generate a highly realistic portrait of their child.`;

        const parentDetails = [];
        if (this.settings.ethnicity) parentDetails.push(`- **Ethnicity/Race:** ${this.settings.ethnicity}`);
        if (this.settings.nationality) parentDetails.push(`- **Nationality:** ${this.settings.nationality}`);

        if (parentDetails.length > 0) {
            prompt += `\n\n**Parent's Details:**\n${parentDetails.join('\n')}`;
        }

        const childNumber = this.settings.childNumber;
        const ordinal = childNumber === 1 ? '1st' :
                       childNumber === 2 ? '2nd' :
                       childNumber === 3 ? '3rd' :
                       `${childNumber}th`;

        prompt += `

**Child's Details:**
- **Gender:** ${this.settings.gender}
- **Age:** ${age}
- **This is their:** ${ordinal} child.

**Resemblance Instructions:**
`;

        if (this.comparisonType === 'simple') {
            prompt += `- The child should have an overall resemblance of **${this.settings.simplePercentages.mom}% to the mother** and **${this.settings.simplePercentages.dad}% to the father**. Blend their features accordingly to achieve this overall mix.`;
        } else {
            const featureKeyToNameMap = {
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
                ears: 'Ears'
            };

            prompt += 'Create the child\'s face by combining the parents\' features with the following specific percentages for each facial area:\n';

            this.facialFeatures.forEach(feature => {
                const featureName = featureKeyToNameMap[feature.key] || feature.key;
                const percentages = this.settings.detailedPercentages[feature.key];
                if (percentages) {
                    prompt += `- **${featureName}:** ${percentages.mom}% Mother's features, ${percentages.dad}% Father's features.\n`;
                }
            });
        }

        prompt += "\nSynthesize all this information to create a cohesive and natural-looking portrait of the child as described. Do not include any text, labels, or annotations on the image itself. The output should be only the child's face."

        return prompt;
    }

    showModal() {
        document.getElementById('result-modal').style.display = 'flex';
        document.getElementById('loading-state').style.display = 'block';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('results-grid').style.display = 'none';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('result-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showErrorState(message) {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('results-grid').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
        document.getElementById('error-details').textContent = message;
    }

    displayResults(images) {
        if (!images || images.length === 0) return;

        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('results-grid').style.display = 'grid';

        const resultsGrid = document.getElementById('results-grid');
        resultsGrid.className = `results-grid ${images.length === 1 ? 'single' : 'multiple'}`;
        resultsGrid.innerHTML = '';

        images.forEach((image, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const img = document.createElement('img');
            img.src = image;
            img.alt = `Generated baby ${index + 1}`;
            img.className = 'result-image';

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.innerHTML = '<i class="fas fa-download mr-2"></i>Download Variation ' + (index + 1);
            downloadBtn.onclick = () => this.downloadImage(image, index);

            resultItem.appendChild(img);
            resultItem.appendChild(downloadBtn);
            resultsGrid.appendChild(resultItem);
        });
    }

    downloadImage(imageDataUrl, index) {
        const link = document.createElement('a');
        link.href = imageDataUrl;
        const fileExtension = imageDataUrl.split(';')[0].split('/')[1] || 'png';
        link.download = `baby-prediction-${index + 1}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }

    clearError() {
        const errorElement = document.getElementById('error-message');
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }

    updateUI() {
        this.updateGenerateButton();
        // Set initial states
        document.querySelector('input[name="gender"][value="Female"]').checked = true;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BabyFacePredictor();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BabyFacePredictor;
}