(function() {
    'use strict';

    console.log('🚀 Avatar Dynamic Injector iniciado - Nuevo enfoque directo');

    // Función para aplicar avatares directamente a los elementos q
    function applyAvatarsToQuotes() {
        console.log('=== Aplicando avatares a quotes ===');

        try {
            // Obtener todos los elementos q
            const quotes = document.querySelectorAll('.mes q');
            console.log(`Encontrados ${quotes.length} elementos q`);

            quotes.forEach((quote, index) => {
                const mesContainer = quote.closest('.mes');
                if (!mesContainer) {
                    console.log(`Quote ${index}: No se encontró contenedor .mes`);
                    return;
                }

                const isUser = mesContainer.getAttribute('is_user') === 'true';
                console.log(`Quote ${index}: ${isUser ? 'Usuario' : 'Personaje'}`);

                // Buscar la imagen de avatar en el mismo mensaje
                const avatarImg = mesContainer.querySelector('.mesAvatarWrapper .avatar img');

                if (avatarImg && avatarImg.src) {
                    console.log(`Quote ${index}: Avatar encontrado - ${avatarImg.src}`);

                    // Aplicar la imagen directamente al pseudo-elemento via CSS personalizado
                    if (isUser) {
                        quote.style.setProperty('--user-quote-avatar', `url("${avatarImg.src}")`);
                        quote.classList.add('has-user-avatar');
                    } else {
                        quote.style.setProperty('--char-quote-avatar', `url("${avatarImg.src}")`);
                        quote.classList.add('has-char-avatar');
                    }

                    console.log(`✅ Quote ${index}: Avatar aplicado`);
                } else {
                    console.log(`❌ Quote ${index}: No se encontró avatar`);
                }
            });

        } catch (error) {
            console.error('Error aplicando avatares:', error);
        }

        console.log('=== Fin aplicación de avatares ===');
    }

    // Función para observar cambios en el chat
    function observeChat() {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) {
            console.log('Chat no encontrado, reintentando...');
            setTimeout(observeChat, 500);
            return;
        }

        console.log('📡 Iniciando observer del chat');

        const observer = new MutationObserver(function(mutations) {
            let needsUpdate = false;

            mutations.forEach(function(mutation) {
                // Nuevos mensajes añadidos
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList?.contains('mes') || node.querySelector?.('.mes')) {
                                console.log('📥 Nuevo mensaje detectado');
                                needsUpdate = true;
                            }
                        }
                    });
                }

                // Cambios en src de imágenes
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'src' && 
                    mutation.target.tagName === 'IMG') {
                    console.log('🖼️ Cambio en imagen detectado');
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                setTimeout(applyAvatarsToQuotes, 300);
            }
        });

        observer.observe(chatContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
        });
    }

    // Función de inicialización
    function initialize() {
        console.log('🔧 Inicializando extensión...');

        const waitForChat = function() {
            const chat = document.getElementById('chat');
            if (chat && chat.children.length > 0) {
                console.log('✅ Chat detectado, aplicando avatares iniciales');

                // Aplicar avatares iniciales
                setTimeout(applyAvatarsToQuotes, 1000);

                // Iniciar observer
                observeChat();

                // Aplicar periódicamente como respaldo
                setInterval(applyAvatarsToQuotes, 5000);

                console.log('🎉 Extensión inicializada correctamente');
            } else {
                setTimeout(waitForChat, 500);
            }
        };

        waitForChat();
    }

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Funciones de debugging
    window.avatarDynamicInjector = {
        applyAvatarsToQuotes,
        forceUpdate: () => {
            console.log('🔄 Forzando actualización...');
            applyAvatarsToQuotes();
        }
    };

})();
