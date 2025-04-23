import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, IconButton, Surface, HelperText } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarEvent } from '@/stores/models';

const LABEL_COLORS = [
  { name: 'Red', color: '#ff4d4d' },
  { name: 'Orange', color: '#ffa500' },
  { name: 'Blue', color: '#007aff' },
  { name: 'Green', color: '#28a745' },
  { name: 'Pink', color: '#e91e63' },
  { name: 'Purple', color: '#9c27b0' },
  { name: 'Teal', color: '#009688' },
  { name: 'Brown', color: '#795548' },
];

type Props = {
  visible: boolean;
  onDismiss: () => void;
  event?: CalendarEvent;
  isEditing?: boolean;
};

type TimePickerMode = 'start' | 'end';

export default function AddEventModal({ visible, onDismiss, event, isEditing = false }: Props) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const eventsByDate = useCalendarStore((s) => s.eventsByDate);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
  });
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[2]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<TimePickerMode>('start');
  const [isAllDay, setIsAllDay] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (isEditing && event) {
        // Set form values from existing event
        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location || '');
        setEventDate(new Date(event.date));
        setIsAllDay(!event.time);
        
        if (event.time) {
          const [startHours, startMinutes] = event.time.split(':').map(Number);
          const startDate = new Date();
          startDate.setHours(startHours);
          startDate.setMinutes(startMinutes);
          setStartTime(startDate);
          setStartTimeStr(event.time);

          if (event.endTime) {
            const [endHours, endMinutes] = event.endTime.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(endHours);
            endDate.setMinutes(endMinutes);
            setEndTime(endDate);
            setEndTimeStr(event.endTime);
          }
        }

        if (event.label) {
          const color = LABEL_COLORS.find(c => c.color === event.label?.color) || LABEL_COLORS[2];
          setSelectedColor(color);
        }
      } else {
        // Reset form for new event
        setTitle('');
        setDescription('');
        setLocation('');
        setEventDate(selectedDate ? new Date(selectedDate) : new Date());
        const now = new Date();
        setStartTime(now);
        const oneHourLater = new Date(now);
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        setEndTime(oneHourLater);
        setStartTimeStr('');
        setEndTimeStr('');
        setSelectedColor(LABEL_COLORS[2]);
        setShowDatePicker(false);
        setShowTimePicker(false);
        setIsAllDay(false);
        setTimeError(null);
      }
    }
  }, [visible, selectedDate, isEditing, event]);

  const validateTimes = (start: Date, end: Date): boolean => {
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    
    if (endMinutes <= startMinutes) {
      setTimeError('End time must be after start time');
      return false;
    }
    
    setTimeError(null);
    return true;
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (!isAllDay && !validateTimes(startTime, endTime)) return;

    const newEvent = {
      title: title.trim(),
      date: eventDate.toISOString().split('T')[0],
      time: isAllDay ? undefined : startTimeStr,
      endTime: isAllDay ? undefined : endTimeStr,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      completed: false,
      label: {
        name: selectedColor.name,
        color: selectedColor.color,
      },
    };

    if (isEditing && event) {
      const events = eventsByDate[event.date] || [];
      const eventIndex = events.findIndex(e => e.title === event.title);
      if (eventIndex !== -1) {
        updateEvent(event.date, eventIndex, newEvent);
      }
    } else {
      addEvent(newEvent);
    }

    onDismiss();
  };

  const handleTimeConfirm = (time: Date) => {
    setShowTimePicker(false);
    
    // Round to nearest 5 minutes
    const minutes = time.getMinutes();
    const roundedMinutes = Math.round(minutes / 5) * 5;
    time.setMinutes(roundedMinutes);
    
    if (timePickerMode === 'start') {
      setStartTime(time);
      const formatted = time.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setStartTimeStr(formatted);
      
      // Validate against existing end time
      validateTimes(time, endTime);
    } else {
      setEndTime(time);
      const formatted = time.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setEndTimeStr(formatted);
      
      // Validate against existing start time
      validateTimes(startTime, time);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          { height: Dimensions.get('window').height * 0.9 }
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
              />
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={!title.trim() || (!isAllDay && !!timeError)}
                style={styles.saveButton}
              >
                Save
              </Button>
            </View>
          </View>

          <ScrollView style={styles.content}>
            <TextInput
              placeholder="Add title"
              value={title}
              onChangeText={setTitle}
              mode="flat"
              style={styles.titleInput}
              theme={{ 
                colors: { 
                  primary: selectedColor.color, 
                  text: '#000000', 
                  placeholder: '#757575',
                  onSurfaceVariant: '#000000'
                } 
              }}
              textColor="#000000"
              placeholderTextColor="#757575"
            />

            <View style={styles.timeSection}>
              <TouchableOpacity
                style={styles.allDayRow}
                onPress={() => {
                  setIsAllDay(!isAllDay);
                  setTimeError(null);
                }}
              >
                <Text style={styles.rowText}>All-day</Text>
                <IconButton
                  icon={isAllDay ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  onPress={() => {
                    setIsAllDay(!isAllDay);
                    setTimeError(null);
                  }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => setShowDatePicker(true)}
              >
                <IconButton icon="calendar" size={24} />
                <Text style={styles.rowText}>
                  {eventDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
              </TouchableOpacity>

              {!isAllDay && (
                <>
                  <TouchableOpacity
                    style={styles.dateTimeRow}
                    onPress={() => {
                      setTimePickerMode('start');
                      setShowTimePicker(true);
                    }}
                  >
                    <IconButton icon="clock-outline" size={24} />
                    <Text style={styles.rowText}>
                      {startTimeStr || 'Start time'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeRow}
                    onPress={() => {
                      setTimePickerMode('end');
                      setShowTimePicker(true);
                    }}
                  >
                    <IconButton icon="clock-check-outline" size={24} />
                    <Text style={styles.rowText}>
                      {endTimeStr || 'End time'}
                    </Text>
                  </TouchableOpacity>

                  {timeError && (
                    <HelperText type="error" visible={true}>
                      {timeError}
                    </HelperText>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity style={styles.row}>
              <IconButton icon="map-marker-outline" size={24} />
              <TextInput
                placeholder="Add location"
                value={location}
                onChangeText={setLocation}
                mode="flat"
                style={styles.rowInput}
                placeholderTextColor="#757575"
                theme={{ 
                  colors: { 
                    text: '#000000',
                    onSurfaceVariant: '#000000'
                  } 
                }}
                textColor="#000000"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <IconButton icon="text" size={24} />
              <TextInput
                placeholder="Add description"
                value={description}
                onChangeText={setDescription}
                mode="flat"
                multiline
                style={styles.rowInput}
                placeholderTextColor="#757575"
                theme={{ 
                  colors: { 
                    text: '#000000',
                    onSurfaceVariant: '#000000'
                  } 
                }}
                textColor="#000000"
              />
            </TouchableOpacity>

            <Surface style={styles.colorPicker}>
              {LABEL_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.name}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.color },
                    selectedColor.color === color.color && styles.selectedColor,
                  ]}
                />
              ))}
            </Surface>
          </ScrollView>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={(date) => {
              setShowDatePicker(false);
              setEventDate(date);
            }}
            onCancel={() => setShowDatePicker(false)}
            date={eventDate}
            modalStyleIOS={{
              alignItems: 'center'
            }}
          />

          <DateTimePickerModal
            isVisible={showTimePicker}
            mode="time"
            onConfirm={handleTimeConfirm}
            onCancel={() => setShowTimePicker(false)}
            date={timePickerMode === 'start' ? startTime : endTime}
            minuteInterval={5}
            modalStyleIOS={{
              alignItems: 'center'
            }}
          />
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#faf7f0',
    position: 'absolute',
    left: 20,
    right: 20,
    top: '10%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e0d8',
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#b7ada3',
    borderRadius: 16,
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    backgroundColor: '#ffffff',
    fontSize: 20,
    marginBottom: 24,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e6e0d8',
    color: '#4a4a4a',
    elevation: 0,
  },
  timeSection: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e6e0d8',
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e0d8',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6e0d8',
  },
  rowInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#4a4a4a',
    paddingHorizontal: 4,
  },
  rowText: {
    fontSize: 16,
    color: '#4a4a4a',
    flex: 1,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#e6e0d8',
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    margin: 4,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#4a4a4a',
  },
  helperText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  }
});
