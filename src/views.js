// src/views.js

/**
 * Sub-View: Willkommensseite (Home)
 */
export function renderHomeView() {
  return `
    <div class="bg-white border rounded-xl p-6 shadow-sm">
      <h2 class="text-xl font-bold text-gray-800 mb-2">Login erfolgreich!</h2>
      <p class="text-sm text-gray-600">
        Willkommen im geschützten Bereich. Bitte wähle oben im Menü eine Funktion aus.
      </p>
    </div>
  `;
}

/**
 * Rendert die Projektübersicht basierend auf den Session-Daten.
 * @param {Array} projects - Das Array SESSION_DATA.projects
 * @returns {string} HTML-String
 */
export function renderProjectsView(projects) {
    if (!projects || projects.length === 0) {
        return `
            <div class="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                <span class="font-medium">Hinweis:</span> Keine Projekte vorhanden oder geladen.
            </div>
        `;
    }

    // Zeilen generieren mittels nativem Array.map
    const tableRows = projects.map(p => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">${p.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">${p.title}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ${p.description ? p.description : '<span class="italic text-gray-400">Keine Beschreibung</span>'}
            </td>
        </tr>
    `).join('');

    // Gesamte Tabelle mit Tailwind / Preline CSS Klassen
    return `
        <div class="flex flex-col">
            <div class="-m-1.5 overflow-x-auto">
                <div class="p-1.5 min-w-full inline-block align-middle">
                    <div class="border rounded-lg overflow-hidden dark:border-gray-700">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">ID</th>
                                    <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Projektname</th>
                                    <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Beschreibung</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}
