// Define una clase para nuestra extensión, siguiendo el formato de SillyTavern
class RequiemThemeHelper extends SillyTavern.Extension {
    constructor() {
        // 'super' llama al constructor de la clase base de SillyTavern
        // El nombre debe ser único
        super('requiem-theme-helper'); 
        
        // Metadatos que se mostrarán en la UI de extensiones
        this.name = 'Requiem Theme Helper';
        this.description = 'Ayudante dinámico para el tema Requiem. Aplica el avatar del personaje a los mensajes.';
    }

    /**
     * Esta es la función principal. SillyTavern la llama automáticamente
     * cada vez que se renderiza un nuevo mensaje en el chat.
     * @param {HTMLElement} message - El elemento HTML del mensaje que se acaba de añadir (un div con la clase .mes)
     */
    onNewMessage(message) {
        // 1. Busca la imagen principal del avatar del personaje en la UI.
        // Su selector suele ser '#char-img img'. El '?' previene errores si no la encuentra.
        const charAvatarElement = document.querySelector('#char-img img');
        
        // 2. Si no encontramos el elemento del avatar, no hacemos nada.
        if (!charAvatarElement) {
            console.warn('RequiemThemeHelper: No se pudo encontrar el avatar principal del personaje (#char-img img).');
            return;
        }

        // 3. Obtenemos la URL de la imagen de su atributo 'src'.
        const charAvatarUrl = charAvatarElement.src;

        // 4. Identificamos si el nuevo mensaje es del personaje (no del usuario).
        const isCharMessage = message.getAttribute('is_user') === 'false';

        // 5. Si es un mensaje del personaje y tenemos la URL, la aplicamos.
        if (isCharMessage && charAvatarUrl) {
            // ¡Esta es la magia! Inyectamos la URL en una variable de CSS
            // (--dynamic-char-avatar) directamente en el estilo de este mensaje específico.
            message.style.setProperty('--dynamic-char-avatar', `url("${charAvatarUrl}")`);
        }
    }

    /**
     * SillyTavern llama a esta función cuando la extensión se carga.
     * La usamos para procesar los mensajes que ya estaban en el chat al cargar la página.
     */
    onReady() {
        console.log('Requiem Theme Helper está activo.');
        
        // Buscamos todos los mensajes que ya existen en el chat y les aplicamos la lógica.
        document.querySelectorAll('#chat .mes').forEach(message => {
            this.onNewMessage(message);
        });
    }
}

// Finalmente, registramos nuestra nueva clase de extensión con SillyTavern
SillyTavern.registerExtension(new RequiemThemeHelper());