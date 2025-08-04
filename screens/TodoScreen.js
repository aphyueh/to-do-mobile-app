import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TODOS = gql`
  query Todos($userId: ID!) {
    todos(userId: $userId) {
      id
      text
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($userId: ID!, $text: String!) {
    addTodo(userId: $userId, text: $text) {
      id
      text
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

export default function TodoScreen() {
  const [userId, setUserId] = useState(null);
  const [text, setText] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setUserId);
  }, []);

  const { data, refetch } = useQuery(GET_TODOS, {
    variables: { userId },
    skip: !userId,
  });

  const [addTodo] = useMutation(ADD_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);

  const handleAdd = async () => {
    await addTodo({ variables: { userId, text } });
    setText('');
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteTodo({ variables: { id } });
    refetch();
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="New to-do" value={text} onChangeText={setText} />
      <Button title="Add" onPress={handleAdd} />
      <FlatList
        data={data?.todos || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text>{item.text}</Text>
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  todoItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
});
