export interface ConfigItem {
    address: string;
    description: string;
    request?: boolean;
    round?: boolean;
    precision?: number;
    floatOptions?: string;
    dbFloat?: boolean;
}
export interface ClientConfig {
    rct: ClientConfigHostRCT;
    mqtt: ClientConfigMQTT;
}
export interface ClientConfigHostRCT {
    host: string;
    port: number;
}
export interface ClientConfigMQTT {
    plainPayload: boolean;
    rootTopic: string;
    host: string;
    port: number;
}
export interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}
