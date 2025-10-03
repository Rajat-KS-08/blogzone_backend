import { Router } from "express";
import { fetchAllBlogs, createNewBlog } from "../controllers/blogController";

const blogRouter = Router();

// Define the route for fetching all blogs
blogRouter.get("/getBlogs", fetchAllBlogs);

// Define the route for creating a new blog
blogRouter.post("/postBlog", createNewBlog);

export default blogRouter;