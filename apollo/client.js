// apollo/client.js
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { persistCache, AsyncStorageWrapper } from 'apollo3-cache-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function createApolloClient() {
  const cache = new InMemoryCache();

  await persistCache({
    cache,
    storage: new AsyncStorageWrapper(AsyncStorage),
  });

  const client = new ApolloClient({
    link: new HttpLink({
      uri: 'http://192.168.68.65:4000/', 
    }),
    cache,
    connectToDevTools: true,
  });

  return client;
}
