import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  TextInput,
  Button,
  Title,
  Text,
  ActivityIndicator,
  Card,
} from "react-native-paper";
import ApiService from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const response = await ApiService.sendOTP(formattedPhone);

      if (response.success) {
        setOtpSent(true);
        Alert.alert("Success", "OTP sent to your mobile number");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const response = await ApiService.verifyOTP(formattedPhone, otp);

      if (response.success) {
        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("userId", response.user_id);
        await AsyncStorage.setItem("phoneNumber", formattedPhone);

        Alert.alert("Success", "Login successful!");
        navigation.navigate("ProfileSetup");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>🌾 GramLink AI</Title>
        <Text style={styles.subtitle}>
          Your AI-powered guide to government schemes
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>
            {otpSent ? "Enter OTP" : "Login with Mobile"}
          </Text>

          <TextInput
            label="Mobile Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            style={styles.input}
            disabled={otpSent}
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
          />

          {loading && <ActivityIndicator size="large" style={styles.loader} />}

          {!otpSent ? (
            <Button
              mode="contained"
              onPress={sendOTP}
              disabled={phone.length !== 10 || loading}
              style={styles.button}
            >
              Send OTP
            </Button>
          ) : (
            <>
              <TextInput
                label="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
              />
              <Button
                mode="contained"
                onPress={verifyOTP}
                disabled={otp.length !== 6 || loading}
                style={styles.button}
              >
                Verify & Login
              </Button>
              <Button
                mode="text"
                onPress={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                style={styles.resendButton}
              >
                Change Number
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <Text style={styles.footer}>
        Multilingual • Voice Enabled • AI Powered
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2e7d32",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "white",
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  resendButton: {
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#999",
    fontSize: 12,
  },
});
