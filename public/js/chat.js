document.addEventListener('DOMContentLoaded', () => {
    const chatBtn = document.getElementById('aiChatBtn');
    const chatWindow = document.getElementById('aiChatWindow');
    const chatCloseBtn = document.getElementById('aiChatCloseBtn');
    const chatForm = document.getElementById('aiChatForm');
    const chatInput = document.getElementById('aiChatInput');
    const chatBody = document.getElementById('aiChatBody');

    let chatHistory = [];
    try {
        const saved = localStorage.getItem('neuraChatHistory');
        if (saved) {
            chatHistory = JSON.parse(saved);
            const defaultGreeting = document.getElementById('aiDefaultGreeting');
            if (defaultGreeting) defaultGreeting.style.display = 'none';
            chatHistory.forEach(msg => {
                addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot', {}, true);
            });
        }
    } catch(e) {}

    if (!chatBtn || !chatWindow) return;

    // Toggle Chat Window
    chatBtn.addEventListener('click', () => {
        chatWindow.classList.add('open');
        setTimeout(() => chatInput.focus(), 300);
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    // Helper: Add message to DOM
    function addMessage(text, sender, products = {}, skipScroll = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${sender}`;
        
        if (sender === 'bot') {
            // Escape HTML first to prevent LLM tags from breaking the bubble
            let htmlText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            // Replace [PRODUCT:id] with rich HTML cards
            htmlText = htmlText.replace(/\[PRODUCT:([a-zA-Z0-9]+)\]/g, (match, pid) => {
                const p = products[pid];
                if (!p) return ''; // If product wasn't found in DB, just remove the tag
                
                return `
                    <a href="/product/${p._id}" class="ai-chat-product-card">
                        <img src="${p.image}" class="ai-chat-product-img" alt="${p.title}">
                        <div class="ai-chat-product-info">
                            <div class="ai-chat-product-title">${p.title}</div>
                            <div class="ai-chat-product-price">₹${p.price.toLocaleString()}</div>
                        </div>
                    </a>
                `;
            });
            // Convert simple newlines to <br>
            htmlText = htmlText.replace(/\n/g, '<br>');
            msgDiv.innerHTML = htmlText;
        } else {
            msgDiv.textContent = text;
        }
        
        chatBody.appendChild(msgDiv);
        if (!skipScroll) chatBody.scrollTop = chatBody.scrollHeight;
        if (typeof window.ncReplaceIcons === 'function') window.ncReplaceIcons();
    }

    // Helper: Add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-msg bot ai-typing-indicator';
        typingDiv.id = 'aiTypingIndicator';
        typingDiv.innerHTML = `
            <div class="ai-typing">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            </div>
        `;
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const typing = document.getElementById('aiTypingIndicator');
        if (typing) typing.remove();
    }

    // Handle Form Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // User message
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Hide quick actions once a message is sent
        const quickActions = document.getElementById('aiQuickActions');
        if (quickActions) quickActions.style.display = 'none';

        addTypingIndicator();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: chatHistory })
            });
            
            const data = await response.json();
            removeTypingIndicator();
            
            if (data.error) {
                addMessage("Oops, I encountered an error: " + data.error, 'bot');
            } else {
                addMessage(data.reply, 'bot', data.products);
                
                // Save context
                chatHistory.push({ role: "user", content: message });
                chatHistory.push({ role: "assistant", content: data.reply });
                
                // Keep history limited to last 20 messages to save tokens
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(chatHistory.length - 20);
                
                try {
                    localStorage.setItem('neuraChatHistory', JSON.stringify(chatHistory));
                } catch(e) {}
            }
        } catch (err) {
            console.error(err);
            removeTypingIndicator();
            addMessage("Network error. Please try again.", 'bot');
        }
    });

    // Quick Actions
    document.querySelectorAll('.ai-quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            chatInput.value = e.target.textContent;
            // dispatch submit
            chatForm.dispatchEvent(new Event('submit'));
        });
    });
});
