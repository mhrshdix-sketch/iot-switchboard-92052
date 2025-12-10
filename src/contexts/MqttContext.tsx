import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { Connection, SwitchPanel, ButtonPanel, UriLauncherPanel, ConnectionStatus } from '@/types/mqtt';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

interface MqttContextType {
  connections: Connection[];
  switches: SwitchPanel[];
  buttonPanels: ButtonPanel[];
  uriLaunchers: UriLauncherPanel[];
  clients: Map<string, MqttClient>;
  addConnection: (connection: Omit<Connection, 'id' | 'status' | 'createdAt'>) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  connectTobroker: (connectionId: string) => Promise<void>;
  disconnectFromBroker: (connectionId: string) => void;
  addSwitch: (switchPanel: Omit<SwitchPanel, 'id' | 'state'>) => void;
  updateSwitch: (id: string, updates: Partial<SwitchPanel>) => void;
  deleteSwitch: (id: string) => void;
  toggleSwitch: (switchId: string) => void;
  addButtonPanel: (buttonPanel: Omit<ButtonPanel, 'id'>) => void;
  updateButtonPanel: (id: string, updates: Partial<ButtonPanel>) => void;
  deleteButtonPanel: (id: string) => void;
  triggerButton: (id: string) => void;
  addUriLauncher: (uriLauncher: Omit<UriLauncherPanel, 'id' | 'uri'>) => void;
  updateUriLauncher: (id: string, updates: Partial<UriLauncherPanel>) => void;
  deleteUriLauncher: (id: string) => void;
  launchUri: (id: string) => void;
  publishMessage: (connectionId: string, topic: string, payload: string, qos: 0 | 1 | 2, retain?: boolean) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [switches, setSwitches] = useState<SwitchPanel[]>([]);
  const [buttonPanels, setButtonPanels] = useState<ButtonPanel[]>([]);
  const [uriLaunchers, setUriLaunchers] = useState<UriLauncherPanel[]>([]);
  const [clients, setClients] = useState<Map<string, MqttClient>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs to always have current state in message handlers (avoids stale closure)
  const switchesRef = useRef<SwitchPanel[]>(switches);
  const uriLaunchersRef = useRef<UriLauncherPanel[]>(uriLaunchers);
  const clientsRef = useRef<Map<string, MqttClient>>(clients);

  // Keep refs in sync with state
  useEffect(() => {
    switchesRef.current = switches;
  }, [switches]);

  useEffect(() => {
    uriLaunchersRef.current = uriLaunchers;
  }, [uriLaunchers]);

  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  // Helper function to update switch state from incoming MQTT message
  const updateSwitchStateFromMessage = useCallback((connectionId: string, topic: string, payload: string) => {
    const currentSwitches = switchesRef.current;
    
    // Match by subscribeTopic (if set) OR by topic (for backwards compatibility)
    const matchingSwitches = currentSwitches.filter(sw => {
      const subscribeToTopic = sw.subscribeTopic || sw.topic;
      return subscribeToTopic === topic && sw.connectionId === connectionId;
    });

    matchingSwitches.forEach(sw => {
      let newState: boolean | null = null;
      
      // Trim payloads for comparison to avoid whitespace issues
      const trimmedPayload = payload.trim();
      const payloadOn = sw.payloadOn.trim();
      const payloadOff = sw.payloadOff.trim();
      
      if (trimmedPayload === payloadOn) {
        newState = true;
      } else if (trimmedPayload === payloadOff) {
        newState = false;
      }

      if (newState !== null && newState !== sw.state) {
        console.log(`✅ Updating switch "${sw.name}" state: ${sw.state} → ${newState} (received: "${trimmedPayload}")`);
        
        // Update state directly with functional update
        setSwitches(prev => 
          prev.map(s => s.id === sw.id 
            ? { ...s, state: newState!, lastUpdated: new Date().toISOString() } 
            : s
          )
        );
        
        // Also update storage
        storage.updateSwitch(sw.id, { state: newState, lastUpdated: new Date().toISOString() });
      } else if (newState === null) {
        console.log(`⚠️ Received message on ${topic} with payload "${trimmedPayload}" but doesn't match payloadOn="${payloadOn}" or payloadOff="${payloadOff}"`);
      }
    });
  }, []);

  // Helper function to update URI launcher from incoming message
  const updateUriLauncherFromMessage = useCallback((connectionId: string, topic: string, payload: string) => {
    setUriLaunchers(prev => prev.map(uri => {
      if (uri.topic === topic && uri.connectionId === connectionId) {
        return { ...uri, uri: payload };
      }
      return uri;
    }));
  }, []);

  const updateConnectionStatus = useCallback((id: string, status: ConnectionStatus) => {
    setConnections(prev => 
      prev.map(conn => conn.id === id ? { ...conn, status } : conn)
    );
    storage.updateConnection(id, { status });
  }, []);

  // Core connection function that reads directly from storage
  const connectTobroker = useCallback(async (connectionId: string) => {
    // Always read fresh connection data from storage to avoid stale state
    const allConnections = storage.getConnections();
    const connection = allConnections.find(c => c.id === connectionId);
    
    if (!connection) {
      console.error(`Connection ${connectionId} not found in storage`);
      toast.error('اتصال یافت نشد');
      return;
    }

    // Check if already connected
    const existingClient = clientsRef.current.get(connectionId);
    if (existingClient && existingClient.connected) {
      console.log(`Already connected to ${connection.name}`);
      return;
    }

    try {
      updateConnectionStatus(connectionId, 'connecting');

      // Build broker URL - browsers only support WebSocket connections
      // Both protocols use WSS in browser environment
      const path = connection.path || '/mqtt';
      const brokerUrl = `wss://${connection.brokerAddress}:${connection.port}${path}`;

      console.log(`Connecting to broker: ${brokerUrl}`);
      console.log(`Connection details: protocol=${connection.protocol}, address=${connection.brokerAddress}, port=${connection.port}`);

      const options: mqtt.IClientOptions = {
        clientId: connection.clientId || `iot_dashboard_${Math.random().toString(16).slice(2, 10)}`,
        clean: connection.cleanSession,
        reconnectPeriod: 5000,
        keepalive: 60,
        connectTimeout: 30000,
        protocolVersion: 4, // MQTT 3.1.1 - more compatible with most brokers
        rejectUnauthorized: false,
      };

      // Only add credentials if they exist and are not empty strings
      if (connection.username && connection.username.trim()) {
        options.username = connection.username.trim();
      }
      if (connection.password && connection.password.trim()) {
        options.password = connection.password.trim();
      }

      console.log('Connection options:', { 
        ...options, 
        password: options.password ? '***' : undefined,
        hasUsername: !!options.username,
        hasPassword: !!options.password
      });

      const client = mqtt.connect(brokerUrl, options);

      client.on('connect', () => {
        console.log(`Connected to ${connection.name}`);
        updateConnectionStatus(connectionId, 'connected');
        toast.success(`متصل شد به ${connection.name}`);

        // Subscribe to ALL switch topics for this connection
        const allSwitches = storage.getSwitchesByConnection(connectionId);
        console.log(`📡 Subscribing to ${allSwitches.length} switch topics for connection ${connection.name}`);
        
        allSwitches.forEach(sw => {
          // Use subscribeTopic if available, otherwise use topic
          const subscribeToTopic = sw.subscribeTopic || sw.topic;
          client.subscribe(subscribeToTopic, { qos: sw.qos }, (err) => {
            if (err) {
              console.error(`❌ Failed to subscribe to ${subscribeToTopic}:`, err);
            } else {
              console.log(`✅ Subscribed to switch topic: ${subscribeToTopic} (panel: ${sw.name})`);
            }
          });
        });

        // Subscribe to URI launcher topics
        const savedUris = localStorage.getItem('mqtt_uri_launchers');
        if (savedUris) {
          const uris: UriLauncherPanel[] = JSON.parse(savedUris);
          const connectionUris = uris.filter(u => u.connectionId === connectionId);
          console.log(`Subscribing to ${connectionUris.length} URI launcher topics`);
          
          connectionUris.forEach(uri => {
            client.subscribe(uri.topic, { qos: uri.qos }, (err) => {
              if (err) {
                console.error(`Failed to subscribe to ${uri.topic}:`, err);
              } else {
                console.log(`Subscribed to URI topic ${uri.topic}`);
              }
            });
          });
        }
      });

      client.on('error', (error) => {
        console.error(`Connection error for ${connection.name}:`, error);
        updateConnectionStatus(connectionId, 'disconnected');
        toast.error(`خطا در اتصال به ${connection.name}: ${error.message}`);
      });

      client.on('close', () => {
        console.log(`Disconnected from ${connection.name}`);
        updateConnectionStatus(connectionId, 'disconnected');
      });

      client.on('reconnect', () => {
        console.log(`Reconnecting to ${connection.name}...`);
        updateConnectionStatus(connectionId, 'connecting');
      });

      client.on('offline', () => {
        console.log(`Client offline: ${connection.name}`);
        updateConnectionStatus(connectionId, 'disconnected');
      });

      client.on('message', (topic, message, packet) => {
        const payload = message.toString();
        const isRetained = packet.retain;
        console.log(`📨 Message received on "${topic}": "${payload}" (retained: ${isRetained})`);
        
        // Update switch states using the helper (uses refs for current state)
        updateSwitchStateFromMessage(connectionId, topic, payload);

        // Update URI launcher
        updateUriLauncherFromMessage(connectionId, topic, payload);
      });

      // Store the client
      setClients(prev => {
        const newClients = new Map(prev);
        newClients.set(connectionId, client);
        return newClients;
      });

    } catch (error) {
      console.error(`Failed to connect to ${connection.name}:`, error);
      updateConnectionStatus(connectionId, 'disconnected');
      toast.error(`خطا در اتصال به ${connection.name}`);
    }
  }, [updateConnectionStatus, updateSwitchStateFromMessage, updateUriLauncherFromMessage]);

  // Load data from storage on mount
  useEffect(() => {
    const loadedConnections = storage.getConnections();
    const loadedSwitches = storage.getSwitches();
    setConnections(loadedConnections);
    setSwitches(loadedSwitches);

    const savedButtons = localStorage.getItem('mqtt_button_panels');
    if (savedButtons) setButtonPanels(JSON.parse(savedButtons));
    
    const savedUris = localStorage.getItem('mqtt_uri_launchers');
    if (savedUris) setUriLaunchers(JSON.parse(savedUris));

    setIsInitialized(true);

    return () => {
      clientsRef.current.forEach(client => client.end());
    };
  }, []);

  // Auto-connect after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const allConnections = storage.getConnections();
    allConnections.forEach(conn => {
      if (conn.autoConnect) {
        console.log(`Auto-connecting to ${conn.name}`);
        connectTobroker(conn.id);
      }
    });
  }, [isInitialized, connectTobroker]);

  useEffect(() => {
    localStorage.setItem('mqtt_button_panels', JSON.stringify(buttonPanels));
  }, [buttonPanels]);

  useEffect(() => {
    localStorage.setItem('mqtt_uri_launchers', JSON.stringify(uriLaunchers));
  }, [uriLaunchers]);

  const disconnectFromBroker = useCallback((connectionId: string) => {
    const client = clients.get(connectionId);
    if (client) {
      client.end();
      setClients(prev => {
        const newClients = new Map(prev);
        newClients.delete(connectionId);
        return newClients;
      });
      updateConnectionStatus(connectionId, 'disconnected');
      
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        toast.info(`قطع اتصال از ${connection.name}`);
      }
    }
  }, [clients, connections, updateConnectionStatus]);

  const addConnection = useCallback((connection: Omit<Connection, 'id' | 'status' | 'createdAt'>) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn_${Date.now()}`,
      status: 'disconnected',
      createdAt: new Date().toISOString(),
    };
    storage.addConnection(newConnection);
    setConnections(prev => [...prev, newConnection]);
    
    if (newConnection.autoConnect) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        connectTobroker(newConnection.id);
      }, 100);
    }
    
    toast.success(`اتصال ${newConnection.name} ایجاد شد`);
  }, [connectTobroker]);

  const updateConnection = useCallback((id: string, updates: Partial<Connection>) => {
    storage.updateConnection(id, updates);
    setConnections(prev => 
      prev.map(conn => conn.id === id ? { ...conn, ...updates } : conn)
    );
  }, []);

  const deleteConnection = useCallback((id: string) => {
    const connection = connections.find(c => c.id === id);
    disconnectFromBroker(id);
    storage.deleteConnection(id);
    setConnections(prev => prev.filter(c => c.id !== id));
    setSwitches(prev => prev.filter(s => s.connectionId !== id));
    setButtonPanels(prev => prev.filter(b => b.connectionId !== id));
    setUriLaunchers(prev => prev.filter(u => u.connectionId !== id));
    
    if (connection) {
      toast.success(`اتصال ${connection.name} حذف شد`);
    }
  }, [connections, disconnectFromBroker]);

  const addSwitch = useCallback((switchPanel: Omit<SwitchPanel, 'id' | 'state'>) => {
    const newSwitch: SwitchPanel = {
      ...switchPanel,
      id: `switch_${Date.now()}`,
      state: false,
    };
    storage.addSwitch(newSwitch);
    setSwitches(prev => [...prev, newSwitch]);
    
    // Subscribe to topic if connection is active
    const client = clientsRef.current.get(switchPanel.connectionId);
    if (client && client.connected) {
      const subscribeToTopic = newSwitch.subscribeTopic || newSwitch.topic;
      client.subscribe(subscribeToTopic, { qos: newSwitch.qos }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${subscribeToTopic}:`, err);
        } else {
          console.log(`✅ Subscribed to new switch topic: ${subscribeToTopic}`);
        }
      });
    }
    
    toast.success(`پنل ${newSwitch.name} ایجاد شد`);
  }, []);

  const updateSwitch = useCallback((id: string, updates: Partial<SwitchPanel>) => {
    storage.updateSwitch(id, updates);
    setSwitches(prev => 
      prev.map(sw => sw.id === id ? { ...sw, ...updates } : sw)
    );
  }, []);

  const deleteSwitch = useCallback((id: string) => {
    const sw = switchesRef.current.find(s => s.id === id);
    
    // Unsubscribe from topic
    if (sw) {
      const client = clientsRef.current.get(sw.connectionId);
      if (client && client.connected) {
        const subscribeToTopic = sw.subscribeTopic || sw.topic;
        client.unsubscribe(subscribeToTopic);
      }
    }
    
    storage.deleteSwitch(id);
    setSwitches(prev => prev.filter(s => s.id !== id));
    
    if (sw) {
      toast.success(`پنل ${sw.name} حذف شد`);
    }
  }, []);

  const publishMessage = useCallback((connectionId: string, topic: string, payload: string, qos: 0 | 1 | 2, retain?: boolean) => {
    const client = clientsRef.current.get(connectionId);
    if (client && client.connected) {
      console.log(`Publishing to ${topic}: ${payload} (retain: ${retain || false})`);
      client.publish(topic, payload, { qos, retain: retain || false }, (err) => {
        if (err) {
          console.error('Publish error:', err);
          toast.error('خطا در ارسال پیام');
        }
      });
    } else {
      toast.error('اتصال برقرار نیست');
    }
  }, []);

  const toggleSwitch = useCallback((switchId: string) => {
    const sw = switchesRef.current.find(s => s.id === switchId);
    if (!sw) return;

    const newState = !sw.state;
    const payload = newState ? sw.payloadOn : sw.payloadOff;
    
    publishMessage(sw.connectionId, sw.topic, payload, sw.qos, sw.retain);
    updateSwitch(switchId, { 
      state: newState, 
      lastUpdated: new Date().toISOString() 
    });
  }, [publishMessage, updateSwitch]);

  // Button Panel functions
  const addButtonPanel = useCallback((buttonPanel: Omit<ButtonPanel, 'id'>) => {
    const newButton: ButtonPanel = {
      ...buttonPanel,
      id: `button_${Date.now()}`,
    };
    setButtonPanels(prev => [...prev, newButton]);
    toast.success(`دکمه ${newButton.name} ایجاد شد`);
  }, []);

  const updateButtonPanel = useCallback((id: string, updates: Partial<ButtonPanel>) => {
    setButtonPanels(prev => 
      prev.map(btn => btn.id === id ? { ...btn, ...updates } : btn)
    );
  }, []);

  const deleteButtonPanel = useCallback((id: string) => {
    const btn = buttonPanels.find(b => b.id === id);
    setButtonPanels(prev => prev.filter(b => b.id !== id));
    if (btn) {
      toast.success(`دکمه ${btn.name} حذف شد`);
    }
  }, [buttonPanels]);

  const triggerButton = useCallback((id: string) => {
    const savedButtons = localStorage.getItem('mqtt_button_panels');
    if (!savedButtons) return;
    
    const buttons: ButtonPanel[] = JSON.parse(savedButtons);
    const btn = buttons.find(b => b.id === id);
    if (!btn) return;

    publishMessage(btn.connectionId, btn.topic, btn.payload, btn.qos, btn.retain);
    toast.success(`دکمه ${btn.name} فعال شد`);
  }, [publishMessage]);

  // URI Launcher functions
  const addUriLauncher = useCallback((uriLauncher: Omit<UriLauncherPanel, 'id' | 'uri'>) => {
    const newUri: UriLauncherPanel = {
      ...uriLauncher,
      id: `uri_${Date.now()}`,
    };
    setUriLaunchers(prev => [...prev, newUri]);

    // Subscribe to topic if connection is active
    const client = clientsRef.current.get(uriLauncher.connectionId);
    if (client && client.connected) {
      client.subscribe(newUri.topic, { qos: newUri.qos }, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${newUri.topic}:`, err);
        } else {
          console.log(`Subscribed to URI topic ${newUri.topic}`);
        }
      });
    }

    toast.success(`پنل ${newUri.name} ایجاد شد`);
  }, []);

  const updateUriLauncher = useCallback((id: string, updates: Partial<UriLauncherPanel>) => {
    setUriLaunchers(prev => 
      prev.map(uri => uri.id === id ? { ...uri, ...updates } : uri)
    );
  }, []);

  const deleteUriLauncher = useCallback((id: string) => {
    const uri = uriLaunchersRef.current.find(u => u.id === id);
    
    // Unsubscribe from topic
    if (uri) {
      const client = clientsRef.current.get(uri.connectionId);
      if (client && client.connected) {
        client.unsubscribe(uri.topic);
      }
    }

    setUriLaunchers(prev => prev.filter(u => u.id !== id));
    
    if (uri) {
      toast.success(`پنل ${uri.name} حذف شد`);
    }
  }, []);

  const launchUri = useCallback((id: string) => {
    const uri = uriLaunchersRef.current.find(u => u.id === id);
    if (uri && uri.uri) {
      window.open(uri.uri, '_blank');
      toast.success('URI باز شد');
    } else {
      toast.error('URI دریافت نشده است');
    }
  }, []);

  return (
    <MqttContext.Provider value={{
      connections,
      switches,
      buttonPanels,
      uriLaunchers,
      clients,
      addConnection,
      updateConnection,
      deleteConnection,
      connectTobroker,
      disconnectFromBroker,
      addSwitch,
      updateSwitch,
      deleteSwitch,
      toggleSwitch,
      addButtonPanel,
      updateButtonPanel,
      deleteButtonPanel,
      triggerButton,
      addUriLauncher,
      updateUriLauncher,
      deleteUriLauncher,
      launchUri,
      publishMessage,
    }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error('useMqtt must be used within MqttProvider');
  }
  return context;
};
