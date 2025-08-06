import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TODOS = gql`
  query Todos($userId: ID!) {
    todos(userId: $userId) {
      id
      text
      completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($userId: ID!, $text: String!) {
    addTodo(userId: $userId, text: $text) {
      id
      text
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodoCompleted($id: ID!) {
    toggleTodoCompleted(id: $id) {
      id
      completed
    }
  }
`;

const TodoPage = () => {
  const [userId, setUserId] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const navigation = useNavigation();
  
  const [addTodoMutation] = useMutation(ADD_TODO);
  const [deleteTodoMutation] = useMutation(DELETE_TODO);
  const [toggleTodoMutation] = useMutation(TOGGLE_TODO);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        console.log('Retrieved userId from AsyncStorage:', id);
        if (!id) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          return;
        }
        setUserId(id);
      } catch (error) {
        console.error('Error getting userId:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };
    
    getUserId();
  }, [navigation]);

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleLogout();
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription?.remove();
    }, [])
  );

  const { data, loading, error, refetch } = useQuery(GET_TODOS, {
    variables: { userId },
    skip: !userId,
  });

  // console.log('Query data:', data);
  // console.log('Query loading:', loading);
  // console.log('Query error:', error);
  // console.log('UserId:', userId);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAdd = async () => {
    if (!newTodo.trim()) return;

    try {
      await addTodoMutation({ variables: { userId, text: newTodo } });
      setNewTodo('');
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodoMutation({ variables: { id } });
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete todo');
            }
          },
        },
      ]
    );
  };

  const handleToggle = async (id) => {
    try {
      await toggleTodoMutation({ variables: { id } });
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userId');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const todos = data?.todos || [];
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D9488" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons style={styles.logo} name="checkbox" size={32} color="white" />
          <Text style={styles.headerTitle}>TodoBreeze</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            You have {totalCount - completedCount} pending tasks and {completedCount} completed tasks.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalCount - completedCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Add Todo Form */}
        <View style={styles.addTodoSection}>
          <Text style={styles.sectionTitle}>Add New Task</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newTodo}
              onChangeText={setNewTodo}
              placeholder="Enter a new task..."
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Todo List */}
        <View style={styles.todoListSection}>
          <Text style={styles.sectionTitle}>Your Tasks</Text>
          
          {todos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No tasks yet. Add your first task above!</Text>
            </View>
          ) : (
            todos.map((todo) => (
              <View key={todo.id} style={[styles.todoItem, todo.completed && styles.todoItemCompleted]}>
                <TouchableOpacity
                  onPress={() => handleToggle(todo.id)}
                  style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
                >
                  {todo.completed && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                
                <Text
                  style={[
                    styles.todoText,
                    todo.completed && styles.todoTextCompleted
                  ]}
                  numberOfLines={0}
                >
                  {todo.text}
                </Text>
                
                <TouchableOpacity
                  onPress={() => handleDelete(todo.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Progress Section */}
        {todos.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <Text style={styles.progressText}>
                {completedCount} of {totalCount} completed
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90A4',
    paddingTop: 0
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90A4',
  },
  loadingText: {
    fontSize: 16,
    color: '#fefefeff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  logo: {
    marginTop: 20,
  },
  header: {
    backgroundColor: '#4A90A4',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#4A90A4',
    padding: 20,
    paddingBottom: 30,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 4,
  },
  addTodoSection: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,
  },
  addButton: {
    backgroundColor: '#1299f3ff',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoListSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  todoItemCompleted: {
    opacity: 0.7,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#1299f3ff',
    borderColor: 'rgba(13, 56, 148, 1)ff',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  progressSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(25, 126, 169, 1)ff',
    borderRadius: 6,
  },
});

export default TodoPage;