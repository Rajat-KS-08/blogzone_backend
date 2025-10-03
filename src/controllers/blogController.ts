import { Request, Response } from "express";
import { getBlogs, createBlog } from "../services/blogService";
import { stat } from "fs";

export const fetchAllBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogs = await getBlogs();
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createNewBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newBlog = req.body;
    const createdBlog = await createBlog(newBlog);
    res.status(201).json({
        message: "Blog created successfully",
        blog: createdBlog,
        status: 201
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
