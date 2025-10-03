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
    likeCount: row?.likes,
    createdAt: row?.createdAt,
    dislikeCount: row?.dislikes,
  }));
};

//CREATE a new blog
export const createBlog = async (blog: IBlog): Promise<IBlog> => {
  const id = uuidv4();
  const query = `
    INSERT INTO blogs (id, title, texts, image, likes, "createdAt", dislikes)
    VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    RETURNING *;
  `;
  const values = [
    id,
    blog.blogTitle,
    blog.blogContent,
    blog.imageUrl,
    blog.likeCount,
    blog.dislikeCount,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};
