import { Connection, SwitchPanel } from '@/types/mqtt';

const CONNECTIONS_KEY = 'iot_mqtt_connections';
const SWITCHES_KEY = 'iot_mqtt_switches';

export const storage = {
  // Connections
  getConnections: (): Connection[] => {
    const data = localStorage.getItem(CONNECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveConnections: (connections: Connection[]) => {
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
  },

  addConnection: (connection: Connection) => {
    const connections = storage.getConnections();
    connections.push(connection);
    storage.saveConnections(connections);
  },

  updateConnection: (id: string, updates: Partial<Connection>) => {
    const connections = storage.getConnections();
    const index = connections.findIndex(c => c.id === id);
    if (index !== -1) {
      connections[index] = { ...connections[index], ...updates };
      storage.saveConnections(connections);
    }
  },

  deleteConnection: (id: string) => {
    const connections = storage.getConnections().filter(c => c.id !== id);
    storage.saveConnections(connections);
    
    // Also delete associated switches
    const switches = storage.getSwitches().filter(s => s.connectionId !== id);
    storage.saveSwitches(switches);
  },

  // Switches
  getSwitches: (): SwitchPanel[] => {
    const data = localStorage.getItem(SWITCHES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSwitches: (switches: SwitchPanel[]) => {
    localStorage.setItem(SWITCHES_KEY, JSON.stringify(switches));
  },

  addSwitch: (switchPanel: SwitchPanel) => {
    const switches = storage.getSwitches();
    switches.push(switchPanel);
    storage.saveSwitches(switches);
  },

  updateSwitch: (id: string, updates: Partial<SwitchPanel>) => {
    const switches = storage.getSwitches();
    const index = switches.findIndex(s => s.id === id);
    if (index !== -1) {
      switches[index] = { ...switches[index], ...updates };
      storage.saveSwitches(switches);
    }
  },

  deleteSwitch: (id: string) => {
    const switches = storage.getSwitches().filter(s => s.id !== id);
    storage.saveSwitches(switches);
  },

  getSwitchesByConnection: (connectionId: string): SwitchPanel[] => {
    return storage.getSwitches().filter(s => s.connectionId === connectionId);
  },
};
