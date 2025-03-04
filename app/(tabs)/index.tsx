import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList } from 'react-native'; // Import FlatList
import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';

interface Contact {
  name: string;
  phoneNumber: string;
}

interface ScheduledContact extends Contact {
  date: string;
  id: string;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserPlus, Bell } from 'lucide-react-native';
import { Modal } from 'react-native'; // Import Modal

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function ScheduleCall() {
  const [contact, setContact] = useState<Contact | null>(null); // Explicit type for contact
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]); // Explicit type for contacts
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContactList, setShowContactList] = useState(false); // State to control contact list visibility
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: contactStatus } = await Contacts.requestPermissionsAsync();
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    
    if (contactStatus !== 'granted') {
      alert('Contact permissions are required to use this app.');
    }
    if (notificationStatus !== 'granted') {
      alert('Notification permissions are required to use this app.');
    }
  };

  const pickContact = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name], // Include name field
      });

      if (data.length > 0) {
        setContacts(data); // Store all contacts in the state
        setShowContactList(true); // Show contact list modal
      }
    } catch (error) {
      console.error('Error picking contact:', error);
    }
  };

  const scheduleCall = async () => {
    if (!contact?.phoneNumber) {
      alert('Please select a contact first');
      return;
    }

    const trigger = date;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Scheduled Call Reminder',
        body: `Time to call ${contact.name}`,
        data: { phoneNumber: contact.phoneNumber },
      },
      trigger,
    });

    const newCall = {
      contact,
      date: date.toISOString(),
      id: Date.now().toString(),
    };

    try {
      const existingCalls = await AsyncStorage.getItem('scheduledCalls');
      const calls = existingCalls ? JSON.parse(existingCalls) : [];
      await AsyncStorage.setItem('scheduledCalls', JSON.stringify([...calls, newCall]));
      alert('Call scheduled successfully!');
    } catch (error) {
      console.error('Error saving scheduled call:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickContact}>
        <UserPlus size={24} color="#007AFF" />
        <Text style={styles.buttonText}>
          {contact ? contact.name : 'Select Contact'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowDatePicker(true)}>
        <Bell size={24} color="#007AFF" />
        <Text style={styles.buttonText}>
          {date.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      <Modal
        visible={showContactList}
        animationType="slide"
        onRequestClose={() => setShowContactList(false)}>
        <View style={styles.modalContainer}>
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id ? item.id.toString() : 'no-id'} // Check if item.id exists
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => {
                  setContact({
                    name: item.name,
                    phoneNumber: item.phoneNumbers?.[0]?.number || '', // Use empty string if phoneNumber is undefined
                  });
                  setShowContactList(false);
                }}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactNumber}>{item.phoneNumbers?.[0]?.number || 'No number'}</Text> // Display 'No number' if phoneNumber is undefined
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowContactList(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.button, styles.scheduleButton]}
        onPress={scheduleCall}>
        <Text style={[styles.buttonText, styles.scheduleButtonText]}>
          Schedule Call
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1A1A1A',
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    marginTop: 20,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  contactItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  contactNumber: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
