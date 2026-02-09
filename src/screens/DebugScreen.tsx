import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_BASE_URL } from '../services/api/config';
import { Colors } from '../theme';

export default function DebugScreen() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
    console.log(msg);
  };

  const testApiUrl = () => {
    const url = process.env.EXPO_PUBLIC_API_URL || 'NOT SET';
    const apiUrl = API_BASE_URL || 'NOT SET';
    const buildProfile = process.env.EAS_BUILD_PROFILE || 'development';
    
    addLog(`EXPO_PUBLIC_API_URL: ${url}`);
    addLog(`API_BASE_URL: ${apiUrl}`);
    addLog(`Build Profile: ${buildProfile}`);
    Alert.alert('API Configuration', `Base URL: ${url}\nAPI URL: ${apiUrl}\nProfile: ${buildProfile}`);
  };

  const testHealth = async () => {
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (!url) {
      addLog('❌ EXPO_PUBLIC_API_URL is not set');
      Alert.alert('Error', 'EXPO_PUBLIC_API_URL is not set');
      return;
    }

    // Try health endpoint (usually at root, not /api)
    const healthUrl = url.includes('/api') ? url.replace('/api', '') + '/health' : `${url}/health`;
    addLog(`Testing: ${healthUrl}`);

    try {
      const response = await axios.get(healthUrl, { timeout: 10000 });
      addLog(`✅ Health check passed: ${JSON.stringify(response.data)}`);
      Alert.alert('Success', 'Health check passed!');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      if (error.code) addLog(`Error code: ${error.code}`);
      if (error.response) {
        addLog(`Response: ${error.response.status}`);
        addLog(`Data: ${JSON.stringify(error.response.data)}`);
      } else {
        addLog('No response - network issue');
      }
      Alert.alert('Failed', error.message);
    }
  };

  const testRegister = async () => {
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (!url) {
      addLog('❌ EXPO_PUBLIC_API_URL is not set');
      Alert.alert('Error', 'EXPO_PUBLIC_API_URL is not set');
      return;
    }

    // Use API_BASE_URL which already includes /api
    const registerUrl = API_BASE_URL || `${url}/api`;
    addLog(`Testing: ${registerUrl}/auth/register`);

    try {
      const response = await axios.post(
        `${registerUrl}/auth/register`,
        {
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'test123456',
        },
        { timeout: 10000 }
      );
      addLog(`✅ Register passed: ${response.status}`);
      addLog(`Response: ${JSON.stringify(response.data)}`);
      Alert.alert('Success', 'Register endpoint works!');
    } catch (error: any) {
      addLog(`❌ Register error: ${error.message}`);
      if (error.response) {
        addLog(`Status: ${error.response.status}`);
        addLog(`Data: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        addLog('No response received - network issue');
      }
      Alert.alert('Failed', error.message);
    }
  };

  const testFetch = async () => {
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (!url) {
      addLog('❌ EXPO_PUBLIC_API_URL is not set');
      Alert.alert('Error', 'EXPO_PUBLIC_API_URL is not set');
      return;
    }

    const healthUrl = url.includes('/api') ? url.replace('/api', '') + '/health' : `${url}/health`;
    addLog(`Testing with fetch: ${healthUrl}`);

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      addLog(`✅ Fetch success: ${JSON.stringify(data)}`);
      Alert.alert('Success', 'Fetch works!');
    } catch (error: any) {
      addLog(`❌ Fetch error: ${error.message}`);
      Alert.alert('Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Debug Panel</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>EXPO_PUBLIC_API_URL:</Text>
          <Text style={styles.infoValue}>{process.env.EXPO_PUBLIC_API_URL || 'NOT SET'}</Text>
          
          <Text style={styles.infoLabel}>API_BASE_URL:</Text>
          <Text style={styles.infoValue}>{API_BASE_URL || 'NOT SET'}</Text>
          
          <Text style={styles.infoLabel}>Build Profile:</Text>
          <Text style={styles.infoValue}>{process.env.EAS_BUILD_PROFILE || 'development'}</Text>
        </View>

        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={testApiUrl}
            style={styles.button}
            buttonColor={Colors.primary.main}
          >
            Check API URL
          </Button>
          <Button
            mode="contained"
            onPress={testHealth}
            style={styles.button}
            buttonColor={Colors.secondary.main}
          >
            Test Health
          </Button>
          <Button
            mode="contained"
            onPress={testRegister}
            style={styles.button}
            buttonColor={Colors.primary.main}
          >
            Test Register
          </Button>
          <Button
            mode="contained"
            onPress={testFetch}
            style={styles.button}
            buttonColor={Colors.secondary.main}
          >
            Test Fetch
          </Button>
          <Button
            mode="outlined"
            onPress={() => setLogs([])}
            style={styles.button}
            textColor={Colors.status.error}
          >
            Clear Logs
          </Button>
        </View>

        <ScrollView style={styles.logs} contentContainerStyle={styles.logsContent}>
          {logs.length === 0 ? (
            <Text style={styles.noLogs}>No logs yet. Run a test!</Text>
          ) : (
            logs.map((log, i) => (
              <Text key={i} style={styles.logText}>
                {log}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background.default,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text.primary,
  },
  infoSection: {
    backgroundColor: Colors.background.paper,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.text.primary,
    backgroundColor: Colors.background.default,
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    marginBottom: 4,
  },
  logs: {
    flex: 1,
    backgroundColor: Colors.background.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.main,
  },
  logsContent: {
    padding: 12,
  },
  logText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.text.primary,
    marginBottom: 6,
    lineHeight: 16,
  },
  noLogs: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});
