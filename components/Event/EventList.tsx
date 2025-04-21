import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  Text,
  FAB,
  List,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Button,
} from 'react-native-paper';

import { useCalendarStore } from '@/stores/calendarStore';
import EventCard from './EventCard';

type Props = {
  onAddPress: () => void;
};

export default function EventList({ onAddPress }: Props) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const eventsByDate = useCalendarStore((s) => s.eventsByDate);

  const events = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditText(events[index].title);
  };

  const handleUpdate = () => {
    if (selectedDate === null || editingIndex === null || !editText.trim()) return;
    updateEvent(selectedDate, editingIndex, { title: editText.trim() });
    closeModal();
  };

  const handleDelete = () => {
    if (selectedDate === null || editingIndex === null) return;
    deleteEvent(selectedDate, editingIndex);
    closeModal();
  };

  const closeModal = () => {
    setEditingIndex(null);
    setEditText('');
  };

  const toggleComplete = (index: number) => {
    if (selectedDate === null) return;
    const event = events[index];
    updateEvent(selectedDate, index, { completed: !event.completed });
  };

  if (!selectedDate) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.infoText}>Select a day to view events</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {events.length === 0 ? (
        <>
          <Text style={styles.infoText}>No events scheduled for {selectedDate}</Text>
          <FAB icon="plus" label="Add event" onPress={onAddPress} style={styles.fab} />
        </>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.eventTitle}>Events for {selectedDate}</Text>
            <IconButton
              icon="plus"
              size={18}
              onPress={onAddPress}
              style={{ backgroundColor: '#6200ee', borderRadius: 20 }}
              iconColor="#ffffff"
            />
          </View>

          {sortedEvents.map((event, index) => (
            <EventCard
              key={index}
              event={event}
              index={index}
              onToggleComplete={toggleComplete}
              onEdit={startEditing}
            />
          ))}
        </>
      )}

      <Portal>
        <Dialog visible={editingIndex !== null} onDismiss={closeModal}>
          <Dialog.Title>Edit Event</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              label="Event Title"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDelete} textColor="red">Delete</Button>
            <Button onPress={closeModal}>Cancel</Button>
            <Button onPress={handleUpdate}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  infoText: {
    fontStyle: 'italic',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  fab: {
    alignSelf: 'center',
    marginTop: 16,
  },
});
