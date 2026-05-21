import { getImagePath } from '../dataManager.js';

/**
 * Composant de carte d'habitant (DOM Element Factory)
 * @param {Object} habitant Données brutes de l'habitant
 * @returns {HTMLElement} Élément HTML représentant la carte
 */
export function createCardElement(habitant) {
    const imagePath = getImagePath(habitant.numero);
    const nomFR = habitant['Nom Français'] || 'Inconnu';
    const nomEN = habitant['Nom Anglais'] || '';
    const espece = habitant.especes || 'Inconnu';
    
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header-wrapper">
            <span class="numero-badge">#${habitant.numero}</span>
            <div class="card-img-container">
                <img src="${imagePath}" alt="${nomFR}" class="card-img" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23cbd5e1\'><path d=\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/></svg>'; this.classList.add('fallback');"
                     loading="lazy">
            </div>
        </div>
        <div class="card-title">${nomFR}</div>
        <div class="card-subtitle">${nomEN}</div>
        <span class="tag">${espece}</span>
    `;
    return card;
}
