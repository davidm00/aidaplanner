import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable, KeyboardAvoidingView } from 'react-native';
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useCalendarStore } from '@/stores/calendarStore';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export default function EventModal({ visible, onDismiss }: Props) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const addEvent = useCalendarStore((s) => s.addEvent);

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [timeValue, setTimeValue] = useState(new Date());
  const [eventTime, setEventTime] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle('');
      setEventDate(selectedDate ? new Date(selectedDate) : new Date());
    }
  }, [visible, selectedDate]);

  const handleSave = () => {
    if (!title.trim()) return;
  
    const labelColors = ['#ff4d4d', '#ffa500', '#007aff', '#28a745', '#e91e63'];
    const randomColor =
      labelColors[Math.floor(Math.random() * labelColors.length)];
  
      addEvent({
        title: title.trim(),
        date: eventDate.toISOString().split('T')[0],
        time: eventTime || undefined,
        completed: false,
        label: {
          name: 'Basic',
          color: randomColor,
        },
      });      
  
    setTitle('');
    onDismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.container}
        >
          <Text style={styles.modalTitle}>Create new event</Text>

          <TextInput
            label="Event Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          {Platform.OS === 'web' ? (
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={eventDate.toISOString().split('T')[0]}
              onChangeText={(text) => setEventDate(new Date(text))}
              mode="outlined"
              style={styles.input}
            />
          ) : (
            <>
              <Text style={styles.pickerLabel}>Event Date</Text>
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  if (date) setEventDate(new Date(date));
                }}
                style={styles.datePicker}
              />
            </>
          )}

          <Text style={styles.pickerLabel}>Time</Text>

            {Platform.OS === 'web' ? (
              <TextInput
                label="Time (HH:mm)"
                value={eventTime}
                onChangeText={setEventTime}
                mode="outlined"
                style={styles.input}
            />
            ) : (
              <DateTimePicker
                value={timeValue}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour={false}
                onChange={(_, selectedTime) => {
                  if (selectedTime) {
                    setTimeValue(selectedTime);

                    const formatted = selectedTime.toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    });

                    setEventTime(formatted);
                  }
                }}
              />
            )}

          <Button 
            mode="contained"
            onPress={handleSave} 
            style={styles.button}
            disabled={!title.trim()}
          >
            Save Event
          </Button>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 24,
    padding: 20,
    backgroundColor: '#444444',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#ccc',
  },
  datePicker: {
    marginBottom: 12,
  },
});
