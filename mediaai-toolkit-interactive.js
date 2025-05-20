/**
 * MediaAI Toolkit Interactive JavaScript
 * Global JavaScript file to handle interactive elements across all toolkit components
 * 
 * @author Himanshu Joshi
 * @version 1.0.0
 * @copyright 2025
 */

// Main MediaAI Toolkit namespace
const MediaAIToolkit = {
    // Core configuration
    config: {
        apiEndpoint: null,  // Set to actual API endpoint if needed
        saveDataLocally: true,
        defaultTransitionSpeed: 300, // ms
        persistenceKey: 'mediaai_toolkit_data',
        debug: false
    },
    
    // Shared state across tools
    state: {
        currentTool: null,
        assessmentData: {},
        architectureData: {},
        roadmapData: {},
        roiData: {},
        // Track user progress through the toolkit
        userProgress: {
            assessmentComplete: false,
            architectureComplete: false,
            roadmapComplete: false,
            roiComplete: false
        }
    },
    
    // Initialization function
    init: function() {
        this.log('Initializing MediaAI Toolkit...');
        this.loadSavedData();
        this.detectCurrentTool();
        this.setupCommonUI();
        this.initializeCurrentTool();
        
        // Set up navigation events
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });
        
        this.log('MediaAI Toolkit initialized');
    },
    
    // Detect which tool is currently active based on URL or page content
    detectCurrentTool: function() {
        const path = window.location.pathname;
        
        if (path.includes('readiness-assessment')) {
            this.state.currentTool = 'assessment';
        } else if (path.includes('architecture-framework')) {
            this.state.currentTool = 'architecture';
        } else if (path.includes('roadmap-generator')) {
            this.state.currentTool = 'roadmap';
        } else if (path.includes('roi-calculator')) {
            this.state.currentTool = 'roi';
        } else {
            // Default to assessment if can't determine
            this.state.currentTool = 'assessment';
        }
        
        this.log('Current tool detected:', this.state.currentTool);
    },
    
    // Set up UI elements common to all tools
    setupCommonUI: function() {
        // Highlight current tool in navigation
        const navItems = document.querySelectorAll('nav a');
        navItems.forEach(item => {
            item.classList.remove('text-white');
            item.classList.add('text-blue-200', 'text-green-200', 'text-purple-200');
        });
        
        const currentNav = document.querySelector(`nav a[href*="${this.state.currentTool}"]`);
        if (currentNav) {
            currentNav.classList.remove('text-blue-200', 'text-green-200', 'text-purple-200');
            currentNav.classList.add('text-white');
        }
        
        // Setup common event listeners
        document.querySelectorAll('.pulse-btn').forEach(btn => {
            btn.addEventListener('click', this.handleButtonClick.bind(this));
        });
        
        // Setup tooltips
        this.setupTooltips();
        
        // Update progress indicators if they exist
        this.updateProgressIndicators();
    },
    
    // Initialize the current tool
    initializeCurrentTool: function() {
        switch(this.state.currentTool) {
            case 'assessment':
                this.AssessmentTool.init();
                break;
            case 'architecture':
                this.ArchitectureTool.init();
                break;
            case 'roadmap':
                this.RoadmapTool.init();
                break;
            case 'roi':
                this.ROITool.init();
                break;
        }
    },
    
    // Handle navigation between tools
    handleNavigation: function(event) {
        const target = event.target.closest('a');
        if (!target) return;
        
        // Save current state before navigation
        this.saveCurrentState();
        
        // If not preventing default, allow normal navigation
        // Otherwise implement custom transition here
    },
    
    // Generic button click handler
    handleButtonClick: function(event) {
        const button = event.currentTarget;
        const action = button.getAttribute('data-action');
        
        if (!action) return;
        
        this.log('Button clicked:', action);
        
        switch(action) {
            case 'calculate-roi':
                this.ROITool.calculateROI();
                break;
            case 'generate-roadmap':
                this.RoadmapTool.generateRoadmap();
                break;
            case 'continue-architecture':
                this.ArchitectureTool.proceedToNextStep();
                break;
            case 'begin-assessment':
                this.AssessmentTool.startAssessment();
                break;
            case 'download-report':
                this.generateReport();
                break;
            case 'save-progress':
                this.saveCurrentState(true); // with feedback
                break;
            case 'reset-form':
                this.resetCurrentTool();
                break;
            default:
                // Tool-specific actions can be handled in their own modules
                this.handleToolSpecificAction(action);
        }
    },
    
    // Handle tool-specific action
    handleToolSpecificAction: function(action) {
        switch(this.state.currentTool) {
            case 'assessment':
                this.AssessmentTool.handleAction(action);
                break;
            case 'architecture':
                this.ArchitectureTool.handleAction(action);
                break;
            case 'roadmap':
                this.RoadmapTool.handleAction(action);
                break;
            case 'roi':
                this.ROITool.handleAction(action);
                break;
        }
    },
    
    // Update progress indicators throughout the toolkit
    updateProgressIndicators: function() {
        // Update navigation to show which tools are completed
        const navItems = document.querySelectorAll('nav a');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            let isComplete = false;
            
            if (href.includes('readiness-assessment')) {
                isComplete = this.state.userProgress.assessmentComplete;
            } else if (href.includes('architecture-framework')) {
                isComplete = this.state.userProgress.architectureComplete;
            } else if (href.includes('roadmap-generator')) {
                isComplete = this.state.userProgress.roadmapComplete;
            } else if (href.includes('roi-calculator')) {
                isComplete = this.state.userProgress.roiComplete;
            }
            
            if (isComplete) {
                item.classList.add('completed');
                // Add a checkmark or other indicator
                if (!item.querySelector('.completion-indicator')) {
                    const indicator = document.createElement('span');
                    indicator.className = 'completion-indicator ml-2';
                    indicator.innerHTML = '<i class="fas fa-check-circle"></i>';
                    item.appendChild(indicator);
                }
            }
        });
        
        // Update progress bars if they exist
        const progressBars = document.querySelectorAll('.progress-completed');
        progressBars.forEach(bar => {
            const progressStep = bar.closest('[data-progress-step]');
            if (!progressStep) return;
            
            const step = progressStep.getAttribute('data-progress-step');
            const progress = this.getProgressForStep(step);
            bar.style.width = `${progress}%`;
        });
    },
    
    // Get progress percentage for a specific step
    getProgressForStep: function(step) {
        switch(this.state.currentTool) {
            case 'assessment':
                return this.AssessmentTool.getStepProgress(step);
            case 'architecture':
                return this.ArchitectureTool.getStepProgress(step);
            case 'roadmap':
                return this.RoadmapTool.getStepProgress(step);
            case 'roi':
                return this.ROITool.getStepProgress(step);
            default:
                return 0;
        }
    },
    
    // Save the current state
    saveCurrentState: function(showFeedback = false) {
        switch(this.state.currentTool) {
            case 'assessment':
                this.state.assessmentData = this.AssessmentTool.getCurrentData();
                this.state.userProgress.assessmentComplete = this.AssessmentTool.isComplete();
                break;
            case 'architecture':
                this.state.architectureData = this.ArchitectureTool.getCurrentData();
                this.state.userProgress.architectureComplete = this.ArchitectureTool.isComplete();
                break;
            case 'roadmap':
                this.state.roadmapData = this.RoadmapTool.getCurrentData();
                this.state.userProgress.roadmapComplete = this.RoadmapTool.isComplete();
                break;
            case 'roi':
                this.state.roiData = this.ROITool.getCurrentData();
                this.state.userProgress.roiComplete = this.ROITool.isComplete();
                break;
        }
        
        if (this.config.saveDataLocally) {
            this.saveDataToLocalStorage();
        }
        
        if (showFeedback) {
            this.showNotification('Progress saved successfully', 'success');
        }
        
        this.log('State saved for tool:', this.state.currentTool);
    },
    
    // Load saved data
    loadSavedData: function() {
        if (!this.config.saveDataLocally) return;
        
        try {
            const savedData = localStorage.getItem(this.config.persistenceKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Merge saved data into current state
                this.state.assessmentData = parsedData.assessmentData || {};
                this.state.architectureData = parsedData.architectureData || {};
                this.state.roadmapData = parsedData.roadmapData || {};
                this.state.roiData = parsedData.roiData || {};
                this.state.userProgress = parsedData.userProgress || this.state.userProgress;
                
                this.log('Loaded saved data from local storage');
            }
        } catch (error) {
            this.log('Error loading saved data:', error);
        }
    },
    
    // Save data to local storage
    saveDataToLocalStorage: function() {
        try {
            const dataToSave = {
                assessmentData: this.state.assessmentData,
                architectureData: this.state.architectureData,
                roadmapData: this.state.roadmapData,
                roiData: this.state.roiData,
                userProgress: this.state.userProgress
            };
            
            localStorage.setItem(this.config.persistenceKey, JSON.stringify(dataToSave));
            this.log('Data saved to local storage');
        } catch (error) {
            this.log('Error saving data:', error);
        }
    },
    
    // Reset the current tool
    resetCurrentTool: function() {
        if (!confirm('Are you sure you want to reset all your progress for this tool? This action cannot be undone.')) {
            return;
        }
        
        switch(this.state.currentTool) {
            case 'assessment':
                this.state.assessmentData = {};
                this.state.userProgress.assessmentComplete = false;
                this.AssessmentTool.reset();
                break;
            case 'architecture':
                this.state.architectureData = {};
                this.state.userProgress.architectureComplete = false;
                this.ArchitectureTool.reset();
                break;
            case 'roadmap':
                this.state.roadmapData = {};
                this.state.userProgress.roadmapComplete = false;
                this.RoadmapTool.reset();
                break;
            case 'roi':
                this.state.roiData = {};
                this.state.userProgress.roiComplete = false;
                this.ROITool.reset();
                break;
        }
        
        this.saveDataToLocalStorage();
        this.showNotification('Tool reset successfully', 'success');
        location.reload();
    },
    
    // Generate comprehensive report across all tools
    generateReport: function() {
        this.log('Generating comprehensive report');
        
        let reportData = {
            assessment: this.state.assessmentData,
            architecture: this.state.architectureData,
            roadmap: this.state.roadmapData,
            roi: this.state.roiData,
            timestamp: new Date().toISOString(),
            progress: this.state.userProgress
        };
        
        // In a real implementation, this might generate a PDF or other document format
        // For now, we'll just create a JSON file and prompt download
        
        const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(reportBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mediaai-toolkit-report-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report generated and downloaded', 'success');
    },
    
    // Setup tooltips
    setupTooltips: function() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltipText = this.getAttribute('data-tooltip');
                
                const tooltip = document.createElement('div');
                tooltip.className = 'absolute z-50 p-2 bg-gray-800 text-white text-xs rounded shadow-lg';
                tooltip.textContent = tooltipText;
                tooltip.style.maxWidth = '250px';
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
                tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
                
                this.addEventListener('mouseleave', function() {
                    document.body.removeChild(tooltip);
                }, { once: true });
            });
        });
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        
        let bgColor = 'bg-blue-500';
        let icon = 'fas fa-info-circle';
        
        if (type === 'success') {
            bgColor = 'bg-green-500';
            icon = 'fas fa-check-circle';
        } else if (type === 'error') {
            bgColor = 'bg-red-500';
            icon = 'fas fa-exclamation-circle';
        } else if (type === 'warning') {
            bgColor = 'bg-yellow-500';
            icon = 'fas fa-exclamation-triangle';
        }
        
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${bgColor} text-white flex items-center z-50 transition-opacity duration-500`;
        notification.innerHTML = `
            <i class="${icon} mr-2"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Fade out and remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    },
    
    // Logger function
    log: function(...args) {
        if (this.config.debug) {
            console.log('[MediaAI Toolkit]', ...args);
        }
    },
    
    // Helper functions
    helpers: {
        // Format currency
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        },
        
        // Format percentage
        formatPercentage: function(percent) {
            return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(percent / 100);
        },
        
        // Format date
        formatDate: function(date) {
            return new Intl.DateTimeFormat('en-US').format(new Date(date));
        },
        
        // Deep clone an object
        deepClone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        
        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }
    },
    
    /**
     * Readiness Assessment Tool Module
     */
    AssessmentTool: {
        // Current assessment state
        data: {
            currentCategory: 'technical', // Default category
            categories: {
                technical: { score: 0, completed: false },
                data: { score: 0, completed: false },
                organizational: { score: 0, completed: false },
                useCase: { score: 0, completed: false },
                governance: { score: 0, completed: false }
            },
            currentStep: 1,
            totalSteps: 15,
            overallScore: 0
        },
        
        // Initialize the assessment tool
        init: function() {
            MediaAIToolkit.log('Initializing Assessment Tool');
            
            // Load any previously saved data
            this.loadSavedData();
            
            // Setup event handlers for assessment-specific interactions
            this.setupEventHandlers();
            
            // Update UI based on current state
            this.updateUI();
        },
        
        // Setup assessment-specific event handlers
        setupEventHandlers: function() {
            // Category selection
            document.querySelectorAll('.category-nav button').forEach(button => {
                button.addEventListener('click', this.handleCategoryClick.bind(this));
            });
            
            // Answer selection
            document.querySelectorAll('.answer-option').forEach(option => {
                option.addEventListener('click', this.handleAnswerSelection.bind(this));
            });
            
            // Navigation buttons
            document.querySelectorAll('.nav-button').forEach(button => {
                button.addEventListener('click', this.handleNavigation.bind(this));
            });
        },
        
        // Handle category click
        handleCategoryClick: function(event) {
            const category = event.currentTarget.getAttribute('data-category');
            this.data.currentCategory = category;
            this.updateUI();
        },
        
        // Handle answer selection
        handleAnswerSelection: function(event) {
            const option = event.currentTarget;
            const questionId = option.closest('.question-container').getAttribute('data-question-id');
            const value = parseInt(option.getAttribute('data-value'));
            
            // Store the answer
            if (!this.data.answers) {
                this.data.answers = {};
            }
            this.data.answers[questionId] = value;
            
            // Update UI to show selection
            const container = option.closest('.question-container');
            container.querySelectorAll('.answer-option').forEach(opt => {
                opt.classList.remove('selected', 'bg-blue-50', 'border-blue-500');
                opt.classList.add('border-gray-200');
            });
            
            option.classList.add('selected', 'bg-blue-50', 'border-blue-500');
            option.classList.remove('border-gray-200');
            
            // Calculate scores
            this.calculateScores();
        },
        
        // Handle navigation buttons
        handleNavigation: function(event) {
            const button = event.currentTarget;
            const action = button.getAttribute('data-action');
            
            if (action === 'next') {
                this.nextQuestion();
            } else if (action === 'prev') {
                this.prevQuestion();
            } else if (action === 'submit') {
                this.submitAssessment();
            }
        },
        
        // Go to next question
        nextQuestion: function() {
            if (this.data.currentStep < this.data.totalSteps) {
                this.data.currentStep++;
                this.updateUI();
            }
        },
        
        // Go to previous question
        prevQuestion: function() {
            if (this.data.currentStep > 1) {
                this.data.currentStep--;
                this.updateUI();
            }
        },
        
        // Submit assessment
        submitAssessment: function() {
            this.calculateScores();
            this.data.completed = true;
            MediaAIToolkit.state.userProgress.assessmentComplete = true;
            MediaAIToolkit.saveCurrentState();
            
            // Show results
            this.showResults();
        },
        
        // Calculate scores based on answers
        calculateScores: function() {
            if (!this.data.answers) return;
            
            const categoryScores = {
                technical: { total: 0, count: 0 },
                data: { total: 0, count: 0 },
                organizational: { total: 0, count: 0 },
                useCase: { total: 0, count: 0 },
                governance: { total: 0, count: 0 }
            };
            
            // Question categorization mapping
            const questionCategories = {
                'q1': 'technical', 'q2': 'technical', 'q3': 'technical',
                'q4': 'data', 'q5': 'data', 'q6': 'data',
                'q7': 'organizational', 'q8': 'organizational', 'q9': 'organizational',
                'q10': 'useCase', 'q11': 'useCase', 'q12': 'useCase',
                'q13': 'governance', 'q14': 'governance', 'q15': 'governance'
            };
            
            // Calculate scores by category
            Object.entries(this.data.answers).forEach(([questionId, value]) => {
                const category = questionCategories[questionId];
                if (category) {
                    categoryScores[category].total += value;
                    categoryScores[category].count++;
                }
            });
            
            // Calculate average scores for each category
            Object.keys(this.data.categories).forEach(category => {
                if (categoryScores[category].count > 0) {
                    this.data.categories[category].score = 
                        (categoryScores[category].total / categoryScores[category].count).toFixed(1);
                    this.data.categories[category].completed = 
                        (categoryScores[category].count >= 3); // All questions in category answered
                }
            });
            
            // Calculate overall score
            let totalScore = 0;
            let totalCategories = 0;
            
            Object.values(this.data.categories).forEach(category => {
                if (category.completed) {
                    totalScore += parseFloat(category.score);
                    totalCategories++;
                }
            });
            
            if (totalCategories > 0) {
                this.data.overallScore = (totalScore / totalCategories).toFixed(1);
            }
            
            // Update progress
            this.updateProgressBars();
        },
        
        // Update the UI based on current state
        updateUI: function() {
            // Show current question and hide others
            document.querySelectorAll('.question-container').forEach(container => {
                const step = parseInt(container.getAttribute('data-step'));
                if (step === this.data.currentStep) {
                    container.classList.remove('hidden');
                } else {
                    container.classList.add('hidden');
                }
            });
            
            // Update progress indicator
            const progressPercentage = (this.data.currentStep / this.data.totalSteps) * 100;
            document.querySelector('.progress-indicator').style.width = `${progressPercentage}%`;
            document.querySelector('.step-count').textContent = `Step ${this.data.currentStep} of ${this.data.totalSteps}`;
            
            // Update category navigation
            document.querySelectorAll('.category-nav button').forEach(button => {
                const category = button.getAttribute('data-category');
                if (category === this.data.currentCategory) {
                    button.classList.add('active', 'bg-blue-100', 'text-blue-800');
                    button.classList.remove('bg-gray-100', 'text-gray-700');
                } else {
                    button.classList.remove('active', 'bg-blue-100', 'text-blue-800');
                    button.classList.add('bg-gray-100', 'text-gray-700');
                }
            });
            
            // Update answers display based on saved data
            if (this.data.answers) {
                document.querySelectorAll('.answer-option').forEach(option => {
                    const questionId = option.closest('.question-container').getAttribute('data-question-id');
                    const value = parseInt(option.getAttribute('data-value'));
                    
                    if (this.data.answers[questionId] === value) {
                        option.classList.add('selected', 'bg-blue-50', 'border-blue-500');
                        option.classList.remove('border-gray-200');
                    }
                });
            }
            
            // Update navigation buttons
            const prevButton = document.querySelector('.nav-button[data-action="prev"]');
            const nextButton = document.querySelector('.nav-button[data-action="next"]');
            const submitButton = document.querySelector('.nav-button[data-action="submit"]');
            
            if (prevButton) {
                prevButton.disabled = (this.data.currentStep === 1);
                prevButton.classList.toggle('opacity-50', this.data.currentStep === 1);
            }
            
            if (nextButton) {
                nextButton.classList.toggle('hidden', this.data.currentStep === this.data.totalSteps);
            }
            
            if (submitButton) {
                submitButton.classList.toggle('hidden', this.data.currentStep !== this.data.totalSteps);
            }
        },
        
        // Update progress bars
        updateProgressBars: function() {
            Object.entries(this.data.categories).forEach(([category, data]) => {
                const progressBar = document.querySelector(`.${category}-progress`);
                if (progressBar) {
                    progressBar.style.width = `${(data.score / 5) * 100}%`;
                }
                
                const scoreElement = document.querySelector(`.${category}-score`);
                if (scoreElement) {
                    scoreElement.textContent = data.score;
                }
            });
            
            const overallProgressBar = document.querySelector('.overall-progress');
            if (overallProgressBar) {
                overallProgressBar.style.width = `${(this.data.overallScore / 5) * 100}%`;
            }
            
            const overallScoreElement = document.querySelector('.overall-score');
            if (overallScoreElement) {
                overallScoreElement.textContent = this.data.overallScore;
            }
        },
        
        // Show assessment results
        showResults: function() {
            // Hide questions, show results
            document.querySelector('.assessment-questions').classList.add('hidden');
            document.querySelector('.assessment-results').classList.remove('hidden');
            
            // Update result displays
            this.updateProgressBars();
            
            // Determine maturity level based on overall score
            const maturityLevel = this.determineMaturityLevel();
            document.querySelector('.maturity-level').textContent = maturityLevel.name;
            document.querySelector('.maturity-description').textContent = maturityLevel.description;
            
            // Update recommendation section
            this.updateRecommendations();
        },
        
        // Determine maturity level based on score
        determineMaturityLevel: function() {
            const score = parseFloat(this.data.overallScore);
            
            if (score < 1.5) {
                return { 
                    name: 'Experimental', 
                    description: 'Early exploration with limited integration into workflows.' 
                };
            } else if (score < 2.5) {
                return { 
                    name: 'Functional', 
                    description: 'Targeted production deployments with point solutions addressing specific needs.' 
                };
            } else if (score < 3.5) {
                return { 
                    name: 'Integrated', 
                    description: 'Connected AI systems working within core products and processes.' 
                };
            } else if (score < 4.5) {
                return { 
                    name: 'Scalable', 
                    description: 'Enterprise-wide capabilities with systematic optimization and governance.' 
                };
            } else {
                return { 
                    name: 'Transformative', 
                    description: 'AI as a core organizational capability driving business model innovation.' 
                };
            }
        },
        
        // Update recommendations based on scores
        updateRecommendations: function() {
            // Find the lowest scoring category for priority focus
            let lowestCategory = 'technical';
            let lowestScore = parseFloat(this.data.categories.technical.score);
            
            Object.entries(this.data.categories).forEach(([category, data]) => {
                const score = parseFloat(data.score);
                if (score < lowestScore) {
                    lowestScore = score;
                    lowestCategory = category;
                }
            });
            
            // Set priority focus area
            const priorityAreaElement = document.querySelector('.priority-focus');
            const categoryNames = {
                'technical': 'Technical Infrastructure',
                'data': 'Data Readiness',
                'organizational': 'Organizational Alignment',
                'useCase': 'Use Case Definition',
                'governance': 'Governance Framework'
            };
            
            if (priorityAreaElement) {
                priorityAreaElement.textContent = categoryNames[lowestCategory];
            }
            
            // Generate recommendations based on the lowest category
            const recommendationsElement = document.querySelector('.recommendations-list');
            if (recommendationsElement) {
                let recommendations = [];
                
                switch(lowestCategory) {
                    case 'technical':
                        recommendations = [
                            'Create API standardization and integration framework',
                            'Implement cloud infrastructure for AI workloads',
                            'Develop technical training program for engineering team',
                            'Establish technical debt reduction plan focused on AI readiness'
                        ];
                        break;
                    case 'data':
                        recommendations = [
                            'Conduct comprehensive data audit and quality assessment',
                            'Implement data governance and metadata management',
                            'Develop centralized data access framework',
                            'Create data enrichment pipeline for AI training'
                        ];
                        break;
                    case 'organizational':
                        recommendations = [
                            'Create cross-functional AI implementation team with editorial representation',
                            'Develop AI champions program among editorial staff with focused training',
                            'Create executive education program focused on media-specific AI applications',
                            'Establish clear AI vision and roadmap with executive sponsorship'
                        ];
                        break;
                    case 'useCase':
                        recommendations = [
                            'Conduct AI use case workshop with business stakeholders',
                            'Develop use case prioritization framework with clear success metrics',
                            'Create rapid prototyping program for AI use case validation',
                            'Establish editorial guidelines for AI-enabled content creation'
                        ];
                        break;
                    case 'governance':
                        recommendations = [
                            'Establish AI ethics committee with cross-functional representation',
                            'Create AI quality assurance and benchmarking framework',
                            'Develop transparent AI usage policies for editorial and business teams',
                            'Implement AI audit and explainability capabilities'
                        ];
                        break;
                }
                
                // Update the recommendations list
                recommendationsElement.innerHTML = '';
                recommendations.forEach((recommendation, index) => {
                    recommendationsElement.innerHTML += `
                        <li class="flex items-start">
                            <span class="flex-shrink-0 h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm mr-2">${index + 1}</span>
                            <span>${recommendation}</span>
                        </li>
                    `;
                });
            }
        },
        
        // Load saved assessment data
        loadSavedData: function() {
            const savedData = MediaAIToolkit.state.assessmentData;
            if (Object.keys(savedData).length > 0) {
                this.data = Object.assign({}, this.data, savedData);
                MediaAIToolkit.log('Loaded saved assessment data');
            }
        },
        
        // Get current data for saving
        getCurrentData: function() {
            return MediaAIToolkit.helpers.deepClone(this.data);
        },
        
        // Check if assessment is complete
        isComplete: function() {
            return this.data.completed === true;
        },
        
        // Get progress for a specific step
        getStepProgress: function(step) {
            return (this.data.currentStep / this.data.totalSteps) * 100;
        },
        
        // Handle tool-specific actions
        handleAction: function(action) {
            // Handle assessment-specific actions here
            MediaAIToolkit.log('Assessment tool handling action:', action);
        },
        
        // Reset the assessment
        reset: function() {
            this.data = {
                currentCategory: 'technical',
                categories: {
                    technical: { score: 0, completed: false },
                    data: { score: 0, completed: false },
                    organizational: { score: 0, completed: false },
                    useCase: { score: 0, completed: false },
                    governance: { score: 0, completed: false }
                },
                currentStep: 1,
                totalSteps: 15,
                overallScore: 0,
                answers: {},
                completed: false
            };
            
            this.updateUI();
        },
        
        // Start a new assessment
        startAssessment: function() {
            document.querySelector('.assessment-intro').classList.add('hidden');
            document.querySelector('.assessment-questions').classList.remove('hidden');
            this.updateUI();
        }
    },
    
    /**
     * Architecture Decision Framework Module
     */
    ArchitectureTool: {
        // Current architecture state
        data: {
            currentStep: 1,
            totalSteps: 5,
            selections: {
                useCase: null,
                approach: null,
                data: null,
                integration: null,
                scaling: null
            },
            completed: false
        },
        
        // Initialize the architecture tool
        init: function() {
            MediaAIToolkit.log('Initializing Architecture Tool');
            
            // Load any previously saved data
            this.loadSavedData();
            
            // Setup event handlers for architecture-specific interactions
            this.setupEventHandlers();
            
            // Update UI based on current state
            this.updateUI();
        },
        
        // Setup architecture-specific event handlers
        setupEventHandlers: function() {
            // Option selection
            document.querySelectorAll('.option-card').forEach(card => {
                card.addEventListener('click', this.handleOptionSelection.bind(this));
            });
            
            // Navigation buttons
            document.querySelectorAll('.step-nav-button').forEach(button => {
                button.addEventListener('click', this.handleNavigation.bind(this));
            });
        },
        
        // Handle option selection
        handleOptionSelection: function(event) {
            const option = event.currentTarget;
            const step = option.closest('[data-step]').getAttribute('data-step');
            const value = option.getAttribute('data-value');
            
            // Store the selection
            this.data.selections[step] = value;
            
            // Update UI to show selection
            const container = option.closest('[data-step]');
            container.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected', 'border-blue-500', 'bg-blue-50');
                card.classList.add('border-gray-200');
            });
            
            option.classList.add('selected', 'border-blue-500', 'bg-blue-50');
            option.classList.remove('border-gray-200');
            
            // Update recommendation preview if on appropriate steps
            if (['useCase', 'approach'].includes(step)) {
                this.updateRecommendationPreview();
            }
        },
        
        // Handle navigation buttons
        handleNavigation: function(event) {
            const button = event.currentTarget;
            const action = button.getAttribute('data-action');
            
            if (action === 'next') {
                this.nextStep();
            } else if (action === 'prev') {
                this.prevStep();
            } else if (action === 'finish') {
                this.completeArchitecture();
            }
        },
        
        // Go to next step
        nextStep: function() {
            const currentStep = this.data.currentStep;
            const currentStepKey = this.getStepKey(currentStep);
            
            // Verify current step is complete
            if (!this.data.selections[currentStepKey]) {
                MediaAIToolkit.showNotification('Please make a selection before proceeding', 'warning');
                return;
            }
            
            if (this.data.currentStep < this.data.totalSteps) {
                this.data.currentStep++;
                this.updateUI();
                this.updateProgressBar();
            }
        },
        
        // Go to previous step
        prevStep: function() {
            if (this.data.currentStep > 1) {
                this.data.currentStep--;
                this.updateUI();
                this.updateProgressBar();
            }
        },
        
        // Complete architecture design
        completeArchitecture: function() {
            const currentStepKey = this.getStepKey(this.data.currentStep);
            
            // Verify current step is complete
            if (!this.data.selections[currentStepKey]) {
                MediaAIToolkit.showNotification('Please make a selection before completing', 'warning');
                return;
            }
            
            this.data.completed = true;
            MediaAIToolkit.state.userProgress.architectureComplete = true;
            MediaAIToolkit.saveCurrentState();
            
            // Show results
            this.showResults();
        },
        
        // Convert step number to key
        getStepKey: function(stepNumber) {
            const stepKeys = ['useCase', 'approach', 'data', 'integration', 'scaling'];
            return stepKeys[stepNumber - 1];
        },
        
        // Update the UI based on current state
        updateUI: function() {
            // Show current step and hide others
            document.querySelectorAll('.step-container').forEach(container => {
                const step = parseInt(container.getAttribute('data-step-number'));
                if (step === this.data.currentStep) {
                    container.classList.remove('hidden');
                } else {
                    container.classList.add('hidden');
                }
            });
            
            // Update step indicators
            document.querySelectorAll('.step-circle').forEach(circle => {
                const step = parseInt(circle.getAttribute('data-step'));
                
                if (step < this.data.currentStep) {
                    // Completed step
                    circle.classList.remove('step-inactive', 'step-active');
                    circle.classList.add('step-completed', 'bg-green-500');
                    circle.innerHTML = '<i class="fas fa-check"></i>';
                } else if (step === this.data.currentStep) {
                    // Active step
                    circle.classList.remove('step-inactive', 'step-completed');
                    circle.classList.add('step-active', 'bg-blue-500');
                } else {
                    // Upcoming step
                    circle.classList.remove('step-active', 'step-completed');
                    circle.classList.add('step-inactive', 'bg-gray-400');
                }
            });
            
            // Update navigation buttons
            const prevButton = document.querySelector('.step-nav-button[data-action="prev"]');
            const nextButton = document.querySelector('.step-nav-button[data-action="next"]');
            const finishButton = document.querySelector('.step-nav-button[data-action="finish"]');
            
            if (prevButton) {
                prevButton.disabled = (this.data.currentStep === 1);
                prevButton.classList.toggle('opacity-50', this.data.currentStep === 1);
            }
            
            if (nextButton) {
                nextButton.classList.toggle('hidden', this.data.currentStep === this.data.totalSteps);
            }
            
            if (finishButton) {
                finishButton.classList.toggle('hidden', this.data.currentStep !== this.data.totalSteps);
            }
            
            // Restore previously selected options
            Object.entries(this.data.selections).forEach(([step, value]) => {
                if (value) {
                    const stepContainer = document.querySelector(`[data-step="${step}"]`);
                    if (stepContainer) {
                        const selectedOption = stepContainer.querySelector(`[data-value="${value}"]`);
                        if (selectedOption) {
                            selectedOption.classList.add('selected', 'border-blue-500', 'bg-blue-50');
                            selectedOption.classList.remove('border-gray-200');
                        }
                    }
                }
            });
        },
        
        // Update progress bar
        updateProgressBar: function() {
            const progressPercentage = ((this.data.currentStep - 1) / (this.data.totalSteps - 1)) * 100;
            
            document.querySelectorAll('.progress-completed').forEach((progressBar, index) => {
                if (index < this.data.currentStep - 1) {
                    progressBar.style.width = '100%';
                } else if (index === this.data.currentStep - 1) {
                    progressBar.style.width = '20%';
                } else {
                    progressBar.style.width = '0%';
                }
            });
        },
        
        // Update recommendation preview based on selections
        updateRecommendationPreview: function() {
            const useCase = this.data.selections.useCase;
            const approach = this.data.selections.approach;
            
            if (!useCase) return;
            
            // Update recommendation preview title
            const previewTitle = document.querySelector('.recommendation-preview-title');
            if (previewTitle) {
                let title = '';
                
                switch(useCase) {
                    case 'content-creation':
                        title = 'Content Creation';
                        break;
                    case 'audience-intelligence':
                        title = 'Audience Intelligence';
                        break;
                    case 'operational-efficiency':
                        title = 'Operational Efficiency';
                        break;
                    case 'business-model':
                        title = 'Business Model Innovation';
                        break;
                }
                
                if (approach) {
                    switch(approach) {
                        case 'api-integration':
                            title += ' with API Integration';
                            break;
                        case 'custom-fine-tuning':
                            title += ' with Fine-tuning';
                            break;
                        case 'hybrid-architecture':
                            title += ' with Hybrid Architecture';
                            break;
                        case 'custom-build':
                            title += ' with Custom Build';
                            break;
                    }
                }
                
                previewTitle.textContent = title;
            }
            
            // Update recommendation preview components
            const previewComponents = document.querySelector('.recommendation-preview-components');
            if (previewComponents && useCase) {
                let components = [];
                
                switch(useCase) {
                    case 'content-creation':
                        components = [
                            'Foundation model integration layer',
                            'Editorial quality assurance framework',
                            'Content workflow integration'
                        ];
                        
                        if (approach === 'custom-fine-tuning') {
                            components.push('Domain-specific fine-tuning pipeline');
                            components.push('Style guide and brand voice enforcement');
                        } else if (approach === 'hybrid-architecture') {
                            components.push('Composable API orchestration layer');
                            components.push('Content quality validation framework');
                        }
                        break;
                        
                    case 'audience-intelligence':
                        components = [
                            'User behavior analytics engine',
                            'Personalization framework',
                            'Content recommendation system'
                        ];
                        
                        if (approach === 'api-integration') {
                            components.push('Third-party API integration hub');
                        } else if (approach === 'custom-build') {
                            components.push('Custom audience segmentation engine');
                            components.push('First-party data enrichment pipeline');
                        }
                        break;
                        
                    // Add similar logic for other use cases
                }
                
                // Update the components list
                previewComponents.innerHTML = '';
                components.forEach(component => {
                    previewComponents.innerHTML += `
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-blue-500 mt-1 mr-2"></i>
                            <span>${component}</span>
                        </li>
                    `;
                });
            }
        },
        
        // Show final architecture results
        showResults: function() {
            // Hide steps, show results
            document.querySelector('.architecture-steps').classList.add('hidden');
            document.querySelector('.architecture-results').classList.remove('hidden');
            
            // Generate full architecture recommendation
            this.generateFullRecommendation();
        },
        
        // Generate full architecture recommendation
        generateFullRecommendation: function() {
            const { useCase, approach, data, integration, scaling } = this.data.selections;
            
            // Create architecture diagram (in a real implementation, this would generate an actual diagram)
            const diagramContainer = document.querySelector('.architecture-diagram');
            if (diagramContainer) {
                diagramContainer.innerHTML = `
                    <div class="bg-gray-100 p-8 rounded-lg text-center">
                        <p class="text-gray-500 mb-4">Architecture diagram would be generated here based on selections:</p>
                        <p>Use Case: ${useCase}</p>
                        <p>Approach: ${approach}</p>
                        <p>Data Architecture: ${data}</p>
                        <p>Integration: ${integration}</p>
                        <p>Scaling: ${scaling}</p>
                    </div>
                `;
            }
            
            // Populate recommendation components
            const componentsContainer = document.querySelector('.architecture-components');
            if (componentsContainer) {
                // This would be more sophisticated in a real implementation
                const components = this.generateArchitectureComponents();
                
                componentsContainer.innerHTML = '';
                components.forEach(component => {
                    componentsContainer.innerHTML += `
                        <div class="border rounded-lg p-4 mb-4">
                            <h4 class="font-bold text-lg mb-2">${component.name}</h4>
                            <p class="text-gray-600 mb-3">${component.description}</p>
                            <div class="flex flex-wrap gap-2">
                                ${component.tags.map(tag => `
                                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">${tag}</span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
            }
            
            // Populate implementation considerations
            const considerationsContainer = document.querySelector('.implementation-considerations');
            if (considerationsContainer) {
                const considerations = this.generateImplementationConsiderations();
                
                considerationsContainer.innerHTML = '';
                considerations.forEach((consideration, index) => {
                    considerationsContainer.innerHTML += `
                        <li class="flex items-start mb-4">
                            <span class="flex-shrink-0 h-6 w-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm mr-2">${index + 1}</span>
                            <div>
                                <span class="font-medium">${consideration.title}</span> – ${consideration.description}
                            </div>
                        </li>
                    `;
                });
            }
        },
        
        // Generate architecture components based on selections
        generateArchitectureComponents: function() {
            const { useCase, approach } = this.data.selections;
            let components = [];
            
            // Base components for content creation use case
            if (useCase === 'content-creation') {
                components = [
                    {
                        name: 'Content Foundation Model',
                        description: 'Core language model for content generation and enhancement',
                        tags: ['Foundation Model', 'NLP', 'Content Generation']
                    },
                    {
                        name: 'Editorial Guardrails',
                        description: 'Framework for ensuring content meets editorial standards',
                        tags: ['Quality Control', 'Policy Enforcement', 'Content Standards']
                    },
                    {
                        name: 'Content Workflow Integration',
                        description: 'Connectors to existing content production systems',
                        tags: ['Workflow', 'Integration', 'CMS']
                    }
                ];
                
                // Add approach-specific components
                if (approach === 'custom-fine-tuning') {
                    components.push({
                        name: 'Fine-tuning Pipeline',
                        description: 'Infrastructure for continuous model training and improvement',
                        tags: ['ML Ops', 'Training', 'Model Management']
                    });
                    components.push({
                        name: 'Brand Voice Encoder',
                        description: 'System to ensure AI-generated content matches brand style and tone',
                        tags: ['Style Guide', 'Brand Voice', 'Content Consistency']
                    });
                } else if (approach === 'api-integration') {
                    components.push({
                        name: 'API Orchestration Layer',
                        description: 'System to manage multiple AI service providers and capabilities',
                        tags: ['API Management', 'Service Orchestration', 'Fallback Handling']
                    });
                }
            }
            
            // Similar logic would be applied for other use cases and approaches
            
            return components;
        },
        
        // Generate implementation considerations based on selections
        generateImplementationConsiderations: function() {
            const { approach, integration, scaling } = this.data.selections;
            let considerations = [];
            
            // Base considerations for all architectures
            considerations = [
                {
                    title: 'Quality Assurance Framework',
                    description: 'Implement comprehensive testing for AI outputs before production use.'
                },
                {
                    title: 'Performance Monitoring',
                    description: 'Establish KPI tracking for both technical and business metrics.'
                },
                {
                    title: 'Fallback Mechanisms',
                    description: 'Design systems to gracefully handle AI service disruptions.'
                }
            ];
            
            // Add approach-specific considerations
            if (approach === 'custom-fine-tuning') {
                considerations.push({
                    title: 'Training Data Management',
                    description: 'Establish processes for data curation, versioning, and quality control.'
                });
                considerations.push({
                    title: 'Model Evaluation',
                    description: 'Define metrics and benchmarks for measuring model quality improvements.'
                });
            } else if (approach === 'api-integration') {
                considerations.push({
                    title: 'Vendor Lock-in Mitigation',
                    description: 'Design abstraction layer to minimize dependency on specific providers.'
                });
                considerations.push({
                    title: 'Cost Management',
                    description: 'Implement usage monitoring and throttling to control API expenses.'
                });
            }
            
            // Add scaling-specific considerations
            if (scaling === 'horizontal') {
                considerations.push({
                    title: 'Load Balancing',
                    description: 'Design distribution system for optimal resource utilization.'
                });
            } else if (scaling === 'vertical') {
                considerations.push({
                    title: 'Resource Sizing',
                    description: 'Implement performance testing to determine optimal instance sizing.'
                });
            }
            
            return considerations;
        },
        
        // Load saved architecture data
        loadSavedData: function() {
            const savedData = MediaAIToolkit.state.architectureData;
            if (Object.keys(savedData).length > 0) {
                this.data = Object.assign({}, this.data, savedData);
                MediaAIToolkit.log('Loaded saved architecture data');
            }
        },
        
        // Get current data for saving
        getCurrentData: function() {
            return MediaAIToolkit.helpers.deepClone(this.data);
        },
        
        // Check if architecture design is complete
        isComplete: function() {
            return this.data.completed === true;
        },
        
        // Get progress for a specific step
        getStepProgress: function(step) {
            return ((this.data.currentStep - 1) / (this.data.totalSteps - 1)) * 100;
        },
        
        // Handle tool-specific actions
        handleAction: function(action) {
            // Handle architecture-specific actions here
            MediaAIToolkit.log('Architecture tool handling action:', action);
            
            if (action === 'proceed-to-next-step') {
                this.nextStep();
            }
        },
        
        // Reset the architecture tool
        reset: function() {
            this.data = {
                currentStep: 1,
                totalSteps: 5,
                selections: {
                    useCase: null,
                    approach: null,
                    data: null,
                    integration: null,
                    scaling: null
                },
                completed: false
            };
            
            this.updateUI();
            this.updateProgressBar();
        }
    },
    
    /**
     * Implementation Roadmap Generator Module
     */
    RoadmapTool: {
        // Current roadmap state
        data: {
            useCase: null,
            approach: null,
            maturityLevel: null,
            priority: null,
            challenges: [],
            roadmapGenerated: false,
            completed: false
        },
        
        // Initialize the roadmap tool
        init: function() {
            MediaAIToolkit.log('Initializing Roadmap Tool');
            
            // Load any previously saved data
            this.loadSavedData();
            
            // Setup event handlers for roadmap-specific interactions
            this.setupEventHandlers();
            
            // Check if we should show generated roadmap
            if (this.data.roadmapGenerated) {
                this.showGeneratedRoadmap();
            }
        },
        
        // Setup roadmap-specific event handlers
        setupEventHandlers: function() {
            // Option card selection
            document.querySelectorAll('.option-card').forEach(card => {
                card.addEventListener('click', this.handleOptionSelection.bind(this));
            });
            
            // Generate roadmap button
            const generateButton = document.querySelector('.generate-roadmap-btn');
            if (generateButton) {
                generateButton.addEventListener('click', this.generateRoadmap.bind(this));
            }
        },
        
        // Handle option selection
        handleOptionSelection: function(event) {
            const option = event.currentTarget;
            const type = option.closest('.parameter-section').getAttribute('data-parameter');
            const value = option.getAttribute('data-value');
            
            // For multi-select (challenges)
            if (type === 'challenges') {
                if (option.classList.contains('selected')) {
                    // Deselect
                    option.classList.remove('selected', 'bg-green-50', 'border-green-500');
                    option.classList.add('border-gray-200');
                    
                    // Remove from array
                    const index = this.data.challenges.indexOf(value);
                    if (index > -1) {
                        this.data.challenges.splice(index, 1);
                    }
                } else {
                    // Check if we've reached the limit
                    if (this.data.challenges.length >= 3) {
                        // Remove oldest selection if we're adding a new one
                        const oldestChallenge = this.data.challenges[0];
                        this.data.challenges.shift();
                        
                        // Update UI for the removed challenge
                        const oldestOption = document.querySelector(`.option-card[data-value="${oldestChallenge}"]`);
                        if (oldestOption) {
                            oldestOption.classList.remove('selected', 'bg-green-50', 'border-green-500');
                            oldestOption.classList.add('border-gray-200');
                        }
                    }
                    
                    // Add new selection
                    option.classList.add('selected', 'bg-green-50', 'border-green-500');
                    option.classList.remove('border-gray-200');
                    this.data.challenges.push(value);
                }
            } else {
                // For single-select parameters
                // Update data
                this.data[type] = value;
                
                // Update UI
                const container = option.closest('.parameter-section');
                container.querySelectorAll('.option-card').forEach(card => {
                    card.classList.remove('selected', 'bg-green-50', 'border-green-500');
                    card.classList.add('border-gray-200');
                });
                
                option.classList.add('selected', 'bg-green-50', 'border-green-500');
                option.classList.remove('border-gray-200');
            }
            
            // Update the generate button state
            this.updateGenerateButtonState();
        },
        
        // Update generate button state based on selections
        updateGenerateButtonState: function() {
            const generateButton = document.querySelector('.generate-roadmap-btn');
            if (!generateButton) return;
            
            const requiredFields = ['useCase', 'approach', 'maturityLevel', 'priority'];
            const allRequired = requiredFields.every(field => this.data[field] !== null);
            const hasEnoughChallenges = this.data.challenges.length > 0;
            
            if (allRequired && hasEnoughChallenges) {
                generateButton.disabled = false;
                generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
                generateButton.classList.add('pulse-btn');
            } else {
                generateButton.disabled = true;
                generateButton.classList.add('opacity-50', 'cursor-not-allowed');
                generateButton.classList.remove('pulse-btn');
            }
        },
        
        // Generate implementation roadmap
        generateRoadmap: function() {
            // Validate selections
            const requiredFields = ['useCase', 'approach', 'maturityLevel', 'priority'];
            const missingFields = requiredFields.filter(field => this.data[field] === null);
            
            if (missingFields.length > 0 || this.data.challenges.length === 0) {
                const missingFieldNames = missingFields.map(field => {
                    switch(field) {
                        case 'useCase': return 'Primary Use Case';
                        case 'approach': return 'Implementation Approach';
                        case 'maturityLevel': return 'Current Maturity Level';
                        case 'priority': return 'Implementation Priority';
                        default: return field;
                    }
                });
                
                let message = 'Please complete the following requirements:';
                if (missingFields.length > 0) {
                    message += `\n- Select ${missingFieldNames.join(', ')}`;
                }
                if (this.data.challenges.length === 0) {
                    message += '\n- Select at least one implementation challenge';
                }
                
                MediaAIToolkit.showNotification(message, 'warning');
                return;
            }
            
            // Mark as generated and complete
            this.data.roadmapGenerated = true;
            this.data.completed = true;
            MediaAIToolkit.state.userProgress.roadmapComplete = true;
            
            // Save state
            MediaAIToolkit.saveCurrentState();
            
            // Show the generated roadmap
            this.showGeneratedRoadmap();
            
            // Scroll to results
            document.querySelector('.roadmap-results').scrollIntoView({ behavior: 'smooth' });
        },
        
        // Show the generated roadmap
        showGeneratedRoadmap: function() {
            // Hide parameters form, show results
            document.querySelector('.roadmap-parameters').classList.add('hidden');
            document.querySelector('.roadmap-results').classList.remove('hidden');
            
            // Update roadmap header
            this.updateRoadmapHeader();
            
            // Update phase content
            this.updatePhaseContent();
            
            // Update team and success factors
            this.updateTeamAndFactors();
        },
        
        // Update roadmap header with selected parameters
        updateRoadmapHeader: function() {
            // Update title
            const titleElement = document.querySelector('.roadmap-title');
            if (titleElement) {
                let title = '';
                
                switch(this.data.useCase) {
                    case 'content-creation':
                        title = 'Content Creation';
                        break;
                    case 'audience-intelligence':
                        title = 'Audience Intelligence';
                        break;
                    case 'operational-efficiency':
                        title = 'Operational Efficiency';
                        break;
                    case 'business-model':
                        title = 'Business Model Innovation';
                        break;
                }
                
                switch(this.data.approach) {
                    case 'api-integration':
                        title += ' with API Integration';
                        break;
                    case 'rag-implementation':
                        title += ' with RAG Implementation';
                        break;
                    case 'agentic-framework':
                        title += ' with Agentic Framework';
                        break;
                }
                
                titleElement.textContent = title;
            }
            
            // Update tags
            const tagsContainer = document.querySelector('.roadmap-tags');
            if (tagsContainer) {
                let tags = [];
                
                switch(this.data.maturityLevel) {
                    case 'experimental':
                        tags.push('Experimental Maturity');
                        break;
                    case 'functional':
                        tags.push('Functional Maturity');
                        break;
                    case 'integrated':
                        tags.push('Integrated Maturity');
                        break;
                    case 'scalable':
                        tags.push('Scalable Maturity');
                        break;
                }
                
                switch(this.data.priority) {
                    case 'speed':
                        tags.push('Speed Focus');
                        break;
                    case 'quality':
                        tags.push('Quality Focus');
                        break;
                    case 'integration':
                        tags.push('Integration Focus');
                        break;
                    case 'scaling':
                        tags.push('Scaling Focus');
                        break;
                }
                
                switch(this.data.approach) {
                    case 'api-integration':
                        tags.push('API Architecture');
                        break;
                    case 'rag-implementation':
                        tags.push('RAG Architecture');
                        break;
                    case 'agentic-framework':
                        tags.push('Agentic Architecture');
                        break;
                }
                
                tagsContainer.innerHTML = '';
                tags.forEach(tag => {
                    tagsContainer.innerHTML += `
                        <span class="challenge-tag bg-green-100 text-green-800">
                            <i class="fas fa-circle"></i> ${tag}
                        </span>
                    `;
                });
            }
            
            // Update challenge tags
            const challengesContainer = document.querySelector('.roadmap-challenges');
            if (challengesContainer) {
                challengesContainer.innerHTML = '';
                this.data.challenges.forEach(challenge => {
                    let challengeText = '';
                    
                    switch(challenge) {
                        case 'legacy-integration':
                            challengeText = 'Legacy System Integration';
                            break;
                        case 'data-quality':
                            challengeText = 'Data Quality & Access';
                            break;
                        case 'technical-expertise':
                            challengeText = 'Technical Expertise Gaps';
                            break;
                        case 'workflow-disruption':
                            challengeText = 'Workflow Disruption Concerns';
                            break;
                        case 'cost-management':
                            challengeText = 'Cost Management & ROI';
                            break;
                        case 'governance':
                            challengeText = 'Governance & Compliance';
                            break;
                    }
                    
                    challengesContainer.innerHTML += `
                        <span class="challenge-tag bg-yellow-100 text-yellow-800">
                            <i class="fas fa-exclamation-triangle"></i> ${challengeText}
                        </span>
                    `;
                });
            }
        },
        
        // Update phase content based on selections
        updatePhaseContent: function() {
            // Generate milestones for each phase
            const foundation = this.generateMilestones('foundation');
            const implementation = this.generateMilestones('implementation');
            const optimization = this.generateMilestones('optimization');
            
            // Update phase 1 (Foundation)
            const phase1List = document.querySelector('.phase-1-list');
            if (phase1List) {
                phase1List.innerHTML = '';
                foundation.forEach(milestone => {
                    phase1List.innerHTML += `
                        <li class="milestone-item">
                            <span class="text-sm">${milestone}</span>
                        </li>
                    `;
                });
            }
            
            // Update phase 2 (Implementation)
            const phase2List = document.querySelector('.phase-2-list');
            if (phase2List) {
                phase2List.innerHTML = '';
                implementation.forEach(milestone => {
                    phase2List.innerHTML += `
                        <li class="milestone-item">
                            <span class="text-sm">${milestone}</span>
                        </li>
                    `;
                });
            }
            
            // Update phase 3 (Optimization)
            const phase3List = document.querySelector('.phase-3-list');
            if (phase3List) {
                phase3List.innerHTML = '';
                optimization.forEach(milestone => {
                    phase3List.innerHTML += `
                        <li class="milestone-item">
                            <span class="text-sm">${milestone}</span>
                        </li>
                    `;
                });
            }
        },
        
        // Generate milestones for specific phase
        generateMilestones: function(phase) {
            const { useCase, approach, challenges } = this.data;
            let milestones = [];
            
            // Base milestones for content creation
            if (useCase === 'content-creation') {
                if (phase === 'foundation') {
                    milestones = [
                        'Define editorial guidelines and quality criteria',
                        'Establish content taxonomy and metadata standards',
                        'Develop prototype content workflow integration'
                    ];
                    
                    if (approach === 'rag-implementation') {
                        milestones.push('Develop knowledge base architecture for editorial content');
                        milestones.push('Implement content indexing and embedding pipeline');
                    } else if (approach === 'api-integration') {
                        milestones.push('Select and integrate foundation model API');
                        milestones.push('Develop API fallback and redundancy framework');
                    }
                    
                } else if (phase === 'implementation') {
                    milestones = [
                        'Implement editorial review workflow with AI assistance',
                        'Develop content quality monitoring framework',
                        'Train content team on AI collaboration techniques'
                    ];
                    
                    if (approach === 'rag-implementation') {
                        milestones.push('Deploy retrieval optimization for editorial guidelines');
                        milestones.push('Implement content synchronization mechanisms');
                    } else if (approach === 'agentic-framework') {
                        milestones.push('Develop custom content agent with editorial guardrails');
                        milestones.push('Implement agent orchestration framework');
                    }
                    
                } else if (phase === 'optimization') {
                    milestones = [
                        'Deploy A/B testing framework for AI-generated content',
                        'Implement automated quality assurance checks',
                        'Develop feedback loop for continuous improvement'
                    ];
                    
                    if (approach === 'rag-implementation') {
                        milestones.push('Implement automatic knowledge base maintenance');
                        milestones.push('Scale to additional content types and formats');
                    } else if (approach === 'api-integration') {
                        milestones.push('Optimize API usage for cost-efficiency');
                        milestones.push('Implement multi-vendor strategy for reduced dependency');
                    }
                }
            }
            
            // Similar logic would be implemented for other use cases
            
            // Add challenge-specific milestones
            if (challenges.includes('legacy-integration')) {
                if (phase === 'foundation') {
                    milestones.push('Create adapter layer for legacy CMS integration');
                } else if (phase === 'implementation') {
                    milestones.push('Develop integration testing framework for legacy systems');
                }
            }
            
            if (challenges.includes('data-quality')) {
                if (phase === 'foundation') {
                    milestones.push('Develop data quality assessment framework');
                } else if (phase === 'implementation') {
                    milestones.push('Implement data enrichment pipeline for content assets');
                }
            }
            
            if (challenges.includes('cost-management')) {
                if (phase === 'foundation') {
                    milestones.push('Develop detailed cost-benefit analysis framework');
                } else if (phase === 'implementation') {
                    milestones.push('Implement cost monitoring for AI operations');
                } else if (phase === 'optimization') {
                    milestones.push('Implement comprehensive ROI tracking dashboard');
                }
            }
            
            return milestones;
        },
        
        // Update team and success factors sections
        updateTeamAndFactors: function() {
            // Update implementation team
            const teamList = document.querySelector('.team-list tbody');
            if (teamList) {
                // Base team
                let team = [
                    { role: 'Technical Lead', responsibility: 'Architecture design and technical oversight' },
                    { role: 'Project Manager', responsibility: 'Coordination, timeline management, stakeholder communication' }
                ];
                
                // Add use case specific roles
                if (this.data.useCase === 'content-creation') {
                    team.push({ role: 'Editorial SME', responsibility: 'Content quality guidelines and editorial alignment' });
                } else if (this.data.useCase === 'audience-intelligence') {
                    team.push({ role: 'Data Scientist', responsibility: 'Audience modeling and segmentation algorithms' });
                }
                
                // Add approach specific roles
                if (this.data.approach === 'rag-implementation') {
                    team.push({ role: 'Data Engineer', responsibility: 'Data pipeline development and optimization' });
                    team.push({ role: 'Knowledge Engineer', responsibility: 'Knowledge base design and retrieval optimization' });
                } else if (this.data.approach === 'agentic-framework') {
                    team.push({ role: 'AI Engineer', responsibility: 'Agent development, prompt engineering, and orchestration' });
                }
                
                // Update the team list
                teamList.innerHTML = '';
                team.forEach(member => {
                    teamList.innerHTML += `
                        <tr>
                            <td class="py-2 pr-4 font-medium">${member.role}</td>
                            <td class="py-2 text-gray-600">${member.responsibility}</td>
                        </tr>
                    `;
                });
            }
            
            // Update success factors
            const factorsList = document.querySelector('.success-factors-list');
            if (factorsList) {
                // Base success factors
                let factors = [
                    { factor: 'Clearly defined success metrics', description: 'Establish quantifiable KPIs before implementation' },
                    { factor: 'Executive sponsorship', description: 'Secure leadership buy-in and resource commitment' },
                    { factor: 'Phased implementation approach', description: 'Start with focused MVPs before expanding' }
                ];
                
                // Add use case specific factors
                if (this.data.useCase === 'content-creation') {
                    factors.push({ factor: 'Quality-first approach', description: 'Prioritize content accuracy and editorial standards' });
                } else if (this.data.useCase === 'audience-intelligence') {
                    factors.push({ factor: 'Privacy-by-design', description: 'Ensure audience data usage respects privacy regulations' });
                }
                
                // Add challenge specific factors
                if (this.data.challenges.includes('technical-expertise')) {
                    factors.push({ factor: 'Skill development program', description: 'Invest in team training and knowledge transfer' });
                }
                
                if (this.data.challenges.includes('workflow-disruption')) {
                    factors.push({ factor: 'Change management framework', description: 'Implement structured adoption process with stakeholder involvement' });
                }
                
                // Update the factors list
                factorsList.innerHTML = '';
                factors.forEach(factor => {
                    factorsList.innerHTML += `
                        <li class="flex items-start">
                            <span class="flex-shrink-0 h-5 w-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                            <span class="text-sm"><span class="font-medium">${factor.factor}</span> – ${factor.description}</span>
                        </li>
                    `;
                });
            }
        },
        
        // Load saved roadmap data
        loadSavedData: function() {
            const savedData = MediaAIToolkit.state.roadmapData;
            if (Object.keys(savedData).length > 0) {
                this.data = Object.assign({}, this.data, savedData);
                MediaAIToolkit.log('Loaded saved roadmap data');
                
                // Restore UI state
                this.restoreUIState();
            }
        },
        
        // Restore UI state based on loaded data
        restoreUIState: function() {
            // Restore selected options
            const fields = ['useCase', 'approach', 'maturityLevel', 'priority'];
            fields.forEach(field => {
                const value = this.data[field];
                if (value) {
                    const option = document.querySelector(`.option-card[data-value="${value}"]`);
                    if (option) {
                        option.classList.add('selected', 'bg-green-50', 'border-green-500');
                        option.classList.remove('border-gray-200');
                    }
                }
            });
            
            // Restore selected challenges
            this.data.challenges.forEach(challenge => {
                const option = document.querySelector(`.option-card[data-value="${challenge}"]`);
                if (option) {
                    option.classList.add('selected', 'bg-green-50', 'border-green-500');
                    option.classList.remove('border-gray-200');
                }
            });
            
            // Update button state
            this.updateGenerateButtonState();
        },
        
        // Get current data for saving
        getCurrentData: function() {
            return MediaAIToolkit.helpers.deepClone(this.data);
        },
        
        // Check if roadmap generation is complete
        isComplete: function() {
            return this.data.completed === true;
        },
        
        // Get progress for a specific step
        getStepProgress: function(step) {
            // For roadmap tool, this is binary - not applicable or 100%
            return this.data.completed ? 100 : 0;
        },
        
        // Handle tool-specific actions
        handleAction: function(action) {
            // Handle roadmap-specific actions here
            MediaAIToolkit.log('Roadmap tool handling action:', action);
            
            if (action === 'generate-roadmap') {
                this.generateRoadmap();
            }
        },
        
        // Reset the roadmap tool
        reset: function() {
            this.data = {
                useCase: null,
                approach: null,
                maturityLevel: null,
                priority: null,
                challenges: [],
                roadmapGenerated: false,
                completed: false
            };
            
            // Show parameters form, hide results
            document.querySelector('.roadmap-parameters').classList.remove('hidden');
            document.querySelector('.roadmap-results').classList.add('hidden');
            
            // Reset UI selections
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected', 'bg-green-50', 'border-green-500');
                card.classList.add('border-gray-200');
            });
            
            this.updateGenerateButtonState();
        }
    },
    
    /**
     * ROI Calculator Module
     */
    ROITool: {
        // Current ROI calculator state
        data: {
            organization: {
                size: 'medium',
                contentVolume: 100,
                contentCreators: 10,
                hourlyRate: 50
            },
            implementation: {
                useCase: 'content-creation',
                scope: 'focused',
                infrastructure: 'some',
                implementationCost: null,
                annualCost: null
            },
            benefits: {
                efficiencyGain: null,
                qualityImprovement: null,
                audienceGrowth: null,
                revenueIncrease: null
            },
            results: null,
            completed: false
        },
        
        // Industry benchmarks for ROI calculations
        benchmarks: {
            'content-creation': {
                efficiencyGain: 0.30,
                qualityImprovement: 0.15,
                audienceGrowth: 0.10,
                revenueIncrease: 0.08
            },
            'audience-intelligence': {
                efficiencyGain: 0.20,
                qualityImprovement: 0.10,
                audienceGrowth: 0.25,
                revenueIncrease: 0.15
            },
            'operational-efficiency': {
                efficiencyGain: 0.40,
                qualityImprovement: 0.05,
                audienceGrowth: 0.05,
                revenueIncrease: 0.10
            },
            'business-model': {
                efficiencyGain: 0.15,
                qualityImprovement: 0.20,
                audienceGrowth: 0.20,
                revenueIncrease: 0.25
            }
        },
        
        // Implementation cost multipliers
        costMultipliers: {
            size: {
                'small': 0.7,
                'medium': 1.0,
                'large': 1.5,
                'enterprise': 2.5
            },
            useCase: {
                'content-creation': 1.0,
                'audience-intelligence': 1.2,
                'operational-efficiency': 0.9,
                'business-model': 1.4
            },
            scope: {
                'focused': 0.7,
                'comprehensive': 1.0,
                'enterprise': 1.8
            },
            infrastructure: {
                'minimal': 1.3,
                'some': 1.0,
                'extensive': 0.7
            }
        },
        
        // Initialize the ROI calculator
        init: function() {
            MediaAIToolkit.log('Initializing ROI Calculator');
            
            // Load any previously saved data
            this.loadSavedData();
            
            // Setup event handlers for ROI-specific interactions
            this.setupEventHandlers();
            
            // Show results if previously calculated
            if (this.data.results) {
                this.showResults();
            }
        },
        
        // Setup ROI-specific event handlers
        setupEventHandlers: function() {
            // Organization parameters
            document.querySelectorAll('[data-param-group="organization"]').forEach(input => {
                input.addEventListener('change', this.handleOrganizationInput.bind(this));
            });
            
            // Implementation parameters
            document.querySelectorAll('[data-param-group="implementation"]').forEach(input => {
                input.addEventListener('change', this.handleImplementationInput.bind(this));
            });
            
            // Benefit parameters
            document.querySelectorAll('[data-param-group="benefits"]').forEach(input => {
                input.addEventListener('change', this.handleBenefitInput.bind(this));
            });
            
            // Calculate button
            const calculateButton = document.querySelector('.calculate-roi-btn');
            if (calculateButton) {
                calculateButton.addEventListener('click', this.calculateROI.bind(this));
            }
            
            // Toggle buttons for views
            document.querySelectorAll('.toggle-btn').forEach(button => {
                button.addEventListener('click', this.handleViewToggle.bind(this));
            });
            
            // Restore input values from saved data
            this.restoreInputValues();
        },
        
        // Handle organization parameter input
        handleOrganizationInput: function(event) {
            const input = event.target;
            const param = input.getAttribute('data-param');
            let value;
            
            if (input.tagName === 'SELECT') {
                value = input.value;
            } else {
                value = input.type === 'number' ? parseInt(input.value) : input.value;
            }
            
            this.data.organization[param] = value;
        },
        
        // Handle implementation parameter input
        handleImplementationInput: function(event) {
            const input = event.target;
            const param = input.getAttribute('data-param');
            let value;
            
            if (input.tagName === 'SELECT') {
                value = input.value;
            } else if (input.value === '') {
                value = null;
            } else {
                value = input.type === 'number' ? parseInt(input.value) : input.value;
            }
            
            this.data.implementation[param] = value;
            
            // If useCase changes, update benefit placeholders
            if (param === 'useCase') {
                this.updateBenefitPlaceholders();
            }
        },
        
        // Handle benefit parameter input
        handleBenefitInput: function(event) {
            const input = event.target;
            const param = input.getAttribute('data-param');
            
            // Store as null if empty, otherwise as a number
            let value = input.value === '' ? null : parseFloat(input.value) / 100;
            this.data.benefits[param] = value;
        },
        
        // Handle view toggle between summary, analysis, comparison
        handleViewToggle: function(event) {
            const button = event.currentTarget;
            const view = button.getAttribute('data-view');
            
            // Update button states
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Update visible view
            document.querySelectorAll('.view-container').forEach(container => {
                container.classList.add('hidden');
            });
            document.querySelector(`.view-container[data-view="${view}"]`).classList.remove('hidden');
        },
        
        // Update benefit placeholders based on selected use case
        updateBenefitPlaceholders: function() {
            const useCase = this.data.implementation.useCase;
            if (!useCase || !this.benchmarks[useCase]) return;
            
            const benchmark = this.benchmarks[useCase];
            
            document.querySelectorAll('[data-param-group="benefits"]').forEach(input => {
                const param = input.getAttribute('data-param');
                if (benchmark[param] !== undefined) {
                    const benchmarkPercent = Math.round(benchmark[param] * 100);
                    input.placeholder = `e.g., ${benchmarkPercent} for ${benchmarkPercent}% (benchmark)`;
                }
            });
        },
        
        // Restore input values from saved data
        restoreInputValues: function() {
            // Organization parameters
            Object.entries(this.data.organization).forEach(([param, value]) => {
                const input = document.querySelector(`[data-param-group="organization"][data-param="${param}"]`);
                if (input) {
                    input.value = value;
                }
            });
            
            // Implementation parameters
            Object.entries(this.data.implementation).forEach(([param, value]) => {
                const input = document.querySelector(`[data-param-group="implementation"][data-param="${param}"]`);
                if (input && value !== null) {
                    input.value = value;
                }
            });
            
            // Benefit parameters
            Object.entries(this.data.benefits).forEach(([param, value]) => {
                const input = document.querySelector(`[data-param-group="benefits"][data-param="${param}"]`);
                if (input && value !== null) {
                    input.value = value * 100; // Convert decimal to percentage
                }
            });
            
            // Update benefit placeholders
            this.updateBenefitPlaceholders();
        },
        
        // Calculate ROI
        calculateROI: function() {
            // Validate required inputs
            if (!this.validateInputs()) {
                MediaAIToolkit.showNotification('Please provide all required organization and implementation parameters', 'warning');
                return;
            }
            
            // Calculate implementation costs
            const costs = this.calculateCosts();
            
            // Calculate benefits
            const benefits = this.calculateBenefits();
            
            // Calculate ROI metrics
            const roi = this.calculateROIMetrics(costs, benefits);
            
            // Store results
            this.data.results = {
                costs: costs,
                benefits: benefits,
                roi: roi
            };
            
            // Mark as completed
            this.data.completed = true;
            MediaAIToolkit.state.userProgress.roiComplete = true;
            
            // Save state
            MediaAIToolkit.saveCurrentState();
            
            // Show results
            this.showResults();
            
            // Scroll to results
            document.querySelector('.roi-results').scrollIntoView({ behavior: 'smooth' });
        },
        
        // Validate inputs
        validateInputs: function() {
            // Check organization parameters
            const { contentVolume, contentCreators, hourlyRate } = this.data.organization;
            if (!contentVolume || !contentCreators || !hourlyRate) {
                return false;
            }
            
            // Check implementation parameters (useCase, scope, infrastructure)
            const { useCase, scope, infrastructure } = this.data.implementation;
            if (!useCase || !scope || !infrastructure) {
                return false;
            }
            
            return true;
        },
        
        // Calculate implementation costs
        calculateCosts: function() {
            const { size, contentCreators, hourlyRate } = this.data.organization;
            const { useCase, scope, infrastructure, implementationCost, annualCost } = this.data.implementation;
            
            // Use provided costs if available
            if (implementationCost !== null && annualCost !== null) {
                return {
                    implementationCost: implementationCost,
                    annualCost: annualCost,
                    fiveYearCost: implementationCost + (annualCost * 5)
                };
            }
            
            // Calculate base costs
            const baseImplementationCost = contentCreators * hourlyRate * 40; // Approx. 40 hours per content creator
            const baseAnnualCost = contentCreators * hourlyRate * 15; // Approx. 15 hours per content creator per year
            
            // Apply multipliers
            const sizeMultiplier = this.costMultipliers.size[size] || 1.0;
            const useCaseMultiplier = this.costMultipliers.useCase[useCase] || 1.0;
            const scopeMultiplier = this.costMultipliers.scope[scope] || 1.0;
            const infraMultiplier = this.costMultipliers.infrastructure[infrastructure] || 1.0;
            
            const totalImplementationCost = Math.round(baseImplementationCost * sizeMultiplier * useCaseMultiplier * scopeMultiplier * infraMultiplier * 1000);
            const totalAnnualCost = Math.round(baseAnnualCost * sizeMultiplier * useCaseMultiplier * scopeMultiplier * infraMultiplier * 1000);
            
            return {
                implementationCost: implementationCost !== null ? implementationCost : totalImplementationCost,
                annualCost: annualCost !== null ? annualCost : totalAnnualCost,
                fiveYearCost: (implementationCost !== null ? implementationCost : totalImplementationCost) + 
                              ((annualCost !== null ? annualCost : totalAnnualCost) * 5)
            };
        },
        
        // Calculate ROI metrics
        calculateROIMetrics: function(costs, benefits) {
            const { implementationCost, annualCost, fiveYearCost } = costs;
            const { annualBenefit, fiveYearBenefit, yearlyBenefits } = benefits;
            
            // First-year ROI
            const firstYearCost = implementationCost + annualCost;
            const firstYearBenefit = yearlyBenefits[0];
            const firstYearROI = ((firstYearBenefit - firstYearCost) / firstYearCost) * 100;
            
            // Five-year ROI
            const fiveYearROI = ((fiveYearBenefit - fiveYearCost) / fiveYearCost) * 100;
            
            // Payback period (in months)
            const monthlyBenefit = yearlyBenefits[0] / 12;
            const paybackPeriod = implementationCost / monthlyBenefit;
            
            // Cumulative net benefits by year
            const cumulativeNetBenefits = [];
            let cumulativeCost = implementationCost;
            let cumulativeBenefit = 0;
            
            for (let i = 0; i < 5; i++) {
                if (i > 0) {
                    cumulativeCost += annualCost;
                }
                cumulativeBenefit += yearlyBenefits[i];
                cumulativeNetBenefits.push(Math.round((cumulativeBenefit - cumulativeCost) * 1000) / 1000);
            }
            
            return {
                firstYearROI: Math.round(firstYearROI * 10) / 10,
                fiveYearROI: Math.round(fiveYearROI * 10) / 10,
                paybackPeriod: Math.round(paybackPeriod * 10) / 10,
                cumulativeNetBenefits: cumulativeNetBenefits
            };
        },
        
        // Show ROI results
        showResults: function() {
            // Hide calculator form, show results
            document.querySelector('.roi-calculator').classList.add('hidden');
            document.querySelector('.roi-results').classList.remove('hidden');
            
            if (!this.data.results) return;
            
            const { costs, benefits, roi } = this.data.results;
            
            // Update cost summary
            document.querySelector('.implementation-cost').textContent = MediaAIToolkit.helpers.formatCurrency(costs.implementationCost);
            document.querySelector('.annual-cost').textContent = MediaAIToolkit.helpers.formatCurrency(costs.annualCost);
            document.querySelector('.five-year-cost').textContent = MediaAIToolkit.helpers.formatCurrency(costs.fiveYearCost);
            
            // Update benefit summary
            document.querySelector('.annual-efficiency-savings').textContent = MediaAIToolkit.helpers.formatCurrency(benefits.annualEfficiencySavings);
            document.querySelector('.annual-revenue-impact').textContent = MediaAIToolkit.helpers.formatCurrency(benefits.annualRevenueImpact);
            document.querySelector('.five-year-benefit').textContent = MediaAIToolkit.helpers.formatCurrency(benefits.fiveYearBenefit);
            
            // Update ROI metrics
            document.querySelector('.first-year-roi').textContent = `${roi.firstYearROI}%`;
            document.querySelector('.five-year-roi').textContent = `${roi.fiveYearROI}%`;
            document.querySelector('.payback-period').textContent = `${roi.paybackPeriod}`;
            
            // Update financial projection visualization
            document.querySelectorAll('.year-net-benefit').forEach((element, index) => {
                const netBenefit = roi.cumulativeNetBenefits[index];
                element.textContent = MediaAIToolkit.helpers.formatCurrency(netBenefit);
            });
            
            document.querySelectorAll('.graph-bar').forEach((bar, index) => {
                // Calculate width as percentage of maximum value (with min 5% for visibility)
                const maxValue = Math.max(...roi.cumulativeNetBenefits);
                const percentage = Math.max(5, (roi.cumulativeNetBenefits[index] / maxValue) * 100);
                bar.style.width = `${percentage}%`;
            });
            
            // Update implementation recommendation
            const recommendationElement = document.querySelector('.implementation-recommendation');
            if (recommendationElement) {
                let recommendation = '';
                
                if (roi.firstYearROI > 50 && roi.paybackPeriod < 9) {
                    recommendation = '<span class="font-bold text-green-600">Strongly Recommended</span>: This implementation shows a strong first-year ROI with excellent long-term returns. The business case is compelling and implementation should be prioritized.';
                } else if (roi.firstYearROI > 20 || roi.fiveYearROI > 100) {
                    recommendation = '<span class="font-bold text-green-600">Recommended</span>: This implementation shows positive ROI with good long-term value. Consider as a high-priority initiative.';
                } else if (roi.firstYearROI > 0 && roi.fiveYearROI > 50) {
                    recommendation = '<span class="font-bold text-yellow-600">Consider</span>: This implementation has a positive but moderate ROI. Implementation should be considered against other strategic initiatives.';
                } else {
                    recommendation = '<span class="font-bold text-red-600">Review</span>: This implementation shows low or negative first-year ROI. Consider adjusting scope or approach, or exploring alternative implementation models.';
                }
                
                recommendationElement.innerHTML = recommendation;
            }
            
            // Update industry benchmarks comparison
            this.updateBenchmarkComparison();
        },
        
        // Update industry benchmark comparison
        updateBenchmarkComparison: function() {
            const comparisonRow = document.querySelector('.comparison-row-your-projection');
            if (!comparisonRow || !this.data.results) return;
            
            const { roi } = this.data.results;
            
            // Update your projection row
            comparisonRow.querySelector('.comparison-roi').textContent = `${roi.firstYearROI}%`;
            comparisonRow.querySelector('.comparison-payback').textContent = `${roi.paybackPeriod} months`;
        },
        
        // Load saved ROI data
        loadSavedData: function() {
            const savedData = MediaAIToolkit.state.roiData;
            if (Object.keys(savedData).length > 0) {
                this.data = Object.assign({}, this.data, savedData);
                MediaAIToolkit.log('Loaded saved ROI data');
            }
        },
        
        // Get current data for saving
        getCurrentData: function() {
            return MediaAIToolkit.helpers.deepClone(this.data);
        },
        
        // Check if ROI calculation is complete
        isComplete: function() {
            return this.data.completed === true;
        },
        
        // Get progress for a specific step
        getStepProgress: function(step) {
            // For ROI tool, this is binary - not applicable or 100%
            return this.data.completed ? 100 : 0;
        },
        
        // Handle tool-specific actions
        handleAction: function(action) {
            // Handle ROI-specific actions here
            MediaAIToolkit.log('ROI tool handling action:', action);
            
            if (action === 'calculate-roi') {
                this.calculateROI();
            }
        },
        
        // Reset the ROI calculator
        reset: function() {
            this.data = {
                organization: {
                    size: 'medium',
                    contentVolume: 100,
                    contentCreators: 10,
                    hourlyRate: 50
                },
                implementation: {
                    useCase: 'content-creation',
                    scope: 'focused',
                    infrastructure: 'some',
                    implementationCost: null,
                    annualCost: null
                },
                benefits: {
                    efficiencyGain: null,
                    qualityImprovement: null,
                    audienceGrowth: null,
                    revenueIncrease: null
                },
                results: null,
                completed: false
            };
            
            // Show calculator form, hide results
            document.querySelector('.roi-calculator').classList.remove('hidden');
            document.querySelector('.roi-results').classList.add('hidden');
            
            // Reset form inputs
            document.querySelectorAll('[data-param-group]').forEach(input => {
                if (input.tagName === 'SELECT') {
                    // Find the default option
                    const defaultOption = Array.from(input.options).find(option => option.defaultSelected);
                    if (defaultOption) {
                        input.value = defaultOption.value;
                    }
                } else if (input.type === 'number') {
                    const paramGroup = input.getAttribute('data-param-group');
                    const param = input.getAttribute('data-param');
                    
                    if (paramGroup === 'organization') {
                        input.value = this.data.organization[param];
                    } else if (paramGroup === 'implementation' && typeof this.data.implementation[param] === 'number') {
                        input.value = this.data.implementation[param];
                    } else {
                        input.value = '';
                    }
                }
            });
            
            // Update benefit placeholders
            this.updateBenefitPlaceholders();
        }
    }
};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    MediaAIToolkit.init();
});

// Handle saving before page unload
window.addEventListener('beforeunload', function() {
    MediaAIToolkit.saveCurrentState();
});

// Handle visibility change (tab switch, etc.)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        MediaAIToolkit.saveCurrentState();
    }
});

        
        // Calculate benefits
        calculateBenefits: function() {
            const { contentVolume, contentCreators, hourlyRate } = this.data.organization;
            const { useCase } = this.data.implementation;
            let { efficiencyGain, qualityImprovement, audienceGrowth, revenueIncrease } = this.data.benefits;
            
            // Use benchmark values for any null benefits
            const benchmark = this.benchmarks[useCase] || this.benchmarks['content-creation'];
            
            efficiencyGain = efficiencyGain !== null ? efficiencyGain : benchmark.efficiencyGain;
            qualityImprovement = qualityImprovement !== null ? qualityImprovement : benchmark.qualityImprovement;
            audienceGrowth = audienceGrowth !== null ? audienceGrowth : benchmark.audienceGrowth;
            revenueIncrease = revenueIncrease !== null ? revenueIncrease : benchmark.revenueIncrease;
            
            // Calculate efficiency savings
            const annualHours = contentCreators * 2000; // Approx. 2000 working hours per year
            const efficiencySavings = annualHours * efficiencyGain * hourlyRate;
            
            // Calculate revenue impact (simplified model)
            const baseRevenue = contentVolume * 100 * 52; // Assume $100 per piece of content per week
            const revenueImpact = baseRevenue * (qualityImprovement * 0.3 + audienceGrowth * 0.4 + revenueIncrease);
            
            // Calculate total annual benefit
            const annualBenefit = efficiencySavings + revenueImpact;
            
            return {
                annualEfficiencySavings: Math.round(efficiencySavings * 1000) / 1000,
                annualRevenueImpact: Math.round(revenueImpact * 1000) / 1000,
                annualBenefit: Math.round(annualBenefit * 1000) / 1000,
                fiveYearBenefit: Math.round(annualBenefit * 5 * 1000) / 1000,
                yearlyBenefits: [
                    Math.round(annualBenefit * 0.7 * 1000) / 1000, // Year 1 (70% of full benefit)
                    Math.round(annualBenefit * 0.9 * 1000) / 1000, // Year 2 (90% of full benefit)
                    Math.round(annualBenefit * 1.0 * 1000) / 1000, // Year 3 (100% of full benefit)
                    Math.round(annualBenefit * 1.1 * 1000) / 1000, // Year 4 (110% of full benefit - assuming growth)
                    Math.round(annualBenefit * 1.2 * 1000) / 1000  // Year 5 (120% of full benefit - assuming growth)
                ]
