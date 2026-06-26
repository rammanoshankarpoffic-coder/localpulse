import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ArrowLeft, Navigation } from 'lucide-react-native';

const CATEGORY_COLORS = {
  roads: '#E53935',
  water: '#1E88E5',
  electricity: '#F9A825',
  safety: '#6A1B9A',
  sanitation: '#2E7D32',
};

const STATUS_CONFIG = {
  open: { bg: '#FFEBEE', text: '#C62828', label: 'Open' },
  under_review: { bg: '#FFF3CC', text: '#7A4F00', label: 'Under Review' },
  in_progress: { bg: '#D6E4F7', text: '#0C447C', label: 'In Progress' },
  resolved: { bg: '#D4F0E8', text: '#0F6E56', label: 'Resolved' },
};

export default function IssueDetailScreen({ issue, onBack }) {
  if (!issue) return null;

  const catColor = CATEGORY_COLORS[issue.category] || '#888888';
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

  const openDirections = () => {
    if (!issue.geopoint) return;
    const { lat, lng } = issue.geopoint;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={22} color="#1A1A1A" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {issue.photoURL && (
        <Image source={{ uri: issue.photoURL }} style={styles.photo} />
      )}

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: catColor + '22' }]}>
          <Text style={[styles.chipText, { color: catColor }]}>
            {issue.category.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: status.bg }]}>
          <Text style={[styles.chipText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.title}>{issue.title}</Text>
      <Text style={styles.description}>{issue.description}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Reported by</Text>
        <Text style={styles.infoValue}>
          {issue.isAnonymous ? 'Anonymous' : (issue.reporterName || 'A resident')}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Distance</Text>
        <Text style={styles.infoValue}>{issue.distanceKm} km away</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Upvotes</Text>
        <Text style={styles.infoValue}>▲ {issue.upvotedBy ? issue.upvotedBy.length : 0}</Text>
      </View>

      {issue.geopoint && (
        <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
          <Navigation size={18} color="#FFFFFF" />
          <Text style={styles.directionsText}>Get Directions</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 15, color: '#1A1A1A', fontWeight: '600' },
  photo: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  description: { fontSize: 15, color: '#444444', lineHeight: 22, marginBottom: 20 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  infoLabel: { fontSize: 14, color: '#999999' },
  infoValue: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  directionsButton: {
    flexDirection: 'row',
    backgroundColor: '#1A56A0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  directionsText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});