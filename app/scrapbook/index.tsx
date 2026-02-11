import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Theme } from '../../constants/Theme';
import { 
  ChevronLeft, 
  Plus, 
  Camera,
  Heart
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2;

export default function ScrapbookScreen() {
  const { nestData } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!nestData) return;

    const q = query(
      collection(db, `nests/${nestData.id || 'temp'}/scrapbook`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPhotos(p);
    });

    return unsubscribe;
  }, [nestData]);

  const addPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `scrapbook/${Date.now()}`);
        
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, `nests/${nestData.id || 'temp'}/scrapbook`), {
          url,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        Alert.alert("Error", "Could not upload photo");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Scrapbook</Text>
        <TouchableOpacity onPress={addPhoto}>
          <Camera color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={photos}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item.url }} style={styles.photo} />
            <View style={styles.photoOverlay}>
               <Heart color="#fff" fill={Theme.colors.primary} size={16} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  listContent: {
    padding: 20,
  },
  photoContainer: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.2,
    margin: 5,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 12,
  }
});
