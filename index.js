// --- index.js MEJORADO CON DEPURACIÓN ---
class RequiemThemeHelper extends SillyTavern.Extension {
    constructor() {
        super('requiem-theme-helper'); 
        this.name = 'Requiem Theme Helper';
        this.description = 'Ayudante dinámico para el tema Requiem. Aplica el avatar del personaje a los mensajes.';
    }

    onNewMessage(message) {
        // --- INICIO DE LA DEPURACIÓN ---
        console.log('[Requiem Helper] Procesando nuevo mensaje:', message);

        // La línea más importante y la más probable de fallar.
        const selector = '#char-img img';
        const charAvatarElement = document.querySelector(selector);
        
        // Verifiquemos si encontramos el elemento
        if (!charAvatarElement) {
            // Si ves este mensaje, significa que el selector es INCORRECTO.
            console.error(`[Requiem Helper] ¡FALLO! No se encontró ningún elemento con el selector: "${selector}". Ve al Paso 2 de la guía.`);
            return;
        }

        console.log('[Requiem Helper] Elemento de avatar encontrado:', charAvatarElement);
        // --- FIN DE LA DEPURACIÓN ---

        const charAvatarUrl = charAvatarElement.src;

        // Verifiquemos si obtuvimos una URL
        if (!charAvatarUrl) {
            console.warn('[Requiem Helper] Se encontró el elemento, pero no tiene una URL (atributo src).');
            return;
        }
        
        console.log('[Requiem Helper] URL del avatar obtenida:', charAvatarUrl);

        const isCharMessage = message.getAttribute('is_user') === 'false';

        if (isCharMessage) {
            message.style.setProperty('--dynamic-char-avatar', `url("${charAvatarUrl}")`);
            console.log('[Requiem Helper] ¡ÉXITO! Variable de CSS aplicada al mensaje.');
        }
    }

    onReady() {
        console.log('[Requiem Helper] Extensión activa y lista.');
        
        document.querySelectorAll('#chat .mes').forEach(message => {
            this.onNewMessage(message);
        });
    }
}

SillyTavern.registerExtension(new RequiemThemeHelper());
