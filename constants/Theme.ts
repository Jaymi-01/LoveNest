export const Colors = {
  background: '#FFF9F5', // Soft Peach Cream
  surface: '#FFFFFF',
  primary: '#F08080', // Soft Coral (Warm & Alive)
  accent: '#FFD1B3', // Muted Apricot
  text: '#5D4037', // Warm Cocoa Brown
  textSecondary: '#A1887F', // Soft Clay
  border: 'rgba(240, 128, 128, 0.2)',
};

export const Theme = {
  colors: Colors,
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(240, 128, 128, 0.1)',
    overflow: 'hidden' as const,
  },
  shadow: {
    shadowColor: '#F08080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
