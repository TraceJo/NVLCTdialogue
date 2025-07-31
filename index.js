// --- index.js CONSISTENTE Y CON DEPURACIÓN ---
class NVLCTDialogueThemeHelper extends SillyTavern.Extension {
    constructor() {
        // 'super' llama al constructor base. Lo hacemos coincidir con el nombre de la carpeta.
        super('nvlct-dialogue-helper'); 
        
        // Metadatos que se mostrarán en la UI de extensiones
        this.name = 'NVLCT Dialogue Theme Helper'; // Coincide con el manifest
        this.description = 'Ayudante dinámico para el tema Requiem/NVLCT. Aplica el avatar del personaje a los mensajes.';
    }

    onNewMessage(message) {
        console.log('[Theme Helper] Procesando nuevo mensaje:', message);
        
        // RECUERDA: Si sigue sin funcionar, el problema es este selector.
        // Usa F12 -> Inspeccionar para encontrar el ID o clase correctos.
        const selector = '#char-img img'; 
        const charAvatarElement = document.querySelector(selector);
        
        if (!charAvatarElement) {
            console.error(`[Theme Helper] ¡FALLO! No se encontró ningún elemento con el selector: "${selector}".`);
            return;
        }

        const charAvatarUrl = charAvatarElement.src;

        if (!charAvatarUrl) {
            console.warn('[Theme Helper] Se encontró el elemento, pero no tiene una URL (atributo src).');
            return;
        }
        
        const isCharMessage = message.getAttribute('is_user') === 'false';

        if (isCharMessage) {
            message.style.setProperty('--dynamic-char-avatar', `url("${charAvatarUrl}")`);
            console.log('[Theme Helper] ¡ÉXITO! Variable de CSS aplicada al mensaje.');
        }
    }

    onReady() {
        console.log('[Theme Helper] Extensión activa y lista.');
        
        document.querySelectorAll('#chat .mes').forEach(message => {
            this.onNewMessage(message);
        });
    }
}

// Finalmente, registramos la extensión
SillyTavern.registerExtension(new NVLCTDialogueThemeHelper());
