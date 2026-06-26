import { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
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

  const usedSpots = [];

  const markersJS = issues.map((issue) => {
    const color = CATEGORY_COLORS[issue.category] || '#888888';
    const safeTitle = issue.title.replace(/'/g, "\\'");

    let lat = issue.geopoint.lat;
    let lng = issue.geopoint.lng;

    const isTooClose = usedSpots.some(
      (spot) => Math.abs(spot.lat - lat) < 0.0003 && Math.abs(spot.lng - lng) < 0.0003
    );

    if (isTooClose) {
      lat += (Math.random() - 0.5) * 0.0008;
      lng += (Math.random() - 0.5) * 0.0008;
    }

    usedSpots.push({ lat, lng });

    return `
      L.circleMarker([${lat}, ${lng}], {
        radius: 10,
        fillColor: '${color}',
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 1
      }).addTo(map).bindPopup('${safeTitle}').on('click', function() {
        window.ReactNativeWebView.postMessage('${issue.id}');
      });
    `;
  }).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        var map = L.map('map').setView([10.8794, 77.0207], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
        ${markersJS}
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    const issueId = event.nativeEvent.data;
    const issue = issues.find((i) => i.id === issueId);
    if (issue) onIssuePress(issue);
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});