
(function() {
    'use strict';

    // Variables globales para almacenar avatares
    let currentCharacterAvatar = '';
    let currentUserAvatar = '';

    // Función para convertir URL de thumbnail a URL completa
    function convertThumbnailToFullUrl(thumbnailUrl) {
        if (!thumbnailUrl) {
            return '';
        }

        // Si ya es una URL completa, devolverla
        if (thumbnailUrl.startsWith('http') || !thumbnailUrl.includes('/thumbnail?')) {
            return thumbnailUrl;
        }

        try {
            // Parsear la URL de thumbnail
            const urlParts = thumbnailUrl.split('?')[1];
            const params = new URLSearchParams(urlParts);
            const type = params.get('type');
            const file = params.get('file');

            console.log('Detectado avatar:', { type, file, originalUrl: thumbnailUrl });

            if (!type || !file) {
                return thumbnailUrl;
            }

            // Convertir según el tipo
            if (type === 'avatar') {
                // Avatar de personaje - usar la ruta directa
                const fullUrl = `/characters/${file}`;
                console.log('Avatar de personaje convertido:', fullUrl);
                return fullUrl;
            } else if (type === 'persona') {
                // Avatar de usuario/persona
                if (file === 'user-default.png') {
                    console.log('Avatar de usuario por defecto ignorado');
                    return ''; // No usar el avatar por defecto
                }
                const fullUrl = `/User Avatars/${file}`;
                console.log('Avatar de usuario convertido:', fullUrl);
                return fullUrl;
            }

            return thumbnailUrl;
        } catch (error) {
            console.warn('Error convirtiendo URL de thumbnail:', error, thumbnailUrl);
            return thumbnailUrl;
        }
    }

    // Función para obtener la URL del avatar del personaje actual
    function getCurrentCharacterAvatar() {
        try {
            console.log('Buscando avatar de personaje...');
            
            // Método 1: Buscar específicamente avatares con type=avatar
            const avatarImages = document.querySelectorAll('img[src*="type=avatar"]');
            console.log('Encontradas imágenes de avatar:', avatarImages.length);
            
            for (let img of avatarImages) {
                if (img && img.src && img.src.includes('type=avatar')) {
                    const fullUrl = convertThumbnailToFullUrl(img.src);
                    console.log('Procesando avatar:', img.src, '->', fullUrl);
                    if (fullUrl && fullUrl !== '' && !fullUrl.includes('user-default')) {
                        console.log('Avatar de personaje encontrado:', fullUrl);
                        return `url("${fullUrl}")`;
                    }
                }
            }

            // Método 2: Buscar en mensajes del personaje más recientes
            const charMessages = document.querySelectorAll('.mes[is_user="false"] .mesAvatarWrapper .avatar img');
            console.log('Mensajes de personaje encontrados:', charMessages.length);
            
            for (let i = charMessages.length - 1; i >= 0; i--) {
                const img = charMessages[i];
                if (img && img.src) {
                    console.log('Revisando mensaje de personaje:', img.src);
                    const fullUrl = convertThumbnailToFullUrl(img.src);
                    if (fullUrl && fullUrl !== '' && !fullUrl.includes('user-default')) {
                        console.log('Avatar de personaje desde mensaje:', fullUrl);
                        return `url("${fullUrl}")`;
                    }
                }
            }

            // Método 3: Usar la API de ST si está disponible
            if (window.characters && window.this_chid !== undefined && window.characters[window.this_chid] && window.characters[window.this_chid].avatar) {
                const avatarPath = window.characters[window.this_chid].avatar;
                console.log('Avatar desde API de ST:', avatarPath);
                if (avatarPath && !avatarPath.includes('user-default')) {
                    const fullUrl = `/characters/${avatarPath}`;
                    console.log('Avatar desde API convertido:', fullUrl);
                    return `url("${fullUrl}")`;
                }
            }

            console.log('No se encontró avatar de personaje');
            return '';
        } catch (error) {
            console.warn('Error obteniendo avatar del personaje:', error);
            return '';
        }
    }

    // Función para obtener la URL del avatar del usuario
    function getCurrentUserAvatar() {
        try {
            console.log('Buscando avatar de usuario...');
            
            // Método 1: Buscar específicamente avatares con type=persona
            const personaImages = document.querySelectorAll('img[src*="type=persona"]');
            console.log('Encontradas imágenes de persona:', personaImages.length);
            
            for (let img of personaImages) {
                if (img && img.src && img.src.includes('type=persona')) {
                    const fullUrl = convertThumbnailToFullUrl(img.src);
                    console.log('Procesando persona:', img.src, '->', fullUrl);
                    if (fullUrl && fullUrl !== '' && !fullUrl.includes('user-default')) {
                        console.log('Avatar de usuario encontrado:', fullUrl);
                        return `url("${fullUrl}")`;
                    }
                }
            }

            // Método 2: Buscar en mensajes del usuario más recientes
            const userMessages = document.querySelectorAll('.mes[is_user="true"] .mesAvatarWrapper .avatar img');
            console.log('Mensajes de usuario encontrados:', userMessages.length);
            
            for (let i = userMessages.length - 1; i >= 0; i--) {
                const img = userMessages[i];
                if (img && img.src) {
                    console.log('Revisando mensaje de usuario:', img.src);
                    const fullUrl = convertThumbnailToFullUrl(img.src);
                    if (fullUrl && fullUrl !== '' && !fullUrl.includes('user-default')) {
                        console.log('Avatar de usuario desde mensaje:', fullUrl);
                        return `url("${fullUrl}")`;
                    }
                }
            }

            // Método 3: Usar la configuración si está disponible
            if (window.power_user && window.power_user.user_avatar && 
                !window.power_user.user_avatar.includes('user-default')) {
                const fullUrl = `/User Avatars/${window.power_user.user_avatar}`;
                console.log('Avatar de usuario desde configuración:', fullUrl);
                return `url("${fullUrl}")`;
            }

            console.log('No se encontró avatar de usuario');
            return '';
        } catch (error) {
            console.warn('Error obteniendo avatar del usuario:', error);
            return '';
        }
    }

    // Función para inyectar las variables CSS
    function injectAvatarVariables() {
        console.log('=== Iniciando actualización de avatares ===');
        
        const charAvatar = getCurrentCharacterAvatar();
        const userAvatar = getCurrentUserAvatar();

        console.log('Avatares obtenidos:', {
            character: charAvatar,
            user: userAvatar,
            previousCharacter: currentCharacterAvatar,
            previousUser: currentUserAvatar
        });

        // Siempre inyectar las variables, aunque sean vacías
        const root = document.documentElement;
        
        // Actualizar avatar de personaje
        if (charAvatar !== currentCharacterAvatar) {
            currentCharacterAvatar = charAvatar;
            if (charAvatar) {
                root.style.setProperty('--dynamic-char-avatar', charAvatar);
                console.log('✅ Avatar de personaje actualizado:', charAvatar);
            } else {
                root.style.removeProperty('--dynamic-char-avatar');
                console.log('❌ Avatar de personaje removido');
            }
        }
        
        // Actualizar avatar de usuario
        if (userAvatar !== currentUserAvatar) {
            currentUserAvatar = userAvatar;
            if (userAvatar) {
                root.style.setProperty('--dynamic-user-avatar', userAvatar);
                console.log('✅ Avatar de usuario actualizado:', userAvatar);
            } else {
                root.style.removeProperty('--dynamic-user-avatar');
                console.log('❌ Avatar de usuario removido');
            }
        }

        // Verificar las variables inyectadas
        const injectedCharAvatar = getComputedStyle(root).getPropertyValue('--dynamic-char-avatar').trim();
        const injectedUserAvatar = getComputedStyle(root).getPropertyValue('--dynamic-user-avatar').trim();
        
        console.log('Variables CSS verificadas:', {
            '--dynamic-char-avatar': injectedCharAvatar,
            '--dynamic-user-avatar': injectedUserAvatar
        });
        
        console.log('=== Fin actualización de avatares ===');
    }

    // Función para observar cambios en el chat
    function observeChatChanges() {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) {
            setTimeout(observeChatChanges, 500);
            return;
        }

        // Observer para detectar nuevos mensajes y cambios en avatares
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
                    
                    // Detectar cambios en atributos de imágenes (especialmente src)
                    if (mutation.type === 'attributes' && 
                        mutation.attributeName === 'src' && 
                        mutation.target.tagName === 'IMG' &&
                        mutation.target.closest('.mesAvatarWrapper')) {
                        shouldUpdate = true;
                    }
                });

                if (shouldUpdate) {
                    // Usar un timeout más largo para evitar conflictos
                    setTimeout(injectAvatarVariables, 500);
                }
            } catch (error) {
                console.warn('Error en observer de chat:', error);
            }
        });

        observer.observe(chatContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
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
