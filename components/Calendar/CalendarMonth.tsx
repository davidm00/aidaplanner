import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { generateCalendarMatrix } from '@/utils/calendar';
import { dayNames } from '@/constants/DataConstants';
import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarEvent } from '@/stores/models';

import EventList from '../Event/EventList';
import EventModal from '../Event/EventModal';
import { FAB } from 'react-native-paper';

// function formatDateKey(date: Date) {
//   return date.toLocaleDateString(undefined, {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });
// }

function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0]; // → "2025-04-24"
}


export default function CalendarMonth() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const getEventsForDate = useCalendarStore((s) => s.getEventsForDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayKey = formatDateKey(new Date());
  const matrix = generateCalendarMatrix(year, month);

  const goPrev = () => {
    setCurrentDate(new Date(year, month - 1));
    setSelectedDate(null); // 👈 clear selected day
  };
  
  const goNext = () => {
    setCurrentDate(new Date(year, month + 1));
    setSelectedDate(null); // 👈 clear selected day
  };

  const handleSelectDate = (day: number) => {
    // Clear selected date if the same day is clicked again
    if (selectedDate === formatDateKey(new Date(year, month, day))) {
      setSelectedDate(null);
      return;
    }
    const selected = new Date(year, month, day);
    setSelectedDate(formatDateKey(selected));
  };

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const renderDots = (events: CalendarEvent[]) => {
    const dots = events.slice(0, 3); // limit to 3
  
    return (
      <View style={styles.dotContainer}>
        {dots.map((event, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: event.label?.color || '#007aff' },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrev}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {currentDate.toLocaleString('default', { month: 'long' })} {year}
        </Text>
        <TouchableOpacity onPress={goNext}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.weekRow}>
        {dayNames.map((day) => (
          <Text key={day} style={styles.dayName}>{day}</Text>
        ))}
      </View>

      {/* Day Grid */}
      {matrix.map((week, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {week.map((day, colIndex) => {
            if (!day) return <View key={colIndex} style={styles.dayCell} />;

            const dateKey = formatDateKey(new Date(year, month, day));
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate;
            const events = getEventsForDate(dateKey);

            return (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.dayCell,
                  isToday && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() => handleSelectDate(day)}
                onLongPress={() => {
                  handleSelectDate(day);
                  openModal();
                }}
              >
                <Text style={styles.dayText}>{day}</Text>
                {events.length > 0 && renderDots(events)}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Event List */}
      <EventList
          onAddPress={openModal}
      />

      {/* Add Event Modal */}
      <EventModal
        visible={isModalVisible}
        onDismiss={closeModal}
      />

      {/* Global FAB */}
      <FAB
        icon="plus"
        onPress={openModal}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navButton: {
    fontSize: 24,
    paddingHorizontal: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: 4,
  },
  dayCell: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
  },
  todayCell: {
    backgroundColor: '#e0f7ff',
  },
  selectedCell: {
    backgroundColor: '#cce5ff',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#007aff',
  },
});
