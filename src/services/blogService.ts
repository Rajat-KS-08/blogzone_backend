import { IBlog } from "../models/blogModel";
import { pool } from "../db/connection";
import { v4 as uuidv4 } from "uuid";

//GET all blogs from the database to display on the Home page
export const getBlogs = async (): Promise<IBlog[]> => {
  const query = "SELECT * FROM blogs";
  const { rows } = await pool.query(query);
  return rows.map((row) => ({
    id: row?.id,
    blogTitle: row?.title,
    blogContent: row?.texts,
    imageUrl: row?.image,
    likes: row?.likes,
    createdAt: row?.createdAt,
    dislikes: row?.dislikes,
    userId: row?.user_id,
    profileName: row?.profile_name,
    profileImage: row?.profile_img,
  }));
};

//CREATE a new blog
export const createBlog = async (blog: IBlog): Promise<IBlog> => {
  const id = uuidv4();

  const query = `
    INSERT INTO blogs (id, title, texts, image, likes, dislikes, "createdAt", user_id, profile_name, profile_img)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    id,
    blog.blogTitle,
    blog.blogContent,
    blog.imageUrl || null,
    [], // empty array for likes
    [], // empty array for dislikes
    blog.userId,
    blog.profileName,
    blog.profileImage || null,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Function to like a blog
export const likeOrDislikeBlog = async (
  blogId: string,
  userId: string,
  type: "like" | "dislike"
): Promise<{ likes: string[]; dislikes: string[] }> => {
  const query = `SELECT likes, dislikes FROM blogs WHERE id = $1`;
  const { rows } = await pool.query(query, [blogId]);

  if (rows.length === 0) {
    throw new Error("Blog not found");
  }

  let { likes, dislikes } = rows[0];
  likes = likes || [];
  dislikes = dislikes || [];

  if (type === "like") {
    // If user already liked → remove like (toggle off)
    if (likes.includes(userId)) {
      likes = likes.filter((id: string) => id !== userId);
    } else {
      // Remove from dislikes if present
      dislikes = dislikes.filter((id: string) => id !== userId);
      // Add to likes
      likes.push(userId);
    }
  } else if (type === "dislike") {
    // If user already disliked → remove dislike (toggle off)
    if (dislikes.includes(userId)) {
      dislikes = dislikes.filter((id: string) => id !== userId);
    } else {
      // Remove from likes if present
      likes = likes.filter((id: string) => id !== userId);
      // Add to dislikes
      dislikes.push(userId);
    }
  }

  // Update the blogs table
  const updateQuery = `
    UPDATE blogs
    SET likes = $1, dislikes = $2
    WHERE id = $3
    RETURNING likes, dislikes
  `;
  const updateResult = await pool.query(updateQuery, [likes, dislikes, blogId]);

  const updatedBlog = updateResult.rows[0];

  return {
    likes: updatedBlog.likes,
    dislikes: updatedBlog.dislikes,
  };
};
