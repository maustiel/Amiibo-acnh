import './style.css';
import { getCleanData } from './dataManager.js';
import { createCardElement } from './components/Card.js';

// === ETAT APPLICATION (STATE) ===
const habitants = getCleanData();
let affichageCourant = [...habitants];
let ordreTri = 'numero';

// === SELECTION DOM ===
const container = document.getElementById('roster-container');
const selectEspece = document.getElementById('filtre-espece');
const btnSortNum = document.getElementById('btn-sort-num');
const btnSortAlpha = document.getElementById('btn-sort-alpha');
const inputRecherche = document.getElementById('recherche-nom');

/**
 * Initialisation générale du JavaScript Client
 */
function init() {
    initFiltres();
    setupEventListeners();
    trier('numero'); // Affichage initial par numéro
}

/**
 * Remplit dynamiquement la liste déroulante des espèces uniques
 */
function initFiltres() {
    const especesBrutes = habitants.map(h => h.especes).filter(e => e && e.trim() !== "");
    const especesUniques = [...new Set(especesBrutes)].sort();
    
    especesUniques.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp;
        option.textContent = esp.charAt(0).toUpperCase() + esp.slice(1);
        selectEspece.appendChild(option);
    });
}

/**
 * Met à jour le DOM pour afficher la grille de cartes actuelle
 */
function render() {
    container.innerHTML = '';
    
    if (affichageCourant.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucun habitant trouvé pour cette sélection.</div>';
        return;
    }
    
    affichageCourant.forEach(habitant => {
        const cardElement = createCardElement(habitant);
        container.appendChild(cardElement);
    });
}

/**
 * Trie les données selon le critère choisi
 * @param {string} critere 'numero' ou 'nom'
 */
function trier(critere) {
    ordreTri = critere;
    if (critere === 'numero') {
        affichageCourant.sort((a, b) => {
            const numAStr = String(a.numero);
            const numBStr = String(b.numero);
            
            const aLettre = numAStr.replace(/[0-9]/g, '');
            const bLettre = numBStr.replace(/[0-9]/g, '');
            const aChiffre = parseInt(numAStr.replace(/[^0-9]/g, '') || 0);
            const bChiffre = parseInt(numBStr.replace(/[^0-9]/g, '') || 0);
            
            if (aLettre !== bLettre) {
                return aLettre.localeCompare(bLettre);
            }
            return aChiffre - bChiffre;
        });
    } else if (critere === 'nom') {
        affichageCourant.sort((a, b) => {
            const nomA = String(a['Nom Français'] || '');
            const nomB = String(b['Nom Français'] || '');
            return nomA.localeCompare(nomB);
        });
    }
    render();
}

/**
 * Filtre les habitants selon l'espèce sélectionnée ET la recherche textuelle
 */
function filtrer() {
    const espece = selectEspece.value;
    const texteRecherche = inputRecherche.value.toLowerCase().trim();

    affichageCourant = habitants.filter(h => {
        // 1. Vérifier l'espèce
        const matchEspece = (espece === 'Toutes') || (h.especes === espece);
        
        // 2. Vérifier le texte (cherche dans le Nom Français, Anglais, ou le numéro)
        const nomFR = String(h['Nom Français'] || '').toLowerCase();
        const nomEN = String(h['Nom Anglais'] || '').toLowerCase();
        const numero = String(h.numero).toLowerCase();
        
        const matchRecherche = nomFR.includes(texteRecherche) || 
                               nomEN.includes(texteRecherche) || 
                               numero.includes(texteRecherche);

        // L'habitant doit correspondre aux deux filtres pour être affiché
        return matchEspece && matchRecherche;
    });
    
    trier(ordreTri); // Réapplique le tri après filtrage
}

/**
 * Attache les observateurs d'événements (Event Listeners)
 */
function setupEventListeners() {
    selectEspece.addEventListener('change', filtrer);
    btnSortNum.addEventListener('click', () => trier('numero'));
    btnSortAlpha.addEventListener('click', () => trier('nom'));
    
    // NOUVEAU : On écoute ce que l'utilisateur tape ('input' s'active à chaque lettre tapée)
    inputRecherche.addEventListener('input', filtrer);
}

// Lancement au chargement du DOM
document.addEventListener('DOMContentLoaded', init);
