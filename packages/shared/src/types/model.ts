export interface Model {
  id: string;
  name: string;
  description?: string;
  providerId: string;
  metrics?: {
    accuracy: number;
    speed: number;
    cost: number;
  };
  aiProviderId?: string;
}
