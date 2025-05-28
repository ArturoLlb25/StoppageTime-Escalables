// export interface Comment {
//   id: string;
//   userId: string;
//   userName: string;
//   userImage?: string;
//   content: string;
//   date: Date;
//   parentId?: string;
//   replies?: Comment[];
// }
export interface Comment {
  _id?: string;  // ID de MongoDB
  id: string;    // ID formateado para el frontend
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  date: Date;
  parentId?: string | null;  // Cambiado para aceptar string, undefined o null
  replies?: Comment[];
}