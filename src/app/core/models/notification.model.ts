import { TypeNotificationEnum } from './enums';

export interface NotificationResponse {
  idNotification: number;
  titre: string;
  message: string;
  type: TypeNotificationEnum;
  dateEnvoi: string;
  lue: boolean;
  idUtilisateur: number;
  nomUtilisateur?: string;
}
export interface NotificationRequest {
  titre: string;
  message: string;
  type: TypeNotificationEnum;
  idUtilisateur: number;
}
