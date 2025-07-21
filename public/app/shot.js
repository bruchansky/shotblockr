// shot.js - JavaScript functionality to update and manage shot

// Ratio management ////////////////////////////////
////////////////////////////////////////////////////
let selectedRatio = "1280:720"; // Default to landscape
window.selectedRatio = selectedRatio;

// Function to update ratio overlay bars based on selected ratio
function updateRatioOverlay(ratio) {
    const canvasContainer = document.querySelector(".canvas-and-controls");

    if (ratio === "720:1280") {
        // Portrait mode - show black bars on sides
        canvasContainer.classList.add("portrait-ratio-active");
    } else {
        // Landscape mode - hide black bars
        canvasContainer.classList.remove("portrait-ratio-active");
    }
}

// Initialize ratio overlay on page load
updateRatioOverlay(selectedRatio);

// Scene management ////////////////////////////////
////////////////////////////////////////////////////
let selectedScene = "none"; // Default to no scene
window.customBackgroundData = null;

function triggerCustomBackgroundUpload() {
    console.log("Triggering custom background upload");
    const fileInput = document.getElementById("customBackgroundInput");
    fileInput.click();

    // Update button state immediately since custom is now selected but no file uploaded yet
    setTimeout(updateGenerateButtonState, 100);
}

function handleCustomBackgroundUpload(input) {
    const file = input.files[0];
    if (!file) {
        console.log("No file selected");
        return;
    }
    // Validate file type
    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
    }
    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert("Please select an image smaller than 10MB");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const imageData = e.target.result;
        window.customBackgroundData = imageData;

        // Update the custom background option display
        const customOption = document.querySelector(
            '.scene-option[data-scene="custom"]',
        );
        if (!customOption) {
            console.error("Custom option not found!");
            return;
        }

        const uploadDiv = customOption.querySelector(".scene-custom-upload");
        if (!uploadDiv) {
            console.error("Upload div not found!");
            return;
        }
        // Replace the upload icon with a preview
        uploadDiv.innerHTML = `
            <img src="${imageData}" alt="Custom Background" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
        `;
        console.log("Thumbnail updated with custom image");

        // Update the scene selection - only remove from main section
        document
            .querySelectorAll("#sceneSelectionMain .scene-option")
            .forEach((opt) => {
                opt.classList.remove("selected");
            });
        customOption.classList.add("selected");

        // Update generate button state since background changed
        setTimeout(updateGenerateButtonState, 100);
    };

    reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        // Scene selection handlers (sidebar)
        document.querySelectorAll(".scene-option").forEach((option) => {
            option.addEventListener("click", function () {
                // Remove selection from all options
                document.querySelectorAll(".scene-option").forEach((opt) => {
                    opt.style.borderColor = "transparent";
                    opt.style.background = "rgba(60, 60, 60, 0.8)";
                });

                // Select clicked option
                this.style.borderColor = "#3498db";
                selectedScene = this.dataset.scene;
            });
        });

        // Scene selection handlers for main section
        document
            .querySelectorAll("#sceneSelectionMain .scene-option")
            .forEach((option) => {
                option.addEventListener("click", function () {
                    // Handle custom background option
                    if (this.dataset.scene === "custom") {
                        console.log("Custom background option clicked");
                        triggerCustomBackgroundUpload();
                        return;
                    }

                    // Remove selection from main section options
                    document
                        .querySelectorAll("#sceneSelectionMain .scene-option")
                        .forEach((opt) => {
                            opt.classList.remove("selected");
                        });

                    // Select clicked option
                    this.classList.add("selected");

                    // Clear custom background data when selecting a different option
                    if (window.customBackgroundData) {
                        console.log(
                            "Clearing custom background data - user selected different option",
                        );
                        const fileInput = document.getElementById(
                            "customBackgroundInput",
                        );
                        fileInput.value = null;
                        window.customBackgroundData = null;
                        // Reset custom option display
                        const customOption = document.querySelector(
                            '.scene-option[data-scene="custom"]',
                        );
                        if (customOption) {
                            const uploadDiv = customOption.querySelector(
                                ".scene-custom-upload",
                            );
                            if (uploadDiv) {
                                uploadDiv.innerHTML = `
                                    <div class="upload-icon">📁</div>
                                `;
                            }
                        }
                    }

                    // Update button state after scene selection
                    setTimeout(updateGenerateButtonState, 100);
                });
            });
    }, 500);
});

// Asset management ////////////////////////////////
////////////////////////////////////////////////////
let currentEditingCharacter = null;
let customAssetData = null;
let originalCharacterHeight = null;

function triggerCustomAssetUpload() {
    const fileInput = document.getElementById("customAssetInput");
    fileInput.click();
}

function handleCustomAssetUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Validate file type
    if (
        !file.name.toLowerCase().endsWith(".glb") &&
        !file.name.toLowerCase().endsWith(".gltf")
    ) {
        alert("Please select a valid GLB or GLTF file");
        return;
    }

    // Validate file size (limit to 20MB)
    if (file.size > 20 * 1024 * 1024) {
        alert("Please select a file smaller than 20MB");
        return;
    }

    // Store the file for later use
    customAssetData = file;

    // Update the custom asset option display
    const customOption = document.querySelector(
        '.asset-option[data-asset="custom"]',
    );
    const uploadDiv = customOption.querySelector(".asset-custom-upload");

    // Select the custom asset option
    document.querySelectorAll(".asset-option").forEach((opt) => {
        opt.classList.remove("selected");
    });
    customOption.classList.add("selected");

    console.log("Custom GLB file uploaded and selected");
}

function openAddCharacterModal() {
    const modal = document.getElementById("addCharacterModal");
    modal.style.display = "flex";

    // Reset asset selection to default-1
    document.querySelectorAll(".asset-option").forEach((opt) => {
        opt.classList.remove("selected");
    });
    document
        .querySelector('.asset-option[data-asset="default-1"]')
        .classList.add("selected");

    // Reset custom asset data and display
    customAssetData = null;
    const fileInput = document.getElementById("customAssetInput");
    fileInput.value = null;
    const customUploadDiv = document.querySelector(".asset-custom-upload");
    if (customUploadDiv) {
        customUploadDiv.innerHTML = `
            <img src="/assets/upload.jpg" alt="Upload Custom Asset">
        `;
    }
}

function closeAddCharacterModal() {
    const modal = document.getElementById("addCharacterModal");
    modal.style.display = "none";
}

async function addCharacterFromModal() {
    const characterName = "character" + (babylonStage.characterCounter + 1);
    console.log("Generated character name:", characterName);

    // Get selected asset from the grid
    const selectedAssetElement = document.querySelector(
        ".asset-option.selected",
    );
    const selectedAsset = selectedAssetElement
        ? selectedAssetElement.dataset.asset
        : "default-1";

    if (babylonStage) {
        // Show loading indicator
        showLoadingIndicator("Adding character...");

        // Initialize character types storage if it doesn't exist
        if (!babylonStage.characterTypes) {
            babylonStage.characterTypes = {};
        }

        // Generate the character prefix that will be used
        const nextCounter = babylonStage.characterCounter + 1;
        const expectedCharacterPrefix = `${characterName.toLowerCase().replace(/\s+/g, "_")}_${nextCounter}`;

        // Store the character type before adding the character
        babylonStage.characterTypes[expectedCharacterPrefix] = selectedAsset;

        let characterPrefix;

        if (selectedAsset === "custom" && customAssetData) {
            // Handle custom asset upload
            try {
                characterPrefix =
                    await babylonStage.addNewCharacterFromCustomData(
                        customAssetData,
                        characterName,
                    );
            } catch (error) {
                console.error(
                    "Error adding new character from custom data:",
                    error,
                );
                showErrorModal(
                    "Failed to load custom asset file. Please check the file format and try again.",
                );
                hideLoadingIndicator();
                return;
            }
        } else {
            // Use predefined asset
            const selectedFile = selectedAsset + ".glb";
            characterPrefix = await babylonStage.addNewCharacter(
                selectedFile,
                characterName,
            );
        }

        // Verify the character type was stored correctly
        if (characterPrefix && babylonStage.characterTypes[characterPrefix]) {
            // Character added successfully
        }

        // Hide loading indicator
        hideLoadingIndicator();
    }

    closeAddCharacterModal();
}

function showErrorModal(message, title = "❌ Error") {
    const modal = document.getElementById("errorModal");
    const titleElement = modal.querySelector("h3");
    const messageDiv = document.getElementById("errorModalMessage");

    titleElement.textContent = title;
    messageDiv.innerHTML = message;
    modal.style.display = "flex";
}

function closeErrorModal() {
    const modal = document.getElementById("errorModal");
    modal.style.display = "none";
}

// Close modal with Escape key and prevent unwanted Enter key behavior
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeAddCharacterModal();
        closeEditCharacterModal();
        closeErrorModal();
    }

    // Prevent Enter key from triggering main generate button except in refine textarea
    if (event.key === "Enter" && !event.shiftKey) {
        const target = event.target;

        // Allow Enter key only in refine prompt textareas
        if (
            target &&
            target.tagName === "TEXTAREA" &&
            target.classList.contains("prompt-textarea")
        ) {
            // This is handled by the refine section's own event listener
            return;
        }

        // Allow Enter key in character name inputs (modal forms)
        if (
            target &&
            target.tagName === "INPUT" &&
            target.classList.contains("character-name-input")
        ) {
            return;
        }

        // Prevent Enter key everywhere else to avoid triggering generate button
        event.preventDefault();
        event.stopPropagation();
        console.log(
            "Prevented Enter key default behavior outside of allowed inputs",
        );
    }
});

// Close modal when clicking outside of it
document.addEventListener("click", function (event) {
    const addModal = document.getElementById("addCharacterModal");
    const editModal = document.getElementById("editCharacterModal");
    const errorModal = document.getElementById("errorModal");
    if (event.target === addModal) {
        closeAddCharacterModal();
    }
    if (event.target === editModal) {
        closeEditCharacterModal();
    }
    if (event.target === errorModal) {
        closeErrorModal();
    }
});

function openEditCharacterModal(characterPrefix) {
    const modal = document.getElementById("editCharacterModal");
    modal.style.display = "flex";

    currentEditingCharacter = characterPrefix;

    // Find the parent mesh object and set it as selected character
    const character = babylonStage.scene.getMeshByName(
        characterPrefix + "_parent",
    );
    if (character) {
        babylonStage.selectedCharacter = character;
        originalCharacterHeight = character.scaling.x; // Store scale (all axes should be the same)
    }

    // Update height display and slider to show current character height
    updateHeightDisplay();
    updateHeightSlider();
}

function closeEditCharacterModal() {
    const modal = document.getElementById("editCharacterModal");
    modal.style.display = "none";

    // Restore original height when canceling edits
    if (originalCharacterHeight !== null && currentEditingCharacter) {
        const character = babylonStage.scene.getMeshByName(
            currentEditingCharacter + "_parent",
        );
        if (character) {
            // Restore original scaling on all axes
            character.scaling.x = originalCharacterHeight;
            character.scaling.y = originalCharacterHeight;
            character.scaling.z = originalCharacterHeight;

            // Update height display to reflect restored height
            updateHeightDisplay();
            updateHeightSlider();
        }
    }

    currentEditingCharacter = null;
    originalCharacterHeight = null; // Clear stored height
}

async function saveCharacterEdits() {
    // Get the base name of the current character for validation
    const currentBaseName = currentEditingCharacter
        ? currentEditingCharacter.split("_")[0]
        : "";

    if (!currentEditingCharacter) {
        showErrorModal("No character selected for editing", "⚠️ No Selection");
        return;
    }

    // Clear original height since changes are being saved
    originalCharacterHeight = null;
    closeEditCharacterModal();
}

function updateCharacterControls(characterPrefix) {
    // Character type is now managed during creation via the modal
    if (
        characterPrefix &&
        babylonStage.characterTypes &&
        babylonStage.characterTypes[characterPrefix]
    ) {
        const storedType = babylonStage.characterTypes[characterPrefix];
    }

    // Update character action buttons
    const editHeightBtn = document.getElementById("editHeightBtn");
    const deleteCharacterBtn = document.getElementById("deleteCharacterBtn");

    if (characterPrefix) {
        // Store selected character for button actions
        window.selectedCharacter = characterPrefix;

        // Enable buttons when character is selected
        if (editHeightBtn) {
            editHeightBtn.disabled = false;
            editHeightBtn.style.opacity = "1";
        }
        if (deleteCharacterBtn) {
            deleteCharacterBtn.disabled = false;
            deleteCharacterBtn.style.opacity = "1";
        }
    } else {
        // Clear selected character
        window.selectedCharacter = null;

        // Disable buttons when no character is selected
        if (editHeightBtn) {
            editHeightBtn.disabled = true;
            editHeightBtn.style.opacity = "0.5";
        }
        if (deleteCharacterBtn) {
            deleteCharacterBtn.disabled = true;
            deleteCharacterBtn.style.opacity = "0.5";
        }
    }
}

function deleteCharacter(characterPrefix) {
    console.log("=== DELETE CHARACTER FUNCTION CALLED ===");
    console.log("Received characterPrefix:", characterPrefix);
    console.log("window.selectedCharacter:", window.selectedCharacter);
    console.log("babylonStage exists:", !!babylonStage);
    console.log(
        "babylonStage.characterTables exists:",
        !!(babylonStage && babylonStage.characterTables),
    );

    if (!babylonStage || !babylonStage.characterTables) {
        console.error("babylonStage or characterTables not available");
        return;
    }

    if (!characterPrefix) {
        console.error("No character prefix provided to delete function");
        return;
    }

    // Show custom delete confirmation modal
    const modal = document.getElementById("deleteConfirmModal");

    if (!modal) {
        console.error("Delete confirmation modal not found");
        return;
    }

    console.log("Modal found, showing delete confirmation");

    // Store the character prefix for the confirmation
    modal.dataset.characterPrefix = characterPrefix;

    // Show the modal
    modal.style.display = "flex";

    console.log("Delete modal should now be visible");
}

function confirmDeleteCharacter(characterPrefix) {
    try {
        // Find the mesh table containing this character prefix
        for (let characterTable of babylonStage.characterTables) {
            if (characterTable.length > 0) {
                const firstMesh = characterTable[0];
                if (
                    firstMesh.name.startsWith(characterPrefix + "_parent") ||
                    firstMesh.name.startsWith(characterPrefix + "_mesh_")
                ) {
                    babylonStage.selectedCharacter = firstMesh;
                    babylonStage.deleteSelectedCharacter();

                    // Update character controls title after deletion
                    const controlsTitle = document.getElementById(
                        "characterControlsTitle",
                    );
                    if (controlsTitle) {
                        controlsTitle.textContent = "Character Controls";
                    }

                    // Reset character action buttons
                    const editHeightBtn =
                        document.getElementById("editHeightBtn");
                    const deleteCharacterBtn =
                        document.getElementById("deleteCharacterBtn");

                    if (editHeightBtn) {
                        editHeightBtn.disabled = true;
                        editHeightBtn.style.opacity = "0.5";
                    }
                    if (deleteCharacterBtn) {
                        deleteCharacterBtn.disabled = true;
                        deleteCharacterBtn.style.opacity = "0.5";
                    }

                    // Clear selected character
                    window.selectedCharacter = null;

                    return;
                }
            }
        }
        console.warn(`Character ${characterPrefix} not found for deletion`);
    } catch (error) {
        console.error("Error during character deletion:", error);
    }
}

// Loading indicator functions
function showLoadingIndicator(text = "Loading...") {
    const indicator = document.getElementById("loadingIndicator");
    if (indicator) {
        indicator.textContent = text;
        indicator.style.display = "block";
    }
}

function hideLoadingIndicator() {
    const indicator = document.getElementById("loadingIndicator");
    if (indicator) {
        indicator.style.display = "none";
    }
}

// Make functions available globally
window.updateCharacterControls = updateCharacterControls;
window.showLoadingIndicator = showLoadingIndicator;
window.hideLoadingIndicator = hideLoadingIndicator;
window.showErrorModal = showErrorModal;
window.closeErrorModal = closeErrorModal;

// Add event listeners for the new HTML controls
function setupControlEventListeners() {
    if (!babylonStage) return;

    // Character rotation controls
    const characterRotateLeft = document.getElementById("characterRotateLeft");
    const characterRotateRight = document.getElementById(
        "characterRotateRight",
    );

    characterRotateLeft.addEventListener("mousedown", () => {
        babylonStage.startContinuousRotation(-Math.PI / 24);
    });
    characterRotateLeft.addEventListener("mouseup", () => {
        babylonStage.stopContinuousRotation();
    });
    characterRotateLeft.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousRotation();
    });

    characterRotateRight.addEventListener("mousedown", () => {
        babylonStage.startContinuousRotation(Math.PI / 24);
    });
    characterRotateRight.addEventListener("mouseup", () => {
        babylonStage.stopContinuousRotation();
    });
    characterRotateRight.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousRotation();
    });

    // Height slider in edit modal
    const heightSlider = document.getElementById("heightSlider");

    heightSlider.addEventListener("input", () => {
        const heightPercentage = parseFloat(heightSlider.value);
        if (babylonStage && babylonStage.selectedCharacter) {
            // Convert percentage to scale (100% = 0.01 scale, which is default height)
            const targetScale = (heightPercentage / 100) * 0.01;

            // Set absolute scale instead of using multiplicative factor
            babylonStage.selectedCharacter.scaling.x = targetScale;
            babylonStage.selectedCharacter.scaling.y = targetScale;
            babylonStage.selectedCharacter.scaling.z = targetScale;

            updateHeightDisplay();
        }
    });

    heightSlider.addEventListener("change", () => {
        const heightPercentage = parseFloat(heightSlider.value);
        if (babylonStage && babylonStage.selectedCharacter) {
            // Convert percentage to scale (100% = 0.01 scale, which is default height)
            const targetScale = (heightPercentage / 100) * 0.01;

            // Set absolute scale instead of using multiplicative factor
            babylonStage.selectedCharacter.scaling.x = targetScale;
            babylonStage.selectedCharacter.scaling.y = targetScale;
            babylonStage.selectedCharacter.scaling.z = targetScale;

            updateHeightDisplay();
        }
    });

    // Camera movement controls
    const moveUp = document.getElementById("moveUp");
    const moveDown = document.getElementById("moveDown");
    const moveLeft = document.getElementById("moveLeft");
    const moveRight = document.getElementById("moveRight");
    const moveForward = document.getElementById("moveForward");
    const moveBack = document.getElementById("moveBack");

    moveUp.addEventListener("mousedown", () => {
        babylonStage.startContinuousCameraMovement(
            new BABYLON.Vector3(0, 1, 0),
        );
    });
    moveUp.addEventListener("mouseup", () => {
        babylonStage.stopContinuousCameraMovement();
    });
    moveUp.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousCameraMovement();
    });

    moveDown.addEventListener("mousedown", () => {
        babylonStage.startContinuousCameraMovement(
            new BABYLON.Vector3(0, -1, 0),
        );
    });
    moveDown.addEventListener("mouseup", () => {
        babylonStage.stopContinuousCameraMovement();
    });
    moveDown.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousCameraMovement();
    });

    moveLeft.addEventListener("mousedown", () => {
        babylonStage.startContinuousCameraMovement(
            new BABYLON.Vector3(-1, 0, 0),
        );
    });
    moveLeft.addEventListener("mouseup", () => {
        babylonStage.stopContinuousCameraMovement();
    });
    moveLeft.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousCameraMovement();
    });

    moveRight.addEventListener("mousedown", () => {
        babylonStage.startContinuousCameraMovement(
            new BABYLON.Vector3(1, 0, 0),
        );
    });
    moveRight.addEventListener("mouseup", () => {
        babylonStage.stopContinuousCameraMovement();
    });
    moveRight.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousCameraMovement();
    });

    moveForward.addEventListener("mousedown", () => {
        babylonStage.startContinuousCameraMovement(
            new BABYLON.Vector3(0, 0, 1),
        );
    });
    moveForward.addEventListener("mouseup", () => {
        babylonStage.stopContinuousCameraMovement();
    });
    moveForward.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousCameraMovement();
    });

    moveBack.addEventListener("mousedown", () => {
        babylonStage.startContinuousCameraMovement(
            new BABYLON.Vector3(0, 0, -1),
        );
    });
    moveBack.addEventListener("mouseup", () => {
        babylonStage.stopContinuousCameraMovement();
    });
    moveBack.addEventListener("mouseleave", () => {
        babylonStage.stopContinuousCameraMovement();
    });

    document.addEventListener("keydown", function (event) {
        // Check if the event is for the up (ArrowUp) or down (ArrowDown) arrow keys
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault(); // Prevent scrolling
            // Add your zooming logic here (e.g., modifying camera position)
        }
    });

    // Reset camera
    document.getElementById("resetCamera").addEventListener("click", () => {
        babylonStage.resetCameraPosition();
    });

    // Character type is now selected during creation in the modal

    // Setup animation slider - ensure it works properly
    setupAnimationSlider();

    // Reset button functionality
    document.getElementById("resetButton").addEventListener("click", () => {
        document.getElementById("resetModal").style.display = "flex";
    });

    // Reset modal event listeners
    document.getElementById("cancelReset").addEventListener("click", () => {
        document.getElementById("resetModal").style.display = "none";
    });

    document.getElementById("confirmReset").addEventListener("click", () => {
        window.location.reload();
    });
}

// Function to setup animation slider event listeners
function setupAnimationSlider() {
    const animationSlider = document.getElementById("animationSlider");
    if (!animationSlider) {
        console.error("Animation slider element not found");
        return;
    }

    // Remove any existing event listeners to avoid duplicates
    const newSlider = animationSlider.cloneNode(true);
    animationSlider.parentNode.replaceChild(newSlider, animationSlider);

    // Throttle function to limit how often the animation updates
    let animationTimeout = null;
    function throttledAnimationUpdate(frameNumber) {
        if (animationTimeout) {
            clearTimeout(animationTimeout);
        }
        animationTimeout = setTimeout(() => {
            try {
                if (babylonStage && babylonStage.selectedCharacter) {
                    babylonStage.setCharacterAnimationFrameNumber(
                        babylonStage.selectedCharacter,
                        frameNumber,
                    );
                }
            } catch (error) {
                console.warn("Error updating animation frame:", error);
            }
        }, 10); // Update every 10ms at most
    }

    // Add event listeners to the new slider
    newSlider.addEventListener("input", function (event) {
        const frameNumber = parseInt(event.target.value, 10);
        throttledAnimationUpdate(frameNumber);
    });

    newSlider.addEventListener("change", function (event) {
        const frameNumber = parseInt(event.target.value, 10);
        // Clear any pending throttled update and do immediate update on change
        if (animationTimeout) {
            clearTimeout(animationTimeout);
        }
        try {
            if (babylonStage && babylonStage.selectedCharacter) {
                babylonStage.setCharacterAnimationFrameNumber(
                    babylonStage.selectedCharacter,
                    frameNumber,
                );
            }
        } catch (error) {
            console.warn("Error updating animation frame:", error);
        }
    });
}

// Function to update animation controls visibility based on selected character
function updateAnimationControls() {
    const animationSection = document.getElementById("animationControlSection");
    const animationSlider = document.getElementById("animationSlider");

    if (!animationSection || !animationSlider) {
        return;
    }

    // Show animation controls for all characters, but enable only for characters with animations
    if (babylonStage && babylonStage.selectedCharacter) {
        animationSection.style.display = "block";

        if (babylonStage.selectedCharacterHasAnimations()) {
            animationSlider.disabled = false;
            animationSlider.style.opacity = "1";
            // Set slider to the character's current animation frame number
            const currentFrame = babylonStage.getCurrentAnimationFrame();
            if (currentFrame !== null) {
                animationSlider.value = currentFrame;

                // Update slider range based on animation bounds
                const animationGroups =
                    babylonStage.selectedCharacter.animationGroups;
                if (animationGroups && animationGroups.length > 0) {
                    const firstGroup = animationGroups[0];
                    animationSlider.min = firstGroup.from;
                    animationSlider.max = firstGroup.to;
                    animationSlider.step = 1;
                }
            } else {
                animationSlider.value = 0;
            }
        } else {
            animationSlider.disabled = true;
            animationSlider.style.opacity = "0.5";
            animationSlider.value = 0;
        }
    } else {
        // Show the section but disable the slider when no character is selected
        animationSection.style.display = "block";
        animationSlider.disabled = true;
        animationSlider.style.opacity = "0.5";
        animationSlider.value = 0;
    }
}

// Make updateAnimationControls available globally for Babylon.js stage
window.updateAnimationControls = updateAnimationControls;

// Function to update height display
function updateHeightDisplay() {
    const heightDisplay = document.getElementById("characterHeightDisplay");
    if (heightDisplay && babylonStage && babylonStage.selectedCharacter) {
        const character = babylonStage.scene.getMeshByName(
            babylonStage.selectedCharacter + "_parent",
        );
        if (character) {
            // Convert scale to percentage (0.01 scale = 100%)
            const heightPercentage = (character.scaling.x / 0.01) * 100;
            heightDisplay.textContent = `${Math.round(heightPercentage)}%`;
        }
    }
}

// Function to update height slider
function updateHeightSlider() {
    const heightSlider = document.getElementById("heightSlider");
    if (heightSlider && babylonStage && babylonStage.selectedCharacter) {
        const character = babylonStage.scene.getMeshByName(
            babylonStage.selectedCharacter + "_parent",
        );
        if (character) {
            // Convert scale to percentage (0.01 scale = 100%)
            const heightPercentage = (character.scaling.x / 0.01) * 100;
            heightSlider.value = Math.round(heightPercentage);
        }
    }
}

// Make functions available globally
window.updateHeightDisplay = updateHeightDisplay;
window.updateHeightSlider = updateHeightSlider;

// Function to change a character's type by recreating it with a new model
async function changeCharacterType(characterPrefix, newType) {
    if (!babylonStage || !babylonStage.selectedCharacter) return;

    // Show loading indicator
    showLoadingIndicator("Changing character type...");

    // Get current character data before deletion
    const currentCharacter = babylonStage.getCharacterData(
        babylonStage.selectedCharacter,
        0,
    );
    if (!currentCharacter) {
        console.error("Could not get character data for type change");
        hideLoadingIndicator();
        return;
    }

    // Store current properties
    const characterName = currentCharacter.name;
    const asset = currentCharacter.asset;
    const bodyRotationZ = currentCharacter.bodyRotationZ;
    const heightInMeters = currentCharacter.heightInMeters;
    const color = currentCharacter.color;

    // Delete the existing character
    babylonStage.deleteSelectedCharacter();

    // Wait a short moment for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a proper BABYLON.Vector3 asset object
    const newAsset = new BABYLON.Vector3(asset.x, asset.y, asset.z);

    // Convert the type value to the actual GLB filename
    const fileName = babylonStage.getCharacterTypeFilename(newType);

    // Add new character with the new type
    await babylonStage.addNewCharacter(fileName, characterName, newAsset);

    // Wait for the character to be fully loaded
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find the newly created character and apply the stored properties
    const newCharacterPrefix = `${characterName}_${babylonStage.characterCounter}`;
    const parentMesh = babylonStage.scene.getMeshByName(
        `${newCharacterPrefix}_parent`,
    );

    // Update the character type in the tracking
    if (babylonStage.characterTypes) {
        babylonStage.characterTypes[newCharacterPrefix] = newType;
    }

    if (parentMesh) {
        // Apply stored transformations
        parentMesh.asset.x = asset.x;
        parentMesh.asset.y = asset.y;
        parentMesh.asset.z = asset.z;

        // Convert degrees to radians for rotations
        const degToRad = (deg) => deg * (Math.PI / 180);
        parentMesh.rotation.z = degToRad(bodyRotationZ);

        // Apply stored height in meters
        babylonStage.setCharacterHeightInMeters(parentMesh, heightInMeters);

        // Select the new character
        babylonStage.selectCharacter(parentMesh);

        // Character type is now determined during creation
    }

    // Hide loading indicator
    hideLoadingIndicator();
}

// Function to show/hide overlay controls based on canvas mouse events
function setupCanvasOverlayControls() {
    const canvas = document.getElementById("babylonCanvas");
    const characterControls = document.querySelector(
        ".character-controls-overlay",
    );
    const cameraControls = document.querySelector(".camera-controls-overlay");

    if (!canvas || !characterControls || !cameraControls) {
        console.warn(
            "Could not find all required elements for opacity control",
        );
        return;
    }

    // Function to show both controls together
    function showControls() {
        characterControls.style.opacity = "1";
        cameraControls.style.opacity = "1";
    }

    // Function to hide both controls together
    function hideControls() {
        characterControls.style.opacity = "0.1";
        cameraControls.style.opacity = "0.1";
    }

    // Initially make the controls nearly invisible
    hideControls();

    // Show controls when mouse enters canvas
    canvas.addEventListener("mouseenter", showControls);

    // Hide controls when mouse leaves canvas
    canvas.addEventListener("mouseleave", hideControls);

    // Also show controls when hovering over either control box
    characterControls.addEventListener("mouseenter", showControls);
    cameraControls.addEventListener("mouseenter", showControls);

    // Hide controls when leaving either control box (only if not over canvas)
    characterControls.addEventListener("mouseleave", (e) => {
        // Check if mouse is still over canvas or other control
        const rect = canvas.getBoundingClientRect();
        const cameraRect = cameraControls.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const overCanvas =
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom;
        const overCamera =
            mouseX >= cameraRect.left &&
            mouseX <= cameraRect.right &&
            mouseY >= cameraRect.top &&
            mouseY <= cameraRect.bottom;

        if (!overCanvas && !overCamera) {
            hideControls();
        }
    });

    cameraControls.addEventListener("mouseleave", (e) => {
        // Check if mouse is still over canvas or other control
        const rect = canvas.getBoundingClientRect();
        const characterRect = characterControls.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const overCanvas =
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom;
        const overCharacter =
            mouseX >= characterRect.left &&
            mouseX <= characterRect.right &&
            mouseY >= characterRect.top &&
            mouseY <= characterRect.bottom;

        if (!overCanvas && !overCharacter) {
            hideControls();
        }
    });
}

function initBabylonStage() {
    babylonStage = new BabylonStage("babylonCanvas");
    babylonStage.init();
    // No default character - user needs to add characters manually
}

// Set up controls after Babylon stage is initialized
window.addEventListener("load", () => {
    setTimeout(() => {
        initBabylonStage();

        // Set up controls after a short delay to ensure babylonStage is ready
        setTimeout(() => {
            setupControlEventListeners();
            setupCanvasOverlayControls();
        }, 1000);

        // Ratio selection handlers (sidebar)
        document.querySelectorAll(".ratio-option").forEach((option) => {
            option.addEventListener("click", function () {
                // Remove selection from all options
                document.querySelectorAll(".ratio-option").forEach((opt) => {
                    opt.style.borderColor = "transparent";
                    opt.style.background = "rgba(60, 60, 60, 0.8)";
                });

                // Select clicked option
                this.style.borderColor = "#3498db";
                selectedRatio = this.dataset.ratio;

                // Update global reference
                window.selectedRatio = selectedRatio;

                // Update ratio overlay bars
                updateRatioOverlay(selectedRatio);
            });
        });

        // Asset selection handlers
        document.querySelectorAll(".asset-option").forEach((option) => {
            option.addEventListener("click", function () {
                // Skip custom asset option as it has its own handler
                if (this.dataset.asset === "custom") {
                    return;
                }

                // Remove selection from all options
                document.querySelectorAll(".asset-option").forEach((opt) => {
                    opt.classList.remove("selected");
                });

                // Select clicked option
                this.classList.add("selected");
            });
        });
    }, 100);
});

// Auto-rotate camera function
function toggleAutoRotate() {
    if (babylonStage) {
        babylonStage.toggleAutoRotate();
    }
}

// Delete modal event handlers
document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", function () {
        const modal = document.getElementById("deleteConfirmModal");
        modal.style.display = "none";
        modal.dataset.characterPrefix = "";
    });

document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
        const modal = document.getElementById("deleteConfirmModal");
        const characterPrefix = modal.dataset.characterPrefix;

        if (characterPrefix) {
            confirmDeleteCharacter(characterPrefix);
        }

        modal.style.display = "none";
        modal.dataset.characterPrefix = "";
    });

// Close modal when clicking outside
document
    .getElementById("deleteConfirmModal")
    .addEventListener("click", function (e) {
        if (e.target === this) {
            this.style.display = "none";
            this.dataset.characterPrefix = "";
        }
    });

// Initialize animation controls on page load
document.addEventListener("DOMContentLoaded", function () {
    updateAnimationControls();

    // Initialize character action buttons as disabled
    const editHeightBtn = document.getElementById("editHeightBtn");
    const deleteCharacterBtn = document.getElementById("deleteCharacterBtn");

    if (editHeightBtn) {
        editHeightBtn.disabled = true;
        editHeightBtn.style.opacity = "0.5";
    }
    if (deleteCharacterBtn) {
        deleteCharacterBtn.disabled = true;
        deleteCharacterBtn.style.opacity = "0.5";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const heightSlider = document.getElementById("heightSlider");
    const heightDisplay = document.getElementById("characterHeightDisplay");

    if (heightSlider) {
        heightSlider.addEventListener("input", function () {
            const newHeightPercentage = parseFloat(heightSlider.value);
            heightDisplay.textContent = `${Math.round(newHeightPercentage)}%`;

            if (window.babylonStage && window.babylonStage.selectedCharacter) {
                // Convert percentage to scale (100% = 0.01 scale)
                const targetScale = (newHeightPercentage / 100) * 0.01;
                window.babylonStage.selectedCharacter.scaling.x = targetScale;
                window.babylonStage.selectedCharacter.scaling.y = targetScale;
                window.babylonStage.selectedCharacter.scaling.z = targetScale;
            }
        });
    }
});

// Generate Button? ////////////////////////////////
////////////////////////////////////////////////////

// Function to validate if generation is possible
function canGenerateImage() {
    // Use the same approach as the working generateImage function
    let hasCharacters = false;
    let characterCount = 0;

    // Check if babylonStage exists (try both global and window)
    const stage =
        window.babylonStage ||
        (typeof babylonStage !== "undefined" ? babylonStage : null);

    if (stage && stage.characterTables) {
        // Count non-empty character tables (same logic as working code)
        characterCount = 0;
        for (const characterTable of stage.characterTables) {
            if (characterTable.length > 0) {
                characterCount++;
            }
        }
        hasCharacters = characterCount > 0;
    }

    // Check if a background is selected and valid
    const selectedBgElement = document.querySelector(
        "#sceneSelectionMain .scene-option.selected",
    );
    let hasBackground = false;

    if (selectedBgElement) {
        const selectedScene = selectedBgElement.dataset.scene;
        if (selectedScene === "custom") {
            // For custom background, check if image data exists
            hasBackground =
                window.customBackgroundData !== null &&
                window.customBackgroundData !== undefined;
        } else {
            // For predefined backgrounds, just check if selected
            hasBackground = true;
        }
    } else {
        hasBackground = false;
    }

    return hasCharacters && hasBackground;
}

// Function to update generate button state
function updateGenerateButtonState() {
    const generateBtn = document.getElementById("generateBtnMain");
    if (!generateBtn) {
        console.log("Generate button not found");
        return;
    }

    const canGenerate = canGenerateImage();
    console.log("Updating button state - can generate:", canGenerate);

    if (canGenerate) {
        generateBtn.disabled = false;
        generateBtn.style.opacity = "1";
        generateBtn.style.cursor = "pointer";
        generateBtn.title = "";
    } else {
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.6";
        generateBtn.style.cursor = "not-allowed";

        // Set helpful tooltip
        let tooltip = "Cannot generate: ";

        // Use same validation logic as canGenerateImage
        const stage =
            window.babylonStage ||
            (typeof babylonStage !== "undefined" ? babylonStage : null);
        let hasCharacters = false;
        if (stage && stage.characterTables) {
            for (const characterTable of stage.characterTables) {
                if (characterTable.length > 0) {
                    hasCharacters = true;
                    break;
                }
            }
        }

        const selectedBgElement = document.querySelector(
            "#sceneSelectionMain .scene-option.selected",
        );
        let hasBackground = false;
        let backgroundIssue = "";

        if (selectedBgElement) {
            const selectedScene = selectedBgElement.dataset.scene;
            if (selectedScene === "custom") {
                hasBackground =
                    window.customBackgroundData !== null &&
                    window.customBackgroundData !== undefined;
                if (!hasBackground) {
                    backgroundIssue = "Upload a custom background image";
                }
            } else {
                hasBackground = true;
            }
        } else {
            backgroundIssue = "Select a background";
        }

        if (!hasCharacters && !hasBackground) {
            tooltip += backgroundIssue
                ? `Add characters and ${backgroundIssue.toLowerCase()}`
                : "Add characters and select a background";
        } else if (!hasCharacters) {
            tooltip += "Add at least one character";
        } else if (!hasBackground) {
            tooltip += backgroundIssue || "Select a background";
        }

        generateBtn.title = tooltip;
    }
}

async function generateImage() {
    performImageGeneration();
}

updateGenerateButtonState();
