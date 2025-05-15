// script.js for Readiness Assessment tool

document.addEventListener('DOMContentLoaded', function() {
    console.log('Readiness Assessment tool script loaded');
    
    // Initialize state
    let currentCategory = 0;
    const categoryScores = [0, 0, 0, 0, 0];
    const maxQuestionsPerCategory = 5;
    const answeredQuestions = [0, 0, 0, 0, 0];
    let overallScore = 0;
    
    // Category names for the report
    const categoryNames = [
        "Technical Infrastructure", 
        "Data Readiness", 
        "Organizational Alignment", 
        "Use Cases", 
        "Governance"
    ];
    
    // Initialize the visibility of categories
    initializeCategoryVisibility();
    
    // Add event listeners to option buttons
    const optionButtons = document.querySelectorAll('.option-card button, .grid button');
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the parent question container
            const questionContainer = this.closest('.mb-8');
            if (!questionContainer) return;
            
            // Get all buttons in this question group
            const buttons = questionContainer.querySelectorAll('button');
            
            // Remove selection from all buttons in group
            buttons.forEach(btn => {
                btn.classList.remove('bg-blue-50', 'border-blue-500');
                btn.classList.add('hover:bg-gray-50', 'border-gray-200');
            });
            
            // Add selection to clicked button
            this.classList.add('bg-blue-50', 'border-blue-500');
            this.classList.remove('hover:bg-gray-50', 'border-gray-200');
            
            // Extract the value from the button (first character, typically 1-5)
            const valueText = this.innerText.trim().split('.')[0];
            const value = parseInt(valueText);
            
            if (!isNaN(value) && value >= 1 && value <= 5) {
                // Update the score for the current category
                categoryScores[currentCategory] += value;
                answeredQuestions[currentCategory]++;
                
                // Update score display
                updateScoreDisplay();
            }
        });
    });
    
    // Add event listeners to navigation buttons
    const nextButtons = document.querySelectorAll('.next-category, button:contains("Continue")');
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Move to next category if valid
            if (currentCategory < categoryNames.length - 1) {
                currentCategory++;
                updateCategoryVisibility();
                window.scrollTo(0, 0); // Scroll to top for new category
            }
        });
    });
    
    // Previous category buttons
    const prevButtons = document.querySelectorAll('.prev-category, button:contains("Back")');
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (currentCategory > 0) {
                currentCategory--;
                updateCategoryVisibility();
                window.scrollTo(0, 0); // Scroll to top for new category
            }
        });
    });
    
    // Add event listener to download report button
    const downloadButtons = document.querySelectorAll('button:contains("Download")');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            generateReport();
        });
    });

    // Initialize category visibility
    function initializeCategoryVisibility() {
        const categoryContainers = document.querySelectorAll('.category-section, .bg-white.rounded-xl.shadow-md.p-8.mb-10');
        
        // Hide all categories except the first one
        categoryContainers.forEach((container, index) => {
            if (index === 0 || container.classList.contains('introduction')) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    }
    
    // Update category visibility based on current category
    function updateCategoryVisibility() {
        const categoryContainers = document.querySelectorAll('.category-section, .bg-white.rounded-xl.shadow-md.p-8.mb-10');
        
        categoryContainers.forEach((container, index) => {
            // Always show introduction and results sections
            if (container.classList.contains('introduction') || 
                container.classList.contains('results-section')) {
                container.style.display = 'block';
                return;
            }
            
            // Show current category, hide others
            if (index === currentCategory + 1) { // +1 because of the introduction section
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
        
        // Show results section if all categories are complete
        if (currentCategory === categoryNames.length - 1) {
            const resultsSection = document.querySelector('.results-section');
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
        }
    }
    
    // Update score displays
    function updateScoreDisplay() {
        // Update category scores
        for (let i = 0; i < categoryScores.length; i++) {
            const score = answeredQuestions[i] > 0 
                ? (categoryScores[i] / answeredQuestions[i]).toFixed(1) 
                : "0.0";
                
            // Update score indicators
            const indicators = document.querySelectorAll(`.score-indicator[data-category="${i}"]`);
            indicators.forEach(indicator => {
                const percentage = (score / 5) * 100;
                indicator.style.width = `${percentage}%`;
            });
            
            // Update score text
            const scoreTexts = document.querySelectorAll(`.score-text[data-category="${i}"]`);
            scoreTexts.forEach(text => {
                text.textContent = `${score}/5.0`;
            });
        }
        
        // Calculate and update overall score
        let totalAnsweredQuestions = answeredQuestions.reduce((a, b) => a + b, 0);
        let totalScore = categoryScores.reduce((a, b) => a + b, 0);
        overallScore = totalAnsweredQuestions > 0 
            ? (totalScore / totalAnsweredQuestions).toFixed(1) 
            : "0.0";
            
        // Update overall score displays
        const overallScoreElements = document.querySelectorAll('.overall-score');
        overallScoreElements.forEach(element => {
            element.textContent = `${overallScore}/5.0`;
        });
        
        // Update overall score indicator
        const overallIndicator = document.querySelector('.overall-indicator');
        if (overallIndicator) {
            const percentage = (overallScore / 5) * 100;
            overallIndicator.style.width = `${percentage}%`;
        }
    }
    
    // Generate and download PDF report
    function generateReport() {
        console.log('Generating report...');
        
        try {
            // Create PDF using jsPDF
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                throw new Error('jsPDF library not loaded');
            }
            
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(22);
            doc.setTextColor(0, 51, 102);
            doc.text('Media AI Readiness Assessment Report', 20, 20);
            
            // Add date
            const today = new Date();
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${today.toLocaleDateString()}`, 20, 30);
            
            // Add overall score
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(`Overall Readiness Score: ${overallScore}/5.0`, 20, 45);
            
            // Add maturity level
            let maturityLevel = '';
            if (overallScore < 1.5) maturityLevel = 'Experimental';
            else if (overallScore < 2.5) maturityLevel = 'Functional';
            else if (overallScore < 3.5) maturityLevel = 'Integrated';
            else if (overallScore < 4.5) maturityLevel = 'Scalable';
            else maturityLevel = 'Transformative';
            
            doc.text(`Maturity Level: ${maturityLevel}`, 20, 55);
            
            // Add category scores
            doc.setFontSize(14);
            doc.text('Category Scores:', 20, 70);
            
            doc.setFontSize(12);
            for (let i = 0; i < categoryNames.length; i++) {
                const score = answeredQuestions[i] > 0 
                    ? (categoryScores[i] / answeredQuestions[i]).toFixed(1) 
                    : "0.0";
                    
                doc.text(`${categoryNames[i]}: ${score}/5.0`, 25, 85 + (i * 10));
            }
            
            // Add recommendations section
            doc.setFontSize(14);
            doc.setTextColor(0, 51, 102);
            doc.text('Key Recommendations:', 20, 145);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            
            // Provide recommendations based on the lowest scoring category
            let lowestScore = 5;
            let lowestCategory = 0;
            
            for (let i = 0; i < categoryScores.length; i++) {
                if (answeredQuestions[i] > 0) {
                    const score = categoryScores[i] / answeredQuestions[i];
                    if (score < lowestScore) {
                        lowestScore = score;
                        lowestCategory = i;
                    }
                }
            }
            
            doc.text(`Priority Focus Area: ${categoryNames[lowestCategory]}`, 25, 160);
            
            // Add specific recommendations based on category
            let recommendations = [];
            switch(lowestCategory) {
                case 0: // Technical Infrastructure
                    recommendations = [
                        "Develop API strategy for AI implementation",
                        "Assess and upgrade computing resources as needed",
                        "Implement modern data pipeline architecture",
                        "Evaluate cloud vs. on-premise options for AI workloads"
                    ];
                    break;
                case 1: // Data Readiness
                    recommendations = [
                        "Conduct comprehensive data quality assessment",
                        "Implement metadata enrichment program",
                        "Develop data governance standards",
                        "Create unified content taxonomy"
                    ];
                    break;
                case 2: // Organizational Alignment
                    recommendations = [
                        "Create cross-functional AI implementation team",
                        "Develop AI champions program among editorial staff",
                        "Create executive education program on media AI applications",
                        "Establish clear AI vision with executive sponsorship"
                    ];
                    break;
                case 3: // Use Cases
                    recommendations = [
                        "Prioritize use cases based on business impact",
                        "Develop clear success metrics for AI initiatives",
                        "Create MVP implementation roadmap",
                        "Establish feedback loops for use case refinement"
                    ];
                    break;
                case 4: // Governance
                    recommendations = [
                        "Develop AI ethics guidelines specific to media context",
                        "Implement AI quality assurance framework",
                        "Create AI review board with editorial representation",
                        "Establish regular AI oversight reporting process"
                    ];
                    break;
            }
            
            // Add recommendations to PDF
            for (let i = 0; i < recommendations.length; i++) {
                doc.text(`${i+1}. ${recommendations[i]}`, 30, 175 + (i * 10));
            }
            
            // Add footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('MediaAI Toolkit - www.github.com/HimJoe/MediaAI-Toolkit', 20, 280);
            
            // Save the PDF
            doc.save('MediaAI_Readiness_Assessment.pdf');
            console.log('Report generated successfully');
            
        } catch (error) {
            console.error('Error generating report:', error);
            alert('There was an error generating the report. Please check console for details.');
        }
    }
});
