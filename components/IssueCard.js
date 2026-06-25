import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

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

export default function IssueCard({ issue, onPress }) {
  const catColor = CATEGORY_COLORS[issue.category] || '#888888';
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={[styles.bar, { backgroundColor: catColor }]} />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={[styles.chip, { backgroundColor: catColor + '22' }]}>
            <Text style={[styles.chipText, { color: catColor }]}>
              {issue.category.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: status.bg }]}>
            <Text style={[styles.chipText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{issue.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{issue.description}</Text>

        <View style={styles.footer}>
          <Text style={styles.meta}>
            {issue.isAnonymous ? 'Anonymous' : issue.reporterName}
          </Text>
          <Text style={styles.meta}>{issue.distanceKm} km away</Text>
          <Text style={styles.upvote}>▲ {issue.upvotes || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bar: {
    width: 6,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 11,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: '#999999',
  },
  upvote: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});