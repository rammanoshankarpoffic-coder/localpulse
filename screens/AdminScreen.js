import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const STATUS_OPTIONS = ['open', 'under_review', 'in_progress', 'resolved'];
const STATUS_LABELS = {
  open: 'Open',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function AdminScreen() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const snap = await getDocs(collection(db, 'issues'));
        setIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.log('Error fetching issues:', error);
      }
      setLoading(false);
    };
    fetchIssues();
  }, []);

  const updateStatus = async (issueId, newStatus) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), { status: newStatus });
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
      );
    } catch (error) {
      console.log('Error updating status:', error);
    }
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
      <Text style={styles.header}>🛡️ Admin Dashboard</Text>

      {issues.length === 0 ? (
        <Text style={styles.emptyText}>No issues to manage.</Text>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.photoURL && (
                <Image source={{ uri: item.photoURL }} style={styles.photo} />
              )}
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.category}>{item.category}</Text>

              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => updateStatus(item.id, status)}
                    style={[
                      styles.statusBtn,
                      item.status === status && styles.statusBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        item.status === status && styles.statusBtnTextActive,
                      ]}
                    >
                      {STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#1A56A0',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusBtnActive: {
    backgroundColor: '#1A56A0',
    borderColor: '#1A56A0',
  },
  statusBtnText: {
    fontSize: 11,
    color: '#666666',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});