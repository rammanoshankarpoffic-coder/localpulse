import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Home, Map as MapIcon, Megaphone, Calendar, Wrench, ShieldCheck, Eye, EyeOff } from 'lucide-react-native';
import * as Location from 'expo-location';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import ReportIssueScreen from './screens/ReportIssueScreen';
import EventsScreen from './screens/EventsScreen';
import ServicesScreen from './screens/ServicesScreen';
import AdminScreen from './screens/AdminScreen';
import IssueDetailScreen from './screens/IssueDetailScreen';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [location, setLocation] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed for LocalPulse to work properly.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      let geocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        setPlaceName(`${place.city || place.subregion || ''}, ${place.region || ''}`);
      }
    })();
  }, []);

  const fetchUserRole = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      setUserRole(userDoc.data().role);
    } else {
      setUserRole('citizen');
    }
  };

  const handleAuth = () => {
    if (authLoading) return;
    setAuthLoading(true);

    if (isLogin) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setUser(userCredential.user);
          fetchUserRole(userCredential.user.uid);
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        })
        .finally(() => setAuthLoading(false));
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: email,
            name: name,
            role: 'citizen',
          });
          setUser(userCredential.user);
          fetchUserRole(userCredential.user.uid);
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        })
        .finally(() => setAuthLoading(false));
    }
  };
  const openIssueDetail = (issue) => {
    setSelectedIssue(issue);
    setActiveTab('detail');
  };

  const closeIssueDetail = () => {
    setSelectedIssue(null);
    setActiveTab('home');
  };

  if (user) {
    return (
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && <HomeScreen onIssuePress={openIssueDetail} />}
        {activeTab === 'map' && <MapScreen onIssuePress={openIssueDetail} />}
        {activeTab === 'report' && <ReportIssueScreen />}
        {activeTab === 'events' && <EventsScreen />}
        {activeTab === 'services' && <ServicesScreen />}
        {activeTab === 'admin' && userRole === 'authority' && <AdminScreen />}
        {activeTab === 'detail' && <IssueDetailScreen issue={selectedIssue} onBack={closeIssueDetail} />}

        {activeTab !== 'detail' && (
        <SafeAreaView edges={['bottom']} style={styles.tabBar}>
          <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('home')}>
            <Home size={22} color={activeTab === 'home' ? '#1A56A0' : '#8E8E93'} />
            <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('map')}>
            <MapIcon size={22} color={activeTab === 'map' ? '#1A56A0' : '#8E8E93'} />
            <Text style={[styles.tabLabel, activeTab === 'map' && styles.tabLabelActive]}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('report')}>
            <Megaphone size={22} color={activeTab === 'report' ? '#1A56A0' : '#8E8E93'} />
            <Text style={[styles.tabLabel, activeTab === 'report' && styles.tabLabelActive]}>Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('events')}>
            <Calendar size={22} color={activeTab === 'events' ? '#1A56A0' : '#8E8E93'} />
            <Text style={[styles.tabLabel, activeTab === 'events' && styles.tabLabelActive]}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('services')}>
            <Wrench size={22} color={activeTab === 'services' ? '#1A56A0' : '#8E8E93'} />
            <Text style={[styles.tabLabel, activeTab === 'services' && styles.tabLabelActive]}>Services</Text>
          </TouchableOpacity>

          {userRole === 'authority' && (
            <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('admin')}>
              <ShieldCheck size={22} color={activeTab === 'admin' ? '#1A56A0' : '#8E8E93'} />
              <Text style={[styles.tabLabel, activeTab === 'admin' && styles.tabLabelActive]}>Admin</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
        )}
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 LocalPulse</Text>

      {placeName && (
        <Text style={styles.locationText}>📍 {placeName}</Text>
      )}

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor="#A0AEC0"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A0AEC0"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#A0AEC0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color="#888888" />
          ) : (
            <Eye size={20} color="#888888" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={authLoading}>
        <Text style={styles.buttonText}>
          {authLoading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
        </Text>
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
  passwordWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 14,
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
  tabBar: {
    flexDirection: 'row',
    minHeight: 64,
    borderTopWidth: 0.5,
    borderTopColor: '#D1D1D6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  tabLabelActive: {
    color: '#1A56A0',
    fontWeight: '600',
  },
});