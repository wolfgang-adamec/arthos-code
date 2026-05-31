/**
 * Arthos-Code - Modul: Benutzerverwaltung (Getrennte UI-Logik)
 */

export function setupUserManagementForm (api_url) {
    const toggleFormBtn = document.getElementById('btn-toggle-user-form');
    const cancelBtn = document.getElementById('btn-cancel-user');
    const saveBtn = document.getElementById('btn-save-user');
    const formContainer = document.getElementById('user-form-container');

    if (!toggleFormBtn || !formContainer) return;

    // 1. Sofort bestehende Benutzer in die Tabelle laden
    loadUserTable(api_url);

    // 2. Formular einblenden
    toggleFormBtn.addEventListener('click', () => {
        formContainer.removeAttribute('hidden');
        document.getElementById('new-username').focus();
    });

    // 3. Formular ausblenden (Abbrechen)
    cancelBtn.addEventListener('click', () => {
        formContainer.setAttribute('hidden', '');
        resetForm();
    });

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
            const response = await fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_user', username, password })
            });

            const result = await response.json();

            if (result.success) {
                // Neu laden, Formular verstecken und aufräumen
                loadUserTable();
                formContainer.setAttribute('hidden', '');
                resetForm();
                
                // Optionale Erfolgsmeldung außerhalb des Formulars (falls gewünscht)
                alert('Benutzer erfolgreich angelegt!'); 
            } else {
                messageDiv.textContent = result.message || 'Fehler beim Anlegen.';
                messageDiv.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800';
            }
        } catch (error) {
            messageDiv.textContent = 'Verbindungsfehler zur API.';
            messageDiv.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800';
        }
    });
}

/**
 * Hilfsfunktion: Leert die Eingabefelder
 */
function resetForm() {
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    const messageDiv = document.getElementById('form-message');
    messageDiv.className = 'hidden text-sm p-2 rounded-lg';
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