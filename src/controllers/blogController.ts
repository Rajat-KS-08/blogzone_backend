import { Request, Response } from "express";
import { getBlogs, createBlog, likeOrDislikeBlog } from "../services/blogService";
import { AuthResponseMsgEnum } from "../models/authModel";

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
    if (!newBlog.userId || !newBlog.profileName) {
      res.status(400).json({ message: AuthResponseMsgEnum.USER_NOT_FOUND });
      return;
    }

    if (!newBlog.blogTitle || !newBlog.blogContent) {
      res
        .status(400)
        .json({ message: AuthResponseMsgEnum.MISSING_REQUIRED_FIELDS });
      return;
    }

    const createdBlog = await createBlog(newBlog);
    res.status(201).json({
      message: "Blog created successfully",
      blog: createdBlog,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Implementation for liking a blog
export const hitLikeOrDislikeBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { blogId } = req.params;
    const { userId, type } = req.body;

    if (!userId) {
      res.status(400).json({ message: AuthResponseMsgEnum.USER_NOT_FOUND });
      return;
    }

    const { likes, dislikes } = await likeOrDislikeBlog(blogId, userId, type);

    res.status(200).json({
      message: "Blog liked/unliked successfully",
      likes,
      dislikes,
    });
  } catch (error) {
    console.error("Error liking blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
