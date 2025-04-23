import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Text,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Button,
  Surface,
} from 'react-native-paper';

import { useCalendarStore } from '@/stores/calendarStore';
import { CalendarEvent } from '@/stores/models';
import EventDetailsModal from './EventDetailsModal';

type Props = {
  onAddPress: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // Height of each hour row in pixels
const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = 24 * 60;
const TIMELINE_START = 0;
const TIMELINE_END = MINUTES_IN_DAY;

interface EventWithLayout extends CalendarEvent {
  column: number;
  totalColumns: number;
  startMinute: number;
  endMinute: number;
  top?: number; // Optional for timed events
}

const DEBUG = false; // Set to true to show time debug info

// Convert time to pixels for positioning
const getTimePosition = (minutes: number) => {
  return (minutes / 60) * HOUR_HEIGHT;
};

// Convert duration to height
const getDurationHeight = (durationInMinutes: number) => {
  return (durationInMinutes / 60) * HOUR_HEIGHT;
};

export default function EventList({ onAddPress, expanded, onToggleExpand }: Props) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const eventsByDate = useCalendarStore((s) => s.eventsByDate);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const events = selectedDate ? eventsByDate[selectedDate] || [] : [];
  
  // Calculate event layout including overlaps
  const eventsWithLayout = useMemo(() => {
    // First, handle all-day events
    const allDayEvents = events
      .filter(event => !event.time)
      .map((event, index) => ({
        ...event,
        startMinute: -1,
        endMinute: -1,
        column: 0,
        totalColumns: 1,
        top: index * 60 // Stack all-day events with 60px height each
      })) as EventWithLayout[];

    // Then handle timed events
    const timeEvents = events
      .filter(event => event.time)
      .map(event => {
        // Parse time strings considering AM/PM format
        const parseTimeString = (timeStr: string) => {
          // Handle cases where the time includes AM/PM
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (!match) return 0;

          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const period = match[3]?.toUpperCase();

          // Convert to 24-hour format
          if (period === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }

          return hours * 60 + minutes;
        };

        const startMinute = parseTimeString(event.time!);
        let endMinute = startMinute + 60; // Default 1 hour duration
        
        if (event.endTime) {
          endMinute = parseTimeString(event.endTime);
        }

        return {
          ...event,
          startMinute,
          endMinute,
          column: 0,
          totalColumns: 1,
          top: undefined
        } as EventWithLayout;
      })
      .sort((a, b) => a.startMinute - b.startMinute);

    // Group overlapping events
    const groups: EventWithLayout[][] = [];
    let currentGroup: EventWithLayout[] = [];

    timeEvents.forEach(event => {
      if (currentGroup.length === 0) {
        currentGroup.push(event);
        return;
      }

      const lastEvent = currentGroup[currentGroup.length - 1];
      if (event.startMinute < lastEvent.endMinute) {
        currentGroup.push(event);
      } else {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [event];
      }
    });
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Assign columns within each group
    groups.forEach(group => {
      const totalColumns = group.length;
      group.forEach((event, index) => {
        event.column = index;
        event.totalColumns = totalColumns;
      });
    });

    return [...allDayEvents, ...timeEvents.flat()];
  }, [events]);

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    if (!selectedDate) return;
    const events = eventsByDate[selectedDate] || [];
    const eventIndex = events.findIndex(e => e.title === selectedEvent?.title);
    if (eventIndex !== -1) {
      updateEvent(selectedDate, eventIndex, updatedEvent);
    }
  };

  const handleEventDelete = () => {
    if (!selectedDate || !selectedEvent) return;
    const events = eventsByDate[selectedDate] || [];
    const eventIndex = events.findIndex(e => e.title === selectedEvent.title);
    if (eventIndex !== -1) {
      deleteEvent(selectedDate, eventIndex);
    }
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${period}`;
  };

  if (!selectedDate) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.infoText}>Select a day to view events</Text>
      </View>
    );
  }

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDate = selectedDateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerContainer}>
        <Text style={styles.dateHeader}>{formattedDate}</Text>
        <IconButton
          icon={expanded ? 'chevron-down' : 'chevron-up'}
          size={24}
          onPress={onToggleExpand}
        />
      </View>
      
      {events.length === 0 ? (
        <Text style={styles.infoText}>No events scheduled for today</Text>
      ) : (
        <ScrollView 
          style={styles.timelineContainer}
          contentContainerStyle={styles.timelineContentContainer}
        >
          {/* All-day events section */}
          <View style={styles.allDaySection}>
            <View style={styles.allDayHeader}>
              <Text style={styles.allDayHeaderText}>ALL DAY</Text>
            </View>
            {eventsWithLayout
              .filter(event => event.startMinute === -1)
              .map((event, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleEventPress(event)}
                >
                  <View
                    style={[
                      styles.eventCard,
                      styles.allDayEvent,
                      {
                        backgroundColor: '#ffffff',
                        borderLeftColor: event.label?.color || '#007aff',
                        marginBottom: 8,
                      }
                    ]}
                  >
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventTime}>All day</Text>
                    {event.location && (
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        📍 {event.location}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            <View style={styles.allDaySeparator} />
          </View>

          {/* Timed events section */}
          <View style={styles.timeline}>
            <View style={styles.hourContainer}>
              {HOURS.map((hour) => (
                <View key={hour} style={styles.hourRow}>
                  <View style={styles.hourLabelContainer}>
                    <Text style={styles.hourLabel}>{formatTime(hour)}</Text>
                  </View>
                  <View style={styles.hourLine} />
                </View>
              ))}
            </View>

            {eventsWithLayout
              .filter(event => event.startMinute !== -1)
              .map((event, index) => {
                const topPosition = getTimePosition(event.startMinute);
                const heightValue = getDurationHeight(event.endMinute - event.startMinute);
                const columnWidth = 100 / event.totalColumns;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleEventPress(event)}
                  >
                    <View
                      style={[
                        styles.eventCard,
                        {
                          position: 'absolute',
                          top: topPosition,
                          height: heightValue,
                          left: `${event.column * (92 / event.totalColumns)}%`,
                          width: `${92 / event.totalColumns}%`,
                          backgroundColor: '#ffffff',
                          borderLeftColor: event.label?.color || '#007aff',
                        } as const
                      ]}
                    >
                      <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">
                        {event.title}
                      </Text>
                      <Text style={styles.eventTime} numberOfLines={1} ellipsizeMode="tail">
                        {event.time}
                        {event.endTime ? ` - ${event.endTime}` : ''}
                      </Text>
                      {event.location && (
                        <Text style={styles.eventLocation} numberOfLines={1} ellipsizeMode="tail">
                          📍 {event.location}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        </ScrollView>
      )}

      <EventDetailsModal
        visible={showEventDetails}
        event={selectedEvent}
        onDismiss={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
        onDelete={handleEventDelete}
        onUpdate={handleEventUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '500',
    padding: 16,
    color: '#333333',
    flex: 1,
    letterSpacing: 0.5,
  },
  infoText: {
    fontStyle: 'normal',
    color: '#999999',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  timelineContainer: {
    flex: 1,
  },
  timelineContentContainer: {
    paddingBottom: 120,
  },
  timeline: {
    flex: 1,
    position: 'relative',
    minHeight: HOUR_HEIGHT * 24,
    paddingLeft: 60,
  },
  hourContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: HOUR_HEIGHT * 24
  },
  hourRow: {
    flexDirection: 'row',
    height: HOUR_HEIGHT,
    alignItems: 'flex-start',
  },
  hourLabelContainer: {
    position: 'absolute',
    left: 0,
    width: 60,
    paddingRight: 8,
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    height: HOUR_HEIGHT,
    zIndex: 2,
  },
  hourLabel: {
    color: '#999999',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  hourLine: {
    position: 'absolute',
    left: 60,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 8,
  },
  eventCard: {
    minHeight: 40,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderLeftWidth: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    zIndex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '100%',
  },
  allDaySection: {
    backgroundColor: '#ffffff',
    paddingTop: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  allDayHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  allDayHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 0.5,
  },
  allDayEvent: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#fafafa',
  },
  allDaySeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 8,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  eventTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 1,
    letterSpacing: 0.2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666666',
    marginTop: 1,
    letterSpacing: 0.2,
  },
});
