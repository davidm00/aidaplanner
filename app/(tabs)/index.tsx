import CalendarMonth from '@/components/Calendar/CalendarMonth';
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  Text,
} from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <CalendarMonth />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48,
        padding: 16,
        backgroundColor: '#eef0f3',
      },
    header: { marginBottom: 12, color: '#000000' },
    inputContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    input: { flex: 1 },
    button: { marginTop: 4 },
});