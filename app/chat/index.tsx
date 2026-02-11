import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Theme } from '../../constants/Theme';
import { encryptMessage, decryptMessage } from '../../lib/crypto';
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Plus, 
  Heart,
  ChevronLeft
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function ChatScreen() {
  const { user, nestData } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    if (!nestData) return;

    const q = query(
      collection(db, `nests/${nestData.id || 'temp'}/messages`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        text: doc.data().encrypted ? decryptMessage(doc.data().text) : doc.data().text
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [nestData]);

  const sendMessage = async (textOverride?: string, type: 'text' | 'image' | 'ping' = 'text') => {
    const textToSend = textOverride || message;
    if (!textToSend.trim() && type === 'text') return;

    try {
      const encryptedText = type === 'text' ? encryptMessage(textToSend) : textToSend;
      
      await addDoc(collection(db, `nests/${nestData.id || 'temp'}/messages`), {
        text: encryptedText,
        senderId: user?.uid,
        createdAt: serverTimestamp(),
        type,
        encrypted: type === 'text'
      });

      if (!textOverride) setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `chats/${Date.now()}`);
      
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      sendMessage(url, 'image');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.uid;
    
    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessage : styles.theirMessage]}>
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {item.type === 'image' ? (
            <Image source={{ uri: item.text }} style={styles.messageImage} />
          ) : item.type === 'ping' ? (
            <View style={styles.pingContainer}>
              <Heart color="#fff" fill="#fff" size={24} />
              <Text style={styles.pingText}>Ping!</Text>
            </View>
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
        </View>
        <Text style={styles.timeText}>
          {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={Theme.colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Heart-to-Heart</Text>
        <TouchableOpacity onPress={() => sendMessage('Ping!', 'ping')}>
          <Heart color={Theme.colors.primary} size={24} />
        </TouchableOpacity>
      </BlurView>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.listContent}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Plus color={Theme.colors.textSecondary} size={24} />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Whisper something..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.disabledSend]} 
            onPress={() => sendMessage()}
            disabled={!message.trim()}
          >
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
  },
  messageWrapper: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  myBubble: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  pingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  pingText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    marginLeft: 10,
  },
  timeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    paddingBottom: 30,
    backgroundColor: Theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadow,
  },
  disabledSend: {
    backgroundColor: 'rgba(233, 78, 119, 0.4)',
  }
});
