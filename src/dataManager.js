import rawData from '../toutleshabitants.json';

/**
 * Filtre et nettoie les données brutes du JSON (retire les lignes vides et entêtes de colonnes)
 * @returns {Array} Liste des habitants valides
 */
export function getCleanData() {
    return rawData.filter(item => {
        const num = String(item.numero || '').trim().toLowerCase();
        return num !== '' && num !== 'numero' && num !== 'colonne 1';
    });
}

/**
 * Génère le chemin d'accès vers l'image WebP de l'habitant
 * @param {string|number} num Numéro d'identification unique
 * @returns {string} Chemin de l'image
 */
export function getImagePath(num) {
    let strNum = String(num).trim();
    
    // Si c'est uniquement des chiffres, on formate avec des zéros devant (ex: 001)
    if (/^\d+$/.test(strNum)) {
        return '/images/' + strNum.padStart(3, '0') + '.webp';
    }
    
    // Si c'est un format de carte spéciale (W01, S05, etc.)
    return '/images/' + strNum + '.webp';
}
