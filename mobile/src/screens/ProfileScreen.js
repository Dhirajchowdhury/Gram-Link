import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Image } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  List,
  ActivityIndicator,
  Surface,
  Chip,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../services/api";
import { getTranslation } from "../utils/translations";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    loadProfile();
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const lang = await AsyncStorage.getItem("language");
    if (lang) setLanguage(lang);
  };

  const loadProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const phone = await AsyncStorage.getItem("phoneNumber");

      if (userId) {
        const response = await ApiService.getUserProfile(userId);
        setProfile({ ...response, phone });
      } else {
        setProfile({ phone });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      getTranslation(language, "logout"),
      "Are you sure you want to logout?",
      [
        { text: getTranslation(language, "cancel"), style: "cancel" },
        {
          text: getTranslation(language, "logout"),
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: "Onboarding" }],
            });
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  // Generate AI avatar URL using DiceBear API
  const getAvatarUrl = (name) => {
    const seed = name || "user";
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header Card */}
      <Card style={styles.profileCard} elevation={4}>
        <Card.Content style={styles.profileHeader}>
          <Image
            source={{ uri: getAvatarUrl(profile?.name) }}
            style={styles.avatar}
          />
          <Title style={styles.name}>
            {profile?.name || getTranslation(language, "notSet")}
          </Title>
          <Paragraph style={styles.phone}>{profile?.phone}</Paragraph>
          {profile?.occupation && (
            <Chip
              icon="briefcase"
              style={styles.occupationChip}
              textStyle={styles.occupationText}
            >
              {profile.occupation}
            </Chip>
          )}
        </Card.Content>
      </Card>

      {/* Personal Information */}
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>
              {getTranslation(language, "personalInformation")}
            </Title>
          </View>
          <Divider style={styles.divider} />

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="account" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "fullName")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.name || getTranslation(language, "notSet")}
              </Title>
            </View>
          </Surface>

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="calendar" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "age")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.age
                  ? `${profile.age} ${getTranslation(language, "years")}`
                  : getTranslation(language, "notSet")}
              </Title>
            </View>
          </Surface>

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="gender-male-female" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "gender")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.gender || getTranslation(language, "notSet")}
              </Title>
            </View>
          </Surface>

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="phone" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "phone")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.phone || getTranslation(language, "notSet")}
              </Title>
            </View>
          </Surface>
        </Card.Content>
      </Card>

      {/* Location Information */}
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>
              {getTranslation(language, "location")}
            </Title>
          </View>
          <Divider style={styles.divider} />

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="map-marker" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "state")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.state || getTranslation(language, "notSet")}
              </Title>
            </View>
          </Surface>

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="map-marker-outline" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "district")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.district || getTranslation(language, "notSet")}
              </Title>
            </View>
          </Surface>
        </Card.Content>
      </Card>

      {/* Work Information */}
      {profile?.occupation && (
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>
                {getTranslation(language, "work")}
              </Title>
            </View>
            <Divider style={styles.divider} />

            <Surface style={styles.infoRow} elevation={1}>
              <List.Icon icon="briefcase" color="#2e7d32" />
              <View style={styles.infoContent}>
                <Paragraph style={styles.infoLabel}>
                  {getTranslation(language, "occupation")}
                </Paragraph>
                <Title style={styles.infoValue}>{profile.occupation}</Title>
              </View>
            </Surface>
          </Card.Content>
        </Card>
      )}

      {/* Documents */}
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>
              {getTranslation(language, "documentsSection")}
            </Title>
          </View>
          <Divider style={styles.divider} />

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="card-account-details" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "aadhaarNumber")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.aadhaar_number ||
                  getTranslation(language, "notUploaded")}
              </Title>
            </View>
          </Surface>

          <Surface style={styles.infoRow} elevation={1}>
            <List.Icon icon="card-account-details-outline" color="#2e7d32" />
            <View style={styles.infoContent}>
              <Paragraph style={styles.infoLabel}>
                {getTranslation(language, "panNumber")}
              </Paragraph>
              <Title style={styles.infoValue}>
                {profile?.pan_number || getTranslation(language, "notUploaded")}
              </Title>
            </View>
          </Surface>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate("ProfileSetup")}
        style={styles.button}
        icon="pencil"
        buttonColor="#2e7d32"
      >
        {getTranslation(language, "editProfile")}
      </Button>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.button}
        icon="logout"
        textColor="#d32f2f"
      >
        {getTranslation(language, "logout")}
      </Button>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  profileCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: "#e8f5e9",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  occupationChip: {
    backgroundColor: "#e8f5e9",
  },
  occupationText: {
    color: "#2e7d32",
    fontWeight: "600",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  divider: {
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  button: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});
