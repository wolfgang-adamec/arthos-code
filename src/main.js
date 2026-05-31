// src/main.js
import './style.css'
import 'preline'

// HIER IST DER CLOU: Wir importieren das nackte HTML als String via Vite
import appShellTemplate from './templates/app-shell.html?raw';
import loginTemplate from './templates/login.html?raw';
import userFormTemplate from './templates/user-form.html?raw';
import userManagementTemplate from './templates/user-management.html?raw';
import manage_terms_template from './templates/manage-terms.html?raw';

// Wir importieren unsere HTML-Zulieferer
import { 
  renderHomeView,   
  renderProjectsView
} from './views.js';

import { 
  setupUserManagementForm  
} from './userController.js';


import { 
  setup_terms_management_panel
} from './terms_controller.js';

const API_URL = 'https://freeshell.de/wadamec/api.php';

// Der globale Zustand (State) der Anwendung innerhalb dieser Session
let SESSION_DATA = {
  username: '',
  projects: []
};

/**
 * Kern-Orchestrator: Steuert die Slots in der statischen index.html
 */
function initAppShell() {
  // Wir greifen die fest im HTML verankerten Elemente
  const menuSlot = document.getElementById('menu-slot');
  const subviewContainer = document.getElementById('subview-container');

  // Sicherheitscheck, falls im DOM was schiefgeht
  if (!menuSlot || !subviewContainer) return;

  if (!SESSION_DATA.username) {
    // ZUSTAND: Ausgeloggt
    // Das Gast-Menü steht schon im HTML, wir müssen nur das Login-Template zeigen
    subviewContainer.innerHTML = loginTemplate;
    setupLoginLogic();
  } else {
    // ZUSTAND: Eingeloggt
    // 1. Das authentifizierte Menü in den Header-Slot schießen
    const verarbeitetesMenü = appShellTemplate.replace('{{username}}', SESSION_DATA.username);
    menuSlot.innerHTML = verarbeitetesMenü;

    // 2. Die geschützte Home-View im Hauptbereich zeigen
    subviewContainer.innerHTML = renderHomeView();

    // 3. Navigation für die Knöpfe aktivieren
    setupMenuNavigation(subviewContainer);
  }
}

/**
 * Aktiviert die Event-Listener für das Login-Formular
 */
function setupLoginLogic() {
  const loginBtn = document.getElementById('login-click-btn');
  const loginError = document.getElementById('login-error');

  if (!loginBtn) return;

  loginBtn.addEventListener('click', async function () {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      if (loginError) {
        loginError.textContent = "Bitte füllen Sie alle Felder aus.";
        loginError.classList.remove('hidden');
      }
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
		action: 'login',
		username, password })
      });

      const data = await response.json();

      if (data.success === true) {
        // State aktualisieren
        SESSION_DATA.username = data.user.username;
        SESSION_DATA.projects = data.projects || [];

        // KREISLAUF SCHLIESSEN: Wir rufen einfach initAppShell() noch mal auf.
        // Da SESSION_DATA jetzt befüllt ist, schwenkt die App automatisch um!
        initAppShell();
      } else {
        if (loginError) {
          loginError.textContent = "Ungültiger Benutzername oder Passwort.";
          loginError.classList.remove('hidden');
        }
      }
    } catch (error) {
      console.error("API-Fehler:", error);
    }
  });
}
 
/**
 * Aktiviert die Navigation im geschützten Bereich
 */
function setupMenuNavigation(subviewContainer) {
  const btnHome     = document.getElementById('nav-home-btn');
  const btn_terms   = document.getElementById('nav-terms-btn');
  const btnUsers    = document.getElementById('nav-users-btn');
  const btnLogout   = document.getElementById('logout-btn');

  const updateActiveTab = (activeBtn) => {
    [btnHome, btn_terms, btnUsers].forEach(btn => {
      btn.classList.remove('border-blue-600', 'text-blue-600');
      btn.classList.add('border-transparent', 'text-gray-500');
    });
    activeBtn.classList.remove('border-transparent', 'text-gray-500');
    activeBtn.classList.add('border-blue-600', 'text-blue-600');
  };

  btnHome.addEventListener('click', () => {
    updateActiveTab(btnHome);
    subviewContainer.innerHTML = renderHomeView();
  });

  btn_terms.addEventListener ('click', () => {
    updateActiveTab (btn_terms);
	
    subviewContainer.innerHTML = manage_terms_template;
	setup_terms_management_panel (API_URL)
  });

  btnUsers.addEventListener('click', () => {
    updateActiveTab(btnUsers);
	
	subviewContainer.innerHTML = userManagementTemplate;
	setupUserManagementForm(API_URL);	
  });

  btnLogout.addEventListener('click', () => {
    window.location.reload();
  });
}
  
// AM ENDE: Die App startet sofort beim Laden der Seite direkt mit der Shell!
initAppShell();
