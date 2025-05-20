/**
 * MediaAI Toolkit Interactive Features
 * This script adds interactivity to the MediaAI Toolkit HTML files
 * Main functionality for GitHub Pages deployment
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('MediaAI Toolkit interactive features initialized');
    
    // Make option cards interactive
    makeOptionsInteractive();
    
    // Make form inputs interactive
    makeFormsInteractive();
    
    // Add PDF export functionality to buttons
    addPdfExport();
    
    // Initialize any toggle buttons
    initializeToggles();
    
    // Mark challenge selection grid as multi-select
    markChallengeGridMultiSelect();
    
    // Highlight the current tool in navigation
    highlightCurrentTool();
});

/**
 * Highlights the current tool in the navigation
 */
function highlightCurrentTool() {
    // Get the current path
    const path = window.location.pathname;
    
    // Find all navigation links
    const navLinks = document.querySelectorAll('.nav-item');
    
    // Loop through links and highlight the matching one
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && path.includes(href)) {
            link.classList.add('text-white');
            link.classList.remove('text-gray-200');
            
            // Add underline
            const underline = document.createElement('div');
            underline.className = 'w-full h-0.5 bg-white mt-1';
            link.appendChild(underline);
        }
    });
}

/**
 * Makes option cards clickable and handles selection state
 */
function makeOptionsInteractive() {
    // Find all option cards
    const optionCards = document.querySelectorAll('.option-card');
    
    // Add click event to each card
    optionCards.forEach(card => {
        // Add cursor pointer style
        card.style.cursor = 'pointer';
        
        // Add click event
        card.addEventListener('click', function() {
            // Get the parent grid
            const parentGrid = this.closest('.grid');
            if (!parentGrid) return;
            
            // Check if this is a multi-select grid
            const isMultiSelect = parentGrid.classList.contains('multi-select');
            
            if (isMultiSelect) {
                // Toggle selection
                this.classList.toggle('selected');
                this.classList.toggle('border-gray-200');
                
                // Toggle border color
                if (this.classList.contains('selected')) {
                    this.style.borderColor = '#3b82f6'; // blue-500
                    this.style.backgroundColor = '#eff6ff'; // blue-50
                } else {
                    this.style.borderColor = '#e5e7eb'; // gray-200
                    this.style.backgroundColor = 'white';
                }
                
                // Update icon colors
                updateIconColors(this);
                
                // Show/hide checkmark if present
                toggleCheckmark(this);
            } else {
                // Get all sibling cards
                const siblingCards = parentGrid.querySelectorAll('.option-card');
                
                // Deselect all siblings
                siblingCards.forEach(siblingCard => {
                    siblingCard.classList.remove('selected');
                    siblingCard.style.borderColor = '#e5e7eb'; // gray-200
                    siblingCard.style.backgroundColor = 'white';
                    
                    // Update sibling icons
                    updateIconColors(siblingCard, false);
                    
                    // Hide sibling checkmarks
                    toggleCheckmark(siblingCard, false);
                });
                
                // Select this card
                this.classList.add('selected');
                this.style.borderColor = '#3b82f6'; // blue-500
                this.style.backgroundColor = '#eff6ff'; // blue-50
                
                // Update icon colors
                updateIconColors(this, true);
                
                // Show checkmark
                toggleCheckmark(this, true);
            }
        });
    });
    
    // Also handle direct button options in grids
    const gridButtons = document.querySelectorAll('.grid button');
    gridButtons.forEach(button => {
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', function() {
            // Get parent question container
            const parentContainer = this.closest('.mb-8');
            if (!parentContainer) return;
            
            // Get all buttons in this container
            const buttons = parentContainer.querySelectorAll('button');
            
            // Deselect all buttons
            buttons.forEach(btn => {
                btn.classList.remove('bg-blue-50', 'border-blue-500');
                if (!btn.classList.contains('bg-blue-50')) {
                    btn.classList.add('hover:bg-gray-50', 'border-gray-200');
                }
            });
            
            // Select this button
            this.classList.add('bg-blue-50', 'border-blue-500');
            this.classList.remove('hover:bg-gray-50', 'border-gray-200');
        });
    });
}

/**
 * Updates icon colors based on selection state
 */
function updateIconColors(card, isSelected) {
    // If isSelected is not provided, use the card's selected state
    if (isSelected === undefined) {
        isSelected = card.classList.contains('selected');
    }
    
    // Find the icon container
    const iconContainer = card.querySelector('.w-10.h-10, .feature-icon');
    if (!iconContainer) return;
    
    // Find the icon
    const icon = iconContainer.querySelector('i');
    if (!icon) return;
    
    if (isSelected) {
        // Update to blue
        iconContainer.classList.remove('bg-gray-100');
        iconContainer.classList.add('bg-blue-100');
        
        icon.classList.remove('text-gray-600');
        icon.classList.add('text-blue-600');
    } else {
        // Update to gray
        iconContainer.classList.add('bg-gray-100');
        iconContainer.classList.remove('bg-blue-100');
        
        icon.classList.add('text-gray-600');
        icon.classList.remove('text-blue-600');
    }
}

/**
 * Toggles the visibility of the checkmark icon
 */
function toggleCheckmark(card, isVisible) {
    // If isVisible is not provided, use the card's selected state
    if (isVisible === undefined) {
        isVisible = card.classList.contains('selected');
    }
    
    // Find the checkmark container
    const checkmark = card.querySelector('.flex.items-center.text-blue-600');
    if (!checkmark) {
        // If no checkmark exists and we want to show it, create one
        if (isVisible) {
            const title = card.querySelector('h4.text-lg, h4.font-bold');
            if (title) {
                const checkmarkHTML = `
                    <div class="flex items-center text-blue-600">
                        <i class="fas fa-check-circle mr-1"></i>
                        <span class="text-sm font-medium">Selected</span>
                    </div>
                `;
                title.insertAdjacentHTML('afterend', checkmarkHTML);
            }
        }
    } else {
        // Show/hide existing checkmark
        checkmark.style.display = isVisible ? 'flex' : 'none';
    }
}

/**
 * Makes form inputs interactive and handles calculation updates
 */
function makeFormsInteractive() {
    // Find all inputs and selects
    const inputs = document.querySelectorAll('input, select');
    
    // Add change events
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            // Trigger any calculations
            updateCalculations();
        });
    });
    
    // Find calculate buttons
    const calculateButtons = document.querySelectorAll('.pulse-btn, button:contains("Calculate")');
    calculateButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update calculations and scroll to results
            updateCalculations();
            scrollToResults();
        });
    });
}

/**
 * Updates calculations in the results section
 */
function updateCalculations() {
    // Find ROI elements
    const roiElements = document.querySelectorAll('.text-3xl.font-bold');
    
    // Update with random variations for demo purposes
    roiElements.forEach(element => {
        const text = element.textContent;
        
        if (text.includes('%')) {
            // Update percentage values
            const currentValue = parseInt(text.replace('%', ''));
            if (!isNaN(currentValue)) {
                const newValue = Math.floor(currentValue * (0.95 + Math.random() * 0.1));
                element.textContent = `${newValue}%`;
            }
        } else if (text.includes('months')) {
            // Update month values
            const parts = text.split(' ');
            if (parts.length > 0) {
                const currentValue = parseFloat(parts[0]);
                if (!isNaN(currentValue)) {
                    const newValue = (currentValue * (0.95 + Math.random() * 0.1)).toFixed(1);
                    element.innerHTML = `${newValue} <span class="text-lg">months</span>`;
                }
            }
        } else if (text.includes('$')) {
            // Update dollar values
            const currentValue = parseInt(text.replace('$', '').replace(/,/g, ''));
            if (!isNaN(currentValue)) {
                const newValue = Math.floor(currentValue * (0.95 + Math.random() * 0.1));
                element.textContent = `$${newValue.toLocaleString()}`;
            }
        }
    });
    
    // Animate progress bars if present
    const progressBars = document.querySelectorAll('.graph-bar, .score-indicator');
    progressBars.forEach(bar => {
        const widthStr = bar.style.width || '0%';
        const currentWidth = parseInt(widthStr);
        const newWidth = Math.min(Math.max(30, currentWidth + (Math.random() - 0.5) * 10), 95);
        bar.style.width = `${newWidth}%`;
    });
}

/**
 * Scrolls to the results section
 */
function scrollToResults() {
    // Find results section
    const resultsSection = document.querySelector('#results-section, .bg-white.rounded-xl.shadow-md:last-of-type');
    
    if (resultsSection) {
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Adds PDF export functionality using browser's print capabilities
 */
function addPdfExport() {
    // Find download buttons to add PDF export buttons next to them
    const downloadButtons = document.querySelectorAll('button:contains("Download")');
    
    // Process download buttons
    downloadButtons.forEach(button => {
        // Create PDF export button
        const pdfButton = document.createElement('button');
        pdfButton.className = button.className; // Copy style from download button
        pdfButton.innerHTML = '<i class="fas fa-file-pdf mr-2"></i> Save as PDF';
        pdfButton.addEventListener('click', printAsPdf);
        
        // Add button after download button
        button.parentNode.insertBefore(pdfButton, button.nextSibling);
    });
    
    // Find existing PDF buttons
    const pdfButtons = document.querySelectorAll('button:contains("PDF")');
    pdfButtons.forEach(button => {
        button.addEventListener('click', printAsPdf);
    });
}

/**
 * Uses the browser's print functionality to generate a PDF
 */
function printAsPdf() {
    // Alert user about printing
    alert('The page will now open the print dialog. To save as PDF:\n\n1. Select "Save as PDF" or "Microsoft Print to PDF" as your printer\n2. Click "Print" or "Save"');
    
    // Create a stylesheet for print
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';
    style.innerHTML = `
        @media print {
            body * {
                visibility: hidden;
            }
            main, main * {
                visibility: visible;
            }
            main {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            .no-print, button, nav, footer {
                display: none !important;
            }
        }
    `;
    
    // Add the style to the document
    document.head.appendChild(style);
    
    // Open print dialog
    window.print();
    
    // Remove the style after printing
    setTimeout(() => {
        document.head.removeChild(style);
    }, 1000);
}

/**
 * Initializes toggle buttons like those in the ROI calculator
 */
function initializeToggles() {
    // Find toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    // Add click events
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Deactivate all toggle buttons in the group
            const buttonGroup = this.closest('div');
            if (!buttonGroup) return;
            
            const groupButtons = buttonGroup.querySelectorAll('.toggle-btn');
            
            groupButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-gray-500');
                
                // Remove underline
                btn.style.borderBottom = 'none';
            });
            
            // Activate this button
            this.classList.add('active');
            this.classList.remove('text-gray-500');
            
            // Add underline
            this.style.borderBottom = '2px solid #7e22ce'; // purple-600
        });
    });
}

/**
 * Marks the challenges grid as multi-select
 */
function markChallengeGridMultiSelect() {
    // Find the challenges section
    const challengesHeader = Array.from(document.querySelectorAll('h4')).find(h => 
        h.textContent.includes('Challenges') || h.textContent.includes('challenges')
    );
    
    if (challengesHeader) {
        // Find the grid
        let grid = challengesHeader;
        
        // Look for the next grid element
        while (grid && !grid.classList.contains('grid')) {
            grid = grid.nextElementSibling;
            if (!grid) break;
        }
        
        // Mark as multi-select if found
        if (grid && grid.classList.contains('grid')) {
            grid.classList.add('multi-select');
        }
    }
}
