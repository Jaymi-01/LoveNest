import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Theme } from '../../constants/Theme';
import { GlassCard } from '../../components/GlassCard';
import { 
  ChevronLeft, 
  Plus, 
  BookOpen,
  FileText,
  Clock
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function JournalsScreen() {
  const { nestData } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newJournal, setNewJournal] = useState({ title: '', content: '' });
  const router = useRouter();

  useEffect(() => {
    if (!nestData) return;

    const q = query(
      collection(db, `nests/${nestData.id || 'temp'}/journals`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const j = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJournals(j);
    });

    return unsubscribe;
  }, [nestData]);

  const addJournal = async () => {
    if (!newJournal.title || !newJournal.content) return;

    try {
      await addDoc(collection(db, `nests/${nestData.id || 'temp'}/journals`), {
        ...newJournal,
        createdAt: serverTimestamp(),
      });
      setNewJournal({ title: '', content: '' });
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Could not save journal");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Journals</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Plus color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={journals}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GlassCard style={styles.journalCard}>
            <View style={styles.journalHeader}>
              <BookOpen color={Theme.colors.primary} size={20} />
              <Text style={styles.journalTitle}>{item.title}</Text>
            </View>
            <Text style={styles.journalPreview} numberOfLines={3}>
              {item.content}
            </Text>
            <View style={styles.journalFooter}>
              <Clock color={Theme.colors.textSecondary} size={14} />
              <Text style={styles.dateText}>
                {item.createdAt?.toDate() ? format(item.createdAt.toDate(), 'MMM do, yyyy') : 'Recently'}
              </Text>
            </View>
          </GlassCard>
        )}
      />

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a New Entry</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newJournal.title}
              onChangeText={text => setNewJournal({...newJournal, title: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Start writing..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newJournal.content}
              onChangeText={text => setNewJournal({...newJournal, content: text})}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addJournal} style={styles.saveButton}>
                <Text style={styles.saveText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
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
  journalCard: {
    marginBottom: 20,
    padding: 20,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  journalTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  journalPreview: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  journalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    padding: 25,
    height: '70%',
  },
  modalTitle: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    flex: 1,
    height: 200,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    height: 50,
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: Theme.colors.textSecondary,
    fontSize: 16,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
