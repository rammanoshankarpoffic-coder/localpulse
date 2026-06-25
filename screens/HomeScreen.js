import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import IssueCard from '../components/IssueCard';

export default function HomeScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIssues(data);
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
        await updateDoc(issueRef, {
          upvotedBy: arrayRemove(userId),
        });
      } else {
        await updateDoc(issueRef, {
          upvotedBy: arrayUnion(userId),
        });
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
      {issues.length === 0 ? (
        <Text style={styles.emptyText}>No issues reported yet. Be the first!</Text>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IssueCard
              issue={item}
              onPress={() => {}}
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  emptyText: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  list: {
    paddingBottom: 20,
  },
});