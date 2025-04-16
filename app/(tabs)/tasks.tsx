import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  TextInput,
  Button,
  List,
  Text,
  Dialog,
  Portal,
  IconButton,
} from 'react-native-paper';

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState('');

  const addTask = () => {
    if (!text.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now(), title: text.trim(), completed: false },
    ]);
    setText('');
  };

  const toggleComplete = (id: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditText(task.title);
  };

  const updateTask = () => {
    if (!editingTask || !editText.trim()) return;
    setTasks(prev =>
      prev.map(task =>
        task.id === editingTask.id ? { ...task, title: editText.trim() } : task
      )
    );
    closeModal();
  };

  const deleteTask = () => {
    if (!editingTask) return;
    setTasks(prev => prev.filter(task => task.id !== editingTask.id));
    closeModal();
  };

  const closeModal = () => {
    setEditingTask(null);
    setEditText('');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>Tasks</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add new task..."
          mode="outlined"
          style={styles.input}
        />
        <Button mode="contained" onPress={addTask} style={styles.button}>
          Add
        </Button>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            onPress={() => toggleComplete(item.id)}
            onLongPress={() => openEditModal(item)}
            left={props => (
              <List.Icon
                {...props}
                icon={item.completed ? 'check-circle' : 'checkbox-blank-circle-outline'}
              />
            )}
            right={props => (
              <IconButton
                {...props}
                icon="pencil"
                onPress={() => openEditModal(item)}
              />
            )}
            titleStyle={{
              textDecorationLine: item.completed ? 'line-through' : 'none',
              color: item.completed ? 'gray' : undefined,
            }}
          />
        )}
      />

      <Portal>
        <Dialog visible={!!editingTask} onDismiss={closeModal}>
          <Dialog.Title>Edit Task</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              mode="outlined"
              label="Task Title"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={deleteTask} textColor="red">Delete</Button>
            <Button onPress={closeModal}>Cancel</Button>
            <Button onPress={updateTask}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 48, // ← adjust as needed
        padding: 16,
        backgroundColor: '#eef0f3', // light background to help visibility
      },
    header: { marginBottom: 12 },
    inputContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    input: { flex: 1 },
    button: { marginTop: 4 },
});
