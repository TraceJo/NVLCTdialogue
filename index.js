export default function() {
    return {
        init: function() {
            console.info('[Requiem Theme] Extension initialized');
        },
        
        onChatEvent: async function(event, message, isUser, chatId) {
            try {
                if (event === 'messageAdded' || event === 'messageUpdated') {
                    await this.setDynamicAvatar(message, isUser);
                }
            } catch (error) {
                console.error('[Requiem Theme] Chat Event Error:', error);
            }
        },
        
        onRenderChat: async function() {
            try {
                document.querySelectorAll('.mes').forEach(messageElement => {
                    if (messageElement.hasAttribute('is_user')) return;
                    
                    const messageId = messageElement.id.replace('mes-', '');
                    const message = getContext().chat.find(m => m.id === messageId);
                    
                    if (message) {
                        this.setDynamicAvatar(message, false, messageElement);
                    }
                });
            } catch (error) {
                console.error('[Requiem Theme] Render Error:', error);
            }
        },
        
        setDynamicAvatar: async function(message, isUser, element = null) {
            if (isUser) return;
            
            const messageElement = element || document.getElementById(`mes-${message.id}`);
            if (!messageElement) return;
            
            try {
                const context = getContext();
                const character = context.groupId 
                    ? context.characters.find(c => c.id === message.charId)
                    : context.character;
                
                if (character?.avatar) {
                    const avatarUrl = await this.getOptimizedAvatar(character.avatar);
                    messageElement.style.setProperty(
                        '--dynamic-char-avatar', 
                        `url('${avatarUrl}')`
                    );
                }
            } catch (error) {
                console.error('[Requiem Theme] Avatar Error:', error);
            }
        },
        
        getOptimizedAvatar: function(avatarUrl) {
            return new Promise((resolve) => {
                if (!avatarUrl) return resolve('');
                
                // Para avatares locales (file://)
                if (avatarUrl.startsWith('file://')) {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = 80;
                            canvas.height = 80;
                            
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, 80, 80);
                            
                            resolve(canvas.toDataURL('image/webp', 0.85));
                        } catch {
                            resolve(avatarUrl);
                        }
                    };
                    
                    img.onerror = () => resolve(avatarUrl);
                    img.src = avatarUrl;
                } else {
                    // Para URLs remotas
                    resolve(avatarUrl);
                }
            });
        }
    };
}
