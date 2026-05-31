// Oben bei den Imports das neue Template als Raw-String laden:
import term_form_template from './templates/term-form.html?raw';

/**
 * Arthos-Code - Modul: Verwaltung der Begriffe (Getrennte UI-Logik)
 */
export function setup_terms_management_panel (api_url) 
{
    const show_form_btn  = document.getElementById('btn-show-term-form');
    const form_container = document.getElementById('term-form-container');

    if (!show_form_btn || !form_container) return;

    // NEU: Das ausgelagerte HTML-Template in den Container injizieren,
    // bevor wir die inneren Elemente (Buttons, Inputs) heraussuchen.
    form_container.innerHTML = term_form_template;

    // Jetzt können wir die Elemente sicher aus dem frisch injizierten HTML greifen
    const cancel_btn   = document.getElementById('btn-cancel-term');
	const cancel_x_btn = document.getElementById('btn-cancel-term-x'); // Das kleine 'X' oben rechts
    const save_btn     = document.getElementById('btn-save-term');

    // 1. Sofort bestehende Benutzer in die Tabelle laden
    load_terms_table (api_url);
	
    // Helper-Funktion zum Schließen und Aufräumen
    const close_form = () => {
      // 1. HTML-Attribut wieder setzen
      form_container.setAttribute('hidden', '');
    
      // 2. Tailwind-Klassen zurücksetzen
      form_container.classList.add('hidden');
      form_container.classList.remove('flex');
    
      reset_form();
    };		
	
	// 2. Formular einblenden (Modal öffnen). Also einen Listener zum Toggle Button hinzugeben.
    show_form_btn.addEventListener ('click', () => {
      // 1. HTML-Attribut entfernen
      form_container.removeAttribute('hidden');
    
      // 2. Tailwind-Klasse 'hidden' entfernen und 'flex' hinzufügen, damit das Modal zentriert fliegt
      form_container.classList.remove('hidden');
      form_container.classList.add('flex');
    
      // 3. Fokus setzen
      document.getElementById('new-id')?.focus();
    });
	
    // 3. Formular ausblenden (Abbrechen)
    cancel_btn?.addEventListener('click', close_form);
    cancel_x_btn?.addEventListener('click', close_form); // 'X'-Button schließt ebenfalls

    // 4. Benutzer speichern
    save_btn.addEventListener ('click', async () => {
        const id_input        = document.getElementById('new-id');
        const lang_code_input = document.getElementById('new-lang-code');
		const term_input      = document.getElementById('new-term');
		
        const message_div     = document.getElementById('form-message');

        const id        = id_input.value;
        const lang_code = lang_code_input.value;
		const term      = term_input.value;

        if (!id || !lang_code || term) {
          message_div.textContent = 'Bitte ID, Sprach-Code und Begriff eingeben.';
          message_div.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800';
          return;
        }

        try {
            const response = await fetch(api_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_term', id, lang_code, term })
            });

            const result = await response.json();

            if (result.success) {
                // Neu laden, Formular verstecken und aufräumen
                load_terms_table (api_url);
                close_form ();                
                // Optionale Erfolgsmeldung außerhalb des Formulars (falls gewünscht)
                alert ('Begriff erfolgreich angelegt!'); 
            } else {
                message_div.textContent = result.message || 'Fehler beim Anlegen.';
                message_div.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800 font-medium';
            }
        } catch (error) {
            message_div.textContent = 'Verbindungsfehler zur API.';
            message_div.className = 'text-sm p-2 rounded-lg bg-red-50 text-red-800 font-medium';
        }
    });
}

// Hilfsfunktion zum Leeren der Felder (falls nicht bereits global definiert)
function reset_form () 
{
    const id_input        = document.getElementById('new-id');
    const lang_code_input = document.getElementById('new-lang-code');
	const term_input      = document.getElementById('new-term');
    const message_div     = document.getElementById('form-message');
    
    if (id_input) id_input.value = '';
	
    if (lang_code_input) lang_code_input.value = '';
	
	if (term_input) term_input.value = '';
	
    if (message_div) {
      message_div.textContent = '';
      message_div.className = '';
    }
}

/**
 * Hilfsfunktion: Lädt alle Benutzer aus dem Backend
 */
async function load_terms_table (api_url) 
{
    const table_body = document.getElementById ('terms-table-body');
	
    if (!table_body) return;

    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_terms' })
        });

        const terms = await response.json();

        if (!Array.isArray (terms) || terms.length === 0) {
            table_body.innerHTML = `
                <tr>
                    <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500 italic">Keine Begriffe gefunden.</td>
                </tr>`;
            return;
        }

        table_body.innerHTML = terms.map(term => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">${term.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">${term.lang}</td>
            </tr>
        `).join('');

    } catch (error) {
        table_body.innerHTML = `
            <tr>
                <td colspan="2" class="px-6 py-4 text-center text-sm text-red-600 font-medium">Fehler beim Laden der Begriffe.</td>
            </tr>`;
    }
}
