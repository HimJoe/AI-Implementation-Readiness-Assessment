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
    
    // Set initial values from demo elements
    initializeScores();
    
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
    const nextButtons = document.querySelectorAll('.next-category');
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Move to next category if valid
            if (currentCategory < categoryNames.length - 1) {
                currentCategory++;
                updateCategoryVisibility();
                window.scrollTo(0, 0); // Scroll to top for new category
            } else {
                // Show results if at the last category
                showResults();
            }
        });
    });
    
    // Previous category buttons
    const prevButtons = document.querySelectorAll('.prev-category');
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (currentCategory > 0) {
                currentCategory--;
                updateCategoryVisibility();
                window.scrollTo(0, 0); // Scroll to top for new category
            } else {
                // If at first category, go back to introduction
                showIntroduction();
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

    // Initialize scores from existing UI elements
    function initializeScores() {
        // This function sets initial scores based on any pre-selected options
        // in the demo interface for a better user experience
        const indicators = document.querySelectorAll('.score-indicator[data-category]');
        indicators.forEach(indicator => {
            const category = parseInt(indicator.getAttribute('data-category'));
            if (!isNaN(category)) {
                const widthStr = indicator.style.width;
                if (widthStr) {
                    const width = parseInt(widthStr);
                    if (!isNaN(width)) {
                        // Convert width percentage to a score (5.0 scale)
                        const score = (width / 100) * 5;
                        categoryScores[category] = score;
                        answeredQuestions[category] = 1; // Assume one question answered
                    }
                }
            }
        });
        
        // Update the displays with these initial values
        updateScoreDisplay();
    }
    
    // Show introduction, hide all categories
    function showIntroduction() {
        document.getElementById('introduction').style.display = 'block';
        
        // Hide all category sections
        const categorySections = document.querySelectorAll('.category-section');
        categorySections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Hide results section
        document.getElementById('results-section').style.display = 'none';
        
        // Reset current category
        currentCategory = 0;
    }
    
    // Show results section, hide categories
    function showResults() {
        // Hide all category sections
        const categorySections = document.querySelectorAll('.category-section');
        categorySections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Hide introduction
        document.getElementById('introduction').style.display = 'none';
        
        // Show results section
        document.getElementById('results-section').style.display = 'block';
        
        // Update scores one last time
        updateScoreDisplay();
    }
    
    // Update category visibility based on current category
    function updateCategoryVisibility() {
        // Hide all category sections
        const categorySections = document.querySelectorAll('.category-section');
        categorySections.forEach((section, index) => {
            if (index === currentCategory) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
        
        // Hide introduction and results
        document.getElementById('introduction').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
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

    // Set up the Begin Assessment button
    const beginAssessmentBtn = document.getElementById('beginAssessment');
    if (beginAssessmentBtn) {
        beginAssessmentBtn.addEventListener('click', function() {
            // Show the first category, hide introduction
            document.getElementById('introduction').style.display = 'none';
            document.getElementById('category1').style.display = 'block';
        });
    }
});
