import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const CATEGORY_COLORS = {
  roads: '#E53935',
  water: '#1E88E5',
  electricity: '#F9A825',
  safety: '#6A1B9A',
  sanitation: '#2E7D32',
};

const SAMPLE_ISSUES = [
  {
    id: '1',
    title: 'Pothole near Gandhi Road',
    category: 'roads',
    lat: 10.8810,
    lng: 77.0220,
  },
  {
    id: '2',
    title: 'Water leakage near park',
    category: 'water',
    lat: 10.8770,
    lng: 77.0195,
  },
  {
    id: '3',
    title: 'Broken streetlight',
    category: 'electricity',
    lat: 10.8830,
    lng: 77.0240,
  },
];

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.8794,
          longitude: 77.0207,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {SAMPLE_ISSUES.map((issue) => (
          <Marker
            key={issue.id}
            coordinate={{ latitude: issue.lat, longitude: issue.lng }}
            pinColor={CATEGORY_COLORS[issue.category]}
            title={issue.title}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});