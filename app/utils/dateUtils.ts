// utils/dateUtils.ts

/**
 * Obtient l'heure ronde suivante (sans minutes)
 * Par exemple, si l'heure actuelle est 15:03, retourne 16:00
 */
export const getNextRoundHour = (date = new Date()): Date => {
    const result = new Date(date);
    
    // Avance d'une heure
    result.setHours(result.getHours() + 1);
    
    // Mettre les minutes et secondes à zéro pour avoir une heure ronde
    result.setMinutes(0);
    result.setSeconds(0);
    result.setMilliseconds(0);
    
    return result;
  };
  
  /**
   * Ajoute un nombre de minutes à une date
   */
  export const addMinutesToDate = (date: Date, minutes: number): Date => {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  };
  
  /**
   * Génère une date de fin à partir d'une date de début et d'une durée en minutes
   */
  export const calculateEndTime = (startDate: Date, durationMinutes: number): Date => {
    return addMinutesToDate(startDate, durationMinutes);
  };
  
  /**
   * Formate une heure au format HH:MM
   */
  export const formatTimeToHHMM = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  /**
   * Formate une durée en minutes en un texte lisible
   */
  export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h${remainingMinutes}`;
    }
  };
  
  // Objet par défaut contenant toutes les fonctions
  const dateUtils = {
    getNextRoundHour,
    addMinutesToDate,
    calculateEndTime,
    formatTimeToHHMM,
    formatDuration
  };
  
  export default dateUtils;