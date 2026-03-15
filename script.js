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

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
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

regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for registering! A confirmation email will be sent to your student inbox shortly.');
    regForm.reset();
    modal.classList.remove('active');
});

const queryForm = document.getElementById('query-form');
if (queryForm) {
    queryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Your message has been sent to the coordinators. We will get back to you soon!');
        queryForm.reset();
    });
}

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

function handleBotResponse(text) {
    let response = "I'm still learning! Our coordinators are best reached via the contact form for specific questions.";
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('event')) {
        response = "We have several events coming up, including CodeFest RIT and weekly coding challenges. Check the Events section!";
    } else if (lowerText.includes('resource') || lowerText.includes('learn') || lowerText.includes('dsa')) {
        response = "The Learning Resources section has top curated content for DSA and Web Dev.";
    } else if (lowerText.includes('join') || lowerText.includes('member')) {
        response = "You can apply for membership during our recruitment drives, or click the Join Club button to fill the intake form.";
    } else if (lowerText.includes('hi') || lowerText.includes('hello')) {
        response = "Hello! Let me know if you need help finding anything on our platform.";
    }

    setTimeout(() => {
        appendMessage(response, false);
    }, 800);
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
