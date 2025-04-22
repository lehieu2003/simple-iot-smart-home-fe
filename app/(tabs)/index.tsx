import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

// API URL - replace with your actual server address when needed
const API_URL = 'http://172.17.79.208:5000';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State for device controls
  const [devices, setDevices] = useState({
    light: false,
    thermostat: 21,
    camera: true,
    speaker: false,
    doorLock: true,
  });

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial device states from the server
  useEffect(() => {
    fetchDeviceStates();
  }, []);

  // Function to fetch device states from the server
  const fetchDeviceStates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/devices`);

      if (!response.ok) {
        throw new Error('Failed to fetch device states');
      }

      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching device states:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update device state on the server
  const updateDeviceState = async (device, value) => {
    try {
      const response = await fetch(`${API_URL}/api/devices/${device}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${device}`);
      }

      // Update successful - the state is already updated locally via setState
      console.log(`${device} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${device}:`, error);
      Alert.alert('Error', `Failed to update ${device}`);

      // Revert the local state to match the server
      fetchDeviceStates();
    }
  };

  // Toggle function for boolean devices
  const toggleDevice = (
    device: 'light' | 'camera' | 'speaker' | 'doorLock'
  ) => {
    const newValue = !devices[device];
    setDevices((prev) => ({ ...prev, [device]: newValue }));
    updateDeviceState(device, newValue);
  };

  // Temperature control
  const adjustTemperature = (increment: number) => {
    const newTemp = Math.min(30, Math.max(16, devices.thermostat + increment));
    setDevices((prev) => ({
      ...prev,
      thermostat: newTemp,
    }));
    updateDeviceState('thermostat', newTemp);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>
          My Smart Home
        </Text>
        <Text style={[styles.subtitle, isDark && styles.darkText]}>
          {isLoading ? 'Connecting...' : '5 Active Devices'}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchDeviceStates}
        >
          <Ionicons name='refresh' size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.deviceList}>
        {/* Light Device */}
        <View style={[styles.deviceCard, isDark && styles.darkCard]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name={devices.light ? 'bulb' : 'bulb-outline'}
              size={28}
              color={devices.light ? '#FFD700' : isDark ? '#fff' : '#333'}
            />
            <Text style={[styles.deviceName, isDark && styles.darkText]}>
              Living Room Light
            </Text>
          </View>
          <Switch
            value={devices.light}
            onValueChange={() => toggleDevice('light')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>

        {/* Thermostat Device */}
        <View style={[styles.deviceCard, isDark && styles.darkCard]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name='thermometer-outline'
              size={28}
              color={isDark ? '#fff' : '#333'}
            />
            <Text style={[styles.deviceName, isDark && styles.darkText]}>
              Thermostat
            </Text>
          </View>
          <View style={styles.temperatureControl}>
            <TouchableOpacity
              style={styles.tempButton}
              onPress={() => adjustTemperature(-1)}
            >
              <Text style={styles.tempButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.tempDisplay, isDark && styles.darkText]}>
              {devices.thermostat}°C
            </Text>
            <TouchableOpacity
              style={styles.tempButton}
              onPress={() => adjustTemperature(1)}
            >
              <Text style={styles.tempButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Camera */}
        <View style={[styles.deviceCard, isDark && styles.darkCard]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name={devices.camera ? 'videocam' : 'videocam-outline'}
              size={28}
              color={devices.camera ? '#4CAF50' : isDark ? '#fff' : '#333'}
            />
            <Text style={[styles.deviceName, isDark && styles.darkText]}>
              Security Camera
            </Text>
          </View>
          <Switch
            value={devices.camera}
            onValueChange={() => toggleDevice('camera')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>

        {/* Smart Speaker */}
        <View style={[styles.deviceCard, isDark && styles.darkCard]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name={devices.speaker ? 'volume-high' : 'volume-mute'}
              size={28}
              color={devices.speaker ? '#9C27B0' : isDark ? '#fff' : '#333'}
            />
            <Text style={[styles.deviceName, isDark && styles.darkText]}>
              Smart Speaker
            </Text>
          </View>
          <Switch
            value={devices.speaker}
            onValueChange={() => toggleDevice('speaker')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>

        {/* Door Lock */}
        <View style={[styles.deviceCard, isDark && styles.darkCard]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name={devices.doorLock ? 'lock-closed' : 'lock-open'}
              size={28}
              color={devices.doorLock ? '#FF5722' : isDark ? '#fff' : '#333'}
            />
            <Text style={[styles.deviceName, isDark && styles.darkText]}>
              Front Door Lock
            </Text>
          </View>
          <Switch
            value={devices.doorLock}
            onValueChange={() => toggleDevice('doorLock')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  deviceList: {
    padding: 15,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  temperatureControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempButton: {
    backgroundColor: '#e0e0e0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tempDisplay: {
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 5,
  },
});
