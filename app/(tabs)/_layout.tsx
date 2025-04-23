import { Tabs } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { IconButton, Menu, PaperProvider } from 'react-native-paper';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from 'react-native-paper';
import { useCalendarStore } from '@/stores/calendarStore';
import { generateRandomEvents } from '@/utils/eventGenerator';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [updateKey, setUpdateKey] = useState(0); // Add key for forcing re-render
  const deleteAllEvents = useCalendarStore((s) => s.deleteAllEvents);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  const handleGenerateEvents = useCallback(() => {
    if (!selectedDate) return;
    
    // Clear existing events first
    deleteAllEvents();

    // Generate and add new events
    const events = generateRandomEvents(new Date(selectedDate));
    events.forEach(event => addEvent(event.date, event));
    
    // Force re-render
    setUpdateKey(prev => prev + 1);
    setMenuVisible(false);
  }, [selectedDate, deleteAllEvents, addEvent]);

  const handleDeleteAll = useCallback(() => {
    deleteAllEvents();
    // Force re-render
    setUpdateKey(prev => prev + 1);
    setMenuVisible(false);
  }, [deleteAllEvents]);

  return (
    <PaperProvider>
      <View style={styles.container} key={updateKey}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: true,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            headerLeft: () => (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="menu"
                    size={24}
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item 
                  onPress={handleGenerateEvents} 
                  title="Fill Events" 
                  leadingIcon="calendar-plus"
                />
                <Menu.Item 
                  onPress={handleDeleteAll} 
                  title="Delete All Events" 
                  leadingIcon="delete"
                />
              </Menu>
            ),
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Calendar',
              tabBarIcon: ({ color }) => <Icon source="calendar" size={28} color={color} />,
            }}
          />
          <Tabs.Screen
            name="tasks"
            options={{
              href: null,
              title: 'Tasks',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="checkmark.circle" color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
