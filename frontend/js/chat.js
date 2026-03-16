let currentHostelId = null;
let currentOtherUserId = null;
let lastMessageCount = 0;
let pollingInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const hostelId = params.get('hostel_id');
    const ownerId = params.get('owner_id');
    const studentId = params.get('student_id');

    if (hostelId && (ownerId || studentId)) {
        startChat(hostelId, ownerId || studentId);
    }

    document.getElementById('chatForm').addEventListener('submit', handleSend);
    loadRecentInquiries();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

async function loadRecentInquiries() {
    // In a real student project, we'd fetch a list of unique conversations
    // For now, let's just show a simple list or the current one
}

function startChat(hostelId, otherUserId) {
    currentHostelId = hostelId;
    currentOtherUserId = otherUserId;
    
    document.getElementById('chatMain').style.display = 'flex';
    
    // Clear previous polling
    if (pollingInterval) clearInterval(pollingInterval);
    
    fetchMessages();
    pollingInterval = setInterval(fetchMessages, 3000);
}

async function fetchMessages() {
    if (!currentHostelId || !currentOtherUserId) return;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/chat/${currentHostelId}/${currentOtherUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await res.json();
        
        if (res.ok && messages.length !== lastMessageCount) {
            renderMessages(messages);
            lastMessageCount = messages.length;
        }
    } catch (e) {
        console.error('Chat error:', e);
    }
}

function renderMessages(messages) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';

    messages.forEach(m => {
        const isSent = m.sender_id === user.id;
        const time = new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        container.innerHTML += `
            <div class="msg ${isSent ? 'msg-sent' : 'msg-received'}">
                <div class="msg-content">${m.message}</div>
                <div class="msg-info">
                    <span>${time}</span>
                </div>
            </div>
        `;
    });
    
    container.scrollTop = container.scrollHeight;
}

async function handleSend(e) {
    e.preventDefault();
    const input = document.getElementById('msgInput');
    const message = input.value.trim();
    const token = localStorage.getItem('token');

    if (!message || !currentHostelId || !currentOtherUserId) return;

    try {
        const res = await fetch(`${API_URL}/chat/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                hostel_id: currentHostelId,
                receiver_id: currentOtherUserId,
                message: message
            })
        });
        
        if (res.ok) {
            input.value = '';
            fetchMessages();
        }
    } catch (e) {
        console.error('Send error:', e);
    }
}
