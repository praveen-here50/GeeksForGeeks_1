const navbar = document.querySelector('.navbar');
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

const featureModal = document.getElementById('feature-modal');
const featureModalClose = document.getElementById('feature-modal-close');
const featureModalOk = document.getElementById('feature-modal-ok');
const featureModalTitle = document.getElementById('feature-modal-title');
const featureModalDesc = document.getElementById('feature-modal-desc');

const openFeatureModal = (title = "Feature Coming Soon", desc = "This feature is currently under development. Check back later!") => {
    featureModalTitle.textContent = title;
    featureModalDesc.textContent = desc;
    featureModal.classList.add('active');
};

if (featureModalClose) featureModalClose.addEventListener('click', () => featureModal.classList.remove('active'));
if (featureModalOk) featureModalOk.addEventListener('click', () => featureModal.classList.remove('active'));
if (featureModal) featureModal.addEventListener('click', (e) => {
    if (e.target === featureModal) featureModal.classList.remove('active');
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') {
            // It's a dummy link, show the generic "Coming Soon" modal
            const linkText = this.textContent.trim() || 'This Link';
            openFeatureModal(`${linkText}`, `The "${linkText}" feature is currently under development. Stay tuned!`);
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

const modal = document.getElementById('registration-modal');
const modalClose = document.getElementById('modal-close');
const registerBtns = document.querySelectorAll('.register-btn');
const modalEventTitle = document.getElementById('modal-event-title');
const regForm = document.getElementById('event-reg-form');

registerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const eventName = e.target.getAttribute('data-event');
        modalEventTitle.textContent = `Register: ${eventName}`;
        modal.classList.add('active');
    });
});

modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventName = modalEventTitle.textContent.replace('Register: ', '');
    const name = document.getElementById('reg-name').value;
    const rollNumber = document.getElementById('reg-roll').value;
    const email = document.getElementById('reg-email').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventName, name, email, rollNumber })
        });
        const data = await response.json();
        alert(data.message || 'Thank you for registering!');
        regForm.reset();
        modal.classList.remove('active');
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    }
});

const queryForm = document.getElementById('query-form');
if (queryForm) {
    queryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });
            const data = await response.json();
            alert(data.message || 'Your message has been sent to the coordinators.');
            queryForm.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending your message.');
        }
    });
}

// Join Club Modal Logic
const joinModal = document.getElementById('join-modal');
const joinModalClose = document.getElementById('join-modal-close');
const joinForm = document.getElementById('join-form');
const joinBtnMain = document.getElementById('join-btn');
const joinBtnMobile = document.querySelector('.join-btn-mobile');

const openJoinModal = () => joinModal.classList.add('active');

if (joinBtnMain) joinBtnMain.addEventListener('click', openJoinModal);
if (joinBtnMobile) joinBtnMobile.addEventListener('click', (e) => {
    e.preventDefault();
    mobileMenu.classList.remove('active');
    openJoinModal();
});

if (joinModalClose) {
    joinModalClose.addEventListener('click', () => {
        joinModal.classList.remove('active');
    });
}

joinModal.addEventListener('click', (e) => {
    if (e.target === joinModal) {
        joinModal.classList.remove('active');
    }
});

joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('join-name').value;
    const rollNumber = document.getElementById('join-roll').value;
    const email = document.getElementById('join-email').value;

    try {
        const response = await fetch('/api/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, rollNumber })
        });
        const data = await response.json();
        alert(data.message || 'Successfully submitted application!');
        joinForm.reset();
        joinModal.classList.remove('active');
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while joining the club.');
    }
});

const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

chatToggle.addEventListener('click', () => {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
        chatInput.focus();
    }
});

function appendMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleBotResponse(text) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        setTimeout(() => {
            appendMessage(data.response, false);
        }, 800);
    } catch (error) {
        console.error('Chat error:', error);
        setTimeout(() => {
            appendMessage("Sorry, I'm having trouble connecting to my brain right now.", false);
        }, 800);
    }
}

function handleChatSubmit() {
    const text = chatInput.value.trim();
    if (text) {
        appendMessage(text, true);
        chatInput.value = '';
        handleBotResponse(text);
    }
}

sendBtn.addEventListener('click', handleChatSubmit);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleChatSubmit();
    }
});

// Authentication UI Updates
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('gfg_token');
    const user = JSON.parse(localStorage.getItem('gfg_user') || '{}');

    if (token) {
        const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        const profileHtml = `
            <div class="profile-nav-item" id="profile-trigger">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-dropdown">
                    <div style="padding: 0.5rem 1rem;">
                        <div style="font-weight: 600; color: #fff;">${user.name || 'User'}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${user.email || ''}</div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="dashboard.html" class="dropdown-item"><i class='bx bxs-dashboard'></i> Dashboard</a>
                    <a href="practice.html" class="dropdown-item"><i class='bx bx-code-block'></i> Practice</a>
                    <a href="contest.html" class="dropdown-item"><i class='bx bx-trophy'></i> Contests</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" id="logout-link" class="dropdown-item" style="color: #ff5f56;"><i class='bx bx-log-out'></i> Log Out</a>
                </div>
            </div>
        `;

        // Update Desktop Navigation
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = profileHtml;
            
            const trigger = document.getElementById('profile-trigger');
            
            // Toggle dropdown on click
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                trigger.classList.toggle('active');
            });

            // Close dropdown when clicking elsewhere
            document.addEventListener('click', () => {
                trigger.classList.remove('active');
            });

            // Prevent closing within the dropdown
            const dropdown = trigger.querySelector('.profile-dropdown');
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Add logout listener
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.reload();
            });
        }

        // Update Mobile Navigation
        const mobileAuthBtn = document.getElementById('mobile-auth-btn');
        if (mobileAuthBtn) {
            mobileAuthBtn.textContent = 'Dashboard';
            mobileAuthBtn.href = 'dashboard.html';
        }
    }
});
