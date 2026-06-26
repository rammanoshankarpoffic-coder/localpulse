import { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CATEGORY_COLORS = {
  roads: '#E53935',
  water: '#1E88E5',
  electricity: '#F9A825',
  safety: '#6A1B9A',
  sanitation: '#2E7D32',
};

export default function MapScreen({ onIssuePress }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const snap = await getDocs(collection(db, 'issues'));
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((issue) => issue.geopoint);
        setIssues(data);
      } catch (error) {
        console.log('Error fetching issues for map:', error);
      }
      setLoading(false);
    };
    fetchIssues();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A56A0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: 10.8794,
          longitude: 77.0207,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            coordinate={{ latitude: issue.geopoint.lat, longitude: issue.geopoint.lng }}
            pinColor={CATEGORY_COLORS[issue.category] || '#888888'}
            title={issue.title}
            description={issue.description}
            onCalloutPress={() => onIssuePress(issue)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});