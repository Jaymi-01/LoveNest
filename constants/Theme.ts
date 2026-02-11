export const Colors = {
  background: '#0F0505', // Blackberry Jam
  surface: 'rgba(45, 10, 10, 0.4)', // Translucent Deep Burgundy
  primary: '#E94E77', // Muted Raspberry
  accent: '#FFB7C5', // Pale Rose (Soft Glow)
  text: '#FFFFFF',
  textSecondary: '#FFB7C5',
  border: 'rgba(233, 78, 119, 0.2)',
};

export const Theme = {
  colors: Colors,
  glass: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  shadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
};
