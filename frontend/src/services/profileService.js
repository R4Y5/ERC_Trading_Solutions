
import api from "./api";

export const getMyProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await api.put("/users/profile", profileData);
  return response.data;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("profile_image", file);

  // Axios uses FormData to send multipart/form-data.
  // Do not manually set Content-Type; Axios/browser supplies
  // the required multipart boundary.
  const response = await api.put("/users/profile", formData);

  return response.data;
};
