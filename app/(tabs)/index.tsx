import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

// API URL - replace with your actual server address when needed
const API_URL = 'http://192.168.0.4:5000';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State for stepper motor control - updated to match app.py structure
  const [stepper, setStepper] = useState({
    running: false,
    direction: 'CW',
    rotation: 0,
    last_command_time: 0,
  });

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial stepper states from the server
  useEffect(() => {
    fetchStepperState();
  }, []);

  // Function to fetch stepper state from the server
  const fetchStepperState = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/stepper`);

      if (!response.ok) {
        throw new Error('Failed to fetch stepper state');
      }

      const data = await response.json();
      setStepper(data.stepper);
    } catch (error) {
      console.error('Error fetching stepper state:', error);
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stepper motor button control
  const handleStepperButton = async (buttonId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/stepper/button/${buttonId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to process button ${buttonId}`);
      }

      const data = await response.json();

      // Update local state with the new stepper settings
      setStepper(data.stepper);

      console.log(`Button ${buttonId} pressed successfully:`, data.action);
    } catch (error) {
      console.error(`Error pressing button ${buttonId}:`, error);
      Alert.alert('Error', `Failed to process button ${buttonId}`);
    }
  };

  // Function to handle custom rotation
  const handleRotate = async (direction, degrees) => {
    try {
      const response = await fetch(`${API_URL}/api/stepper/rotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction, degrees }),
      });

      if (!response.ok) {
        throw new Error('Failed to rotate stepper');
      }

      const data = await response.json();
      setStepper(data.stepper);
      console.log('Rotation command sent successfully:', data.action);
    } catch (error) {
      console.error('Error rotating stepper:', error);
      Alert.alert('Error', 'Failed to rotate stepper motor');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>
          Stepper Motor Control
        </Text>
        <Text style={[styles.subtitle, isDark && styles.darkText]}>
          {isLoading ? 'Connecting...' : 'Motor Controller'}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchStepperState}
        >
          <Ionicons name='refresh' size={24} color={isDark ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.deviceList}>
        {/* Stepper Motor Control */}
        <View style={[styles.deviceCard, isDark && styles.darkCard]}>
          <View style={styles.deviceInfo}>
            <Ionicons
              name={stepper.running ? 'hardware-chip' : 'hardware-chip-outline'}
              size={28}
              color={stepper.running ? '#3F51B5' : isDark ? '#fff' : '#333'}
            />
            <View>
              <Text style={[styles.deviceName, isDark && styles.darkText]}>
                Stepper Motor
              </Text>
              <Text style={[styles.motorStatus, isDark && styles.darkText]}>
                {stepper.running ? 'Running' : 'Idle'} • {stepper.direction} •
                Rotation: {stepper.rotation}°
              </Text>
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.motorButton,
                stepper.running &&
                  stepper.rotation === 90 &&
                  stepper.direction === 'CW' &&
                  styles.activeButton,
              ]}
              onPress={() => handleStepperButton(1)}
            >
              <Text style={styles.buttonText}>B1</Text>
              <Text style={styles.buttonSubtext}>CW 90°</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.motorButton,
                stepper.running &&
                  stepper.rotation === 90 &&
                  stepper.direction === 'CCW' &&
                  styles.activeButton,
              ]}
              onPress={() => handleStepperButton(2)}
            >
              <Text style={styles.buttonText}>B2</Text>
              <Text style={styles.buttonSubtext}>CCW 90°</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.motorButton,
                stepper.running &&
                  stepper.rotation === 180 &&
                  styles.activeButton,
              ]}
              onPress={() => handleStepperButton(3)}
            >
              <Text style={styles.buttonText}>B3</Text>
              <Text style={styles.buttonSubtext}>CW 180°</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Panel */}
        <View style={[styles.statusPanel, isDark && styles.darkCard]}>
          <Text style={[styles.statusTitle, isDark && styles.darkText]}>
            Motor Status
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, isDark && styles.darkText]}>
                Status
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  stepper.running ? styles.statusOn : styles.statusOff,
                ]}
              >
                {stepper.running ? 'RUNNING' : 'IDLE'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, isDark && styles.darkText]}>
                Direction
              </Text>
              <Text style={[styles.statusValue, isDark && styles.darkText]}>
                {stepper.direction}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, isDark && styles.darkText]}>
                Rotation
              </Text>
              <Text style={[styles.statusValue, isDark && styles.darkText]}>
                {stepper.rotation}°
              </Text>
            </View>
          </View>
        </View>

        {/* Custom Control Panel */}
        <View style={[styles.statusPanel, isDark && styles.darkCard]}>
          <Text style={[styles.statusTitle, isDark && styles.darkText]}>
            Custom Rotation
          </Text>
          <View style={[styles.buttonGroup, { marginTop: 10 }]}>
            <TouchableOpacity
              style={styles.motorButton}
              onPress={() => handleRotate('CW', 90)}
            >
              <Text style={styles.buttonSubtext}>CW 90°</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.motorButton}
              onPress={() => handleRotate('CCW', 90)}
            >
              <Text style={styles.buttonSubtext}>CCW 90°</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.motorButton}
              onPress={() => handleRotate('CW', 180)}
            >
              <Text style={styles.buttonSubtext}>CW 180°</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.motorButton}
              onPress={() => handleRotate('CCW', 180)}
            >
              <Text style={styles.buttonSubtext}>CCW 180°</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
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
    marginBottom: 15,
  },
  deviceName: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '500',
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 5,
  },
  motorStatus: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  motorButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#3F51B5',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonSubtext: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  statusPanel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusOn: {
    color: '#4CAF50',
  },
  statusOff: {
    color: '#F44336',
  },
});
