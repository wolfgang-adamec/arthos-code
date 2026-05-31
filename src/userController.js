// Oben bei den Imports das neue Template als Raw-String laden:
import userFormTemplate from './templates/user-form.html?raw';

/**
 * Arthos-Code - Modul: Benutzerverwaltung (Getrennte UI-Logik)
 */

export function setupUserManagementForm (api_url) {
    const toggleFormBtn = document.getElementById('btn-toggle-user-form');
    const formContainer = document.getElementById('user-form-container');

    if (!toggleFormBtn || !formContainer) return;

    // NEU: Das ausgelagerte HTML-Template in den Container injizieren,
    // bevor wir die inneren Elemente (Buttons, Inputs) heraussuchen.
    formContainer.innerHTML = userFormTemplate;

    // Jetzt können wir die Elemente sicher aus dem frisch injizierten HTML greifen
    const cancelBtn = document.getElementById('btn-cancel-user');
	const cancelXBtn = document.getElementById('btn-cancel-user-x'); // Das kleine 'X' oben rechts
    const saveBtn = document.getElementById('btn-save-user');

    // 1. Sofort bestehende Benutzer in die Tabelle laden
    loadUserTable(api_url);
	
    // Helper-Funktion zum Schließen und Aufräumen
    const closeForm = () => {
      // 1. HTML-Attribut wieder setzen
      formContainer.setAttribute('hidden', '');
    
      // 2. Tailwind-Klassen zurücksetzen
      formContainer.classList.add('hidden');
      formContainer.classList.remove('flex');
    
      resetForm();
    };		
	
	// 2. Formular einblenden (Modal öffnen). Also einen Listener zum Toggle Button hinzugeben.
    toggleFormBtn.addEventListener('click', () => {
      // 1. HTML-Attribut entfernen
      formContainer.removeAttribute('hidden');
    
      // 2. Tailwind-Klasse 'hidden' entfernen und 'flex' hinzufügen, damit das Modal zentriert fliegt
      formContainer.classList.remove('hidden');
      formContainer.classList.add('flex');
    
      // 3. Fokus setzen
      document.getElementById('new-username')?.focus();
    });
	
    // 3. Formular ausblenden (Abbrechen)
    cancelBtn?.addEventListener('click', closeForm);
    cancelXBtn?.addEventListener('click', closeForm); // 'X'-Button schließt ebenfalls

    // 4. Benutzer speichern
    saveBtn.addEventListener('click', async () => {
        const usernameInput = document.getElementById('new-username');
        const passwordInput = document.getElementById('new-password');
        const messageDiv = document.getElementById('form-message');

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            messageDiv.textContent = 'Bitte sowohl Benutzernamen als auch Passwort eingeben.';
            messageDiv.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800';
            return;
        }

        try {
            const response = await fetch(api_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_user', username, password })
            });

            const result = await response.json();

            if (result.success) {
                // Neu laden, Formular verstecken und aufräumen
                loadUserTable(api_url);
                closeForm();                
                // Optionale Erfolgsmeldung außerhalb des Formulars (falls gewünscht)
                alert('Benutzer erfolgreich angelegt!'); 
            } else {
                messageDiv.textContent = result.message || 'Fehler beim Anlegen.';
                messageDiv.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800 font-medium';
            }
        } catch (error) {
            messageDiv.textContent = 'Verbindungsfehler zur API.';
            messageDiv.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800 font-medium';
        }
    });
}

// Hilfsfunktion zum Leeren der Felder (falls nicht bereits global definiert)
function resetForm() {
    const usernameInput = document.getElementById('new-username');
    const passwordInput = document.getElementById('new-password');
    const messageDiv = document.getElementById('form-message');
    
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }
}

/**
 * Hilfsfunktion: Lädt alle Benutzer aus dem Backend
 */
async function loadUserTable(api_url) {
    const tableBody = document.getElementById('user-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_users' })
        });

        const users = await response.json();

        if (!Array.isArray(users) || users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="2" class="px-6 py-4 text-center text-sm text-gray-500 italic">Keine Benutzer gefunden.</td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">${user.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">${user.username}</td>
            </tr>
        `).join('');

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="px-6 py-4 text-center text-sm text-red-600 font-medium">Fehler beim Laden der Benutzerdaten.</td>
            </tr>`;
    }
}