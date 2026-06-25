import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import * as Location from 'expo-location';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed for LocalPulse to work properly.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleAuth = () => {
    if (isLogin) {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          Alert.alert('Success', 'Logged in!');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        });
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          Alert.alert('Success', 'Account created!');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 LocalPulse</Text>

      {location && (
        <Text style={styles.locationText}>
          📍 {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A0AEC0"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A0AEC0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "New here? Sign Up" : 'Already have an account? Log In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A56A0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  locationText: {
    color: '#D6E4F7',
    fontSize: 13,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    width: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#D6E4F7',
    marginTop: 18,
    fontSize: 14,
  },
});