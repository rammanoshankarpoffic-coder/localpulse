import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const CATEGORIES = ['roads', 'water', 'electricity', 'safety', 'sanitation'];
const CLOUD_NAME = 'ddltp7g82';
const UPLOAD_PRESET = 'localpulse_unsigned';

export default function ReportIssueScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('roads');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Missing info', 'Please fill in both title and description.');
      return;
    }

    setLoading(true);

    try {
      let photoURL = null;
      if (photo) {
        photoURL = await uploadToCloudinary(photo);
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const geopoint = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      };

      await addDoc(collection(db, 'issues'), {
        title: title,
        description: description,
        category: category,
        photoURL: photoURL,
        geopoint: geopoint,
        reportedBy: auth.currentUser.uid,
        status: 'open',
        upvotes: 0,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Your issue has been reported!');
      setTitle('');
      setDescription('');
      setCategory('roads');
      setPhoto(null);
    } catch (error) {
      Alert.alert('Error', error.message);
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>📢 Report an Issue</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Pothole near main road"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.catRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.catButton, category === cat && styles.catButtonActive]}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Photo</Text>
      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Text style={styles.photoButtonText}>
          {photo ? '📷 Retake Photo' : '📷 Take Photo'}
        </Text>
      </TouchableOpacity>

      {photo && (
        <Image source={{ uri: photo }} style={styles.previewImage} />
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444444',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  catButtonActive: {
    backgroundColor: '#1A56A0',
    borderColor: '#1A56A0',
  },
  catText: {
    fontSize: 13,
    color: '#444444',
    textTransform: 'capitalize',
  },
  catTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  photoButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoButtonText: {
    fontSize: 15,
    color: '#1A56A0',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 12,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});