/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from 'https://esm.sh/html2canvas';

/**
 * Handles real-time updates for the ID card generator.
 */
function initializeIdCardGenerator() {
    const form = document.getElementById('id-form');
    if (!form) {
        console.error('Form element #id-form not found.');
        return;
    }

    // Function to update a card element
    const updateCardElement = (targetId: string | null, value: string) => {
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.textContent = value;
            }
        }
    };

    // Handle text and other simple input updates
    const inputs = form.querySelectorAll<HTMLInputElement>('input[type="text"]');
    inputs.forEach(input => {
        // Set initial values on page load
        updateCardElement(input.dataset.target || null, input.value);
        
        // Add event listener for real-time updates
        input.addEventListener('input', () => {
            updateCardElement(input.dataset.target || null, input.value);
        });
    });

    // Handle photo upload
    const photoInput = document.getElementById('input-photo') as HTMLInputElement;
    const mainPhoto = document.getElementById('card-photo-main') as HTMLImageElement;
    const secondaryPhoto = document.getElementById('card-photo-secondary') as HTMLImageElement;

    if (photoInput && mainPhoto && secondaryPhoto) {
        photoInput.addEventListener('change', () => {
            if (photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const imageUrl = e.target?.result as string;
                    if (!imageUrl) return;

                    // Update main photo immediately
                    mainPhoto.src = imageUrl;

                    // Create a grayscale version for the secondary photo to ensure it downloads correctly
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;

                        canvas.width = img.width;
                        canvas.height = img.height;
                        
                        ctx.filter = 'grayscale(100%)';
                        ctx.drawImage(img, 0, 0);

                        secondaryPhoto.src = canvas.toDataURL('image/png');
                    };
                    img.crossOrigin = "Anonymous"; // Handle potential CORS issues with html2canvas
                    img.src = imageUrl;
                };
                
                reader.readAsDataURL(photoInput.files[0]);
            }
        });
    } else {
        console.error('One or more photo elements are missing from the DOM.');
    }

    // Handle card download
    const downloadBtn = document.getElementById('download-btn');
    const cardContainer = document.getElementById('card-container');

    if (downloadBtn && cardContainer) {
        downloadBtn.addEventListener('click', () => {
            html2canvas(cardContainer, {
                useCORS: true, // Needed for external images like the default avatar
                scale: 2 // Render at 2x resolution for better quality
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'id-card.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    } else {
        console.error('Download button or card container is missing from the DOM.');
    }
}

// Wait for the DOM to be fully loaded before running the script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIdCardGenerator);
} else {
    initializeIdCardGenerator();
}