import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../services/api/config';
import { Colors } from '../theme';

export function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = process.env.EXPO_PUBLIC_API_URL;
    const apiUrl = API_BASE_URL;
    setResult(`API URL: ${url || 'NOT SET'}\nAPI Base URL: ${apiUrl || 'NOT SET'}`);
  }, []);

  const testConnection = async () => {
    const url = process.env.EXPO_PUBLIC_API_URL;
    
    if (!url) {
      Alert.alert('Error', 'EXPO_PUBLIC_API_URL is not set');
      setResult('❌ Error: EXPO_PUBLIC_API_URL is not set');
      return;
    }

    setLoading(true);
    
    try {
      // Health endpoint is exposed at /api/health
      // If EXPO_PUBLIC_API_URL already contains /api, just append /health,
      // otherwise hit /api/health from the base URL.
      let healthUrl = '';
      if (url.endsWith('/api') || url.includes('/api/')) {
        healthUrl = `${url}/health`;
      } else {
        healthUrl = `${url}/api/health`;
      }
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success!', JSON.stringify(data, null, 2));
        setResult(`✅ Connected: ${JSON.stringify(data)}`);
      } else {
        Alert.alert('Error', `Status: ${response.status}\n${JSON.stringify(data)}`);
        setResult(`❌ Error: Status ${response.status} - ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Connection failed');
      setResult(`❌ Error: ${error.message || 'Connection failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiEndpoint = async () => {
    const apiUrl = API_BASE_URL;
    
    if (!apiUrl) {
      Alert.alert('Error', 'API_BASE_URL is not set');
      setResult('❌ Error: API_BASE_URL is not set');
      return;
    }

    setLoading(true);
    
    try {
      // Try a simple API endpoint
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success!', JSON.stringify(data, null, 2));
        setResult(`✅ API Connected: ${JSON.stringify(data)}`);
      } else {
        Alert.alert('Error', `Status: ${response.status}\n${JSON.stringify(data)}`);
        setResult(`❌ API Error: Status ${response.status} - ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'API connection failed');
      setResult(`❌ API Error: ${error.message || 'Connection failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating debug button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Icon name="bug" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Debug modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Debug Panel</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Configuration</Text>
                <Text style={styles.infoText}>
                  EXPO_PUBLIC_API_URL:{'\n'}
                  {process.env.EXPO_PUBLIC_API_URL || 'NOT SET'}
                </Text>
                <Text style={styles.infoText}>
                  API_BASE_URL:{'\n'}
                  {API_BASE_URL || 'NOT SET'}
                </Text>
                <Text style={styles.infoText}>
                  Build Profile:{'\n'}
                  {process.env.EAS_BUILD_PROFILE || 'development'}
                </Text>
              </View>

              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>Test Result</Text>
                <Text style={styles.resultText}>{result || 'No test run yet'}</Text>
              </View>

              <View style={styles.buttonSection}>
                <TouchableOpacity
                  style={[styles.testButton, loading && styles.testButtonDisabled]}
                  onPress={testConnection}
                  disabled={loading}
                >
                  <Icon name="network" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>
                    {loading ? 'Testing...' : 'Test Base URL'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.testButton, styles.testButtonSecondary, loading && styles.testButtonDisabled]}
                  onPress={testApiEndpoint}
                  disabled={loading}
                >
                  <Icon name="api" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>
                    {loading ? 'Testing...' : 'Test API Endpoint'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.main,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: 8,
    lineHeight: 18,
  },
  resultSection: {
    marginBottom: 24,
    backgroundColor: Colors.background.default,
    padding: 16,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  buttonSection: {
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonSecondary: {
    backgroundColor: Colors.secondary.main,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
