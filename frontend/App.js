import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import './ui/i18n';
import SearchScreen from './ui/SearchScreen';
import { colors } from './ui/theme';

export default function App() {
  return (
    <View style={styles.root}>
      <SearchScreen />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
