import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Bell, Volume2, Vibrate } from 'lucide-react-native';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const toggleNotifications = async (value: boolean) => { // Explicit type for value
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable notifications in your device settings to use this feature.');
        return;
      }
    }
    setNotifications(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Bell size={24} color="#007AFF" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Volume2 size={24} color="#007AFF" />
            <Text style={styles.settingText}>Sound</Text>
          </View>
          <Switch
            value={sound}
            onValueChange={setSound}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={sound ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Vibrate size={24} color="#007AFF" />
            <Text style={styles.settingText}>Vibration</Text>
          </View>
          <Switch
            value={vibration}
            onValueChange={setVibration}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={vibration ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          // Implement reset functionality
        }}>
        <Text style={styles.resetButtonText}>Reset All Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1A1A1A',
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
