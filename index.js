
// Avatar Dynamic Sync for SillyTavern
// Auto-updates avatar images in chat quotes without manual configuration

(function() {
    'use strict';
    
    let currentCharacterAvatar = null;
    let lastCharacterName = null;
    
    // Function to get current character avatar URL
    function getCurrentCharacterAvatar() {
        // Try multiple methods to get the current character avatar
        
        // Method 1: Check if there's an active character avatar element
        const avatarImg = document.querySelector('.avatar:not(.main-avatar)');
        if (avatarImg && avatarImg.src && !avatarImg.src.includes('placeholder')) {
            return avatarImg.src;
        }
        
        // Method 2: Check character card avatar
        const characterAvatar = document.querySelector('.character-avatar img');
        if (characterAvatar && characterAvatar.src) {
            return characterAvatar.src;
        }
        
        // Method 3: Look for character name and construct avatar URL
        const charNameElement = document.querySelector('.ch_name');
        if (charNameElement) {
            const charName = charNameElement.textContent.trim();
            if (charName && charName !== lastCharacterName) {
                lastCharacterName = charName;
                // Construct avatar URL based on character name
                return `/thumbnail?type=avatar&file=${encodeURIComponent(charName)}.png`;
            }
        }
        
        // Method 4: Check CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        const cssAvatar = rootStyles.getPropertyValue('--char-avatar-image');
        if (cssAvatar && cssAvatar.includes('url(')) {
            return cssAvatar.replace(/url\(['"]?([^'"]*)['"]?\)/, '$1');
        }
        
        return null;
    }
    
    // Function to update CSS variable with current avatar
    function updateAvatarVariable() {
        const newAvatar = getCurrentCharacterAvatar();
        
        if (newAvatar && newAvatar !== currentCharacterAvatar) {
            currentCharacterAvatar = newAvatar;
            
            // Update CSS custom property for dynamic avatar
            document.documentElement.style.setProperty('--dynamic-avatar', `url("${newAvatar}")`);
            
            console.log('Avatar updated:', newAvatar);
        }
    }
    
    // Mutation observer to detect DOM changes
    function setupMutationObserver() {
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            mutations.forEach(function(mutation) {
                // Check if any avatar-related elements changed
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const hasAvatarChanges = addedNodes.some(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            return node.classList.contains('mes') || 
                                   node.classList.contains('avatar') ||
                                   node.querySelector && (
                                       node.querySelector('.avatar') || 
                                       node.querySelector('.ch_name') ||
                                       node.querySelector('.mesAvatarWrapper')
                                   );
                        }
                        return false;
                    });
                    
                    if (hasAvatarChanges) {
                        shouldUpdate = true;
                    }
                }
                
                // Check for attribute changes that might affect avatars
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'src' || 
                     mutation.attributeName === 'style' ||
                     mutation.attributeName === 'class')) {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                // Slight delay to allow DOM to settle
                setTimeout(updateAvatarVariable, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'style', 'class']
        });
        
        return observer;
    }
    
    // Initialize the system
    function initialize() {
        console.log('Initializing dynamic avatar sync...');
        
        // Initial avatar detection
        updateAvatarVariable();
        
        // Set up mutation observer
        setupMutationObserver();
        
        // Periodic check as fallback
        setInterval(updateAvatarVariable, 2000);
        
        // Event listeners for common SillyTavern events
        document.addEventListener('DOMContentLoaded', updateAvatarVariable);
        window.addEventListener('load', updateAvatarVariable);
        
        // Custom event listener for character changes (if SillyTavern provides them)
        document.addEventListener('character_selected', updateAvatarVariable);
        document.addEventListener('character_changed', updateAvatarVariable);
        
        console.log('Dynamic avatar sync initialized');
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
