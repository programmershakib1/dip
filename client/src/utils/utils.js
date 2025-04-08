import { format, isYesterday, differenceInSeconds } from "date-fns";
import axios from "axios";

// upload image
const imageUpload = async (imageData) => {
  try {
    const formData = new FormData();
    formData.append("file", imageData);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      formData
    );

    return data.secure_url;
  } catch (error) {
    throw new Error(error?.message || "Image upload failed");
  }
};

// generate username
const generateUsername = async (name) => {
  try {
    let cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (cleanName.length < 6) {
      cleanName = cleanName + Math.floor(100000 + Math.random() * 900000);
      cleanName = cleanName.slice(0, 6);
    }

    let username = cleanName;
    let attempts = 0;

    while (!(await isUsernameAvailable(username)) && attempts < 10) {
      attempts += 1;
      username = cleanName.slice(0, 10) + Math.floor(10 + Math.random() * 90);
    }

    if (attempts === 10) {
      throw new Error("Unable to generate a unique username.");
    }

    return username;
  } catch (error) {
    throw new Error(error?.message || "Something went wrong");
  }
};

const isUsernameAvailable = async (username) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/user_name/${username}`
    );

    return response.data.available;
  } catch {
    return false;
  }
};

// generate profile image
const generateProfile = (name) => {
  try {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = [
      "#4CAF50",
      "#FF5722",
      "#2196F3",
      "#FFC107",
      "#9C27B0",
      "#E91E63",
      "#00BCD4",
      "#FF9800",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const profileUrl = `https://ui-avatars.com/api/?name=${firstLetter}&background=${randomColor.slice(
      1
    )}&color=ffffff&size=128`;

    return profileUrl;
  } catch {
    return null;
  }
};

// generate cover image
const generateCover = async (name) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    const colors = [
      "#4CAF50",
      "#FF5722",
      "#2196F3",
      "#FFC107",
      "#9C27B0",
      "#E91E63",
      "#00BCD4",
      "#FF9800",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = randomColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );
    const coverUrl = await imageUpload(blob);

    return coverUrl;
  } catch (error) {
    console.error("Error generating cover image:", error);
    return null;
  }
};

// time format
const getTimeAgo = (dateString) => {
  try {
    const date = new Date(dateString);

    if (isNaN(date)) {
      throw new Error("Invalid date");
    }

    const now = new Date();
    const secondsDiff = differenceInSeconds(now, date);

    if (secondsDiff < 60) {
      return "Just now";
    }

    const minutesDiff = Math.floor(secondsDiff / 60);
    if (minutesDiff < 60) {
      return `${minutesDiff}m`;
    }

    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24) {
      return `${hoursDiff}h`;
    }

    if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }

    const daysDiff = Math.floor(hoursDiff / 24);
    if (daysDiff < 7) {
      return `${format(date, "EEEE 'at' h:mm a")}`;
    }

    return format(date, "MMMM d 'at' h:mm a");
  } catch {
    return "Invalid Date";
  }
};

export {
  imageUpload,
  generateUsername,
  generateProfile,
  generateCover,
  getTimeAgo,
};
