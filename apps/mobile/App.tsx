import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { colors } from './src/constants/theme';
import { fr } from './src/locales/fr'; // Note: In a real app we'd use i18n-js or similar, just importing to show structure.
import { en as enDict } from './src/locales/en';

export default function App() {
  const scheme = useColorScheme() ?? 'light';
  const theme = colors[scheme];
  const lang = 'fr'; // Hardcoded for demo of structure
  const t = lang === 'fr' ? fr : enDict;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>{t.welcome}</Text>
      <Text style={{ color: theme.text }}>{t.foundation_ready}</Text>
    </View>
  );
}
