import { StyleSheet, Text, View, FlatList } from 'react-native';
import IssueCard from '../components/IssueCard';

const SAMPLE_ISSUES = [
  {
    id: '1',
    title: 'Pothole near Gandhi Road',
    description: 'Large pothole causing traffic issues, especially dangerous at night.',
    category: 'roads',
    status: 'open',
    isAnonymous: false,
    reporterName: 'Priya S.',
    distanceKm: '0.8',
    upvotes: 12,
  },
  {
    id: '2',
    title: 'Water leakage near park',
    description: 'Continuous water leakage from underground pipe for 3 days now.',
    category: 'water',
    status: 'in_progress',
    isAnonymous: true,
    distanceKm: '1.4',
    upvotes: 27,
  },
  {
    id: '3',
    title: 'Broken streetlight',
    description: 'Streetlight has been out for two weeks, area is very dark at night.',
    category: 'electricity',
    status: 'resolved',
    isAnonymous: false,
    reporterName: 'Arjun K.',
    distanceKm: '2.1',
    upvotes: 8,
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📍 Nearby Issues</Text>
      <FlatList
        data={SAMPLE_ISSUES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IssueCard issue={item} onPress={() => {}} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
});