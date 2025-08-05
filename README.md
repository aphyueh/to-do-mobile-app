# TodoBreeze - React Native Todo Mobile App

An intuitive mobile todo application built with React Native and Expo, featuring user signup/login and real-time task management through GraphQL API integration.

### Deployed Expo App 
Click [here](https://expo.dev/accounts/aphyueh/projects/to-do-mobile-app/builds/f8919be9-a701-4897-bd82-e56d5b797d0e) 
or scan this QR code for the installation link for Android phones

<img src="img/expo-qr-code.png" alt="QR Code to install the app" width="30%">

## Features

- **User Authentication**: Login and signup with email and dummy password
- **Task Management**: Create, view, toggle completion, and delete tasks
- **Real-time Updates**: GraphQL API integration for seamless data synchronization
- **Beautiful UI/UX**: Modern design with gradients, animations, and intuitive interactions
- **Progress Tracking**: Visual progress indicators and task statistics
- **Offline Support**: Local state caching with Apollo Client
- **Cross-platform**: Works on Android as of now

## Screenshots

*Add your app screenshots here*

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Apollo Client for GraphQL state management
- **API Integration**: GraphQL with Apollo Client
- **Local Storage**: AsyncStorage for user session persistence
- **UI Components**: React Native core components with custom styling
- **Icons**: Expo Vector Icons (Ionicons)
- **Gradients**: Expo Linear Gradient

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- Expo CLI installed globally: `npm install -g expo-cli`
- A GraphQL backend API running (see API Requirements section)
- iOS Simulator or Android Emulator, or Expo Go app on your device

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aphyueh/to-do-mobile-app.git
   cd to-do-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update your Apollo Client configuration to point to your GraphQL API:
   ```javascript
   // In your Apollo Client setup file
   const client = new ApolloClient({
     uri: 'YOUR_GRAPHQL_API_ENDPOINT',
     cache: new InMemoryCache(),
   });
   ```

4. **Start the development server**
   ```bash
   expo start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## Project Structure

```
├── apollo/
│   └── client.js        
├── assets/                     # image files for icon/logos
├── img/                        # Screenshots for documentation
├── screens/
│   ├── LoginScreen.js          # Authentication screen with login/signup
│   └── TodoScreen.js           # Main todo list management screen
├── App.js                      # Main app component
├── app.json
├── eas.json
├── index.js
├── package-lock.json                                  
└── package.json
```

## API Requirements

Your GraphQL backend should implement the following schema:

### Mutations
```graphql
type Mutation {
  login(email: String!, password: String!): User
  signup(name: String!, email: String!, password: String!): User
  addTodo(userId: ID!, text: String!): Todo
  deleteTodo(id: ID!): Boolean
  toggleTodoCompleted(id: ID!): Todo
}
```

### Queries
```graphql
type Query {
  todos(userId: ID!): [Todo]
}
```

### Types
```graphql
type User {
  id: ID!
  email: String!
  name: String
}

type Todo {
  id: ID!
  text: String!
  completed: Boolean!
  userId: ID!
}
```

## Key Features Implementation

### Authentication Flow
- **LoginScreen.js**: Handles both login and signup with form validation
- **Session Management**: Uses AsyncStorage to persist user sessions
- **Navigation**: Automatic navigation to todo screen after successful authentication

### Task Management
- **TodoScreen.js**: Complete CRUD operations for tasks
- **Real-time Updates**: Automatic refetch after mutations
- **Progress Tracking**: Visual progress bars and statistics
- **Optimistic UI**: Immediate UI updates with Apollo Client

### State Management & Caching
The app implements offline support and caching through:

**Apollo Client InMemoryCache** (Primary caching mechanism):
```javascript
// Located in Apollo Client setup
const client = new ApolloClient({
  uri: 'YOUR_API_ENDPOINT',
  cache: new InMemoryCache(), // Handles GraphQL data caching
});
```

**AsyncStorage for Session Persistence**:
```javascript
// In LoginScreen.js - User session storage
await AsyncStorage.setItem('userId', data.login.id);

// In TodoScreen.js - Session retrieval
const id = await AsyncStorage.getItem('userId');
```

**Query Caching & Refetching**:
```javascript
// In TodoScreen.js - Automatic cache updates
const { data, loading, error, refetch } = useQuery(GET_TODOS, {
  variables: { userId },
  skip: !userId,
});
```

## Security Features

- Secure password input with toggle visibility
- Form validation for all input fields
- Session token storage in AsyncStorage
- Automatic logout functionality
- Navigation guards for protected routes

## UI/UX Features

- **Modern Design**: Clean, modern interface with beautiful gradients
- **Responsive Layout**: Adapts to different screen sizes
- **Interactive Elements**: Smooth animations and hover effects
- **Error Handling**: User-friendly error messages and loading states
- **Accessibility**: Proper contrast ratios and semantic elements

## Navigation Flow

1. **App Start** → Check for existing session
2. **LoginScreen** → Authentication (login/signup)
3. **TodoScreen** → Main application interface
4. **Hardware Back Button** → Logout confirmation (Android)

## Error Handling

The app includes comprehensive error handling:
- Network error handling for GraphQL mutations
- Form validation with real-time feedback
- Loading states for better user experience
- Graceful fallbacks for offline scenarios

## Performance Optimizations

- **Apollo Client Caching**: Reduces unnecessary network requests
- **Optimistic UI Updates**: Immediate feedback for user actions
- **Lazy Loading**: Components load only when needed
- **Memory Management**: Proper cleanup of event listeners

## Building for Production

### Android
```bash
eas build --platform android --profile preview
```

## Author

**Amber Pang** - [GitHub Profile](https://github.com/aphyueh)
