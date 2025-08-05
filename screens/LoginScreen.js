import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, gql } from '@apollo/client';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      email
    }
  }
`;

const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
      id
      email
    }
  }
`;

export default function LoginScreen({ navigation }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(''); // Add error state

  const [login] = useMutation(LOGIN);
  const [signup] = useMutation(SIGNUP);

  const handleLogin = async () => {
    setError(''); // Clear previous errors
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const { data } = await login({ variables: { email, password } });
      await AsyncStorage.setItem('userId', data.login.id);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Todos' }],
      });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSignup = async () => {
    setError(''); // Clear previous errors
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data } = await signup({ variables: { email, password } });
      await AsyncStorage.setItem('userId', data.signup.id);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Todos' }],
      });
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  const PlantIllustration = () => (
    <View style={styles.plantContainer}>
      <View style={styles.pot}>
        <View style={styles.potRim} />
      </View>
      <View style={styles.stem} />
      <View style={[styles.leaf, styles.leftLeaf]} />
      <View style={[styles.leaf, styles.rightLeaf]} />
    </View>
  );

  const SocialButton = ({ icon, onPress }) => (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#4A90A4" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#7BC5AE', '#4A90A4', '#2E5266']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {!isSignUp && (
              <>
                <View style={styles.header}>
                  <Text style={styles.greeting}>Hello!</Text>
                  <Text style={styles.subtitle}>Welcome to TodoBreeze</Text>
                </View>
              </>
            )}

            <View style={[styles.formContainer, isSignUp && styles.signupFormContainer]}>
              {isSignUp && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setIsSignUp(false);
                    setError(''); // Clear errors when switching
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="#4A90A4" />
                  <Text style={styles.backText}>Back to login</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.formTitle}>
                {isSignUp ? 'Sign Up' : 'Login'}
              </Text>

              {/* Error Message Box */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color="#DC2626" style={styles.errorIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(''); // Clear error when user starts typing
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(''); // Clear error when user starts typing
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#A0A0A0"
                  />
                </TouchableOpacity>
              </View>

              {isSignUp && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#A0A0A0" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#A0A0A0"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (error) setError(''); // Clear error when user starts typing
                      }}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#A0A0A0"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {!isSignUp && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={isSignUp ? handleSignup : handleLogin}
              >
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>

              {!isSignUp && (
                <>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or login with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.socialContainer}>
                    <SocialButton icon="logo-facebook" />
                    <SocialButton icon="logo-google" />
                    <SocialButton icon="logo-apple" />
                  </View>

                  <TouchableOpacity
                    style={styles.switchMode}
                    onPress={() => {
                      setIsSignUp(true);
                      setError(''); // Clear errors when switching
                    }}
                  >
                    <Text style={styles.switchModeText}>
                      Don't have account? <Text style={styles.switchModeLink}>Sign Up</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 100,
    right: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    marginTop: 100,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  plantContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  pot: {
    width: 60,
    height: 40,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    position: 'relative',
  },
  potRim: {
    position: 'absolute',
    top: -3,
    left: -2,
    right: -2,
    height: 6,
    backgroundColor: '#D0D0D0',
    borderRadius: 8,
  },
  stem: {
    width: 4,
    height: 25,
    backgroundColor: '#4A7C59',
    position: 'absolute',
    top: 15,
    borderRadius: 2,
  },
  leaf: {
    width: 20,
    height: 35,
    backgroundColor: '#5B8A72',
    borderRadius: 20,
    position: 'absolute',
  },
  leftLeaf: {
    top: -5,
    left: -8,
    transform: [{ rotate: '-20deg' }],
  },
  rightLeaf: {
    top: -5,
    right: -8,
    transform: [{ rotate: '20deg' }],
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  signupFormContainer: {
    marginTop: 160, // Add margin top for signup form
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    color: '#4A90A4',
    fontSize: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90A4',
    marginBottom: 30,
  },
  // Error Message Styles
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#4A90A4',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#4A90A4',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#4A90A4',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#A0A0A0',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  switchMode: {
    alignItems: 'center',
  },
  switchModeText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  switchModeLink: {
    color: '#4A90A4',
    fontWeight: '600',
  },
});