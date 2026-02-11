import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { Theme } from '../../constants/Theme';
import { GlassCard } from '../../components/GlassCard';
import { 
  ChevronLeft, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock,
  Bell
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function CalendarScreen() {
  const { nestData } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '' });
  const router = useRouter();

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    if (!nestData) return;

    const q = query(collection(db, `nests/${nestData.id || 'temp'}/events`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }));
      setEvents(evts);
    });

    return unsubscribe;
  }, [nestData]);

  const addEvent = async () => {
    if (!newEvent.title) return;

    try {
      await addDoc(collection(db, `nests/${nestData.id || 'temp'}/events`), {
        title: newEvent.title,
        time: newEvent.time,
        date: selectedDate,
        createdAt: serverTimestamp(),
      });
      setNewEvent({ title: '', time: '' });
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Could not add event");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Plus color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.calendarGrid}>
          {days.map((day, i) => {
            const dayEvents = events.filter(e => e.date && isSameDay(e.date, day));
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <TouchableOpacity 
                key={i} 
                style={[styles.dayCell, isSelected && styles.selectedDay]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                  {format(day, 'd')}
                </Text>
                {dayEvents.length > 0 && <View style={styles.eventDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Events for {format(selectedDate, 'MMM do')}</Text>
          {events.filter(e => e.date && isSameDay(e.date, selectedDate)).map(event => (
            <GlassCard key={event.id} style={styles.eventCard}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventTimeRow}>
                  <Clock color={Theme.colors.textSecondary} size={14} />
                  <Text style={styles.eventTime}>{event.time || 'All day'}</Text>
                </View>
              </View>
              <Bell color={Theme.colors.primary} size={20} />
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Shared Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newEvent.title}
              onChangeText={text => setNewEvent({...newEvent, title: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (e.g. 7:00 PM)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newEvent.time}
              onChangeText={text => setNewEvent({...newEvent, time: text})}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addEvent} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
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
    fontSize: 20,
    fontWeight: '800',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  selectedDay: {
    backgroundColor: Theme.colors.primary,
  },
  dayText: {
    color: Theme.colors.text,
    fontSize: 16,
  },
  selectedDayText: {
    fontWeight: '800',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
    marginTop: 2,
  },
  eventsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  eventTime: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
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
