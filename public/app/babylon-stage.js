// babylon-stage.js - 3D babylon stage setup and management

class BabylonStage {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.sceneOffsetX = 5; // Move the whole scene 5 meters to the right
        this.selectedCharacter = null;
        this.highlightLayer = null;
        this.characterInfoText = null;
        this.characterCounter = 0; // Counter for unique character naming
        this.gridSquares = [];
        this.advancedTexture = null;
        this.characterTables = []; // Added mesh tables
        this.characterTypes = {}; // Store character types for each character

        // Control intervals
        this.rotationInterval = null;
        this.cameraMovementInterval = null;
        this.scalingInterval = null;
        this.autoRotateInterval = null;
        this.isAutoRotating = false;
    }

    // =====================================================
    // STAGE SETUP SECTION
    // =====================================================

    async init() {
        const canvas = document.getElementById(this.canvasId);

        try {
            this.engine = new BABYLON.Engine(canvas, true);
            this.scene = new BABYLON.Scene(this.engine);

            // Create a spherical gradient background
            this.createGradientBackground();
            this.setupCamera();
            this.setupLighting();
            this.createGrid();

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            window.addEventListener("resize", () => {
                this.engine.resize();
            });
        } catch (error) {
            console.error("Error initializing Babylon.js scene:", error);
            console.error("Error details:", error.stack);
        }
    }

    setupLighting() {
        // Main hemispheric light for ambient lighting
        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(0, 1, 0),
            this.scene,
        );
        light.intensity = 0.6;
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        //light.specular = new BABYLON.Color3(0.2, 0.2, 0.2);

        // Add a directional light for better visibility and shadows
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, 0),
            this.scene,
        );
        dirLight.intensity = 0.4;
        dirLight.specular = new BABYLON.Color3(1, 1, 1);

        // Add a second directional light from the opposite side for fill lighting
        const fillLight = new BABYLON.DirectionalLight(
            "fillLight",
            new BABYLON.Vector3(1, -2, 1),
            this.scene,
        );
        fillLight.intensity = 0.4;
        fillLight.specular = new BABYLON.Color3(1, 1, 1);
    }

    createGradientBackground() {
        // Create a smaller sphere for more focused gradient effect
        const backgroundSphere = BABYLON.MeshBuilder.CreateSphere(
            "backgroundSphere",
            { diameter: 60 },
            this.scene,
        );
        const gradientMaterial = new BABYLON.StandardMaterial(
            "gradientMaterial",
            this.scene,
        );
        const gradientTexture = new BABYLON.DynamicTexture(
            "gradientTexture",
            { width: 512, height: 512 },
            this.scene,
        );
        const ctx = gradientTexture.getContext();
        const centerX = 256;
        const centerY = 256;
        const radius = 180;
        const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0, // Inner circle (center, no radius)
            centerX,
            centerY,
            radius, // Outer circle (center, full radius)
        );
        gradient.addColorStop(1, "rgba(20, 20, 20, 1)"); // Dark center (front)
        gradient.addColorStop(0.4, "rgba(50, 50, 50, 1)"); // Darker inner area
        gradient.addColorStop(0, "rgba(70, 70, 70, 1)"); // Mid-tone
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        gradientTexture.update();
        gradientMaterial.diffuseTexture = gradientTexture;
        gradientMaterial.emissiveTexture = gradientTexture;
        gradientMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        gradientMaterial.backFaceCulling = false;
        gradientMaterial.disableLighting = true;
        backgroundSphere.material = gradientMaterial;
        backgroundSphere.isPickable = false;
        backgroundSphere.infiniteDistance = true;
        backgroundSphere.rotation.y = Math.PI / 2;
    }

    createGrid() {
        const gridSize = 6;
        const spacing = 1;
        const squareSize = 1;
        this.gridSquares = [];
        const groundPlane = BABYLON.MeshBuilder.CreateGround(
            "groundPlane",
            {
                width: gridSize + 4,
                height: gridSize + 4,
            },
            this.scene,
        );
        groundPlane.position = new BABYLON.Vector3(0, -0.05, 0);

        const groundMaterial = new BABYLON.StandardMaterial(
            "groundMaterial",
            this.scene,
        );
        groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        groundMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        groundPlane.material = groundMaterial;
        groundPlane.isPickable = false;
        groundPlane.isVisible = false;

        for (
            let x = -gridSize / 2 + squareSize / 2;
            x < gridSize / 2;
            x += spacing
        ) {
            for (
                let z = -gridSize / 2 + squareSize / 2;
                z < gridSize / 2;
                z += spacing
            ) {
                const square = BABYLON.MeshBuilder.CreateGround(
                    `gridSquare_${x}_${z}`,
                    {
                        width: squareSize * 0.95,
                        height: squareSize * 0.95,
                    },
                    this.scene,
                );

                square.position = new BABYLON.Vector3(x, 0.001, z);

                const material = new BABYLON.StandardMaterial(
                    `gridMaterial_${x}_${z}`,
                    this.scene,
                );
                material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                material.specularColor = new BABYLON.Color3(0, 0, 0);
                material.alpha = 1.0;
                square.material = material;

                square.originalColor = material.diffuseColor.clone();
                square.isPickable = false;

                this.gridSquares.push(square);
            }
        }
    }

    setupCamera() {
        this.camera = new BABYLON.UniversalCamera(
            "camera",
            new BABYLON.Vector3(0, 1.3, -3),
            this.scene,
        );
        this.resetCameraPosition();
        this.camera.attachControl(document.getElementById(this.canvasId), true);
        this.camera.speed = 0.1; // Movement speed
        this.camera.angularSensibility = 2000; // Mouse sensitivity (higher = less sensitive)

        // Set near and far clipping planes to prevent character clipping
        this.camera.minZ = 0.01; // Very close near plane to prevent clipping
        this.camera.maxZ = 1000; // Far plane for distant objects
        this.camera.keysUp.push(87); // W key
        this.camera.keysDown.push(83); // S key
        this.camera.keysLeft.push(65); // A key
        this.camera.keysRight.push(68); // D key
        this.camera.keysUpward.push(32); // Spacebar for up
        this.camera.keysDownward.push(16); // Shift for down
    }

    resetCameraPosition() {
        this.camera.position = new BABYLON.Vector3(0, 1.3, -3);
        this.camera.setTarget(new BABYLON.Vector3(0, 1.5, 0));
    }

    startContinuousCameraMovement(direction) {
        if (this.cameraMovementInterval) {
            clearInterval(this.cameraMovementInterval);
        }
        this.cameraMovementInterval = setInterval(() => {
            this.moveCameraInDirection(direction);
        }, 20); // Move every 50ms for smooth movement
    }

    stopContinuousCameraMovement() {
        if (this.cameraMovementInterval) {
            clearInterval(this.cameraMovementInterval);
            this.cameraMovementInterval = null;
        }
    }

    moveCameraInDirection(direction) {
        const moveSpeed = 0.02; // Adjust movement speed as needed
        const moveVector = direction.scale(moveSpeed);
        // Move the camera position
        this.camera.position.addInPlace(moveVector);
    }

    downloadScreenshot() {
        try {
            // Temporarily disable highlight layer to remove glowing effects
            const highlightLayerEnabled = this.highlightLayer
                ? this.highlightLayer.isEnabled
                : false;
            if (this.highlightLayer) {
                this.highlightLayer.isEnabled = false;
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
                // For 9:16 portrait, capture at higher resolution for better quality
                screenshotWidth = 1080; // Higher resolution width
                screenshotHeight = 1920; // 9:16 aspect ratio (1080 * 16/9 = 1920)
            } else {
                // Standard 16:9 landscape
                screenshotWidth = 1200;
                screenshotHeight = 800;
            }

            // Screenshot capture with aspect ratio handling
            BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                this.engine,
                this.camera,
                {
                    width: screenshotWidth,
                    height: screenshotHeight,
                    precision: 1.0,
                },
                (data) => {
                    // Re-enable highlight layer after screenshot
                    if (this.highlightLayer && highlightLayerEnabled) {
                        this.highlightLayer.isEnabled = true;
                    }

                    if (isPortraitRatio) {
                        // For 9:16 ratio, crop the center section to match visible area
                        this.cropImageTo9x16(data, (croppedData) => {
                            return croppedData;
                        });
                    } else {
                        // Standard download for 16:9
                        return data;
                    }

                    console.log("Screenshot processed successfully");
                },
                "image/png",
                1.0, // samples
                false, // antialiasing
            );
        } catch (error) {
            console.error("Error creating screenshot:", error);
            if (window.showErrorModal) {
                window.showErrorModal(
                    "Error capturing screenshot. Please try again.",
                    "❌ Screenshot Failed",
                );
            }

            // Re-enable highlight layer in case of error
            if (this.highlightLayer) {
                this.highlightLayer.isEnabled = true;
            }
        }
    }

    cropImageTo9x16(imageData, callback) {
        try {
            console.log("Cropping image to 9:16 aspect ratio...");

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Calculate crop dimensions for 9:16 from center
                const originalWidth = img.width;
                const originalHeight = img.height;

                // Target 9:16 aspect ratio (9/16 = 0.5625)
                const targetAspectRatio = 9 / 16;
                const originalAspectRatio = originalWidth / originalHeight;

                let cropWidth, cropHeight, cropX, cropY;

                if (originalAspectRatio > targetAspectRatio) {
                    // Original is wider than 9:16, crop the width
                    cropHeight = originalHeight;
                    cropWidth = originalHeight * targetAspectRatio;
                    cropX = (originalWidth - cropWidth) / 2; // Center horizontally
                    cropY = 0;
                } else {
                    // Original is taller than 9:16, crop the height
                    cropWidth = originalWidth;
                    cropHeight = originalWidth / targetAspectRatio;
                    cropX = 0;
                    cropY = (originalHeight - cropHeight) / 2; // Center vertically
                }

                // Set canvas size to 9:16 aspect ratio
                const finalWidth = 720;
                const finalHeight = 1280;
                canvas.width = finalWidth;
                canvas.height = finalHeight;

                // Draw the cropped image scaled to final dimensions
                ctx.drawImage(
                    img,
                    cropX,
                    cropY,
                    cropWidth,
                    cropHeight, // Source crop area
                    0,
                    0,
                    finalWidth,
                    finalHeight, // Destination area
                );

                // Convert canvas to data URL
                const croppedDataURL = canvas.toDataURL("image/png", 1.0);
                callback(croppedDataURL);

                console.log(
                    `Cropped from ${originalWidth}x${originalHeight} (crop: ${Math.round(cropWidth)}x${Math.round(cropHeight)}) to ${finalWidth}x${finalHeight}`,
                );
            };

            img.onerror = () => {
                console.error("Failed to load image for cropping");
                callback(imageData); // Fallback to original image
            };

            img.src = imageData;
        } catch (error) {
            console.error("Error cropping image:", error);
            callback(imageData); // Fallback to original image
        }
    }

    // =====================================================
    // CHARACTER MANAGEMENT SECTION
    // =====================================================

    async loadCharacterFromFile(
        position = new BABYLON.Vector3(0, 0, 0),
        characterName = "character1",
        fileName = "model.glb",
    ) {
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.ImportMesh(
                "",
                "/assets/",
                fileName,
                this.scene,
                (meshes, particleSystems, skeletons, animationGroups) => {
                    // Stop animations and set to frame 0 (pause by default)
                    animationGroups.forEach((animationGroup) => {
                        animationGroup.pause();
                        animationGroup.goToFrame(animationGroup.from);
                    });

                    // Create a parent mesh (empty item) to hold the character meshes
                    const parentItem = new BABYLON.TransformNode(
                        `${characterName}_parent`,
                        this.scene,
                    );
                    parentItem.position = position.clone();
                    parentItem.rotationQuaternion = null;
                    // Initialize with default height of 1.65m (scale 0.01 = 1.65m)
                    parentItem.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
                    parentItem.rotation.y = Math.PI;
                    parentItem.rotation.x = Math.PI / 2;

                    this.makeMeshDraggable(parentItem);
                    parentItem.actionManager = new BABYLON.ActionManager(
                        this.scene,
                    );
                    parentItem.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPickTrigger,
                            (evt) => {
                                this.selectCharacter(parentItem);
                            },
                        ),
                    );

                    // Process each mesh in the loaded character
                    meshes.forEach((mesh, index) => {
                        if (mesh && mesh.name !== undefined) {
                            mesh.parent = parentItem; // Attach mesh as child to the parent item
                            mesh.name = `${characterName}_mesh_${index}`;
                            mesh.isPickable = true;
                        } else {
                            console.warn(
                                `Skipping invalid mesh at index ${index} for character ${characterName}`,
                            );
                        }
                    });

                    // Store animation groups in the parent item for later access
                    parentItem.animationGroups = animationGroups;

                    // Add the parent mesh (empty item) to a new mesh table
                    this.characterTables.push([parentItem]);
                    updateGenerateButtonState();

                    resolve(parentItem);
                },
                (progress) => {},
                (scene, message, exception) => {
                    console.error(
                        `Error loading GLB character ${characterName} from ${fileName}:`,
                        message,
                        exception,
                    );
                    reject(
                        new Error(
                            `Failed to load ${characterName} from ${fileName}: ${message}`,
                        ),
                    );
                },
            );
        });
    }

    // Load character from custom uploaded file
    async loadCharacterFromCustomData(
        file,
        position = new BABYLON.Vector3(0, 0, 0),
        characterName = "character1",
    ) {
        return new Promise((resolve, reject) => {
            // Create a blob URL from the file
            const fileUrl = URL.createObjectURL(file);

            BABYLON.SceneLoader.ImportMesh(
                "",
                "",
                fileUrl,
                this.scene,
                (meshes, particleSystems, skeletons, animationGroups) => {
                    // Clean up the blob URL
                    URL.revokeObjectURL(fileUrl);

                    // Stop animations and set to frame 0 (pause by default)
                    animationGroups.forEach((animationGroup) => {
                        animationGroup.pause();
                        animationGroup.goToFrame(animationGroup.from);
                    });

                    // Create a parent mesh (empty item) to hold the character meshes
                    const parentItem = new BABYLON.TransformNode(
                        `${characterName}_parent`,
                        this.scene,
                    );
                    parentItem.position = position.clone();
                    parentItem.rotationQuaternion = null;
                    // Initialize with default height of 1.65m (scale 0.01 = 1.65m)
                    parentItem.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
                    parentItem.rotation.y = Math.PI;
                    parentItem.rotation.x = Math.PI / 2;

                    this.makeMeshDraggable(parentItem);
                    parentItem.actionManager = new BABYLON.ActionManager(
                        this.scene,
                    );
                    parentItem.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPickTrigger,
                            (evt) => {
                                this.selectCharacter(parentItem);
                            },
                        ),
                    );

                    // Process each mesh in the loaded character
                    meshes.forEach((mesh, index) => {
                        if (mesh && mesh.name !== undefined) {
                            mesh.parent = parentItem; // Attach mesh as child to the parent item
                            mesh.name = `${characterName}_mesh_${index}`;
                            mesh.isPickable = true;
                        } else {
                            console.warn(
                                `Skipping invalid mesh at index ${index} for character ${characterName}`,
                            );
                        }
                    });

                    // Store animation groups in the parent item for later access
                    parentItem.animationGroups = animationGroups;

                    // Add the parent mesh (empty item) to a new mesh table
                    this.characterTables.push([parentItem]);
                    updateGenerateButtonState();

                    resolve(parentItem);
                },
                (progress) => {},
                (scene, message, exception) => {
                    // Clean up the blob URL in case of error
                    URL.revokeObjectURL(fileUrl);

                    console.error(
                        `Error loading GLB character ${characterName} from custom file:`,
                        message,
                        exception,
                    );
                    reject(
                        new Error(
                            `Failed to load ${characterName} from custom file: ${message}`,
                        ),
                    );
                },
                ".glb",
            );
        });
    }

    // Add character from custom uploaded file
    async addNewCharacterFromCustomData(
        file,
        displayName = "default",
        customPosition = null,
    ) {
        // Check if we already have 2 characters
        if (this.characterTables.length >= 3) {
            if (window.showErrorModal) {
                window.showErrorModal(
                    "Maximum of 3 characters supported.",
                    "Character Limit",
                );
            }
            return null;
        }

        this.characterCounter++;
        // Convert display name to internal format: lowercase with underscores
        const internalName = displayName.toLowerCase().replace(/\s+/g, "_");
        const characterName = `${internalName}_${this.characterCounter}`;
        const bestPosition = customPosition || this.findBestPosition();

        try {
            const meshes = await this.loadCharacterFromCustomData(
                file,
                bestPosition,
                characterName,
            );

            // Store the character type for this character
            const characterPrefix = characterName;
            if (!this.characterTypes) {
                this.characterTypes = {};
            }
            this.characterTypes[characterPrefix] = "custom";

            // Auto-select the newly added character
            this.selectCharacter(meshes);

            // Make the character draggable and clickable
            this.makeMeshDraggable(meshes);

            // Refresh the characters list and update controls after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (window.updateCharactersList) {
                    window.updateCharactersList();
                }
                if (window.updateCharacterControls) {
                    window.updateCharacterControls(characterName);
                }
            }, 100);

            // Return the character prefix for tracking
            return characterName;
        } catch (error) {
            console.error(
                `Error adding new character from custom data:`,
                error,
            );

            // Show user-friendly error message
            if (window.showErrorModal) {
                window.showErrorModal(
                    `Failed to add character: ${error.message || "Unknown error"}`,
                    "❌ Character Load Failed",
                );
            }

            return null;
        }
    }

    // Export scene data as JSON
    exportSceneData() {
        // Get the current ratio from the HTML interface
        let currentRatio = "1280:720"; // Default to landscape
        try {
            // Try to access the selectedRatio variable from the HTML context
            if (typeof window !== "undefined" && window.selectedRatio) {
                currentRatio = window.selectedRatio;
            } else {
                // Fallback: check which ratio option is currently selected
                const selectedRatioElement = document.querySelector(
                    '.ratio-option[style*="border-color: rgb(52, 152, 219)"], .ratio-option[style*="border-color: #3498db"]',
                );
                if (
                    selectedRatioElement &&
                    selectedRatioElement.dataset.ratio
                ) {
                    currentRatio = selectedRatioElement.dataset.ratio;
                }
            }
        } catch (error) {
            console.warn(
                "Could not determine current ratio, using default:",
                error,
            );
        }

        const sceneData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            ratio: currentRatio,
            camera: this.getCameraData(),
            characters: this.getCharactersData(),
        };

        return sceneData;
    }

    // Utility function to convert radians to degrees
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    // Get camera position and rotation data
    getCameraData() {
        if (!this.camera) {
            return null;
        }

        return {
            position: {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z,
            },
            rotation: {
                x: this.radToDeg(this.camera.rotation.x),
                y: this.radToDeg(this.camera.rotation.y),
                z: this.radToDeg(this.camera.rotation.z),
            },
            target: this.camera.getTarget
                ? {
                      x: this.camera.getTarget().x,
                      y: this.camera.getTarget().y,
                      z: this.camera.getTarget().z,
                  }
                : null,
            fov: this.camera.fov || null,
        };
    }

    // Get all characters data
    getCharactersData() {
        const charactersData = [];

        this.characterTables.forEach((characterTable, index) => {
            if (characterTable.length > 0) {
                const parentMesh = characterTable[0];
                const characterData = this.getCharacterData(parentMesh, index);
                if (characterData) {
                    charactersData.push(characterData);
                }
            }
        });

        return charactersData;
    }

    // Get individual character data
    getCharacterData(parentMesh, tableIndex) {
        if (!parentMesh || !parentMesh.name) {
            return null;
        }

        const characterPrefix = parentMesh.name.replace("_parent", "");
        const baseName = characterPrefix.split("_")[0];

        // Get character type/pose
        const characterType =
            this.characterTypes && this.characterTypes[characterPrefix]
                ? this.characterTypes[characterPrefix]
                : "talking.glb";

        // Get character type internal code
        const characterTypeCode = this.getCharacterTypeCode(characterType);

        // Get current animation frame number
        const animationFrame = this.getCurrentAnimationFrame(parentMesh);

        return {
            name: baseName,
            tagName: baseName, // Tag name for referencing in prompts
            position: {
                x: parentMesh.position.x,
                y: parentMesh.position.y,
                z: parentMesh.position.z,
            },
            bodyRotationZ: this.radToDeg(parentMesh.rotation.z), // Only Z rotation (user-controllable)
            heightInMeters: this.getCharacterHeightInMeters(parentMesh), // Height in meters instead of scale ratio
            characterType: characterTypeCode,
            animationFrame: animationFrame, // Actual animation frame number
            tableIndex: tableIndex,
        };
    }

    // Get character type internal code from filename
    getCharacterTypeCode(filename) {
        const typeMap = {
            "talking.glb": "talking",
            "walking.glb": "walking",
            "reacting.glb": "reacting",
            "angry.glb": "angry",
            "sitting-talking.glb": "sitting",
        };
        return typeMap[filename] || "talking";
    }

    // Get filename from character type code
    getCharacterTypeFilename(typeCode) {
        const filenameMap = {
            talking: "talking.glb",
            walking: "walking.glb",
            reacting: "reacting.glb",
            angry: "angry.glb",
            sitting: "sitting-talking.glb",
        };
        return filenameMap[typeCode] || "talking.glb";
    }

    // Find the best available position for a new character
    findBestPosition() {
        const preferredPositions = [
            new BABYLON.Vector3(0, 0, 0), // Center first
            new BABYLON.Vector3(1, 0, 0), // Right
            new BABYLON.Vector3(0, 0, 1), // Forward
            new BABYLON.Vector3(-1, 0, 0), // Left
            new BABYLON.Vector3(0, 0, -1), // Back
        ];

        // Get all existing character positions
        const occupiedPositions = [];
        if (this.characterTables) {
            this.characterTables.forEach((characterTable) => {
                if (characterTable.length > 0) {
                    const parentMesh = characterTable[0];
                    if (parentMesh && parentMesh.position) {
                        occupiedPositions.push(parentMesh.position);
                    }
                }
            });
        }

        // Find the first available position
        for (let preferredPos of preferredPositions) {
            let isOccupied = false;

            for (let occupiedPos of occupiedPositions) {
                const distance = BABYLON.Vector3.Distance(
                    preferredPos,
                    occupiedPos,
                );
                if (distance < 0.8) {
                    // 1 meter minimum distance
                    isOccupied = true;
                    break;
                }
            }

            if (!isOccupied) {
                return preferredPos;
            }
        }

        // If all preferred positions are taken, return center (shouldn't happen with max 2 characters)
        return new BABYLON.Vector3(0, 0, 0);
    }

    async addNewCharacter(
        fileName = "model.glb",
        displayName = "default",
        customPosition = null,
    ) {
        // Check if we already have 2 characters
        if (this.characterTables.length >= 3) {
            if (window.showErrorModal) {
                window.showErrorModal(
                    "Maximum of 3 characters supported.",
                    "Character Limit",
                );
            }
            return null;
        }

        this.characterCounter++;
        // Convert display name to internal format: lowercase with underscores
        const internalName = displayName.toLowerCase().replace(/\s+/g, "_");
        const characterName = `${internalName}_${this.characterCounter}`;
        const bestPosition = customPosition || this.findBestPosition();

        try {
            const meshes = await this.loadCharacterFromFile(
                bestPosition,
                characterName,
                fileName,
            );

            // Store the character type for this character (convert filename to simple value)
            const characterPrefix = characterName;
            if (!this.characterTypes) {
                this.characterTypes = {};
            }
            const simpleType = this.getCharacterTypeCode(fileName);
            this.characterTypes[characterPrefix] = simpleType;

            // Auto-select the newly added character
            this.selectCharacter(meshes);

            // Make the character draggable and clickable
            this.makeMeshDraggable(meshes);

            // Refresh the characters list and update controls after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (window.updateCharactersList) {
                    window.updateCharactersList();
                }
                if (window.updateCharacterControls) {
                    window.updateCharacterControls(characterName);
                }
            }, 100);

            // Return the character prefix for tracking
            return characterName;
        } catch (error) {
            console.error(`Error adding new character with ${fileName}:`);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            console.error("Full error object:", error);

            // Show user-friendly error message
            if (window.showErrorModal) {
                window.showErrorModal(
                    `Failed to add character: ${error.message || "Unknown error"}`,
                    "❌ Character Load Failed",
                );
            }

            return null;
        }
    }

    makeMeshDraggable(mesh) {
        const pointerDragBehavior = new BABYLON.PointerDragBehavior({
            dragPlaneNormal: new BABYLON.Vector3(0, 1, 0),
        });

        pointerDragBehavior.useObjectOrientationForDragging = false;
        pointerDragBehavior.updateDragPlane = false;

        const gridBoundary = 3;
        const followSpeed = 0.15;

        let targetPosition = mesh.position.clone();
        let originalPosition = mesh.position.clone();
        let dragging = false;

        pointerDragBehavior.onDragStartObservable.add(() => {
            this.camera.detachControl();
            this.selectCharacter(mesh);
            dragging = true;

            // ✅ Capture the original (pre-drag) position
            originalPosition = mesh.position.clone();
            targetPosition.copyFrom(mesh.position);
        });

        pointerDragBehavior.onDragObservable.add((event) => {
            const point = event.dragPlanePoint.clone();
            point.y = 0;

            // Do NOT clamp here – we allow drag outside, and check later
            targetPosition.copyFrom(point);
        });

        pointerDragBehavior.onDragEndObservable.add(() => {
            dragging = false;

            // Check where the character was dropped
            const finalX = mesh.position.x;
            const finalZ = mesh.position.z;

            const isOutOfBounds =
                finalX < -gridBoundary ||
                finalX > gridBoundary ||
                finalZ < -gridBoundary ||
                finalZ > gridBoundary;

            if (isOutOfBounds) {
                // ✅ Set target to the original position to return smoothly
                targetPosition.copyFrom(originalPosition);
            } else {
                // ✅ Update the "last valid" position
                originalPosition.copyFrom(mesh.position);
                targetPosition.copyFrom(mesh.position);
            }

            mesh.position.y = 0;

            setTimeout(() => {
                this.camera.attachControl(
                    document.getElementById(this.canvasId),
                    true,
                );
            }, 100);

            this.updateCharacterInfo();
        });

        mesh.addBehavior(pointerDragBehavior);

        // Smooth follow per frame
        this.scene.onBeforeRenderObservable.add(() => {
            if (!mesh.position.equals(targetPosition)) {
                mesh.position = BABYLON.Vector3.Lerp(
                    mesh.position,
                    targetPosition,
                    followSpeed,
                );
                mesh.position.y = 0;
            }
        });
    }

    selectCharacter(mesh) {
        if (!mesh) {
            console.error("Cannot select character: mesh is undefined");
            return;
        }

        // Check if mesh is still valid and not disposed
        try {
            if (!mesh.name || mesh.isDisposed()) {
                console.warn(
                    "Cannot select character: mesh is disposed or invalid",
                );
                return;
            }
        } catch (error) {
            console.warn("Cannot select character: mesh appears to be invalid");
            return;
        }

        // Remove previous highlight
        if (this.selectedCharacter && this.highlightLayer) {
            try {
                // If previous selection was a parent node, remove highlights from all children
                if (
                    this.selectedCharacter.name.includes("_parent") &&
                    this.selectedCharacter.getChildren
                ) {
                    const children = this.selectedCharacter.getChildren();
                    children.forEach((child) => {
                        if (child && child.material) {
                            try {
                                this.highlightLayer.removeMesh(child);
                            } catch (childError) {
                                console.warn(
                                    `Could not remove highlight from child ${child.name}:`,
                                    childError,
                                );
                            }
                        }
                    });
                } else {
                    // Regular mesh highlight removal
                    this.highlightLayer.removeMesh(this.selectedCharacter);
                }
            } catch (error) {
                console.warn("Error removing previous highlight:", error);
            }
        }

        this.selectedCharacter = mesh;

        // Create highlight layer if it doesn't exist
        if (!this.highlightLayer) {
            try {
                this.highlightLayer = new BABYLON.HighlightLayer(
                    "highlightLayer",
                    this.scene,
                    {
                        mainTextureFixedSize: 1024,
                        blurTextureSizeRatio: 0.25,
                    },
                );
                this.highlightLayer.innerGlow = true;
                this.highlightLayer.outerGlow = true;
                this.highlightLayer.isEnabled = true;
            } catch (error) {
                console.error("Error creating highlight layer:", error);
                return;
            }
        }

        // Add highlight with a bright green glow
        try {
            if (
                this.highlightLayer &&
                mesh &&
                mesh.name &&
                !mesh.isDisposed()
            ) {
                // If this is a parent node, highlight all its children
                if (mesh.name.includes("_parent") && mesh.getChildren) {
                    const children = mesh.getChildren();
                    let highlightedCount = 0;

                    children.forEach((child) => {
                        if (child && child.material && !child.isDisposed()) {
                            try {
                                this.highlightLayer.addMesh(
                                    child,
                                    new BABYLON.Color3(
                                        0.20392,
                                        0.59608,
                                        0.85882,
                                    ),
                                );
                                highlightedCount++;
                            } catch (childError) {
                                console.warn(
                                    `Could not highlight child ${child.name}:`,
                                    childError,
                                );
                            }
                        }
                    });

                    if (highlightedCount > 0) {
                    } else {
                        console.warn(
                            `No child meshes could be highlighted for ${mesh.name}`,
                        );
                    }
                } else if (mesh.material || mesh.subMeshes) {
                    // Regular mesh highlighting
                    this.highlightLayer.addMesh(
                        mesh,
                        new BABYLON.Color3(0, 1, 0),
                    );
                } else {
                    console.warn(
                        `Mesh ${mesh.name} lacks required properties for highlighting`,
                    );
                }
            } else {
                console.warn(
                    "Cannot highlight mesh - mesh may be disposed or invalid",
                );
            }
        } catch (error) {
            console.error(
                "Error adding mesh to highlight layer:",
                error.message || error,
            );
        }

        // Update HTML interface with error handling
        setTimeout(() => {
            try {
                if (window.updateCharactersList) {
                    window.updateCharactersList();
                }

                // Update character controls for the selected character
                if (window.updateCharacterControls && mesh && mesh.name) {
                    let characterPrefix = mesh.name;
                    if (characterPrefix.includes("_parent")) {
                        characterPrefix = characterPrefix.replace(
                            "_parent",
                            "",
                        );
                    } else if (characterPrefix.includes("_mesh_")) {
                        characterPrefix = characterPrefix.replace(
                            /_mesh_\d+$/,
                            "",
                        );
                    }
                    window.updateCharacterControls(characterPrefix);
                }

                // Update animation controls for the selected character
                if (window.updateAnimationControls) {
                    window.updateAnimationControls();
                }

                // Update height display and slider for the selected character
                if (window.updateHeightDisplay) {
                    window.updateHeightDisplay();
                }
                if (window.updateHeightSlider) {
                    window.updateHeightSlider();
                }
            } catch (error) {
                console.error(
                    "Error updating interface after selection:",
                    error,
                );
            }
        }, 50);
    }

    updateCharacterInfo() {
        // Update HTML interface instead of Babylon GUI
        if (window.updateCharactersList) {
            window.updateCharactersList();
        }
    }

    updateCharacterName(newName) {
        if (!this.selectedCharacter) {
            return;
        }

        let oldCharacterPrefix = "";
        let characterNumber = "";
        let oldFullPrefix = "";

        // Handle both parent nodes and mesh nodes
        if (this.selectedCharacter.name.includes("_parent")) {
            oldFullPrefix = this.selectedCharacter.name.replace("_parent", "");
            const parts = oldFullPrefix.split("_");
            oldCharacterPrefix = parts[0];
            characterNumber = parts[1];
        } else if (this.selectedCharacter.name.includes("_mesh_")) {
            oldFullPrefix = this.selectedCharacter.name.split("_mesh_")[0];
            const parts = oldFullPrefix.split("_");
            oldCharacterPrefix = parts[0];
            characterNumber = parts[1];
        } else {
            return;
        }

        const newFullPrefix = `${newName}_${characterNumber}`;

        // Find and rename the parent node (check both meshes and transformNodes)
        let parentNode = this.scene.meshes.find(
            (mesh) => mesh.name === `${oldFullPrefix}_parent`,
        );

        if (!parentNode) {
            parentNode = this.scene.transformNodes.find(
                (node) => node.name === `${oldFullPrefix}_parent`,
            );
        }

        if (parentNode) {
            parentNode.name = `${newFullPrefix}_parent`;

            // Update selectedCharacter reference if it's the parent
            if (this.selectedCharacter === parentNode) {
                this.selectedCharacter = parentNode;
            }
        } else {
            console.log(`Parent node not found: ${oldFullPrefix}_parent`);
        }

        // Find all meshes with the same character prefix and update their names
        const meshesToRename = this.scene.meshes.filter((mesh) =>
            mesh.name.startsWith(`${oldFullPrefix}_mesh_`),
        );

        console.log(`Found ${meshesToRename.length} meshes to rename`);

        meshesToRename.forEach((mesh) => {
            const meshNumber = mesh.name.split("_mesh_")[1];
            const oldMeshName = mesh.name;
            mesh.name = `${newFullPrefix}_mesh_${meshNumber}`;
            console.log(`Renamed mesh from "${oldMeshName}" to "${mesh.name}"`);
        });

        // Update stored data references

        if (this.characterTypes && this.characterTypes[oldFullPrefix]) {
            this.characterTypes[newFullPrefix] =
                this.characterTypes[oldFullPrefix];
            delete this.characterTypes[oldFullPrefix];
            console.log(
                `Updated character type reference from "${oldFullPrefix}" to "${newFullPrefix}"`,
            );
        }

        this.updateCharacterInfo();
    }

    deleteSelectedCharacter() {
        if (!this.selectedCharacter) {
            console.log("No character selected for deletion");
            return;
        }

        const characterName = this.selectedCharacter.name;
        let characterPrefix = characterName;

        // Extract the character prefix properly
        if (characterName.includes("_parent")) {
            characterPrefix = characterName.replace("_parent", "");
        } else if (characterName.includes("_mesh_")) {
            characterPrefix = characterName.split("_mesh_")[0];
        }

        // Remove from highlight layer first
        if (this.highlightLayer && this.selectedCharacter) {
            try {
                this.highlightLayer.removeMesh(this.selectedCharacter);
            } catch (error) {
                console.warn("Error removing from highlight layer:", error);
            }
        }

        // Clear selection immediately to prevent further operations on disposed mesh
        this.selectedCharacter = null;

        // Find and remove the mesh table containing this character first
        const characterTableIndex = this.characterTables.findIndex(
            (characterTable) =>
                characterTable.some((mesh) => {
                    if (!mesh || !mesh.name) return false;
                    const meshPrefix = mesh.name.includes("_parent")
                        ? mesh.name.replace("_parent", "")
                        : mesh.name.split("_mesh_")[0];
                    return meshPrefix === characterPrefix;
                }),
        );

        if (characterTableIndex !== -1) {
            // Remove the mesh table from the array first
            this.characterTables.splice(characterTableIndex, 1);
        }

        // Find and dispose the parent node and all its children
        const parentNode = this.scene.getNodeByName(
            `${characterPrefix}_parent`,
        );
        if (parentNode) {
            try {
                // Dispose all children first
                const children = parentNode.getChildren();
                children.forEach((child) => {
                    if (
                        child &&
                        child.dispose &&
                        typeof child.dispose === "function"
                    ) {
                        try {
                            child.dispose();
                        } catch (error) {
                            console.warn(
                                `Error disposing child ${child.name}:`,
                                error,
                            );
                        }
                    }
                });

                // Dispose the parent node
                parentNode.dispose();
            } catch (error) {
                console.error(
                    `Error disposing parent node ${parentNode.name}:`,
                    error,
                );
            }
        }

        // Clean up character-related data
        if (this.characterTypes && this.characterTypes[characterPrefix]) {
            delete this.characterTypes[characterPrefix];
        }

        updateGenerateButtonState();

        console.log(`Successfully deleted character: ${characterPrefix}`);

        // Refresh the characters list with error handling
        setTimeout(() => {
            try {
                if (window.updateCharactersList) {
                    window.updateCharactersList();
                }
            } catch (error) {
                console.error(
                    "Error updating characters list after deletion:",
                    error,
                );
            }
        }, 200);
    }

    // =====================================================
    // CHARACTER CONTROLS SECTION
    // =====================================================

    // Character Rotation Controls
    rotateSelectedCharacter(rotationZ) {
        if (!this.selectedCharacter) {
            console.log("No character selected for rotation");
            return;
        }

        // Simply rotate the selected mesh around its Y axis
        this.selectedCharacter.rotation.z -= rotationZ;

        // Update the character info display
        this.updateCharacterInfo();
    }

    startContinuousRotation(rotationAmount) {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }

        this.rotationInterval = setInterval(() => {
            this.rotateSelectedCharacter(rotationAmount);
        }, 50); // Rotate every 50ms for smooth continuous rotation
    }

    stopContinuousRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    // Scale Controls
    scaleSelectedCharacter(scaleFactor) {
        if (!this.selectedCharacter || !this.selectedCharacter.name) {
            console.log("No character selected for scaling");
            return;
        }

        // Get the character prefix and find the parent node
        let characterPrefix = this.selectedCharacter.name;
        let parentNode = this.selectedCharacter;

        // If selected mesh is not the parent, find the parent
        if (this.selectedCharacter.name.includes("_mesh_")) {
            characterPrefix = this.selectedCharacter.name.split("_mesh_")[0];
            parentNode = this.scene.getNodeByName(`${characterPrefix}_parent`);
        } else if (this.selectedCharacter.name.includes("_parent")) {
            characterPrefix = this.selectedCharacter.name.replace(
                "_parent",
                "",
            );
        }

        if (!parentNode) {
            console.log(
                `Parent node not found for character ${characterPrefix}`,
            );
            return;
        }

        // Scale the parent node - this will scale all children
        parentNode.scaling.x *= scaleFactor;
        parentNode.scaling.y *= scaleFactor;
        parentNode.scaling.z *= scaleFactor;

        // Prevent scaling from going too small or too large
        const minScale = 0.001;
        const maxScale = 0.1;

        if (
            parentNode.scaling.x < minScale ||
            parentNode.scaling.y < minScale ||
            parentNode.scaling.z < minScale
        ) {
            parentNode.scaling.x = Math.max(parentNode.scaling.x, minScale);
            parentNode.scaling.y = Math.max(parentNode.scaling.y, minScale);
            parentNode.scaling.z = Math.max(parentNode.scaling.z, minScale);
        }

        if (
            parentNode.scaling.x > maxScale ||
            parentNode.scaling.y > maxScale ||
            parentNode.scaling.z > maxScale
        ) {
            parentNode.scaling.x = Math.min(parentNode.scaling.x, maxScale);
            parentNode.scaling.y = Math.min(parentNode.scaling.y, maxScale);
            parentNode.scaling.z = Math.min(parentNode.scaling.z, maxScale);
        }

        console.log(
            `Scaled character ${characterPrefix} by factor of ${scaleFactor} - New scale: (${parentNode.scaling.x.toFixed(4)}, ${parentNode.scaling.y.toFixed(4)}, ${parentNode.scaling.z.toFixed(4)})`,
        );
    }

    startContinuousScaling(scaleFactor) {
        if (this.scalingInterval) {
            clearInterval(this.scalingInterval);
        }

        this.scalingInterval = setInterval(() => {
            this.scaleSelectedCharacter(scaleFactor);
        }, 50); // Scale every 50ms for smooth continuous scaling
    }

    stopContinuousScaling() {
        if (this.scalingInterval) {
            clearInterval(this.scalingInterval);
            this.scalingInterval = null;
        }
    }

    // Auto-rotate camera around scene center
    toggleAutoRotate() {
        if (this.isAutoRotating) {
            this.stopAutoRotate();
        } else {
            this.startAutoRotate();
        }
    }

    startAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
        }

        this.isAutoRotating = true;
        const rotationSpeed = 0.01; // Rotation speed in radians per frame

        // Use current camera position to maintain its distance from center
        const currentX = this.camera.position.x;
        const currentZ = this.camera.position.z;
        const currentY = this.camera.position.y;
        const radius = Math.sqrt(currentX * currentX + currentZ * currentZ); // Calculate current distance from center
        const centerY = currentY; // Maintain current camera height

        // Calculate current camera angle based on its position to start from current location
        let angle = Math.atan2(currentZ, currentX); // Start from current camera position

        // Update button appearance
        const autoRotateBtn = document.getElementById("autoRotateBtn");
        if (autoRotateBtn) {
            autoRotateBtn.innerHTML = "⏹️ Stop Rotate";
            autoRotateBtn.style.background =
                "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)";
        }

        // Disable character highlighting
        if (this.highlightLayer) {
            this.highlightLayer.isEnabled = false;
        }

        // Hide overlay interfaces
        const characterControls = document.querySelector(
            '[style*="position: absolute"][style*="top: 15px"][style*="left: 15px"]',
        );
        const cameraControls = document.querySelector(
            '[style*="position: absolute"][style*="bottom: 15px"][style*="right: 15px"]',
        );

        if (characterControls) {
            characterControls.style.display = "none";
        }
        if (cameraControls) {
            cameraControls.style.display = "none";
        }

        this.autoRotateInterval = setInterval(() => {
            // Calculate new camera position in a circle around the center
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Update camera position
            this.camera.position.x = x;
            this.camera.position.z = z;
            this.camera.position.y = centerY;

            // Always look at the center of the scene
            this.camera.setTarget(new BABYLON.Vector3(0, centerY, 0));

            // Increment angle for next frame
            angle += rotationSpeed;

            // Reset angle to prevent overflow
            if (angle >= Math.PI * 2) {
                angle = 0;
            }
        }, 16); // ~60 FPS

        console.log(
            "Auto-rotate camera started - UI hidden, expressions hidden, highlighting disabled",
        );
    }

    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }

        this.isAutoRotating = false;

        // Update button appearance
        const autoRotateBtn = document.getElementById("autoRotateBtn");
        if (autoRotateBtn) {
            autoRotateBtn.innerHTML = "🎥 Auto Rotate";
        }

        // Re-enable character highlighting
        if (this.highlightLayer) {
            this.highlightLayer.isEnabled = true;
        }

        // Show overlay interfaces
        const characterControls = document.querySelector(
            '[style*="position: absolute"][style*="top: 15px"][style*="left: 15px"]',
        );
        const cameraControls = document.querySelector(
            '[style*="position: absolute"][style*="bottom: 15px"][style*="right: 15px"]',
        );

        if (characterControls) {
            characterControls.style.display = "block";
        }
        if (cameraControls) {
            cameraControls.style.display = "block";
        }

        console.log(
            "Auto-rotate camera stopped - UI restored, expressions restored, highlighting enabled",
        );
    }

    // =====================================================
    // ANIMATION CONTROLS SECTION
    // =====================================================

    // Get current animation frame number for the selected character
    getCurrentAnimationFrame(parentMesh = null) {
        // Use the provided mesh or fall back to selected character
        const targetMesh = parentMesh || this.selectedCharacter;

        if (!targetMesh || !targetMesh.animationGroups) {
            return 0; // Return 0 if no animation available
        }

        const animationGroups = targetMesh.animationGroups;
        if (animationGroups.length === 0) {
            return 0; // Return 0 if no animation available
        }

        // Get the first animation group (simple approach - no sub-groups)
        const animationGroup = animationGroups[0];

        // Get current frame position
        let currentFrame = animationGroup.from;
        if (
            animationGroup.animatables &&
            animationGroup.animatables.length > 0
        ) {
            currentFrame = animationGroup.animatables[0].masterFrame;
        }

        return Math.round(currentFrame);
    }

    // Set animation frame for any character mesh using frame number
    setCharacterAnimationFrameNumber(parentMesh, frameNumber) {
        try {
            if (!parentMesh || !parentMesh.animationGroups) {
                return;
            }
        } catch (error) {
            console.warn("Error accessing character animation groups:", error);
            return;
        }

        const animationGroups = parentMesh.animationGroups;

        // Simple approach - work with first animation group only
        if (animationGroups.length > 0) {
            try {
                const animationGroup = animationGroups[0];
                if (!animationGroup) return;

                const fromFrame = animationGroup.from;
                const toFrame = animationGroup.to;

                // Clamp frame number to valid range
                const targetFrame = Math.max(
                    fromFrame,
                    Math.min(toFrame, frameNumber),
                );

                // Always keep animation paused and just set the frame
                animationGroup.pause();
                animationGroup.goToFrame(targetFrame);
            } catch (error) {
                console.warn("Error setting animation frame:", error);
            }
        }
    }

    // Check if selected character has animations
    selectedCharacterHasAnimations() {
        return (
            this.selectedCharacter &&
            this.selectedCharacter.animationGroups &&
            this.selectedCharacter.animationGroups.length > 0
        );
    }
}

// Global functions
let babylonStage = null;

function initBabylonStage() {
    babylonStage = new BabylonStage("babylonCanvas");
    babylonStage.init();
    // Make babylonStage globally accessible
    window.babylonStage = babylonStage;
    // Don't auto-add character, let user add them manually
}
