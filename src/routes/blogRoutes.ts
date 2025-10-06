import { Router } from "express";
import { fetchAllBlogs, createNewBlog, hitLikeOrDislikeBlog } from "../controllers/blogController";

const blogRouter = Router();

// Define the route for fetching all blogs
blogRouter.get("/getBlogs", fetchAllBlogs);

// Define the route for creating a new blog
blogRouter.post("/createBlog", createNewBlog);

// Define the route for liking or disliking a blog
blogRouter.post("/hitLikeOrDislike/:blogId", hitLikeOrDislikeBlog);

export default blogRouter;