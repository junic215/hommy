(function () {
    // --- EmailJS Configuration ---
    const EMAILJS_PUBLIC_KEY = "Yn4lx7V4Cj1mekEt5";
    const EMAILJS_SERVICE_ID = "service_f5yp4ps";
    const EMAILJS_TEMPLATE_ID = "template_d4wh4jt";

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    async function sendEmailNotification(locationUrl) {
        if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY_HERE") return;

        const templateParams = {
            message: "【緊急】迷子のWEBページ（HELP ME）へアクセスがありました",
            location_url: locationUrl,
            timestamp: new Date().toLocaleString('ja-JP')
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            console.log("SOS Email sent!");
        } catch (error) {
            console.error("EmailJS failed:", error);
        }
    }

    function notifyLocation() {
        if (!navigator.geolocation) {
            sendEmailNotification("位置情報非対応のブラウザです");
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            sendEmailNotification(mapUrl);
        }, (err) => {
            console.warn("Location error: ", err.message);
            sendEmailNotification("アクセスした方が位置情報を許可しませんでした。");
        }, {
            enableHighAccuracy: true,
            timeout: 7000,
            maximumAge: 0
        });
    }

    // Run on page load
    window.onload = notifyLocation;
})();
