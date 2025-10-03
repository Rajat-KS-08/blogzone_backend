import { Request, Response } from "express";
import { pool } from "../db/connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthResponseMsgEnum } from "../models/authModel";

const COOKIE_NAME = "jid";

// Creation of Access Token
const createAccessToken = (user: { user_id: string; email: string }) => {
  const accessToken = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.ACCESS_SECRET_TOKEN as string,
    { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN as any) || "15m" }
  );
  return accessToken;
};

// Creation of Refresh Token
const createRefreshToken = (user: { user_id: string; email: string }) => {
  const refreshToken = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.REFRESH_SECRET_TOKEN as string,
    { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || "7d" }
  );
  return refreshToken;
};

// Register(Sign Up) User
export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      user_name,
      profile_name,
      dob,
      bio,
      country,
      gender,
      profile_img,
    } = req.body;

    if (!email || !password || !profile_name) {
      return res
        .status(400)
        .json({ message: AuthResponseMsgEnum.MISSING_REQUIRED_FIELDS });
    }

    const userEmail = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );

    if ((userEmail.rowCount ?? 0) > 0) {
      return res
        .status(409)
        .json({ message: AuthResponseMsgEnum.EMAIL_ALREADY_EXISTS });
    }

    const userProfileName = await pool.query(
      "SELECT user_id FROM users WHERE profile_name = $1",
      [profile_name]
    );

    if ((userProfileName.rowCount ?? 0) > 0) {
      return res
        .status(409)
        .json({ message: AuthResponseMsgEnum.PROFILE_ALREADY_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (email, password_hash, user_name, profile_name, dob, bio, country, gender, profile_img)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING user_id, email, profile_name
    `;
    const values = [
      email,
      hashedPassword,
      user_name,
      profile_name,
      dob,
      bio,
      country,
      gender,
      profile_img,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: AuthResponseMsgEnum.SERVER_ERROR });
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query(
      "SELECT user_id, email, user_name, profile_name, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rowCount === 0)
      return res
        .status(401)
        .json({ message: AuthResponseMsgEnum.INVALID_CREDNTIALS });

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword)
      return res
        .status(401)
        .json({ message: AuthResponseMsgEnum.INVALID_CREDNTIALS });

    const accessToken = createAccessToken({
      user_id: user.user_id,
      email: user.email,
    });
    const refreshToken = createRefreshToken({
      user_id: user.user_id,
      email: user.email,
    });

    await pool.query(
      "INSERT INTO user_refresh_tokens (user_id, token) VALUES ($1, $2)",
      [user.user_id, refreshToken]
    );

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/api/auth/refresh",
    });

    // Returns userId, email, userName, profileName and accessToken on Successful Login
    res.json({
      user_id: user.user_id,
      email: user.email,
      user_name: user.user_name,
      profile_name: user.profile_name,
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: AuthResponseMsgEnum.SERVER_ERROR });
  }
};

// Refresh Access Token
export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token)
      return res
        .status(401)
        .json({ message: AuthResponseMsgEnum.MISSING_REFRESH_TOKEN });

    const payload = jwt.verify(
      token,
      process.env.REFRESH_SECRET_TOKEN as string
    ) as {
      user_id: string;
      email: string;
    };

    const stored = await pool.query(
      "SELECT token FROM user_refresh_tokens WHERE user_id = $1 AND token = $2",
      [payload.user_id, token]
    );
    if (stored.rowCount === 0)
      return res
        .status(403)
        .json({ message: AuthResponseMsgEnum.REFRESH_TOKEN_NOT_FOUND });

    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);

    await pool.query(
      "UPDATE user_refresh_tokens SET token = $1, created_at = now() WHERE user_id = $2 AND token = $3",
      [newRefreshToken, payload.user_id, token]
    );

    res.cookie(COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/api/auth/refresh",
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: AuthResponseMsgEnum.SERVER_ERROR });
  }
};

// Logout User
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      await pool.query("DELETE FROM user_refresh_tokens WHERE token = $1", [
        token,
      ]);
    }
    res.clearCookie(COOKIE_NAME, { path: "/api/auth/refresh" });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Data
export const getUserData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userResult = await pool.query(
      "SELECT user_id, user_name, profile_name, dob, bio, country, gender, profile_img, created_at, updated_at FROM users WHERE user_id = $1",
      [userId]
    );

    // If user id not found
    if (userResult.rowCount === 0) {
      return res
        .status(404)
        .json({ message: AuthResponseMsgEnum.USER_NOT_FOUND });
    }

    const user = userResult.rows[0];
    const resData = {
      data: user,
      status: 200,
      message: "User data fetched successfully",
    };
    return res.status(200).json(resData);
  } catch (error) {
    console.error("Get User Data error:", error);
    res.status(500).json({ message: AuthResponseMsgEnum.SERVER_ERROR });
  }
};

// Update User Data
export const updateUserData = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      user_name,
      profile_name,
      dob,
      bio,
      country,
      gender,
      profile_img,
    } = req.body;
    if (!user_id || !profile_name) {
      return res
        .status(400)
        .json({ message: AuthResponseMsgEnum.PROFILE_UPDATE_FIELD_MISSING });
    }

    const userId = await pool.query(
      "SELECT user_id, profile_name FROM users WHERE user_id = $1",
      [user_id]
    );

    if (userId.rowCount === 0) {
      return res
        .status(404)
        .json({ message: AuthResponseMsgEnum.USER_NOT_FOUND });
    }

    const userProfileName = await pool.query(
      "SELECT user_id FROM users WHERE profile_name = $1",
      [profile_name]
    );

    if (
      userProfileName?.rows?.length > 1 ||
      userProfileName?.rows[0]?.user_id !== user_id
    ) {
      return res
        .status(400)
        .json({ message: AuthResponseMsgEnum.PROFILE_ALREADY_EXISTS });
    }

    const query = `
      UPDATE users
      SET 
        user_name = $1,
        profile_name = $2,
        dob = $3,
        bio = $4,
        country = $5,
        gender = $6,
        profile_img = $7,
        updated_at = NOW()
      WHERE user_id = $8
      RETURNING user_id, user_name, profile_name, dob, bio, country, gender, profile_img, updated_at
    `;

    const values = [
      user_name,
      profile_name,
      dob,
      bio,
      country,
      gender,
      profile_img,
      user_id,
    ];

    const result = await pool.query(query, values);
    return res.status(200).json({
      message: AuthResponseMsgEnum.PROFILE_UPDATED_SUCCESSFULLY,
      data: result.rows[0], // updated user data
      status: 200
    });
  } catch (error) {
    console.error("Update User Data error:", error);
    res.status(500).json({ message: AuthResponseMsgEnum.SERVER_ERROR });
  }
};
