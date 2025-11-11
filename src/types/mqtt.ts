export type NetworkProtocol = 'tcp-ssl' | 'websocket-secure';
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';
export type QoSLevel = 0 | 1 | 2;

export interface Connection {
  id: string;
  name: string;
  clientId?: string;
  brokerAddress: string;
  port: number;
  protocol: NetworkProtocol;
  path?: string;
  username?: string;
  password?: string;
  cleanSession: boolean;
  autoConnect: boolean;
  status: ConnectionStatus;
  createdAt: string;
}

export interface SwitchPanel {
  id: string;
  connectionId: string;
  name: string;
  topic: string;
  payloadOn: string;
  payloadOff: string;
  qos: QoSLevel;
  retain?: boolean;
  state: boolean;
  icon?: string;
  lastUpdated?: string;
  size?: 'xs' | 'xxs' | 'sm' | 'md' | 'lg' | 'xl';
  colorOn?: string;
  order?: number;
}

export interface ButtonPanel {
  id: string;
  name: string;
  connectionId: string;
  topic: string;
  payload: string;
  qos: QoSLevel;
  retain: boolean;
  icon?: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorOn?: string;
}

export interface UriLauncherPanel {
  id: string;
  name: string;
  connectionId: string;
  topic: string;
  qos: QoSLevel;
  uri?: string;
}

export interface MqttMessage {
  topic: string;
  payload: string | Buffer;
  qos: QoSLevel;
  retain?: boolean;
}
