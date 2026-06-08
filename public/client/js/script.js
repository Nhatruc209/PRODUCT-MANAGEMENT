(() => {
    const messageAlerts = document.querySelectorAll("[message-alert]");

    if (messageAlerts.length > 0) {
        setTimeout(() => {
            messageAlerts.forEach(alert => {
                alert.classList.remove("show");
                setTimeout(() => alert.remove(), 300);
            });
        }, 3000);
    }
})();
