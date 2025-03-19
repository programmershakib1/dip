import axios from "axios";
import { format, isYesterday, formatDistanceToNow } from "date-fns";

// upload image
const imageUpload = async (imageData) => {
  try {
    const formData = new FormData();
    formData.append("image", imageData);

    const { data } = await axios.post(
      `https://api.imgbb.com/1/upload?key=${
        import.meta.env.VITE_IMGBB_API_KEY
      }`,
      formData
    );

    if (data?.success) {
      return data.data.display_url;
    } else {
      throw new Error("Image upload failed");
    }
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

// generate default image
const generateDefaultImage = (name) => {
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

    const imageUrl = `https://ui-avatars.com/api/?name=${firstLetter}&background=${randomColor.slice(
      1
    )}&color=ffffff&size=128`;

    return imageUrl;
  } catch {
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

    const diffInHours = (new Date() - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      const timeDistance = formatDistanceToNow(date, { addSuffix: true });
      return timeDistance.replace(/^about\s| ago$/, "");
    }

    if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }

    return format(date, "MMM dd, yyyy h:mm a");
  } catch {
    return "Invalid Date";
  }
};

export { imageUpload, generateUsername, generateDefaultImage, getTimeAgo };
