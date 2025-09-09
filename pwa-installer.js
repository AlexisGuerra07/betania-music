// PWA Installation Manager
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    // Registrar Service Worker
    this.registerServiceWorker();
    
    // Configurar eventos de instalación
    this.setupInstallEvents();
    
    // Crear botón de instalación
    this.createInstallButton();
    
    // Detectar si ya está instalada
    this.detectIfInstalled();
  }

  // Registrar Service Worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] Service Worker registrado:', registration);

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });

      } catch (error) {
        console.error('[PWA] Error registrando Service Worker:', error);
      }
    }
  }

  // Configurar eventos de instalación
  setupInstallEvents() {
    // Capturar el evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] beforeinstallprompt fired');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Evento cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App instalada');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstalledMessage();
    });
  }

  // Crear botón de instalación
  createInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.innerHTML = `
      <span>📱</span>
      <span>Instalar App</span>
    `;
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      display: none;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Efectos hover
    installBtn.addEventListener('mouseenter', () => {
      installBtn.style.transform = 'translateY(-2px)';
      installBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    });

    installBtn.addEventListener('mouseleave', () => {
      installBtn.style.transform = 'translateY(0)';
      installBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });

    // Evento de instalación
    installBtn.addEventListener('click', () => {
      this.installApp();
    });

    document.body.appendChild(installBtn);
  }

  // Mostrar botón de instalación
  showInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn && !this.isInstalled) {
      btn.style.display = 'flex';
      
      // Animación de entrada
      setTimeout(() => {
        btn.style.animation = 'pwa-bounce 0.6s ease-out';
      }, 100);
    }
  }

  // Ocultar botón de instalación
  hideInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.style.display = 'none';
    }
  }

  // Instalar la aplicación
  async installApp() {
    if (!this.deferredPrompt) return;

    // Mostrar el prompt de instalación
    this.deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[PWA] Usuario aceptó la instalación');
    } else {
      console.log('[PWA] Usuario rechazó la instalación');
    }

    // Limpiar el prompt
    this.deferredPrompt = null;
    this.hideInstallButton();
  }

  // Detectar si la app ya está instalada
  detectIfInstalled() {
    // Método 1: Verificar si se ejecuta en modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }

    // Método 2: Verificar navigator.standalone (iOS)
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      return;
    }

    // Método 3: Verificar URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('standalone') === 'true') {
      this.isInstalled = true;
    }
  }

  // Mostrar notificación de actualización
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1001;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        🔄 Nueva versión disponible. Recarga la página para actualizar.
        <button onclick="window.location.reload()" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 5px 10px;
          margin-left: 10px;
          border-radius: 4px;
          cursor: pointer;
        ">Recargar</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 10 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 10000);
  }

  // Mostrar mensaje de instalación exitosa
  showInstalledMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #2196F3;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1001;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        🎉 ¡Betania Music instalada correctamente! Ya puedes usarla desde tu pantalla de inicio.
      </div>
    `;
    
    document.body.appendChild(message);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }
}

// Estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes pwa-bounce {
    0%, 20%, 60%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    80% {
      transform: translateY(-5px);
    }
  }
`;
document.head.appendChild(style);

// Inicializar PWA cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PWAInstaller();
  });
} else {
  new PWAInstaller();
}
