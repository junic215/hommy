document.addEventListener('DOMContentLoaded', () => {
    // --- Medicine Notebook Logic ---
    const medDateInput = document.getElementById('med-date');
    const medNameInput = document.getElementById('med-name');
    const medAddBtn = document.getElementById('med-add-btn');
    const medListEl = document.getElementById('med-list');
    const MED_KEY = 'hommy_med_notebook';

    let medData = JSON.parse(localStorage.getItem(MED_KEY)) || [];

    function renderMedList() {
        if (!medListEl) return;
        medListEl.innerHTML = '';
        medData.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'data-item';
            li.innerHTML = `
                <span>${escapeHtml(item)}</span>
                <button class="delete-btn" data-index="${index}">×</button>
            `;
            medListEl.appendChild(li);
        });

        // Add delete listeners
        medListEl.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                medData.splice(idx, 1);
                saveMed();
                renderMedList();
            });
        });
    }

    function saveMed() {
        localStorage.setItem(MED_KEY, JSON.stringify(medData));
    }

    if (medAddBtn && medDateInput && medNameInput) {
        medAddBtn.addEventListener('click', () => {
            const dateVal = medDateInput.value;
            const nameVal = medNameInput.value.trim();

            if (dateVal && nameVal) {
                const entry = `${dateVal} : ${nameVal}`;
                medData.unshift(entry);
                saveMed();
                renderMedList();
                medNameInput.value = '';
                medDateInput.value = '';
            } else {
                alert('日付とお薬名の両方を入力してください');
            }
        });
    }

    // --- Medication Status Logic ---
    const statusName = document.getElementById('status-name');
    const timeMorning = document.getElementById('time-morning');
    const timeNoon = document.getElementById('time-noon');
    const timeEvening = document.getElementById('time-evening');
    const statusNotes = document.getElementById('status-notes');
    const statusAddBtn = document.getElementById('status-add-btn');
    const statusListEl = document.getElementById('status-list');
    const STATUS_KEY = 'hommy_med_status';

    let statusData = JSON.parse(localStorage.getItem(STATUS_KEY)) || [];

    function renderStatusList() {
        if (!statusListEl) return;
        statusListEl.innerHTML = '';
        statusData.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'data-item';
            li.style.alignItems = 'flex-start'; // Align delete button to top
            // Item is stored as a formatted string: "Name [Times] \n メモ: Notes"
            li.innerHTML = `
                <div style="flex: 1; font-size: 0.9rem; line-height: 1.4;">
                    ${escapeHtml(item).replace(/\n/g, '<br>')}
                </div>
                <button class="delete-btn" data-index="${index}">×</button>
            `;
            statusListEl.appendChild(li);
        });

        statusListEl.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                statusData.splice(idx, 1);
                saveStatus();
                renderStatusList();
            });
        });
    }

    function saveStatus() {
        localStorage.setItem(STATUS_KEY, JSON.stringify(statusData));
    }

    if (statusAddBtn && statusName) {
        statusAddBtn.addEventListener('click', () => {
            const name = statusName.value.trim();
            const selectedTimes = [];
            if (timeMorning && timeMorning.checked) selectedTimes.push('朝');
            if (timeNoon && timeNoon.checked) selectedTimes.push('昼');
            if (timeEvening && timeEvening.checked) selectedTimes.push('晩');

            const notes = statusNotes ? statusNotes.value.trim() : '';

            if (name && selectedTimes.length > 0) {
                let entry = `${name} [${selectedTimes.join('・')}]`;
                if (notes) {
                    entry += `\nメモ: ${notes}`;
                }

                statusData.unshift(entry);
                saveStatus();
                renderStatusList();

                // Reset fields
                statusName.value = '';
                if (statusNotes) statusNotes.value = '';
                if (timeMorning) timeMorning.checked = false;
                if (timeNoon) timeNoon.checked = false;
                if (timeEvening) timeEvening.checked = false;
            } else {
                alert('薬の名前と投薬タイミングを少なくとも1つ選択してください');
            }
        });
    }

    // Utility
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Geolocation & Notification with EmailJS ---
    const EMAILJS_PUBLIC_KEY = "Yn4lx7V4Cj1mekEt5";
    const EMAILJS_SERVICE_ID = "service_f5yp4ps";
    const EMAILJS_TEMPLATE_ID = "template_d4wh4jt";

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    function notifyLocation() {
        if (!navigator.geolocation) {
            sendEmailNotification("位置情報非対応のブラウザです");
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

            console.log("Location captured: ", mapUrl);
            sendEmailNotification(mapUrl);
        }, (err) => {
            console.warn("Location error: ", err.message);
            sendEmailNotification(`位置情報の取得に失敗しました (${err.message})`);
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    }

    async function sendEmailNotification(locationUrl) {
        if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY_HERE" || !EMAILJS_PUBLIC_KEY) {
            console.warn("EmailJS: Public Key is not set.");
            return;
        }

        const templateParams = {
            message: "迷子のWEBページへアクセスがありました",
            location_url: locationUrl,
            timestamp: new Date().toLocaleString('ja-JP')
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            console.log("Email notification sent successfully!");
        } catch (error) {
            console.error("EmailJS failed to send:", error);
        }
    }

    // Init
    renderMedList();
    renderStatusList();
    notifyLocation(); // ページ表示時に位置情報を取得
});
