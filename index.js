// --- index.js MODO DEPURACIÓN TOTAL ---
class NVLCTDialogueThemeHelper extends SillyTavern.Extension {
    constructor() {
        super('nvlct-dialogue-helper'); 
        this.name = 'NVLCT Dialogue Theme Helper (Debug Mode)';
        this.description = 'Ayudante dinámico para el tema Requiem/NVLCT.';
    }

    // Definimos la lógica principal en una función separada
    processMessage(message) {
        console.log('[Theme Helper] ------------------------------');
        console.log('[Theme Helper] 1. Ejecutando processMessage en:', message);

        const isCharMessage = message.getAttribute('is_user') === 'false';
        if (!isCharMessage) {
            console.log('[Theme Helper] 2. Es un mensaje de usuario. Ignorando.');
            return;
        }

        console.log('[Theme Helper] 2. Es un mensaje de personaje. Procediendo.');

        const selector = '.avatar img';
        console.log(`[Theme Helper] 3. Buscando elemento con el selector local: "${selector}"`);

        const avatarImg = message.querySelector(selector);

        // Esta es la prueba más importante.
        if (!avatarImg) {
            console.error(`[Theme Helper] 4. ¡FALLO! No se encontró la imagen DENTRO del mensaje.`);
            // Vamos a mostrar el contenido del mensaje para ver por qué no la encuentra.
            console.log('[Theme Helper] Contenido del HTML del mensaje en el momento del fallo:', message.innerHTML);
            return;
        }

        console.log('[Theme Helper] 4. ¡ÉXITO! Se encontró el elemento de la imagen:', avatarImg);
        
        const avatarUrl = avatarImg.src;

        if (!avatarUrl) {
            console.warn('[Theme Helper] 5. Se encontró la imagen, pero su "src" (la URL) está vacía.');
            return;
        }

        console.log(`[Theme Helper] 5. URL encontrada: ${avatarUrl}`);

        message.style.setProperty('--dynamic-char-avatar', `url("${avatarUrl}")`);
        console.log('[Theme Helper] 6. ¡TERMINADO! Variable de CSS aplicada con éxito.');
    }

    // onNewMessage ahora actúa como un disparador
    onNewMessage(message) {
        // --- TÉCNICA DE DEPURACIÓN PARA PROBLEMAS DE TIEMPO ---
        // Esperamos 100 milisegundos antes de ejecutar la lógica.
        // Esto le da a SillyTavern tiempo de sobra para "dibujar" el contenido del mensaje.
        // Si esto soluciona el problema, la causa era 100% un problema de tiempo.
        setTimeout(() => {
            this.processMessage(message);
        }, 100);
    }

    onReady() {
        console.log('[Theme Helper] Extensión en modo depuración está activa y lista.');
        
        document.querySelectorAll('#chat .mes').forEach(message => {
            this.onNewMessage(message);
        });
    }
}

SillyTavern.registerExtension(new NVLCTDialogueThemeHelper());
