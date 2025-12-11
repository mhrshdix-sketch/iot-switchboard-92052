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

  // Refs to always have access to latest state in callbacks (fixes stale closure)
  const switchesRef = useRef<SwitchPanel[]>([]);
  const uriLaunchersRef = useRef<UriLauncherPanel[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    switchesRef.current = switches;
  }, [switches]);

  useEffect(() => {
    uriLaunchersRef.current = uriLaunchers;
  }, [uriLaunchers]);

  useEffect(() => {
    const loadedConnections = storage.getConnections();
    const loadedSwitches = storage.getSwitches();
    setConnections(loadedConnections);
    setSwitches(loadedSwitches);

    const savedButtons = localStorage.getItem('mqtt_button_panels');
    if (savedButtons) setButtonPanels(JSON.parse(savedButtons));
    
    const savedUris = localStorage.getItem('mqtt_uri_launchers');
    if (savedUris) setUriLaunchers(JSON.parse(savedUris));

    // Auto-connect to brokers
    loadedConnections.forEach(conn => {
      if (conn.autoConnect) {
        connectTobroker(conn.id);
      }
    });

    return () => {
      clients.forEach(client => client.end());
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('mqtt_button_panels', JSON.stringify(buttonPanels));
  }, [buttonPanels]);

  useEffect(() => {
    localStorage.setItem('mqtt_uri_launchers', JSON.stringify(uriLaunchers));
  }, [uriLaunchers]);

  const updateConnectionStatus = (id: string, status: ConnectionStatus) => {
    setConnections(prev => 
      prev.map(conn => conn.id === id ? { ...conn, status } : conn)
    );
    storage.updateConnection(id, { status });
  };

  const connectTobroker = useCallback(async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId) || 
                       storage.getConnections().find(c => c.id === connectionId);
    
    if (!connection) return;

    try {
      updateConnectionStatus(connectionId, 'connecting');

      let brokerUrl: string;
      if (connection.protocol === 'websocket-secure') {
        const path = connection.path || '/mqtt';
        brokerUrl = `wss://${connection.brokerAddress}:${connection.port}${path}`;
      } else {
        brokerUrl = `mqtts://${connection.brokerAddress}:${connection.port}`;
      }

      const options: mqtt.IClientOptions = {
        clientId: connection.clientId || `mqtt_${Math.random().toString(16).slice(2, 10)}`,
        username: connection.username,
        password: connection.password,
        clean: connection.cleanSession,
        reconnectPeriod: 5000,
        keepalive: 60,
        connectTimeout: 30000,
        protocolVersion: 5,
        rejectUnauthorized: false,
      };

      const client = mqtt.connect(brokerUrl, options);

      client.on('connect', () => {
        console.log(`Connected to ${connection.name}`);
        updateConnectionStatus(connectionId, 'connected');
        toast.success(`متصل شد به ${connection.name}`);

        // Subscribe to switch topics
        const connectionSwitches = storage.getSwitchesByConnection(connectionId);
        connectionSwitches.forEach(sw => {
          client.subscribe(sw.topic, { qos: sw.qos }, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${sw.topic}:`, err);
            }
          });
        });

        // Subscribe to URI launcher topics
        const savedUris = localStorage.getItem('mqtt_uri_launchers');
        if (savedUris) {
          const uris: UriLauncherPanel[] = JSON.parse(savedUris);
          uris.filter(u => u.connectionId === connectionId).forEach(uri => {
            client.subscribe(uri.topic, { qos: uri.qos }, (err) => {
              if (err) {
                console.error(`Failed to subscribe to ${uri.topic}:`, err);
              }
            });
          });
        }
      });

      client.on('error', (error) => {
        console.error(`Connection error for ${connection.name}:`, error);
        updateConnectionStatus(connectionId, 'disconnected');
        toast.error(`خطا در اتصال به ${connection.name}`);
      });

      client.on('close', () => {
        console.log(`Disconnected from ${connection.name}`);
        updateConnectionStatus(connectionId, 'disconnected');
      });

      client.on('message', (topic, message) => {
        const payload = message.toString().trim();
        console.log(`📨 Message received on ${topic}:`, payload);
        
        // Use ref to get current switches (fixes stale closure)
        const currentSwitches = switchesRef.current;
        const sw = currentSwitches.find(s => s.topic === topic && s.connectionId === connectionId);
        
        if (sw) {
          const newState = payload === sw.payloadOn;
          console.log(`🔄 Updating switch "${sw.name}" state to:`, newState, `(payload: "${payload}", payloadOn: "${sw.payloadOn}")`);
          
          // Update both storage and state
          storage.updateSwitch(sw.id, { state: newState, lastUpdated: new Date().toISOString() });
          setSwitches(prev => 
            prev.map(s => s.id === sw.id ? { ...s, state: newState, lastUpdated: new Date().toISOString() } : s)
          );
        }

        // Update URI launcher using ref
        const currentUriLaunchers = uriLaunchersRef.current;
        const uri = currentUriLaunchers.find(u => u.topic === topic && u.connectionId === connectionId);
        if (uri) {
          setUriLaunchers(prev => prev.map(u => {
            if (u.id === uri.id) {
              return { ...u, uri: payload };
            }
            return u;
          }));
        }
      });

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
  }, [connections]);

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
  }, [clients, connections]);

  const addConnection = (connection: Omit<Connection, 'id' | 'status' | 'createdAt'>) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn_${Date.now()}`,
      status: 'disconnected',
      createdAt: new Date().toISOString(),
    };
    storage.addConnection(newConnection);
    setConnections(prev => [...prev, newConnection]);
    
    if (newConnection.autoConnect) {
      connectTobroker(newConnection.id);
    }
    
    toast.success(`اتصال ${newConnection.name} ایجاد شد`);
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    storage.updateConnection(id, updates);
    setConnections(prev => 
      prev.map(conn => conn.id === id ? { ...conn, ...updates } : conn)
    );
  };

  const deleteConnection = (id: string) => {
    disconnectFromBroker(id);
    storage.deleteConnection(id);
    setConnections(prev => prev.filter(c => c.id !== id));
    setSwitches(prev => prev.filter(s => s.connectionId !== id));
    setButtonPanels(prev => prev.filter(b => b.connectionId !== id));
    setUriLaunchers(prev => prev.filter(u => u.connectionId !== id));
    
    const connection = connections.find(c => c.id === id);
    if (connection) {
      toast.success(`اتصال ${connection.name} حذف شد`);
    }
  };

  const addSwitch = (switchPanel: Omit<SwitchPanel, 'id' | 'state'>) => {
    const newSwitch: SwitchPanel = {
      ...switchPanel,
      id: `switch_${Date.now()}`,
      state: false,
    };
    storage.addSwitch(newSwitch);
    setSwitches(prev => [...prev, newSwitch]);
    
    // Subscribe to topic if connection is active
    const client = clients.get(switchPanel.connectionId);
    if (client && client.connected) {
      client.subscribe(newSwitch.topic, { qos: newSwitch.qos });
    }
    
    toast.success(`پنل ${newSwitch.name} ایجاد شد`);
  };

  const updateSwitch = (id: string, updates: Partial<SwitchPanel>) => {
    storage.updateSwitch(id, updates);
    setSwitches(prev => 
      prev.map(sw => sw.id === id ? { ...sw, ...updates } : sw)
    );
  };

  const deleteSwitch = (id: string) => {
    const sw = switches.find(s => s.id === id);
    
    // Unsubscribe from topic
    if (sw) {
      const client = clients.get(sw.connectionId);
      if (client && client.connected) {
        client.unsubscribe(sw.topic);
      }
    }
    
    storage.deleteSwitch(id);
    setSwitches(prev => prev.filter(s => s.id !== id));
    
    if (sw) {
      toast.success(`پنل ${sw.name} حذف شد`);
    }
  };

  const publishMessage = (connectionId: string, topic: string, payload: string, qos: 0 | 1 | 2, retain?: boolean) => {
    const client = clients.get(connectionId);
    if (client && client.connected) {
      client.publish(topic, payload, { qos, retain: retain || false }, (err) => {
        if (err) {
          console.error('Publish error:', err);
          toast.error('خطا در ارسال پیام');
        }
      });
    } else {
      toast.error('اتصال برقرار نیست');
    }
  };

  const toggleSwitch = (switchId: string) => {
    const sw = switches.find(s => s.id === switchId);
    if (!sw) return;

    const newState = !sw.state;
    const payload = newState ? sw.payloadOn : sw.payloadOff;
    
    publishMessage(sw.connectionId, sw.topic, payload, sw.qos, sw.retain);
    updateSwitch(switchId, { 
      state: newState, 
      lastUpdated: new Date().toISOString() 
    });
  };

  // Button Panel functions
  const addButtonPanel = (buttonPanel: Omit<ButtonPanel, 'id'>) => {
    const newButton: ButtonPanel = {
      ...buttonPanel,
      id: `button_${Date.now()}`,
    };
    setButtonPanels(prev => [...prev, newButton]);
    toast.success(`دکمه ${newButton.name} ایجاد شد`);
  };

  const updateButtonPanel = (id: string, updates: Partial<ButtonPanel>) => {
    setButtonPanels(prev => 
      prev.map(btn => btn.id === id ? { ...btn, ...updates } : btn)
    );
  };

  const deleteButtonPanel = (id: string) => {
    const btn = buttonPanels.find(b => b.id === id);
    setButtonPanels(prev => prev.filter(b => b.id !== id));
    if (btn) {
      toast.success(`دکمه ${btn.name} حذف شد`);
    }
  };

  const triggerButton = (id: string) => {
    const btn = buttonPanels.find(b => b.id === id);
    if (!btn) return;

    publishMessage(btn.connectionId, btn.topic, btn.payload, btn.qos, btn.retain);
    toast.success(`دکمه ${btn.name} فعال شد`);
  };

  // URI Launcher functions
  const addUriLauncher = (uriLauncher: Omit<UriLauncherPanel, 'id' | 'uri'>) => {
    const newUri: UriLauncherPanel = {
      ...uriLauncher,
      id: `uri_${Date.now()}`,
    };
    setUriLaunchers(prev => [...prev, newUri]);

    // Subscribe to topic if connection is active
    const client = clients.get(uriLauncher.connectionId);
    if (client && client.connected) {
      client.subscribe(newUri.topic, { qos: newUri.qos });
    }

    toast.success(`پنل ${newUri.name} ایجاد شد`);
  };

  const updateUriLauncher = (id: string, updates: Partial<UriLauncherPanel>) => {
    setUriLaunchers(prev => 
      prev.map(uri => uri.id === id ? { ...uri, ...updates } : uri)
    );
  };

  const deleteUriLauncher = (id: string) => {
    const uri = uriLaunchers.find(u => u.id === id);
    
    // Unsubscribe from topic
    if (uri) {
      const client = clients.get(uri.connectionId);
      if (client && client.connected) {
        client.unsubscribe(uri.topic);
      }
    }

    setUriLaunchers(prev => prev.filter(u => u.id !== id));
    
    if (uri) {
      toast.success(`پنل ${uri.name} حذف شد`);
    }
  };

  const launchUri = (id: string) => {
    const uri = uriLaunchers.find(u => u.id === id);
    if (uri && uri.uri) {
      window.open(uri.uri, '_blank');
      toast.success('URI باز شد');
    } else {
      toast.error('URI دریافت نشده است');
    }
  };

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
