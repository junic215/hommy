document.addEventListener('DOMContentLoaded', () => {
    const likeBtn = document.getElementById('like-btn');
    const likeCountSpan = document.getElementById('like-count');
    const heartIcon = document.querySelector('.heart-icon');

    // Load from local storage or default to 0
    let likeCount = parseInt(localStorage.getItem('pet_like_count')) || 0;

    // Initialize display
    likeCountSpan.textContent = likeCount;
    if (likeCount > 0) {
        likeBtn.classList.add('liked');
    }

    likeBtn.addEventListener('click', () => {
        likeCount++;
        likeCountSpan.textContent = likeCount;
        localStorage.setItem('pet_like_count', likeCount);

        // Animation
        likeBtn.classList.add('liked');

        // Create floating heart
        createFloatingHeart(likeBtn);
    });

    function createFloatingHeart(btn) {
        const heart = document.createElement('div');
        heart.textContent = '❤';
        heart.style.position = 'absolute';
        heart.style.color = '#ff6b81';
        heart.style.fontSize = '1.5rem';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '100';

        // Position
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top;

        heart.style.left = `${centerX}px`;
        heart.style.top = `${centerY}px`;

        // Random movement
        const randomX = (Math.random() - 0.5) * 60;

        // Animation
        heart.animate([
            { transform: `translate(0, 0) scale(0)`, opacity: 0 },
            { transform: `translate(${randomX}px, -50px) scale(1.2)`, opacity: 1, offset: 0.5 },
            { transform: `translate(${randomX * 1.5}px, -100px) scale(1)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });

        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 1000);
    }


    // Owner Login
    const loginBtn = document.getElementById('owner-login-btn');
    const passInput = document.getElementById('owner-passcode');

    if (loginBtn && passInput) {
        loginBtn.addEventListener('click', checkPasscode);
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPasscode();
        });
    }

    async function checkPasscode() {
        const pass = passInput.value;
        if (!pass) return;

        // Hash the input to compare (SHA-256)
        // "0415" -> 735483905673bd9e3b9fe417248633156a3e9d5083ea65647272f9c9e37a994f
        const targetHash = "735483905673bd9e3b9fe417248633156a3e9d5083ea65647272f9c9e37a994f";

        try {
            const msgBuffer = new TextEncoder().encode(pass);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (hashHex === targetHash) {
                window.location.href = 'owner.html';
            } else {
                alert('Wrong passcode!');
                passInput.value = '';
            }
        } catch (e) {
            console.error(e);
            // Fallback or error handling
        }
    }
});
