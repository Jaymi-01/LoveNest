import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Modal,
  Alert,
  Platform
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
  Mail,
  Lock,
  Unlock,
  Calendar
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format, isAfter } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LoveLettersScreen() {
  const { nestData, user } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newLetter, setNewLetter] = useState({ title: '', content: '', unlockDate: new Date() });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!nestData) return;

    const q = query(
      collection(db, `nests/${nestData.id || 'temp'}/love_letters`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const l = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        unlockDate: doc.data().unlockDate?.toDate()
      }));
      setLetters(l);
    });

    return unsubscribe;
  }, [nestData]);

  const addLetter = async () => {
    if (!newLetter.title || !newLetter.content) return;

    try {
      await addDoc(collection(db, `nests/${nestData.id || 'temp'}/love_letters`), {
        ...newLetter,
        senderId: user?.uid,
        createdAt: serverTimestamp(),
      });
      setNewLetter({ title: '', content: '', unlockDate: new Date() });
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Could not send love letter");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewLetter({ ...newLetter, unlockDate: selectedDate });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Love Letters</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Plus color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={letters}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const canOpen = isAfter(new Date(), item.unlockDate);
          const isFromMe = item.senderId === user?.uid;

          return (
            <TouchableOpacity 
              disabled={!canOpen}
              onPress={() => Alert.alert(item.title, item.content)}
            >
              <GlassCard style={[styles.letterCard, !canOpen && styles.lockedCard]}>
                <View style={styles.letterHeader}>
                  <Mail color={canOpen ? Theme.colors.primary : Theme.colors.textSecondary} size={24} />
                  <View style={styles.titleArea}>
                    <Text style={styles.letterTitle}>{item.title}</Text>
                    <Text style={styles.letterSender}>{isFromMe ? 'From You' : 'From Partner'}</Text>
                  </View>
                  {canOpen ? (
                    <Unlock color={Theme.colors.primary} size={20} />
                  ) : (
                    <Lock color={Theme.colors.textSecondary} size={20} />
                  )}
                </View>
                {!canOpen && (
                  <View style={styles.unlockArea}>
                    <Calendar color={Theme.colors.textSecondary} size={14} />
                    <Text style={styles.unlockText}>
                      Unlocks on {format(item.unlockDate, 'MMM do, yyyy')}
                    </Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seal a Love Letter</Text>
            <TextInput
              style={styles.input}
              placeholder="Title (e.g. Open when you miss me)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newLetter.title}
              onChangeText={text => setNewLetter({...newLetter, title: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your heart goes here..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newLetter.content}
              onChangeText={text => setNewLetter({...newLetter, content: text})}
              multiline
            />
            
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color={Theme.colors.primary} size={20} />
              <Text style={styles.datePickerText}>
                Unlock Date: {format(newLetter.unlockDate, 'MMM do, yyyy')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newLetter.unlockDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addLetter} style={styles.saveButton}>
                <Text style={styles.saveText}>Seal Letter</Text>
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
  letterCard: {
    marginBottom: 15,
    padding: 20,
  },
  lockedCard: {
    opacity: 0.7,
  },
  letterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginLeft: 15,
  },
  letterTitle: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  letterSender: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
  unlockArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  unlockText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    padding: 25,
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
    height: 120,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  datePickerText: {
    color: Theme.colors.text,
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
