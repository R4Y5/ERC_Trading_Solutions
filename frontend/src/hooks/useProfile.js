
import { useCallback, useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
} from "../services/profileService";
import { getToken } from "../utils/auth";

const editableFields = [
  "title",
  "fname",
  "lname",
  "phone",
  "gender",
  "date_of_birth",
  "addressline",
  "town",
];

function getCustomerForm(user) {
  const customer = user?.customer || {};

  return {
    title: customer.title || "",
    fname: customer.fname || "",
    lname: customer.lname || "",
    phone: customer.phone || "",
    gender: customer.gender || "",
    date_of_birth: formatDateForInput(customer.date_of_birth),
    addressline: customer.addressline || "",
    town: customer.town || "",
  };
}

function formatDateForInput(value) {
  if (!value) return "";

  // A date-only string from MongoDB should stay a date-only string.
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return String(value);
  }

  // For timestamps, use the local calendar date instead of UTC.
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function saveUserLocally(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getErrorMessage(error, fallback) {
  if (error.response?.status === 401) {
    return "Your session may have expired. Please log in again.";
  }

  return error.response?.data?.message || error.message || fallback;
}

export default function useProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(getCustomerForm(null));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!getToken()) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getMyProfile();
      const profile = response.user;

      setUser(profile);
      setFormData(getCustomerForm(profile));
      saveUserLocally(profile);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to load your profile. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Retained for compatibility with any other existing consumers.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // Formik passes validated values directly to this function.
  const saveProfile = async (values) => {
    if (saving) return;

    const submittedValues = values || formData;
    const original = user?.customer || {};
    const changedFields = {};

    editableFields.forEach((field) => {
const originalValue =
  field === "date_of_birth"
    ? formatDateForInput(original[field])
    : String(original[field] ?? "");

      const currentValue = String(
        submittedValues[field] ?? ""
      ).trim();

      // Preserve existing behavior: a blank value doesn't erase
      // an already-filled field.
      if (currentValue === "" && originalValue !== "") {
        return;
      }

      if (currentValue !== originalValue) {
        changedFields[field] = currentValue;
      }
    });

    if (Object.keys(changedFields).length === 0) {
      setMessage("There are no changes to save.");
      setError("");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await updateMyProfile(changedFields);
      const updatedUser = response.user;

      setUser(updatedUser);
      setFormData(getCustomerForm(updatedUser));
      saveUserLocally(updatedUser);

      setEditing(false);
      setMessage(response.message || "Profile updated successfully.");

      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to update your profile. Please try again."
        )
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file || uploadingImage) return false;

    try {
      setUploadingImage(true);
      setMessage("");
      setError("");

      const response = await uploadProfileImage(file);
      const updatedUser = response.user;

      if (!updatedUser?.profile_image) {
        throw new Error(
          "The server did not return a profile image URL. Please check the Cloudinary upload configuration."
        );
      }

      setUser(updatedUser);
      saveUserLocally(updatedUser);

      setMessage(
        response.message || "Profile picture updated successfully."
      );
      setError("");

      return true;
    } catch (err) {
      console.error("Profile image upload error:", err);
      setError(
        getErrorMessage(
          err,
          "Unable to upload your profile picture. Please try again."
        )
      );

      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  const startEditing = () => {
    setFormData(getCustomerForm(user));
    setEditing(true);
    setMessage("");
    setError("");
  };

  const cancelEditing = () => {
    setFormData(getCustomerForm(user));
    setEditing(false);
    setMessage("");
    setError("");
  };

  return {
    user,
    formData,
    loading,
    saving,
    uploadingImage,
    editing,
    message,
    error,
    setMessage,
    setError,
    handleChange,
    saveProfile,
    uploadImage,
    startEditing,
    cancelEditing,
    fetchProfile,
  };
}
