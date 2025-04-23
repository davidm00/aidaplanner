import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

import { generateCalendarMatrix } from '@/utils/calendar';
import { dayNames } from '@/constants/DataConstants';
import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarEvent } from '@/stores/models';

import EventList from '../Event/EventList';
import AddEventModal from '../Event/AddEventModal';

function formatDateKey(date: Date) {
  return date.toISOString().split('T')[0]; // → "2025-04-24"
}

export default function CalendarMonth() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [calendarHeightAnim] = useState(new Animated.Value(1));

  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const eventsByDate = useCalendarStore((s) => s.eventsByDate);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleSelectDate = (date: Date) => {
    const newDate = new Date(date);
    setSelectedDate(formatDateKey(newDate));
    // Only update currentDate if we're not in expanded mode or if the date is in the current week
    if (!isListExpanded || 
        (date >= startOfWeek(currentDate) && date <= endOfWeek(currentDate))) {
      setCurrentDate(newDate);
    }
  };

  const handlePrevious = () => {
    if (isListExpanded) {
      const newDate = subWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDate(formatDateKey(newDate));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (isListExpanded) {
      const newDate = addWeeks(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDate(formatDateKey(newDate));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const handleToggleExpand = useCallback(() => {
    setIsListExpanded(prev => !prev);
    if (!selectedDate) {
      setSelectedDate(formatDateKey(currentDate));
    } else {
      // When expanding, ensure we're showing the week of the selected date
      const selectedDateObj = new Date(selectedDate);
      setCurrentDate(selectedDateObj);
    }
  }, [selectedDate, currentDate]);

  const animatedCalendarHeight = calendarHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['30%', '50%'],
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Generate calendar matrix
  const matrix = useMemo(() => {
    if (isListExpanded) {
      // In week view, generate only the current week
      const weekDates = [];
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Ensure week starts on Sunday
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
      }
      
      return [weekDates];
    }

    // Month view logic
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay(); // 0 = Sunday
    const lastDate = lastDay.getDate();

    const weeks = [];
    let week = new Array(7).fill(null);
    let dayCounter = 1;

    // Fill in the first week
    for (let i = 0; i < startingDay; i++) {
      const prevMonthDate = new Date(year, month, -startingDay + i + 1);
      week[i] = null;
    }
    for (let i = startingDay; i < 7; i++) {
      const date = new Date(year, month, dayCounter);
      week[i] = date;
      dayCounter++;
    }
    weeks.push(week);

    // Fill in the rest of the weeks
    week = [];
    while (dayCounter <= lastDate) {
      for (let i = 0; i < 7; i++) {
        if (dayCounter <= lastDate) {
          const date = new Date(year, month, dayCounter);
          week[i] = date;
          dayCounter++;
        } else {
          week[i] = null;
        }
        if (i === 6) {
          weeks.push(week);
          week = [];
        }
      }
    }
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return weeks;
  }, [year, month, isListExpanded, currentDate]);

  const getEventsForDate = (dateKey: string) => {
    return eventsByDate[dateKey] || [];
  };

  const renderDots = (events: any[]) => {
    const maxDots = 3;
    const dots = events.slice(0, maxDots);

    return (
      <View style={styles.dotContainer}>
        {dots.map((event, index) => (
          <View
            key={index}
            style={[styles.dot, { backgroundColor: event.label?.color || '#007aff' }]}
          />
        ))}
        {events.length > maxDots && (
          <Text style={styles.moreDots}>+{events.length - maxDots}</Text>
        )}
      </View>
    );
  };

  const headerTitle = isListExpanded
    ? `${startOfWeek(currentDate).toLocaleString('default', { month: 'long' })} ${startOfWeek(currentDate).getDate()}-${
        endOfWeek(currentDate).getDate()
      }, ${year}`
    : `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

  return (
    <View style={styles.container}>
      <View style={[
        styles.calendarSection,
        isListExpanded && styles.calendarSectionCompact
      ]}>
        {/* Month/Week Navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevious} style={styles.navButtonContainer}>
            <Text style={styles.navButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{headerTitle}</Text>
          <TouchableOpacity onPress={handleNext} style={styles.navButtonContainer}>
            <Text style={styles.navButton}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.weekRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Text key={index} style={styles.dayName}>
              {day}
            </Text>
          ))}
        </View>

        {/* Day Grid */}
        <View style={styles.calendar}>
          {matrix.map((week, rowIndex) => (
            <View key={rowIndex} style={styles.weekRow}>
              {week.map((date, colIndex) => {
                if (!date) return <View key={colIndex} style={styles.dayCell} />;

                const dateKey = formatDateKey(date);
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const events = getEventsForDate(dateKey);
                const day = date.getDate();

                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.dayCell,
                      isToday && styles.todayCell,
                      isSelected && styles.selectedCell,
                    ]}
                    onPress={() => handleSelectDate(date)}
                    onLongPress={() => {
                      handleSelectDate(date);
                      openModal();
                    }}
                  >
                    <Text style={[
                      styles.dayText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedText,
                    ]}>{day}</Text>
                    {events.length > 0 && renderDots(events)}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Event List */}
      <View style={styles.eventListSection}>
        <EventList 
          onAddPress={openModal}
          expanded={isListExpanded}
          onToggleExpand={handleToggleExpand}
        />
      </View>

      {/* Add Event Modal */}
      <AddEventModal
        visible={isModalVisible}
        onDismiss={closeModal}
      />

      {/* Global FAB */}
      <FAB
        icon="plus"
        onPress={openModal}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  calendarSection: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  calendarSectionCompact: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventListSection: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: 1,
  },
  navButtonContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  navButton: {
    fontSize: 22,
    color: '#666666',
    fontWeight: '300',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  dayName: {
    width: 36,
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 4,
    color: '#999999',
    fontSize: 13,
  },
  dayCell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 4,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '400',
  },
  todayCell: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  selectedCell: {
    backgroundColor: '#f0f7ff',
    borderWidth: 0,
  },
  todayText: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  selectedText: {
    color: '#1a73e8',
    fontWeight: '500',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
    opacity: 0.8,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1a73e8',
  },
  moreDots: {
    fontSize: 10,
    fontWeight: '400',
    color: '#666666',
  },
  calendar: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#1a73e8',
  },
});
