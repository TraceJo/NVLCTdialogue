
(function() {
    'use strict';

    // Variables globales para almacenar avatares
    let currentCharacterAvatar = '';
    let currentUserAvatar = '';

    // Función para obtener la URL del avatar del personaje actual
    function getCurrentCharacterAvatar() {
        try {
            // Verificar si existe un personaje seleccionado
            if (typeof window.this_chid === 'undefined' || window.this_chid === null) {
                return '';
            }

            // Método 1: Buscar en el DOM el avatar visible
            const avatarImg = document.querySelector('.avatar.main-avatar');
            if (avatarImg && avatarImg.src && avatarImg.src !== 'undefined' && !avatarImg.src.includes('thumbnail')) {
                return `url("${avatarImg.src}")`;
            }

            // Método 2: Buscar en el contenedor de mensajes
            const charAvatar = document.querySelector('.mesAvatarWrapper .avatar img');
            if (charAvatar && charAvatar.src && charAvatar.src !== 'undefined' && !charAvatar.src.includes('thumbnail')) {
                return `url("${charAvatar.src}")`;
            }

            // Método 3: Buscar cualquier imagen de avatar de personaje válida
            const anyCharAvatar = document.querySelector('.ch_img img, img[src*="characters/"]');
            if (anyCharAvatar && anyCharAvatar.src && anyCharAvatar.src !== 'undefined' && !anyCharAvatar.src.includes('thumbnail')) {
                return `url("${anyCharAvatar.src}")`;
            }

            // Método 4: Usar la API de ST si está disponible
            if (window.characters && window.characters[window.this_chid] && window.characters[window.this_chid].avatar) {
                const avatarPath = window.characters[window.this_chid].avatar;
                if (avatarPath && !avatarPath.includes('thumbnail') && !avatarPath.includes('user-default')) {
                    return `url("characters/${avatarPath}")`;
                }
            }

            return '';
        } catch (error) {
            console.warn('Error obteniendo avatar del personaje:', error);
            return '';
        }
    }

    // Función para obtener la URL del avatar del usuario
    function getCurrentUserAvatar() {
        try {
            // Método 1: Buscar imagen de usuario en el DOM
            const userAvatarImg = document.querySelector('img[src*="User Avatars"]:not([src*="thumbnail"]):not([src*="user-default"])');
            if (userAvatarImg && userAvatarImg.src && userAvatarImg.src !== 'undefined') {
                return `url("${userAvatarImg.src}")`;
            }

            // Método 2: Usar la configuración si está disponible
            if (window.power_user && window.power_user.user_avatar && 
                !window.power_user.user_avatar.includes('thumbnail') && 
                !window.power_user.user_avatar.includes('user-default')) {
                return `url("User Avatars/${window.power_user.user_avatar}")`;
            }

            // Método 3: Buscar cualquier avatar de usuario válido
            const anyUserAvatar = document.querySelector('img[src*="/User Avatars/"]:not([src*="thumbnail"]):not([src*="user-default"])');
            if (anyUserAvatar && anyUserAvatar.src && anyUserAvatar.src !== 'undefined') {
                return `url("${anyUserAvatar.src}")`;
            }

            return '';
        } catch (error) {
            console.warn('Error obteniendo avatar del usuario:', error);
            return '';
        }
    }

    // Función para inyectar las variables CSS
    function injectAvatarVariables() {
        const charAvatar = getCurrentCharacterAvatar();
        const userAvatar = getCurrentUserAvatar();

        // Solo actualizar si hay cambios
        if (charAvatar !== currentCharacterAvatar || userAvatar !== currentUserAvatar) {
            currentCharacterAvatar = charAvatar;
            currentUserAvatar = userAvatar;

            // Inyectar las variables CSS en el documento
            const root = document.documentElement;
            
            if (charAvatar) {
                root.style.setProperty('--dynamic-char-avatar', charAvatar);
            }
            
            if (userAvatar) {
                root.style.setProperty('--dynamic-user-avatar', userAvatar);
            }

            console.log('Avatares actualizados:', {
                character: charAvatar,
                user: userAvatar
            });
        }
    }

    // Función para observar cambios en el chat
    function observeChatChanges() {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) {
            setTimeout(observeChatChanges, 500);
            return;
        }

        // Observer para detectar nuevos mensajes
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            try {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        // Verificar si se agregaron nuevos mensajes
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE && 
                                (node.classList?.contains('mes') || node.querySelector?.('.mes'))) {
                                shouldUpdate = true;
                            }
                        });
                    }
                });

                if (shouldUpdate) {
                    // Usar un timeout más largo para evitar conflictos
                    setTimeout(injectAvatarVariables, 300);
                }
            } catch (error) {
                console.warn('Error en observer de chat:', error);
            }
        });

        observer.observe(chatContainer, {
            childList: true,
            subtree: true
        });

        console.log('Observer de chat iniciado');
    }

    // Función para observar cambios de personaje
    function observeCharacterChanges() {
        // Observer para cambios en el selector de personajes
        const characterSelect = document.getElementById('rm_button_selected_ch');
        if (characterSelect) {
            const observer = new MutationObserver(function() {
                setTimeout(injectAvatarVariables, 200);
            });
            
            observer.observe(characterSelect, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        // También observar cambios en el avatar principal
        const avatarContainer = document.querySelector('.mesAvatarWrapper');
        if (avatarContainer) {
            const observer = new MutationObserver(function() {
                setTimeout(injectAvatarVariables, 100);
            });
            
            observer.observe(avatarContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src']
            });
        }
    }

    // Función de inicialización
    function initialize() {
        console.log('Inicializando Avatar Dynamic Injector...');
        
        // Esperar a que SillyTavern esté completamente cargado
        const waitForST = function() {
            if (typeof window.eventSource !== 'undefined' || document.querySelector('#chat')) {
                // Inyectar avatares iniciales con más tiempo
                setTimeout(injectAvatarVariables, 2000);
                
                // Configurar observers
                setTimeout(observeChatChanges, 1000);
                setTimeout(observeCharacterChanges, 1000);
                
                // Actualizar avatares periódicamente como respaldo
                setInterval(injectAvatarVariables, 10000);
                
                // Escuchar eventos específicos de SillyTavern con timeouts más largos
                document.addEventListener('characterSelected', function() {
                    setTimeout(injectAvatarVariables, 800);
                });
                
                document.addEventListener('chatLoaded', function() {
                    setTimeout(injectAvatarVariables, 1000);
                });

                // Eventos adicionales
                window.addEventListener('beforeunload', function() {
                    // Limpiar en caso de recarga
                });

                console.log('Avatar Dynamic Injector inicializado correctamente');
            } else {
                setTimeout(waitForST, 500);
            }
        };
        
        waitForST();
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Exponer funciones globalmente para debugging
    window.avatarDynamicInjector = {
        injectAvatarVariables,
        getCurrentCharacterAvatar,
        getCurrentUserAvatar,
        currentCharacterAvatar: () => currentCharacterAvatar,
        currentUserAvatar: () => currentUserAvatar
    };

})();
