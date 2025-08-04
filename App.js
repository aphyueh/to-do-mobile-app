import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApolloProvider } from '@apollo/client';
import client from './apollo/client'; // We'll lazy-load this
import LoginScreen from './screens/LoginScreen';
import TodoScreen from './screens/TodoScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [appClient, setAppClient] = useState(null);

  useEffect(() => {
    (async () => {
      const { default: createClient } = await import('./apollo/client');
      const clientInstance = await createClient(); // because now client.js exports a function
      setAppClient(clientInstance);
    })();
  }, []);

  if (!appClient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ApolloProvider client={appClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Todos" component={TodoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}
