let deferredPrompt;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado'))
            .catch(err => console.log('SW error', err));
    });
}

// Escuchar el evento de instalación
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Mostrar banner de instalación después de 3 segundos
    setTimeout(() => {
        showInstallBanner();
    }, 3000);
});

function showInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
    <span>✨ Instala AutoGuest App</span>
    <div style="display:flex; gap:10px;">
      <button class="install-btn" id="installPwaBtn">Instalar</button>
      <button style="background:none; border:none; color:inherit; font-size:20px; cursor:pointer;" id="closePwaBtn">×</button>
    </div>
  `;
    document.body.appendChild(banner);

    // Trigger reflow for animation
    setTimeout(() => banner.classList.add('show'), 10);

    document.getElementById('installPwaBtn').addEventListener('click', async () => {
        banner.classList.remove('show');
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
        }
    });

    document.getElementById('closePwaBtn').addEventListener('click', () => {
        banner.classList.remove('show');
    });
}
