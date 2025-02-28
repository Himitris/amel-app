// Ajoutons un fichier de thème pour centraliser les couleurs et le style
// constants/theme.ts

export const COLORS = {
    primary: '#8B5FBF', // Violet professionnel pour une coiffeuse
    primaryLight: '#D7BBF5',
    secondary: '#ECA0C1', // Rose pour accentuation
    accent: '#FFD9ED', // Rose pâle pour fond
    success: '#4CAF50',
    error: '#FF5252',
    warning: '#FFC107',
    info: '#2196F3',
    dark: '#1C1C1E',
    darkGray: '#3A3A3C',
    gray: '#8E8E93',
    lightGray: '#C7C7CC',
    veryLightGray: '#E5E5EA',
    background: '#FFFFFF',
    card: '#F8F8F8'
  };
  
  export const FONTS = {
    regular: {
      fontFamily: 'System',
      fontWeight: '400'
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500'
    },
    semiBold: {
      fontFamily: 'System',
      fontWeight: '600'
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700'
    }
  };
  
  export const SIZES = {
    // Global sizes
    base: 8,
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
    
    // Font sizes
    caption: 12,
    button: 14,
    body: 16,
    title: 18,
    h3: 20,
    h2: 24,
    h1: 32
  };
  
  export const SHADOWS = {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  };
  
  export default { COLORS, FONTS, SIZES, SHADOWS };