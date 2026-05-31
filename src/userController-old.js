/**
 * Initialisiert den Click-Presenter für die Benutzererstellung.
 * Liest die Werte direkt bei Klick aus.
 */
export function setupCreateUserForm() {
    const saveBtn = document.getElementById('btn-save-user');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
        const usernameInput = document.getElementById('new-username');
        const passwordInput = document.getElementById('new-password');
        const messageDiv = document.getElementById('form-message');

        // Validierung im "Debian-Style" (einfach, direkt)
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            messageDiv.textContent = 'Bitte beide Felder ausfüllen.';
            messageDiv.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800';
            return;
        }

        // Payload schnüren
        const payload = {
            action: 'create_user',
            username: username,
            password: password
        };

        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                messageDiv.textContent = 'Benutzer erfolgreich angelegt!';
                messageDiv.className = 'text-sm p-2 rounded-lg bg-green-50 text-green-800';
                usernameInput.value = '';
                passwordInput.value = '';
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