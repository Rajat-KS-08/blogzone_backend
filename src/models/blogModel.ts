export interface IBlog {
  id?: string;
  blogTitle: string;
  blogContent: string;
  imageUrl?: string;
  userId: number;            // from users table
  profileName: string;       // author name
  likes?: string[];          // UUID array
  dislikes?: string[];       // UUID array
  createdAt?: Date | string;
  profileImage?: string;     // author's profile image
}