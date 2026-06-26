import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import * as Location from 'expo-location';
import { getDistanceKm } from '../utils/geoUtils';
import IssueCard from '../components/IssueCard';

const RADIUS_OPTIONS = [1, 3, 5, 10];

export default function HomeScreen({ onIssuePress }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);

  const filteredIssues = issues.filter((issue) => {
    if (issue.distanceKm === '?') return false;
    return parseFloat(issue.distanceKm) <= radius;
  });

  const fetchIssues = async () => {
    try {
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const userLocation = await Location.getCurrentPositionAsync({});

      const dataWithDistance = data.map((issue) => {
        if (issue.geopoint) {
          const dist = getDistanceKm(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            issue.geopoint.lat,
            issue.geopoint.lng
          );
          return { ...issue, distanceKm: dist.toFixed(1) };
        }
        return { ...issue, distanceKm: '?' };
      });

      setIssues(dataWithDistance);
    } catch (error) {
      console.log('Error fetching issues:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpvote = async (issue) => {
    const userId = auth.currentUser.uid;
    const alreadyUpvoted = issue.upvotedBy && issue.upvotedBy.includes(userId);
    const issueRef = doc(db, 'issues', issue.id);

    try {
      if (alreadyUpvoted) {
        await updateDoc(issueRef, { upvotedBy: arrayRemove(userId) });
      } else {
        await updateDoc(issueRef, { upvotedBy: arrayUnion(userId) });
      }
      fetchIssues();
    } catch (error) {
      console.log('Error upvoting:', error);
    }
  };

  const handleDelete = (issueId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'issues', issueId));
              fetchIssues();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A56A0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📍 Nearby Issues</Text>

      <View style={styles.radiusRow}>
        {RADIUS_OPTIONS.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRadius(r)}
            style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
          >
            <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>
              {r} km
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredIssues.length === 0 ? (
        <Text style={styles.emptyText}>No issues within {radius} km. Try a wider radius.</Text>
      ) : (
        <FlatList
          data={filteredIssues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IssueCard
              issue={item}
              onPress={() => onIssuePress(item)}
              onUpvote={() => handleUpvote(item)}
              hasUpvoted={item.upvotedBy && item.upvotedBy.includes(auth.currentUser.uid)}
              onDelete={() => handleDelete(item.id)}
              isOwner={item.reportedBy === auth.currentUser.uid}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', paddingTop: 60, paddingHorizontal: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  radiusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  radiusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  radiusBtnActive: { backgroundColor: '#1A56A0', borderColor: '#1A56A0' },
  radiusText: { fontSize: 13, color: '#444444' },
  radiusTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyText: { color: '#999999', fontSize: 14, textAlign: 'center', marginTop: 40 },
  list: { paddingBottom: 20 },
});