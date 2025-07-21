// ai.js - AI functionality for Shotblockr
// This file handles AI-related operations like image generation and refinement

console.log("AI module loaded");

// Counters for unique IDs
let imageGenerationCounter = 0;
let refineSectionCounter = 0;

/**
 * Creates a new image generation block by copying the hidden template,
 * assigning a unique ID, and making it visible at the bottom of the stack
 */
function createImageGenerationBlock() {
    // Find the hidden template block
    const hiddenTemplate = document.querySelector(".image-generation-block");

    if (!hiddenTemplate) {
        console.error("Hidden images-generation-block template not found");
        return null;
    }

    // Clone the template
    const newBlock = hiddenTemplate.cloneNode(true);

    // Generate unique ID
    imageGenerationCounter++;
    const uniqueId = `image-generation-block-${imageGenerationCounter}`;
    newBlock.id = uniqueId;

    // Make it visible
    newBlock.style.display = "block";
    newBlock.style.visibility = "visible";

    // Ensure loading message is visible and image wrapper is hidden initially
    const loadingMessage = newBlock.querySelector(".loading-message");
    const imageWrapper = newBlock.querySelector(".image-wrapper");

    if (loadingMessage) {
        loadingMessage.style.display = "block";
        loadingMessage.classList.remove("error-message"); // Remove any previous error state
        loadingMessage.textContent = "Generating image"; // Reset to default text
    }
    if (imageWrapper) {
        imageWrapper.style.display = "none";
    }

    // Find the container where image blocks should be added
    const container = hiddenTemplate.parentNode;

    // Add the new block at the bottom of the stack
    container.appendChild(newBlock);
    return newBlock;
}

/**
 * Creates a new refine section by copying the hidden template,
 * assigning a unique ID, and making it visible at the bottom of the stack
 */
function createRefineSectionBlock() {
    // Find the hidden template refine section
    const hiddenTemplate = document.querySelector(".refine-section");

    if (!hiddenTemplate) {
        console.error("Hidden refine-section template not found");
        return null;
    }

    // Clone the template
    const newRefineSection = hiddenTemplate.cloneNode(true);

    // Generate unique ID
    refineSectionCounter++;
    const uniqueId = `refine-section-${refineSectionCounter}`;
    newRefineSection.id = uniqueId;

    // Make it visible
    newRefineSection.style.display = "block";
    newRefineSection.style.visibility = "visible";

    // Update the onclick handler to pass the specific section
    const refineButton = newRefineSection.querySelector(".generate-button");
    if (refineButton) {
        refineButton.setAttribute("onclick", `refineImage(this)`);
    }

    // Find the container where refine sections should be added
    const container = hiddenTemplate.parentNode;

    // Add the new section at the bottom of the stack
    container.appendChild(newRefineSection);

    // Set up character count functionality for the new refine section
    setupCharacterCountForRefineSection(newRefineSection, uniqueId);

    return newRefineSection;
}

/**
 * Hides all previous refine sections (freezes them)
 */
function hidePreviousRefineSections() {
    const allRefineSections = document.querySelectorAll(
        '.refine-section[id^="refine-section-"]',
    );
    allRefineSections.forEach((section) => {
        section.style.display = "none";
    });
}

/**
 * Freezes a specific refine section (disables it)
 */
function freezeRefineSection(refineSectionElement) {
    if (!refineSectionElement) return;

    const textarea = refineSectionElement.querySelector(".prompt-textarea");
    const button = refineSectionElement.querySelector(".generate-button");

    if (textarea) {
        textarea.disabled = true;
        textarea.style.opacity = "0.6";
    }

    if (button) {
        button.disabled = true;
        button.style.opacity = "0.6";
        button.textContent = "Refining...";
    }

    console.log(
        `Frozen refine section: ${refineSectionElement.id || "unnamed"}`,
    );
}

/**
 * Sets up character count functionality for a refine section
 * @param {HTMLElement} refineSectionElement - The refine section element
 * @param {string} uniqueId - The unique ID for this refine section
 */
function setupCharacterCountForRefineSection(refineSectionElement, uniqueId) {
    const textarea = refineSectionElement.querySelector(".prompt-textarea");
    const countSpan = refineSectionElement.querySelector(
        ".character-count span",
    );
    const refineButton = refineSectionElement.querySelector(".generate-button");

    if (!textarea || !countSpan) {
        console.error(
            "Could not find textarea or count span for character count setup",
        );
        return;
    }

    const maxLength = 200;

    const updateCount = () => {
        const currentLength = textarea.value.length;
        const trimmedLength = textarea.value.trim().length;
        countSpan.textContent = `${currentLength}/200`;

        // Update styling based on character count
        const countContainer =
            refineSectionElement.querySelector(".character-count");
        if (countContainer) {
            if (currentLength > maxLength * 0.9) {
                countContainer.style.color = "#e74c3c"; // Red when near limit
            } else if (currentLength > maxLength * 0.7) {
                countContainer.style.color = "#f39c12"; // Orange when getting close
            } else {
                countContainer.style.color = "#7f8c8d"; // Default gray
            }
        }

        // Update button state based on whether prompt is empty
        if (refineButton) {
            if (trimmedLength === 0) {
                refineButton.disabled = true;
                refineButton.style.opacity = "0.6";
                refineButton.style.cursor = "not-allowed";
            } else {
                refineButton.disabled = false;
                refineButton.style.opacity = "1";
                refineButton.style.cursor = "pointer";
            }
        }
    };

    // Add event listeners
    textarea.addEventListener("input", updateCount);

    // Add Enter key listener to trigger refine button
    textarea.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Prevent new line

            // Check if there's text and button is enabled
            const trimmedLength = textarea.value.trim().length;
            if (trimmedLength > 0 && refineButton && !refineButton.disabled) {
                console.log("Enter key triggered in refine section:", uniqueId);
                console.log(
                    "Refine button onclick attribute:",
                    refineButton.getAttribute("onclick"),
                );

                // Call refineImage directly instead of clicking the button
                refineImage(refineButton);
            }
        }
    });

    // Initial call to set correct count and button state
    updateCount();
}

/**
 * Unified function to make Replicate API calls
 * @param {string} endpoint - Either 'multi-image' or 'refine'
 * @param {Object} inputData - API input parameters
 * @param {HTMLElement} block - The image generation block element
 */
async function callReplicateAPI(endpoint, inputData, block) {
    const apiEndpoints = {
        "multi-image": "/api/generate-image",
        refine: "/api/refine-image",
    };

    try {
        const response = await fetch(apiEndpoints[endpoint], {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `HTTP error! status: ${response.status} - ${errorText}`,
            );
        }

        const data = await response.json();

        // Handle the prediction response
        if (data.urls && data.urls.get) {
            // Poll for completion
            await pollReplicateStatus(data.urls.get, block);
        } else if (
            data.output &&
            Array.isArray(data.output) &&
            data.output.length > 0
        ) {
            // Sometimes the result is immediately available
            displayGeneratedImage(data.output[0], block);

            // After displaying image, hide previous refine sections and create a new one
            hidePreviousRefineSections();
            createRefineSectionBlock();
        } else {
            throw new Error("No prediction URL received from Replicate API");
        }
    } catch (error) {
        console.error("Error calling Replicate API:", error);
        console.error("Error message:", error.message);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });
        showErrorInBlock(block, extractErrorMessage(error));
    }
}

/**
 * Polls Replicate prediction status until completion
 * @param {string} statusUrl - URL to check prediction status
 * @param {HTMLElement} block - The image generation block element
 */
async function pollReplicateStatus(statusUrl, block) {
    try {
        const response = await fetch(
            `/api/replicate-status/${encodeURIComponent(statusUrl)}`,
        );

        const data = await response.json();

        if (data.status === "succeeded" && data.output) {
            // Handle both string and array output formats
            const imageUrl = Array.isArray(data.output)
                ? data.output[0]
                : data.output;
            displayGeneratedImage(imageUrl, block);

            // After displaying image, hide previous refine sections and create a new one
            hidePreviousRefineSections();
            createRefineSectionBlock();
        } else if (data.status === "failed") {
            throw new Error(data.error || "Image generation failed");
        } else if (data.status === "processing" || data.status === "starting") {
            // Continue polling
            setTimeout(() => pollReplicateStatus(statusUrl, block), 2000);
        }
    } catch (error) {
        console.error("Error polling status:", error);
        console.error("Error message:", error.message);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });
        showErrorInBlock(block, extractErrorMessage(error));
    }
}

/**
 * Displays the generated image in the block
 * @param {string} imageUrl - URL of the generated image
 * @param {HTMLElement} block - The image generation block element
 */
function displayGeneratedImage(imageUrl, block) {
    const loadingMessage = block.querySelector(".loading-message");
    const imageWrapper = block.querySelector(".image-wrapper");
    const imageElement = block.querySelector(".generated-image");
    const downloadButton = block.querySelector(".download-button");

    // Initially hide image wrapper and keep loading message visible
    if (imageWrapper) {
        imageWrapper.style.display = "none";
    }

    if (imageElement) {
        imageElement.src = imageUrl;
        imageElement.onload = () => {
            // Hide loading message and show image wrapper when image loads
            if (loadingMessage) {
                loadingMessage.style.display = "none";
                loadingMessage.classList.remove("error-message"); // Clean up any error state
            }
            if (imageWrapper) {
                imageWrapper.style.display = "block";
            }

            // Setup download button
            if (downloadButton) {
                const now = new Date();
                const filename = `shotblockr_${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()}_${now.getHours().toString().padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}-${now.getSeconds().toString().padStart(2, "0")}.jpg`;

                downloadButton.onclick = () =>
                    downloadImage(imageUrl, filename);
                downloadButton.style.display = "block";
            }
        };

        imageElement.onerror = (error) => {
            console.error("Image failed to load:", error);
        };
    } else {
        console.error("No image element found in block");
    }
}

/**
 * Downloads an image with the given filename
 * @param {string} imageUrl - URL of the image to download
 * @param {string} filename - Filename for the download
 */
function downloadImage(imageUrl, filename) {
    fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch((error) => console.error("Download failed:", error));
}

/**
 * Shows an error message in the block
 * @param {HTMLElement} block - The image generation block element
 * @param {string} message - Error message to display
 */
function showErrorInBlock(block, message) {
    const loadingMessage = block.querySelector(".loading-message");
    if (loadingMessage) {
        loadingMessage.textContent = `Error: ${message}`;
        loadingMessage.classList.add("error-message");
    }
}

/**
 * Extracts user-friendly error message from error object
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
function extractErrorMessage(error) {
    if (error.message.includes("502 Bad Gateway")) {
        return "The AI image service is temporarily unavailable. Please try again in a few minutes.";
    } else if (error.message.includes("503 Service Unavailable")) {
        return "The AI image service is temporarily down for maintenance. Please try again later.";
    } else if (error.message.includes("504 Gateway Timeout")) {
        return "The request timed out. Please try again.";
    } else {
        return error.message || "Unknown error occurred";
    }
}

/**
 * Gets screenshot data from the Babylon.js scene using promise-based approach
 * @returns {Promise<string>} Base64 encoded screenshot data
 */
function getScreenshotData() {
    console.log("Getting screenshot data...");

    // Find the babylon stage
    const stage =
        window.babylonStage ||
        (typeof babylonStage !== "undefined" ? babylonStage : null);

    if (!stage) {
        throw new Error(
            "3D scene not available. Please wait for the scene to load.",
        );
    }

    if (!stage.engine || !stage.camera) {
        throw new Error("3D scene not properly initialized.");
    }

    return new Promise((resolve, reject) => {
        try {
            // Temporarily disable highlight layer to remove glowing effects
            const highlightLayerEnabled = stage.highlightLayer
                ? stage.highlightLayer.isEnabled
                : false;
            if (stage.highlightLayer) {
                stage.highlightLayer.isEnabled = false;
            }

            // Check if 9:16 portrait ratio is selected
            const isPortraitRatio = window.selectedRatio === "720:1280";
            console.log(
                "Screenshot ratio mode:",
                isPortraitRatio ? "9:16 Portrait" : "16:9 Landscape",
            );

            // Calculate screenshot dimensions based on ratio
            let screenshotWidth, screenshotHeight;
            if (isPortraitRatio) {
                screenshotWidth = 1080;
                screenshotHeight = 1920;
            } else {
                screenshotWidth = 1200;
                screenshotHeight = 800;
            }

            BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                stage.engine,
                stage.camera,
                {
                    width: screenshotWidth,
                    height: screenshotHeight,
                    precision: 1.0,
                },
                (data) => {
                    // Re-enable highlight layer
                    if (stage.highlightLayer && highlightLayerEnabled) {
                        stage.highlightLayer.isEnabled = true;
                    }

                    console.log(
                        "Screenshot taken successfully using existing method",
                    );
                    resolve(data);
                },
                "image/png",
                1.0,
                false,
            );
        } catch (error) {
            console.error("Error taking screenshot:", error);
            reject(
                new Error(
                    "Failed to capture scene screenshot: " + error.message,
                ),
            );
        }
    });
}

/**
 * Gets the selected background data as base64
 * @returns {Promise<string>} Background image data as base64 data URL
 */
async function getBackgroundData() {
    // Get selected scene background
    const selectedBgElement = document.querySelector(
        "#sceneSelectionMain .scene-option.selected",
    );
    if (selectedBgElement) {
        const sceneType = selectedBgElement.getAttribute("data-scene");
        if (sceneType && sceneType !== "custom") {
            try {
                // Fetch the scene image and convert to base64
                const sceneResponse = await fetch(`/scenes/${sceneType}.jpg`);
                if (sceneResponse.ok) {
                    const sceneBlob = await sceneResponse.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(sceneBlob);
                    });
                }
            } catch (error) {
                console.error("Error loading background image:", error);
                throw new Error("Failed to load background image");
            }
        } else if (sceneType === "custom") {
            if (window.customBackgroundData) {
                return window.customBackgroundData;
            }
        }
    }

    throw new Error("No background selected");
}

/**
 * Gets the selected aspect ratio
 * @returns {string} Aspect ratio (e.g., "16:9" or "9:16")
 */
function getAspectRatio() {
    // First try to get from the global selectedRatio variable (used by existing ratio selection system)
    if (window.selectedRatio) {
        const ratioValue = window.selectedRatio;
        if (ratioValue === "1280:720") {
            return "16:9";
        } else if (ratioValue === "720:1280") {
            return "9:16";
        }
        return ratioValue;
    }

    // Fallback: look for CSS class-based selection
    const selectedRatio = document.querySelector(
        "#ratioSelection .ratio-option-detailed",
    );
    if (selectedRatio) {
        const ratioValue = selectedRatio.getAttribute("data-ratio");
        if (ratioValue === "1280:720") {
            return "16:9";
        } else if (ratioValue === "720:1280") {
            return "9:16";
        }
        return ratioValue;
    }
    return "16:9";
}

/**
 * Gets the prompt text from the main prompt input
 * @returns {string} User prompt
 */
function getPromptText() {
    const promptElement = document.getElementById("imagePromptMain");
    return promptElement ? promptElement.value.trim() : "";
}

/**
 * Shows the regenerate warning modal and returns a promise that resolves with user's choice
 * @returns {Promise<boolean>} true if user confirms, false if cancelled
 */
function showRegenerateWarningModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById("regenerateWarningModal");
        const cancelBtn = document.getElementById("cancelRegenerate");
        const confirmBtn = document.getElementById("confirmRegenerate");

        if (!modal || !cancelBtn || !confirmBtn) {
            console.error("Regenerate warning modal elements not found");
            resolve(true); // Default to proceeding if modal is missing
            return;
        }

        // Show the modal
        modal.style.display = "flex";

        // Handle cancel
        const handleCancel = () => {
            modal.style.display = "none";
            cleanup();
            resolve(false);
        };

        // Handle confirm
        const handleConfirm = () => {
            modal.style.display = "none";
            cleanup();
            resolve(true);
        };

        // Clean up event listeners
        const cleanup = () => {
            cancelBtn.removeEventListener("click", handleCancel);
            confirmBtn.removeEventListener("click", handleConfirm);
        };

        // Add event listeners
        cancelBtn.addEventListener("click", handleCancel);
        confirmBtn.addEventListener("click", handleConfirm);
    });
}

/**
 * Clears all generated images and refine sections to start fresh
 */
function clearAllGeneratedContent() {
    console.log("Clearing all generated content...");

    // Debug: Check current background selection before clearing
    const currentSelectedBg = document.querySelector(
        "#sceneSelectionMain .scene-option.selected",
    );
    const currentBgName = currentSelectedBg
        ? currentSelectedBg.getAttribute("data-scene")
        : "none";

    // Remove all image generation blocks with IDs (keep the hidden template)
    const generatedBlocks = document.querySelectorAll(
        ".image-generation-block[id]",
    );
    generatedBlocks.forEach((block) => {
        console.log(`Removing image block: ${block.id}`);
        block.remove();
    });

    // Remove all refine sections with IDs (keep the hidden template)
    const refineSections = document.querySelectorAll(".refine-section[id]");
    refineSections.forEach((section) => {
        console.log(`Removing refine section: ${section.id}`);
        section.remove();
    });

    // Reset counters to start fresh
    imageGenerationCounter = 0;
    refineSectionCounter = 0;

    console.log("All generated content cleared, counters reset");
}

async function performImageGeneration() {
    console.log("Starting image generation...");

    // Check if images already exist
    const existingImages = document.querySelectorAll(
        '.image-generation-block[id]:not([style*="display: none"])',
    );

    if (existingImages.length > 0) {
        // Show warning modal and wait for user confirmation
        const shouldProceed = await showRegenerateWarningModal();
        if (!shouldProceed) {
            console.log("Image generation cancelled by user");
            return;
        }

        // Clear all existing images and refine sections
        clearAllGeneratedContent();
    }

    // Create a new image generation block
    const newBlock = createImageGenerationBlock();

    if (!newBlock) {
        console.error("Failed to create image generation block");
        return;
    }

    try {
        // Get required data
        const screenshotData = await getScreenshotData();
        const backgroundData = await getBackgroundData();
        const aspectRatio = getAspectRatio();
        const userPrompt = getPromptText();

        // Debug: Log which background is being used
        const selectedBgElement = document.querySelector(
            "#sceneSelectionMain .scene-option.selected",
        );
        const selectedBgName = selectedBgElement
            ? selectedBgElement.getAttribute("data-scene")
            : "none";

        // Build the prompt
        const promptPrecision =
            " — same pose, same orientation, and same asset relative to the camera. The integration should appear realistic, with the scene adapted for correct perspective and lighting.";
        const stage =
            window.babylonStage ||
            (typeof babylonStage !== "undefined" ? babylonStage : null);
        let promptReplicate =
            "Place the character in a scene similar to the other image (remove gray background and floor). The character must be positioned precisely as in the original";

        if (
            stage &&
            stage.characterTables &&
            stage.characterTables.length > 1
        ) {
            promptReplicate = `Place the ${stage.characterTables.length} characters in a scene similar to the other image (remove gray background and floor). There must be ${stage.characterTables.length} characters positioned precisely as in the original`;
        }

        const fullPrompt = userPrompt
            ? `${userPrompt}. ${promptReplicate}${promptPrecision}`
            : `${promptReplicate}${promptPrecision}`;

        // Prepare API input data with correct field names
        const inputData = {
            input: {
                prompt: fullPrompt,
                aspect_ratio: aspectRatio,
                input_image_1: screenshotData,
                input_image_2: backgroundData,
                output_format: "jpg",
                safety_tolerance: 2,
            },
        };

        // Call the API
        await callReplicateAPI("multi-image", inputData, newBlock);
    } catch (error) {
        console.error("Error in performImageGeneration:", error);
        const errorMessage = error.message || "Unknown error occurred";
        console.error("Detailed error:", errorMessage);
        showErrorInBlock(newBlock, errorMessage);
    }
}

async function refineImage(buttonElement) {
    console.log("Starting image refinement...");

    // Check if button is disabled
    if (buttonElement && buttonElement.disabled) {
        console.log("Refine button is disabled, not proceeding");
        return;
    }

    // Find the specific refine section that contains this button
    const refineSectionElement = buttonElement
        ? buttonElement.closest(".refine-section")
        : document.querySelector('.refine-section[id^="refine-section-"]');

    if (!refineSectionElement) {
        console.error("Could not find refine section");
        return;
    }

    // Get the refinement prompt and check if it's empty
    const refineTextarea =
        refineSectionElement.querySelector(".prompt-textarea");
    const refinementPrompt = refineTextarea ? refineTextarea.value.trim() : "";

    if (!refinementPrompt) {
        console.log("Refinement prompt is empty, not proceeding");
        return;
    }

    // Freeze the current refine section
    freezeRefineSection(refineSectionElement);

    // Create a new image generation block for the refinement
    const newBlock = createImageGenerationBlock();

    if (!newBlock) {
        console.error("Failed to create refinement block");
        return;
    }

    try {
        // Get the last generated image as the input - try multiple selectors
        let lastGeneratedImage = document.querySelector(
            ".generated-image:last-of-type",
        );

        if (!lastGeneratedImage || !lastGeneratedImage.src) {
            // Try finding all generated images and get the last one with a src
            const allImages = document.querySelectorAll(".generated-image");

            for (let i = allImages.length - 1; i >= 0; i--) {
                if (allImages[i].src && allImages[i].src !== "") {
                    lastGeneratedImage = allImages[i];
                    break;
                }
            }
        }

        if (!lastGeneratedImage || !lastGeneratedImage.src) {
            throw new Error("No image available to refine");
        }

        const aspectRatio = getAspectRatio();

        // Prepare API input data for refinement
        const inputData = {
            input: {
                prompt: refinementPrompt,
                input_image: lastGeneratedImage.src,
                aspect_ratio: aspectRatio,
                steps: 50,
                guidance: 3.0,
                safety_tolerance: 2,
                output_format: "jpg",
            },
        };

        // Call the API
        await callReplicateAPI("refine", inputData, newBlock);
    } catch (error) {
        console.error("Error in refineImage:", error);
        console.error("Error message:", error.message);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
        });
        showErrorInBlock(newBlock, extractErrorMessage(error));
    }
}

// Initialize AI functionality
function initializeAI() {
    console.log("AI module initialized");

    // Reset counter on initialization
    imageGenerationCounter = 0;
}

// Export functions for use in other modules
window.initializeAI = initializeAI;
window.performImageGeneration = performImageGeneration;
window.refineImage = refineImage;
window.createImageGenerationBlock = createImageGenerationBlock;
