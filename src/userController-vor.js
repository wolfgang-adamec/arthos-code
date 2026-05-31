export function setupUserManagementForm(api_url) {
    const toggleFormBtn = document.getElementById('btn-toggle-user-form');
    const cancelBtn = document.getElementById('btn-cancel-user');
    const saveBtn = document.getElementById('btn-save-user');
    const formContainer = document.getElementById('user-form-container');

    if (!toggleFormBtn || !formContainer) return;

    // 1. Sofort bestehende Benutzer in die Tabelle laden
    loadUserTable(api_url);

    // 2. Full-Screen Sheet hineinfahren (Von unten nach oben)
    toggleFormBtn.addEventListener('click', () => {
        formContainer.classList.remove('translate-y-full', 'invisible');
        // Optional: Verhindert das Scrollen des Hintergrunds, während das Sheet offen ist
        document.body.classList.add('overflow-hidden');
        
        setTimeout(() => {
            document.getElementById('new-username').focus();
        }, 300); // Wartet das Ende der Animation ab
    });

    // 3. Full-Screen Sheet herausfahren (Nach unten weg)
    const closeSheet = () => {
        formContainer.classList.add('translate-y-full', 'invisible');
        document.body.classList.remove('overflow-hidden');
        resetForm();
    };

    cancelBtn.addEventListener('click', closeSheet);

    // 4. Benutzer speichern
    saveBtn.addEventListener('click', async () => {
        const usernameInput = document.getElementById('new-username');
        const passwordInput = document.getElementById('new-password');
        const messageDiv = document.getElementById('form-message');

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            messageDiv.textContent = 'Bitte sowohl Benutzernamen als auch Passwort eingeben.';
            messageDiv.className = 'text-sm p-3 rounded-xl bg-red-50 text-red-800';
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
                // Daten aktualisieren
                loadUserTable();
                // Sheet schließen
                closeSheet();
            } else {
                messageDiv.textContent = result.message || 'Fehler beim Anlegen.';
                messageDiv.className = 'text-sm p-3 rounded-xl bg-red-50 text-red-800';
            }
        } catch (error) {
            messageDiv.textContent = 'Verbindungsfehler zur API.';
            messageDiv.className = 'text-sm p-3 rounded-xl bg-red-50 text-red-800';
        }
    });
}

function resetForm() {
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    const messageDiv = document.getElementById('form-message');
    messageDiv.className = 'hidden text-sm p-3 rounded-xl';
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
