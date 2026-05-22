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
const selectSerie = document.getElementById('filtre-serie'); // <-- Le nouveau select
const btnSortNum = document.getElementById('btn-sort-num');
const btnSortAlpha = document.getElementById('btn-sort-alpha');
const inputRecherche = document.getElementById('recherche-nom');
const btnRemonter = document.getElementById('btn-remonter');
const btnReset = document.getElementById('btn-reset');


/**
 * Initialisation générale
 */
function init() {
    initFiltres();
    setupEventListeners();
    trier('numero');
}

/**
 * Remplit dynamiquement la liste déroulante des espèces
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
 * Met à jour le DOM pour afficher les cartes
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
 * "Cerveau" pour déduire la série selon le numéro
 */
function getSerie(numero) {
    const numStr = String(numero).trim().toUpperCase();
    
    if (numStr.startsWith('W')) return 'Welcome';
    if (numStr.startsWith('S')) return 'Collaboration';
    
    // Si c'est un numéro normal
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
        if (num >= 1 && num <= 100) return 'Série 1';
        if (num >= 101 && num <= 200) return 'Série 2';
        if (num >= 201 && num <= 300) return 'Série 3';
        if (num >= 301 && num <= 400) return 'Série 4';
        if (num >= 401 && num <= 448) return 'Série 5';
    }
    return 'Autre';
}

/**
 * Trie les données
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
 * Filtre les habitants (Série + Espèce + Recherche textuelle)
 */
function filtrer() {
    const espece = selectEspece.value;
    const serie = selectSerie.value;
    const texteRecherche = inputRecherche.value.toLowerCase().trim();

    affichageCourant = habitants.filter(h => {
        // 1. Vérification de la série
        const villagerSerie = getSerie(h.numero);
        const matchSerie = (serie === 'Toutes') || (villagerSerie === serie);

        // 2. Vérification de l'espèce
        const matchEspece = (espece === 'Toutes') || (h.especes === espece);
        
        // 3. Vérification du texte
        const nomFR = String(h['Nom Français'] || '').toLowerCase();
        const nomEN = String(h['Nom Anglais'] || '').toLowerCase();
        const numero = String(h.numero).toLowerCase();
        
        const matchRecherche = nomFR.includes(texteRecherche) || 
                               nomEN.includes(texteRecherche) || 
                               numero.includes(texteRecherche);

        // L'habitant doit correspondre aux 3 filtres à la fois
        return matchSerie && matchEspece && matchRecherche;
    });
    
    trier(ordreTri);
}

/**
 * Attache les événements
 */
function setupEventListeners() {
    // 1. Écoute des deux menus déroulants (Espèce et Série)
    selectEspece.addEventListener('change', filtrer);
    selectSerie.addEventListener('change', filtrer);
    
    // 2. Boutons de tri
    btnSortNum.addEventListener('click', () => trier('numero'));
    btnSortAlpha.addEventListener('click', () => trier('nom'));
    
    // 3. Recherche en temps réel
    inputRecherche.addEventListener('input', filtrer);
    
    // 4. Vider la recherche avec la touche "Entrée"
    inputRecherche.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            inputRecherche.value = '';
            filtrer(); 
            inputRecherche.blur(); // Enlève le focus de la barre de recherche
        }
    });

    // 5. Action du bouton Réinitialiser
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            // On remet les menus déroulants à zéro
            selectEspece.value = 'Toutes';
            selectSerie.value = 'Toutes';
            
            // On vide la barre de recherche
            inputRecherche.value = '';
            
            // On remet le tri par défaut (Numéro)
            ordreTri = 'numero';
            
            // On relance le filtrage pour mettre à jour l'écran
            filtrer();
        });
    }

    // 6. Apparition du bouton "Remonter" au défilement (scroll)
    window.addEventListener('scroll', () => {
        if (!btnRemonter) return; // Sécurité si le bouton n'existe pas en HTML
        if (window.scrollY > 300) {
            btnRemonter.classList.add('visible');
        } else {
            btnRemonter.classList.remove('visible');
        }
    });

    // 7. Action de remonter tout en haut au clic
    if (btnRemonter) {
        btnRemonter.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Lancement
document.addEventListener('DOMContentLoaded', init);