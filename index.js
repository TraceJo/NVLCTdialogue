// --- index.js FINAL Y CORRECTO ---
class NVLCTDialogueThemeHelper extends SillyTavern.Extension {
    constructor() {
        super('nvlct-dialogue-helper'); 
        this.name = 'NVLCT Dialogue Theme Helper';
        this.description = 'Ayudante dinámico para el tema Requiem/NVLCT. Aplica el avatar del personaje a los mensajes.';
    }

    onNewMessage(message) {
        // Solo nos interesan los mensajes del personaje.
        const isCharMessage = message.getAttribute('is_user') === 'false';
        if (!isCharMessage) {
            return; // Si es un mensaje de usuario, no hacemos nada.
        }

        // --- ESTA ES LA LÍNEA CLAVE ---
        // Buscamos la imagen del avatar DENTRO del mensaje que se acaba de crear.
        const avatarImg = message.querySelector('.avatar img');

        // Si no encontramos la imagen por alguna razón, salimos para evitar errores.
        if (!avatarImg) {
            return;
        }

        // Obtenemos la URL de la imagen que encontramos.
        const avatarUrl = avatarImg.src;

        // Si la URL existe, la aplicamos a nuestra variable CSS para este mensaje.
        if (avatarUrl) {
            message.style.setProperty('--dynamic-char-avatar', `url("${avatarUrl}")`);
        }
    }

    onReady() {
        console.log('[Theme Helper] Extensión activa y lista.');
        
        // Ejecutamos la lógica para todos los mensajes que ya están en el chat al cargar.
        document.querySelectorAll('#chat .mes').forEach(message => {
            this.onNewMessage(message);
        });
    }
}

// Registramos la extensión.
SillyTavern.registerExtension(new NVLCTDialogueThemeHelper());
