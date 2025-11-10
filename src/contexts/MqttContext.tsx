import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { Connection, SwitchPanel, ConnectionStatus } from '@/types/mqtt';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

interface MqttContextType {
  connections: Connection[];
  switches: SwitchPanel[];
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
  publishMessage: (connectionId: string, topic: string, payload: string, qos: 0 | 1 | 2, retain?: boolean) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [switches, setSwitches] = useState<SwitchPanel[]>([]);
  const [clients, setClients] = useState<Map<string, MqttClient>>(new Map());

  useEffect(() => {
    const loadedConnections = storage.getConnections();
    const loadedSwitches = storage.getSwitches();
    setConnections(loadedConnections);
    setSwitches(loadedSwitches);

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
        console.log(`Message received on ${topic}:`, message.toString());
        
        // Update switch state based on received message
        const sw = switches.find(s => s.topic === topic && s.connectionId === connectionId);
        if (sw) {
          const payload = message.toString();
          const newState = payload === sw.payloadOn;
          updateSwitch(sw.id, { state: newState, lastUpdated: new Date().toISOString() });
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
  }, [connections, switches]);

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

  return (
    <MqttContext.Provider value={{
      connections,
      switches,
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
