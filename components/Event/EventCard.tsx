import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, IconButton } from 'react-native-paper';
import { CalendarEvent } from '@/stores/models';

type Props = {
  event: CalendarEvent;
  index: number;
  onToggleComplete: (index: number) => void;
  onEdit: (index: number) => void;
};

export default function EventCard({ event, index, onToggleComplete, onEdit }: Props) {
  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: event.label?.color || '#007aff' },
      ]}
    >
      <List.Item
        title={event.title}
        description={event.time}
        onPress={() => onToggleComplete(index)}
        onLongPress={() => onEdit(index)}
        left={(props) => (
          <List.Icon
            {...props}
            icon={event.completed ? 'check-circle' : 'checkbox-blank-circle-outline'}
          />
        )}
        right={(props) => (
          <IconButton
            {...props}
            icon="pencil"
            onPress={() => onEdit(index)}
          />
        )}
        titleStyle={{
          textDecorationLine: event.completed ? 'line-through' : 'none',
          color: event.completed ? 'gray' : 'black',
        }}
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 6,
  },
});
