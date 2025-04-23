import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Modal, Portal, Text, IconButton, Dialog, Button } from 'react-native-paper';

import { CalendarEvent } from '@/stores/models';
import EditEventModal from './EditEventModal';

type Props = {
  visible: boolean;
  event: CalendarEvent | null;
  onDismiss: () => void;
  onDelete: () => void;
  onUpdate: (updatedEvent: CalendarEvent) => void;
};

export default function EventDetailsModal({ 
  visible, 
  event, 
  onDismiss,
  onDelete,
  onUpdate
}: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (event) {
      setCurrentEvent(event);
    }
  }, [event]);

  if (!currentEvent) return null;

  const formatEventDateTime = (date: string, time?: string) => {
    const eventDate = new Date(date);
    const dayOfWeek = eventDate.toLocaleDateString(undefined, { weekday: 'long' });
    const month = eventDate.toLocaleDateString(undefined, { month: 'short' });
    const day = eventDate.getDate();
    
    if (!time) {
      return `${dayOfWeek}, ${month} ${day}`;
    }
    return `${dayOfWeek}, ${month} ${day} ${time}`;
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
    onDismiss();
  };

  const handleUpdate = (updatedEvent: CalendarEvent) => {
    setCurrentEvent(updatedEvent);
    onUpdate(updatedEvent);
    setShowEditModal(false);
  };

  return (
    <Portal>
      <Modal
        visible={visible && !showEditModal}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          { height: Dimensions.get('window').height * 0.9 }
        ]}
      >
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
          />
          <View style={styles.headerActions}>
            <IconButton
              icon="pencil"
              size={24}
              onPress={() => setShowEditModal(true)}
            />
            <IconButton
              icon="delete"
              size={24}
              onPress={() => setShowDeleteConfirm(true)}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.colorStrip, { backgroundColor: currentEvent.label?.color || '#007aff' }]} />
          
          <Text style={styles.title}>{currentEvent.title}</Text>
          
          <View style={styles.detailRow}>
            <IconButton icon="calendar" size={20} />
            <Text style={styles.detailText}>
              {currentEvent.time 
                ? `${formatEventDateTime(currentEvent.date, currentEvent.time)}${currentEvent.endTime ? ` - ${currentEvent.endTime}` : ''}`
                : `${formatEventDateTime(currentEvent.date)} • All day`
              }
            </Text>
          </View>

          {currentEvent.location && (
            <View style={styles.detailRow}>
              <IconButton icon="map-marker-outline" size={20} />
              <Text style={styles.detailText}>{currentEvent.location}</Text>
            </View>
          )}

          {currentEvent.description && (
            <View style={styles.detailRow}>
              <IconButton icon="text" size={20} />
              <Text style={styles.detailText}>{currentEvent.description}</Text>
            </View>
          )}
        </View>
      </Modal>

      <EditEventModal
        visible={showEditModal}
        onDismiss={() => setShowEditModal(false)}
        event={currentEvent}
        onUpdate={handleUpdate}
      />

      <Dialog visible={showDeleteConfirm} onDismiss={() => setShowDeleteConfirm(false)}>
        <Dialog.Title>Delete Event</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.dialogText}>
            Are you sure you want to delete this event? This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onPress={handleDelete} textColor="#ff4d4d">Delete</Button>
        </Dialog.Actions>
      </Dialog>
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
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  colorStrip: {
    height: 3,
    borderRadius: 1.5,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#4a4a4a',
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e6e0d8',
    minHeight: 48,
  },
  detailText: {
    fontSize: 16,
    color: '#4a4a4a',
    flex: 1,
    marginLeft: 8,
    lineHeight: 22,
    alignSelf: 'center',
  },
  dialogContent: {
    backgroundColor: '#faf7f0',
    padding: 20,
    borderRadius: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4a4a4a',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  dialogText: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 20,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e6e0d8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cancelButtonText: {
    color: '#4a4a4a',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  }
}); 