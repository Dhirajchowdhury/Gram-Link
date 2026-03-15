// API service for backend communication
const API_BASE_URL = "http://192.168.1.9:8000"; // Change to your computer's IP

class ApiService {
  // Auth endpoints
  async sendOTP(phone) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to send OTP");
      }

      return await response.json();
    } catch (error) {
      console.error("Send OTP error:", error);
      throw error;
    }
  }

  async verifyOTP(phone, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Invalid OTP");
      }

      return await response.json();
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  }

  // OCR endpoints
  async uploadAadhaar(imageUri) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "aadhaar.jpg",
      });

      const response = await fetch(`${API_BASE_URL}/profile/upload-aadhaar`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to process Aadhaar");
      }

      return await response.json();
    } catch (error) {
      console.error("Upload Aadhaar error:", error);
      throw error;
    }
  }

  async uploadPAN(imageUri) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "pan.jpg",
      });

      const response = await fetch(`${API_BASE_URL}/profile/upload-pan`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to process PAN");
      }

      return await response.json();
    } catch (error) {
      console.error("Upload PAN error:", error);
      throw error;
    }
  }

  // Profile endpoints
  async createProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Create profile error:", error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${userId}/profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to get profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  // Scheme query endpoints
  async querySchemes(query, language = "en", userId = "unknown") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          language,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to query schemes");
      }

      return await response.json();
    } catch (error) {
      console.error("Query schemes error:", error);
      throw error;
    }
  }

  async getUserApplications(userId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${userId}/applications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to get applications");
      }

      return await response.json();
    } catch (error) {
      console.error("Get applications error:", error);
      throw error;
    }
  }
}

export default new ApiService();
