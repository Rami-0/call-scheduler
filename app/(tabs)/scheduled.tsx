import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Phone, Trash2 } from 'lucide-react-native';

interface Contact {
  name: string;
  phoneNumber: string;
}

interface ScheduledCall {
  id: string;
  contact: Contact;
  date: string;
}

export default function ScheduledCalls() {
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);

  useEffect(() => {
    loadScheduledCalls();
  }, []);

  const loadScheduledCalls = async () => {
    console.log('loadScheduledCalls function invoked'); // Added log
    try {
      const calls = await AsyncStorage.getItem('scheduledCalls');
      if (calls) {
        const parsedCalls = JSON.parse(calls);
        console.log('Loaded calls from AsyncStorage:', parsedCalls); // Added log
        setScheduledCalls(parsedCalls);
      } else {
        console.log('No scheduled calls found in AsyncStorage'); // Added log for empty case
      }
    } catch (error) {
      console.error('Error loading scheduled calls:', error);
    }
  };

  const deleteCall = async (id: string) => {
    try {
      const updatedCalls = scheduledCalls.filter(call => call.id !== id);
      await AsyncStorage.setItem('scheduledCalls', JSON.stringify(updatedCalls));
      setScheduledCalls(updatedCalls);
    } catch (error) {
      console.error('Error deleting call:', error);
    }
  };

  const makeCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderItem = ({ item }: { item: ScheduledCall }) => (
    <View style={styles.callItem}>
      <View style={styles.callInfo}>
        <Text style={styles.contactName}>{item.contact.name}</Text>
        <Text style={styles.callTime}>
          {new Date(item.date).toLocaleString()}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => makeCall(item.contact.phoneNumber)}
          style={[
            styles.actionButton,
            styles.callButton,
            new Date(item.date) < new Date(Date.now() - 5 * 60 * 1000) && styles.callButtonDisabled,
          ]}
          disabled={new Date(item.date) < new Date(Date.now() - 5 * 60 * 1000)}
        >
          <Phone size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteCall(item.id)}
          style={[styles.actionButton, styles.deleteButton]}>
          <Trash2 size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={scheduledCalls}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No scheduled calls</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    padding: 20,
  },
  callItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  callInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1A1A1A',
  },
  callTime: {
    fontSize: 14,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: '#007AFF',
  },
  callButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 20,
  },
});
