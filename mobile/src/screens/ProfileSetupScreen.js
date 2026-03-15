import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Button,
  Title,
  Text,
  TextInput,
  Card,
  ActivityIndicator,
} from "react-native-paper";
import ApiService from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileSetupScreen({ navigation }) {
  const [extractedData, setExtractedData] = useState({
    name: "",
    age: "",
    gender: "",
    state: "",
    district: "",
    occupation: "",
    aadhaar_number: "",
    pan_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [aadhaarExtracted, setAadhaarExtracted] = useState(false);
  const [panExtracted, setPanExtracted] = useState(false);

  const extractAadhaarData = async () => {
    setLoading(true);
    try {
      // Directly use mock data without image upload
      const mockData = {
        name: "Ramesh Kumar",
        age: "46",
        gender: "Male",
        state: "Bihar",
        district: "Patna",
        occupation: "Farmer",
        aadhaar_number: "234567891234",
      };

      setExtractedData((prev) => ({
        ...prev,
        ...mockData,
      }));

      setAadhaarExtracted(true);
      Alert.alert(
        "✅ Success",
        "All Aadhaar details extracted!\n\nName, Age, Gender, State, District, Occupation, and Aadhaar Number have been filled.",
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to extract data");
    } finally {
      setLoading(false);
    }
  };

  const extractPANData = async () => {
    setLoading(true);
    try {
      // Directly use mock data without image upload
      const mockData = {
        pan_number: "ABCDE1234F",
        name: "Ramesh Kumar",
      };

      setExtractedData((prev) => ({
        ...prev,
        pan_number: mockData.pan_number,
        // Only update name if not already set
        name: prev.name || mockData.name,
      }));

      setPanExtracted(true);
      Alert.alert("✅ Success", "PAN Number extracted!\n\nPAN: ABCDE1234F");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to extract data");
    } finally {
      setLoading(false);
    }
  };

  const confirmProfile = async () => {
    // Validate required fields
    if (!extractedData.name || !extractedData.age || !extractedData.gender) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Name, Age, Gender)",
      );
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");

      const profileData = {
        user_id: userId,
        ...extractedData,
        age: parseInt(extractedData.age) || 0,
      };

      const response = await ApiService.createProfile(profileData);

      if (response.success) {
        Alert.alert("Success", "Profile created successfully!");
        navigation.navigate("Home");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Setup Your Profile</Title>
      <Text style={styles.subtitle}>
        Extract data from documents or enter manually
      </Text>

      {loading && (
        <ActivityIndicator size="large" style={styles.loader} color="#2e7d32" />
      )}

      {/* Aadhaar Card */}
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          <Text style={styles.cardTitle}>📄 Aadhaar Card</Text>
          <Text style={styles.cardSubtitle}>
            Click below to extract Aadhaar details
          </Text>
          <Button
            mode={aadhaarExtracted ? "outlined" : "contained"}
            onPress={extractAadhaarData}
            style={styles.uploadButton}
            buttonColor={aadhaarExtracted ? undefined : "#2e7d32"}
            icon={aadhaarExtracted ? "check-circle" : "card-account-details"}
            disabled={loading}
          >
            {aadhaarExtracted ? "Aadhaar Extracted ✓" : "Extract Aadhaar Data"}
          </Button>
        </Card.Content>
      </Card>

      {/* PAN Card */}
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          <Text style={styles.cardTitle}>💳 PAN Card</Text>
          <Text style={styles.cardSubtitle}>
            Click below to extract PAN details
          </Text>
          <Button
            mode={panExtracted ? "outlined" : "contained"}
            onPress={extractPANData}
            style={styles.uploadButton}
            buttonColor={panExtracted ? undefined : "#2e7d32"}
            icon={
              panExtracted ? "check-circle" : "card-account-details-outline"
            }
            disabled={loading}
          >
            {panExtracted ? "PAN Extracted ✓" : "Extract PAN Data"}
          </Button>
        </Card.Content>
      </Card>

      {/* Extracted Details Form */}
      {(aadhaarExtracted || panExtracted || extractedData.name) && (
        <Card style={styles.card} elevation={4}>
          <Card.Content>
            <Text style={styles.cardTitle}>✏️ Extracted Details</Text>
            <Text style={styles.cardSubtitle}>
              Review and edit the information below
            </Text>

            <TextInput
              label="Full Name *"
              value={extractedData.name}
              onChangeText={(text) =>
                setExtractedData((prev) => ({ ...prev, name: text }))
              }
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
            />

            <TextInput
              label="Age *"
              value={String(extractedData.age)}
              onChangeText={(text) =>
                setExtractedData((prev) => ({ ...prev, age: text }))
              }
              keyboardType="number-pad"
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
            />

            <TextInput
              label="Gender *"
              value={extractedData.gender}
              onChangeText={(text) =>
                setExtractedData((prev) => ({ ...prev, gender: text }))
              }
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
              placeholder="Male/Female/Other"
            />

            <TextInput
              label="State"
              value={extractedData.state}
              onChangeText={(text) =>
                setExtractedData((prev) => ({ ...prev, state: text }))
              }
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
            />

            <TextInput
              label="District"
              value={extractedData.district}
              onChangeText={(text) =>
                setExtractedData((prev) => ({ ...prev, district: text }))
              }
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
            />

            <TextInput
              label="Occupation (e.g., Farmer, Student, Business)"
              value={extractedData.occupation}
              onChangeText={(text) =>
                setExtractedData((prev) => ({ ...prev, occupation: text }))
              }
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
            />

            <TextInput
              label="Aadhaar Number"
              value={extractedData.aadhaar_number}
              onChangeText={(text) =>
                setExtractedData((prev) => ({ ...prev, aadhaar_number: text }))
              }
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
              keyboardType="number-pad"
              maxLength={12}
            />

            <TextInput
              label="PAN Number"
              value={extractedData.pan_number}
              onChangeText={(text) =>
                setExtractedData((prev) => ({
                  ...prev,
                  pan_number: text.toUpperCase(),
                }))
              }
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
              maxLength={10}
              autoCapitalize="characters"
            />

            <Text style={styles.requiredNote}>* Required fields</Text>
          </Card.Content>
        </Card>
      )}

      {/* Confirm Button */}
      {extractedData.name && (
        <Button
          mode="contained"
          onPress={confirmProfile}
          style={styles.confirmButton}
          disabled={loading}
          buttonColor="#2e7d32"
          icon="check-circle"
          contentStyle={styles.confirmButtonContent}
        >
          Confirm & Continue
        </Button>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2e7d32",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    color: "#666",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    color: "#666",
  },
  uploadButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  requiredNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
  confirmButton: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  confirmButtonContent: {
    paddingVertical: 4,
  },
  loader: {
    marginVertical: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});
