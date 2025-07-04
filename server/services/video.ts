import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

export class VideoService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), "uploads", "videos");
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory(): Promise<void> {
    try {
      if (!await exists(this.uploadsDir)) {
        await mkdir(this.uploadsDir, { recursive: true });
      }
    } catch (error) {
      console.error("Error creating uploads directory:", error);
    }
  }

  async saveVideoFile(videoBase64: string, filename: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const base64Data = videoBase64.replace(/^data:video\/[a-z]+;base64,/, "");
      
      // Convert base64 to buffer
      const videoBuffer = Buffer.from(base64Data, "base64");
      
      // Generate unique filename
      const timestamp = Date.now();
      const videoFilename = `${timestamp}_${filename}`;
      const filePath = path.join(this.uploadsDir, videoFilename);
      
      // Save file
      await writeFile(filePath, videoBuffer);
      
      console.log("Video saved successfully:", filePath);
      return filePath;
    } catch (error) {
      console.error("Error saving video file:", error);
      throw new Error("Failed to save video file: " + (error as Error).message);
    }
  }

  async getVideoFile(filePath: string): Promise<Buffer> {
    try {
      if (!await exists(filePath)) {
        throw new Error("Video file not found");
      }
      
      return await readFile(filePath);
    } catch (error) {
      console.error("Error reading video file:", error);
      throw new Error("Failed to read video file: " + (error as Error).message);
    }
  }

  async getVideoBase64(filePath: string): Promise<string> {
    try {
      const videoBuffer = await this.getVideoFile(filePath);
      return videoBuffer.toString("base64");
    } catch (error) {
      console.error("Error converting video to base64:", error);
      throw new Error("Failed to convert video to base64: " + (error as Error).message);
    }
  }

  async deleteVideoFile(filePath: string): Promise<void> {
    try {
      if (await exists(filePath)) {
        await promisify(fs.unlink)(filePath);
        console.log("Video file deleted:", filePath);
      }
    } catch (error) {
      console.error("Error deleting video file:", error);
      throw new Error("Failed to delete video file: " + (error as Error).message);
    }
  }

  getVideoUrl(filePath: string): string {
    // Return a URL that can be used to stream the video
    const filename = path.basename(filePath);
    return `/api/videos/${filename}`;
  }
}

export const videoService = new VideoService();
