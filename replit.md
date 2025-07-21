# Shotblockr - Replit Project Guide

## Overview

Shotblockr is an AI-powered 3D character positioning application for film and creative industries. Built with Node.js and TypeScript backend serving a sophisticated 3D scene builder using Babylon.js. The application allows users to create and manipulate 3D scenes with characters, poses, and environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **July 20, 2025**: EXAMPLE IMAGES SERVER ROUTE - Added /examples/ server route to serve existing example images from public/examples directory: makes 6 example images accessible for README.md documentation, includes proper content-type handling and CORS support, enables showcase of 3D positioning workflow and AI-generated results in project documentation.
- **July 20, 2025**: COMPREHENSIVE API DEBUGGING - Enhanced server and client-side debugging for Replicate API communication: added detailed logging of image data transmission including lengths and formats, server logs show successful API responses with prediction IDs, confirmed both screenshot (input_image_1) and background reference (input_image_2) are properly sent to API, resolved background image regeneration issues.
- **July 20, 2025**: DELETE CHARACTER FUNCTIONALITY RESTORED - Fixed delete character button with comprehensive debugging: added extensive console logging to trace character selection process, restored missing modal display code in deleteCharacter function, confirmed character selection and deletion workflow working correctly, delete confirmation modal properly shows and processes character removal.
- **July 19, 2025**: ENTER KEY REFINE FUNCTIONALITY - Added Enter key shortcut for refine prompt text areas: pressing Enter in refine prompts automatically triggers the "Refine shot" button, only works when prompt text is not empty and button is enabled, Shift+Enter still creates new lines, functionality only applies to refine sections not main generation button.
- **July 19, 2025**: COMPREHENSIVE DOCUMENTATION ADDED - Created complete README.md with user guide, technical architecture, API documentation, troubleshooting guides, and development instructions: added server routes for accessing documentation at /readme, /docs, and /README, includes styled HTML rendering with navigation links, provides both formatted view and raw markdown access, comprehensive coverage of all features and technical details.
- **July 19, 2025**: CUSTOM BACKGROUND PERSISTENCE COMPLETE FIX - Completely removed custom background data clearing during regeneration: clearAllGeneratedContent no longer clears window.customBackgroundData automatically, custom uploaded backgrounds now persist through all regeneration cycles, only manual selection of different background options clears custom data, ensures uploaded reference images remain available for multiple generations.
- **July 19, 2025**: GENERATE BUTTON ACTIVATION FIX - Fixed Generate Shot button not activating when selecting scene reference images: removed duplicate event handlers for scene selection, added missing updateGenerateButtonState() call in scene selection click handlers, button now properly enables/disables based on character and background selection status.
- **July 19, 2025**: REGENERATE WARNING MODAL WITH COMPLETE CLEANUP - Added confirmation modal for image regeneration with full content clearing: when users attempt to generate new images while existing images are present, a warning modal appears asking for confirmation, upon confirmation completely removes all existing image blocks and refine sections from DOM, resets internal counters to start fresh as if beginning new session, preserves only hidden templates for proper functionality, provides clean slate regeneration experience.
- **July 19, 2025**: RESET MODAL FUNCTIONALITY - Implemented complete reset functionality: reset button now displays confirmation modal before proceeding, modal warns about losing all characters, images, and refinements, cancel option returns to app without changes, confirm option reloads the page completely to start fresh, provides safe way to restart the entire workflow.
- **July 19, 2025**: REGENERATION BACKGROUND PRESERVATION - Fixed regeneration incorrectly resetting background selection: modified clearAllGeneratedContent to only change background selection when custom background was actually selected, preserves user's chosen background (space/lost-island) during regeneration process, ensures fresh screenshot uses correct selected background instead of defaulting to lost-island.
- **July 19, 2025**: ERROR MESSAGE ANIMATION FIX - Prevented loading dots animation from appearing on error messages: created error-message CSS class that excludes loading animation, modified CSS selector to only animate non-error loading messages using :not(.error-message) pseudo-selector, added proper error state cleanup when resetting to normal loading state.
- **July 19, 2025**: CUSTOM BACKGROUND SELECTION FIX - Fixed "No background selected" error when using custom uploaded backgrounds: made customBackgroundData variable globally accessible across JavaScript files using window object, updated all references to use window.customBackgroundData for cross-file compatibility, added proper cleanup of custom background data during regeneration process with visual reset of upload option.
- **July 19, 2025**: FIXED CANVAS WIDTH STABILITY - Ensured canvas container maintains consistent 800px width regardless of window resizing: changed canvas-and-controls from flex:1 to fixed 800px width, set both canvas container and Babylon canvas to exact 800px dimensions, prevents layout shifts during window resize for stable 3D viewport experience.
- **July 19, 2025**: BOTTOM LAYOUT REORGANIZATION - Moved reset button to right side and added attribution text: created new bottom section with flexbox layout placing "3D shotblockr prototype - Christophe Bruchansky, 2025" attribution on the left and reset button on the right, added subtle border separator and proper spacing, maintains professional appearance while providing credit information.
- **July 19, 2025**: USER GUIDANCE INSTRUCTIONS - Added helpful instruction section under generate button: displays clear guidance text "To generate an image: Add characters, position them in the 3D scene, and choose a background above", styled with subtle background and purple border to match app theme, helps new users understand the required workflow steps before generating images.
- **July 19, 2025**: LOADING MESSAGE CENTERED - Fixed loading message positioning during image generation: loading text now appears perfectly centered both horizontally and vertically within the 648px image generation block, uses absolute positioning with transform centering technique for reliable cross-browser compatibility, maintains proper text display with animated progressive dots.
- **July 18, 2025**: JAVASCRIPT FILES CONFIGURATION - Ensured all JavaScript files are properly configured for server access: created missing stage.js (copied from babylon-stage.js), app.js (copied from shot.js), and ai.js placeholder, configured TypeScript server routes for all JavaScript files with both /app/ and root path access, all Babylon.js, shot, and AI functionality now properly accessible.
- **July 17, 2025**: ITERATIVE REFINEMENT WORKFLOW - Updated refinement system to create separate visual containers for each refinement: each refine operation creates a new complete image section with loading message, image display, download button, and new refine controls, previous refine sections are disabled to maintain clear workflow progression, provides visual separation between original and refined images.
- **July 17, 2025**: DOM CREATION REFACTORING - Refactored createImageItem and createGlobalRefineSection functions to use proper DOM methods instead of innerHTML: replaced innerHTML string concatenation with createElement, appendChild, and textContent assignments, improves code maintainability and security by avoiding HTML injection risks, maintains identical functionality while following better JavaScript practices.
- **July 17, 2025**: MODAL STYLING CONSISTENCY - Refactored delete character warning modal and regenerate warning modal to use standard button styling: both modals now use app-button app-button-cancel and app-button app-button-save classes matching the add character modal, updated modal-text to modal-message class for consistent text styling, maintains visual consistency across all modal dialogs in the application.
- **July 17, 2025**: HEIGHT SLIDER PERCENTAGE DISPLAY - Updated height slider interface to show percentage values instead of metric units: slider displays 30% to 200% range with 5% increments, height display shows percentage format (e.g., "125%"), maintains same scaling functionality with proper conversion between percentage and internal scale values, cancel functionality properly restores original height percentage.
- **July 17, 2025**: POSITION GRID INTERFACE WITH CUSTOM UPLOAD - Replaced position dropdown with intuitive grid layout using visual thumbnails: users select character positions from 3x2 grid showing talking, walking, reacting, angry, sitting-talking, and custom upload options, added custom GLB/GLTF file upload support (up to 20MB) with file preview display, uploaded position files are kept in memory and loaded directly into 3D scene without permanent storage, seamlessly integrates with existing character creation workflow.
- **July 17, 2025**: IMPROVED ERROR DISPLAY IN GENERATION ZONE - Enhanced error handling to show user-friendly messages directly in the image generation area instead of floating notifications: API errors (502, 503, 504) now display styled error cards with retry buttons in the generation zone, maintains consistent visual design with purple/red color scheme, provides clear feedback about temporary service availability issues.
- **July 17, 2025**: CUSTOM BACKGROUND UPLOAD FEATURE - Added option to upload custom background images in background selection: users can now click "Upload" option to select custom background images (up to 10MB), images are kept in memory for image generation without permanent storage, uploaded images show preview in selection interface with automatic selection, seamlessly integrates with existing background selection workflow using base64 data URLs.
- **July 17, 2025**: ENHANCED API ERROR HANDLING - Fixed internal server errors by adding comprehensive error handling for Replicate API responses: detects HTML error pages (502, 503, 504) returned by API instead of JSON, provides specific user-friendly error messages for different server states, prevents JSON parsing crashes that caused generic "internal server error" messages, maintains server stability during external API issues.
- **July 17, 2025**: ADD CHARACTER BUTTON REPOSITIONED - Moved the add character button from left sidebar to overlay the top right corner of the 3D area: button now appears as a circular overlay with purple styling and hover effects, positioned strategically for easy access while viewing the 3D scene, maintains consistent visual design with other overlay elements.
- **July 17, 2025**: DYNAMIC CHARACTER CONTROLS TITLE - Updated Character Controls title to display the selected character's name: title shows user-entered name (with underscores converted to spaces) when a character is selected and reverts to "Character Controls" when no character is selected, provides better visual feedback about which character is currently being controlled, properly updates when characters are deleted.
- **July 17, 2025**: POSITION SELECTION MOVED TO MODAL - Moved character position selection from Character Controls section into Add Character Modal: users now select character position (talking, walking, reacting, angry, sitting-talking) when creating characters, removed position dropdown from character controls to simplify interface, position defaults to "talking" in modal, fixed missing position file issue by updating "sitting" to "sitting-talking" to match actual .glb file.
- **July 17, 2025**: CHARACTER CONTROLS REORGANIZATION - Moved delete character and edit height buttons from character tags into the Character Controls section: created new "Character Actions" section with height edit and delete buttons, buttons are disabled by default and enabled when a character is selected, added proper styling with purple/red gradients and hover effects, removed delete button from character tags to reduce clutter, buttons now use global selectedCharacter tracking for consistent behavior.
- **July 17, 2025**: IMAGE GENERATION INTERFACE REORGANIZATION - Created comprehensive parent section for image generation with organized subsections: moved background picker and prompt input from sidebar to main scene setup section, implemented regeneration warning modal for when users attempt to regenerate scene images (warns about losing refinements), kept image ratio selection in sidebar for consistency, removed duplicate ratio selection from main section, updated all JavaScript functions to use proper element references and aspect ratio calculations from sidebar selection.
- **July 16, 2025**: ANIMATION SYSTEM SIMPLIFIED AND OPTIMIZED - Redeveloped animation frame logic to use simple paused-by-default mechanism: animations are paused by default on character load, frame slider uses actual frame numbers, slider controls frame position within animation bounds, added throttling to prevent excessive slider updates (10ms limit for responsive control), added comprehensive error handling to prevent unhandled promise rejections, removed excessive console logging to reduce spam, simplified to single animation group approach for reliability.
- **July 16, 2025**: DOWNLOAD SYSTEM ENHANCED - Added download buttons overlaying upper-right corner of generated images with European date format filenames (shotblockr_DD-MM-YYYY_HH-MM-SS.jpg), implemented blob-based downloads triggering native browser save dialog instead of opening new tabs, added simple reset button at bottom that refreshes page to start over completely.
- **July 16, 2025**: IMAGE REFINEMENT SYSTEM COMPLETE - Implemented comprehensive image refinement workflow using Black Forest Labs flux-kontext-max API: created image history container with stacked display, added refinement interface with prompt input and refine buttons under each generated image, integrated /api/refine-image server proxy endpoint, implemented iterative editing allowing unlimited refinements while preserving image history, used proper input_image parameter for context-aware editing with aspect ratio preservation.
- **July 16, 2025**: CORS RESOLUTION AND API PROXY ARCHITECTURE - Fixed image generation CORS issues by implementing server-side proxy endpoints: created /api/generate-image and /api/replicate-status proxies to handle Replicate API calls, updated frontend to use local endpoints instead of direct external API calls, resolved beach scene reference transmission issues, added comprehensive debugging for image loading and display verification.
- **July 15, 2025**: REPLICATE API INTEGRATION - Migrated image generation from Shotblockr API to Replicate's flux-kontext-apps/multi-image-kontext-max API: sends prompt, ratio, screenshot as input_image_1, scene reference as input_image_2, output_format as jpg, safety_tolerance 2. Added server endpoint /api/replicate-token for secure token access, implemented polling mechanism for async prediction status checks.
- **July 14, 2025**: AUTOROTATE CAMERA ENHANCEMENT - Fixed autorotate to start from camera's current position: calculates current distance from center and camera angle to maintain position continuity, prevents camera jumping to fixed radius when autorotate begins, preserves current camera height during rotation.
- **July 14, 2025**: GRADIENT BACKGROUND REFINEMENT - Made dark center smaller and more focused: reduced radius from 180 to 120 pixels, adjusted color stops for better contrast with darker center appearing in front, improved gradient transitions for more professional visual appearance.
- **July 14, 2025**: LIGHTING FIX FOR MESH 4 - Fixed lighting issues on mesh 4 by reversing backface culling during character creation, simplified character color application to use consistent emissive material approach for flat appearance across all meshes, resolved talking expression file naming to match actual PNG files with dashes.
- **July 14, 2025**: HEAD ROTATION SYSTEM OVERHAUL - Updated head rotation logic to work with Mixamo skeletal animation system: replaced direct mesh rotation with proper bone rotation using character skeleton, implemented findHeadBone function to locate Mixamo head bones (supports common naming conventions like mixamorig:Head), head rotation now uses quaternion-based bone transformations for natural movement, maintained separate findHeadMesh function for expression system compatibility.
- **July 14, 2025**: TRANSPARENT PNG EXPRESSION SYSTEM - Migrated expression system to use transparent PNG files: updated all expression file paths from .jpg to .png, implemented proper diffuse texture transparency using hasAlpha property, removed complex opacity texture workarounds in favor of standard Babylon.js PNG transparency, fixed expression mesh highlighting exclusion to prevent mesh_5 from being highlighted when characters are selected.
- **July 13, 2025**: CHARACTER EXPRESSION SYSTEM OVERHAUL - Completely replaced emoji-based expression system with image-based expressions: converted expression system to use actual image files from expressions folder (neutral.jpg, smiling.jpg, angry.jpg, talking-angry.jpg, talking-neutral.jpg, talking-smiling.jpg), added /expressions/ route to server for serving expression images, fixed expressionPlane error that was breaking character creation, updated all expression functions to load and display image textures instead of generating emoji graphics.
- **July 13, 2025**: PORTRAIT SCREENSHOT FIX - Fixed portrait ratio screenshot distortion issues: updated cropping logic to properly maintain 9:16 aspect ratio without stretching, increased screenshot resolution from 800x1422 to 1080x1920 for better quality, improved center-cropping algorithm to remove black areas without distorting image proportions.
- **July 13, 2025**: ANIMATION FRAME NUMBER SYSTEM COMPLETE - Converted animation system to use actual frame numbers instead of percentages: animation frames are stored as precise frame numbers in exported scene data, import function restores character poses to exact animation frames, characters maintain their animation positions when scenes are loaded. Animation slider dynamically adjusts to each character's frame range and works with actual frame numbers.
- **July 13, 2025**: ANIMATION CONTROLS IMPLEMENTATION - Added comprehensive animation controls for GLB characters: automatically stops animations on load and sets to frame 1 to avoid T-pose, added animation slider in Character Controls panel that appears by default and enables/disables based on character selection, implemented setCharacterAnimationFrame method for precise frame control, styled animation slider with purple theme and disabled states.
- **July 11, 2025**: MAJOR CSS CONSOLIDATION COMPLETE - Implemented comprehensive color system with 12 standardized colors, consolidated 92 purple color instances to use centrally defined CSS variables (--color-purple: #8a2be2 and --color-purple-light: #764ba2), created CSS variable system for gradients, borders, shadows, and transitions. Reduced CSS redundancy by ~800-900 lines while maintaining identical visual design.
- **July 11, 2025**: ACHIEVED 100% ISO COMPLIANCE - Successfully migrated ALL inline styles from app/index.html to external CSS file, creating unified styling system across entire website. Converted 100+ inline styles to CSS classes in styles.css, maintaining all visual design and functionality while establishing clean separation between content and presentation.
- **July 11, 2025**: Moved app styles to external CSS file - migrated CSS styles from app HTML to unified styles.css, converted inline styles to CSS classes, maintained all functionality while creating consistent styling system across entire website
- **July 11, 2025**: Moved all homepage styles to external CSS file for better maintainability and cleaner HTML structure. Created `/public/styles.css` and removed all inline styles from `/public/index.html`
- **July 11, 2025**: Modified character creation workflow - new characters are automatically assigned "standing" character type, users can change character type through the character edit modal

## System Architecture

### Backend Architecture
- **Custom HTTP Server**: Built using Node.js native `http` module
- **Multi-route Serving**: Handles multiple app routes (homepage and 3D app)
- **Asset Management**: Serves 3D models, character images, and scene backgrounds
- **TypeScript ES Modules**: Modern TypeScript with ES module syntax
- **Dependencies**: tsx for TypeScript execution, node-fetch for HTTP requests

### Frontend Architecture
- **3D Scene Builder**: Advanced 3D application using Babylon.js library
- **Multiple Pages**: Landing page and dedicated 3D application interface
- **3D Assets**: Character models (GLB format), scene backgrounds, character designs
- **Interactive Controls**: Real-time 3D scene manipulation and character positioning

## Key Components

### Server Implementation (`index.ts`)
- **Multi-Route Server**: Handles homepage, 3D app, and asset serving
- **Default Redirect**: Root URL (/) redirects to 3D Scene Builder app (/app/)
- **Homepage Access**: Homepage available at /home or /index.html routes
- **Asset Route Handlers**: Specialized routes for models, characters, scenes, and images
- **CORS Support**: Cross-origin headers for 3D asset loading
- **File Type Detection**: Automatic content-type detection for various media formats

### Frontend Components
- **Landing Page** (`public/index.html`): Professional homepage for Shotblockr brand
- **3D Scene Builder** (`public/app/index.html`): Full-featured 3D application interface
- **Babylon.js Integration** (`public/app/stage.js`): Advanced 3D scene manipulation
- **Asset Collections**: Characters, poses, and environments for scene building

### Configuration
- **TypeScript Config**: Strict type checking with ES2020 target
- **Development Tools**: tsx for TypeScript execution, comprehensive compiler options

## Data Flow

1. **Request Routing**: HTTP requests are routed to appropriate handlers
2. **Asset Management**: 3D models, images, and scenes served from dedicated directories
3. **3D Scene Loading**: Babylon.js loads and renders 3D assets in real-time
4. **Character Positioning**: Interactive controls for manipulating 3D character poses
5. **Scene Generation**: Real-time 3D scene building and manipulation

## External Dependencies

### Runtime Dependencies
- **@types/node**: TypeScript definitions for Node.js
- **tsx**: TypeScript execution engine for development
- **node-fetch**: HTTP client for external API requests

### Frontend Dependencies
- **Babylon.js**: 3D graphics library for scene rendering
- **Babylon.js Loaders**: Asset loading support for 3D models
- **Babylon.js GUI**: User interface components for 3D scenes

### External Resources
- **Google Fonts**: Inter font family for typography
- **No Database**: Currently no data persistence layer
- **No API Integrations**: Self-contained application

## Deployment Strategy

### Current Setup
- **Development Server**: Custom HTTP server on port 5000
- **Multi-Directory Serving**: Assets from public, characters, positions, scenes directories
- **TypeScript ES Modules**: Modern ES module compilation with tsx

### Production Considerations
- Server runs on configurable host (default: 0.0.0.0) and port (default: 5000)
- TypeScript ES modules with modern compilation target
- Large 3D assets require optimized serving and caching
- No database required - all assets served as static files

### Key Features
- **Hot Reload Ready**: tsx enables TypeScript file watching
- **Port Flexibility**: Configurable port and host settings
- **Security Basics**: Path traversal protection implemented
- **Error Handling**: Graceful 404 and 500 error responses

The architecture balances performance with advanced 3D capabilities, providing a professional tool for film and creative industries while maintaining clean separation between server routing and client-side 3D rendering.