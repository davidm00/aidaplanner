// app/(tabs)/profile.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Profile Screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa', // light background to help visibility
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // dark text for contrast
  },
});