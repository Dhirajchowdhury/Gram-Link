import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  IconButton,
  SegmentedButtons,
  ActivityIndicator,
  Text,
  Appbar,
  Chip,
  Surface,
} from "react-native-paper";
import ApiService from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTranslation } from "../utils/translations";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadLanguage();
    loadUserName();
  }, []);

  const loadLanguage = async () => {
    const savedLang = await AsyncStorage.getItem("language");
    if (savedLang) setLanguage(savedLang);
  };

  const loadUserName = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const profile = await ApiService.getUserProfile(userId);
        setUserName(profile.name || "User");
      }
    } catch (error) {
      console.log("Could not load user name");
    }
  };

  const saveLanguage = async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem("language", lang);
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      Alert.alert(getTranslation(language, "error"), "Please enter a question");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const response = await ApiService.querySchemes(query, language, userId);

      if (response.schemes && response.schemes.length > 0) {
        navigation.navigate("SchemesList", {
          schemes: response.schemes,
          aiResponse: response.response,
          query: query,
          language: language,
        });
      } else {
        Alert.alert(
          getTranslation(language, "error"),
          response.response || "No matching schemes found for your query.",
        );
      }
    } catch (error) {
      Alert.alert(
        getTranslation(language, "error"),
        error.message || "Failed to search schemes",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    alert("Voice input will be implemented soon!");
  };

  const quickSearches = [
    { label: "Farmers", query: "schemes for farmers", icon: "sprout" },
    {
      label: "Health",
      query: "health insurance schemes",
      icon: "hospital-box",
    },
    { label: "Business", query: "business loan schemes", icon: "briefcase" },
    { label: "Women", query: "schemes for women", icon: "human-female" },
  ];

  const handleQuickSearch = (searchQuery) => {
    setQuery(searchQuery);
    setTimeout(() => handleQuery(), 100);
  };

  return (
    <View style={styles.wrapper}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="GramLink AI" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon="account-circle"
          onPress={() => navigation.navigate("Profile")}
          color="#fff"
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {/* Welcome Section */}
        <Surface style={styles.welcomeCard} elevation={2}>
          <Text style={styles.welcomeText}>
            {language === "hi"
              ? "नमस्ते"
              : language === "bn"
                ? "নমস্কার"
                : "Hello"}
            {userName ? `, ${userName}!` : "!"}
          </Text>
          <Text style={styles.welcomeSubtext}>
            {getTranslation(language, "findSchemes")}
          </Text>
        </Surface>

        {/* Language Selector */}
        <SegmentedButtons
          value={language}
          onValueChange={saveLanguage}
          buttons={[
            { value: "en", label: "English", style: styles.segmentButton },
            { value: "hi", label: "हिन्दी", style: styles.segmentButton },
            { value: "bn", label: "বাংলা", style: styles.segmentButton },
          ]}
          style={styles.languageSelector}
        />

        {/* Search Card */}
        <Card style={styles.searchCard} elevation={4}>
          <Card.Content>
            <Text style={styles.cardLabel}>Ask me anything about schemes</Text>
            <TextInput
              label={getTranslation(language, "askPlaceholder")}
              value={query}
              onChangeText={setQuery}
              multiline
              numberOfLines={3}
              style={styles.input}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#2e7d32"
              right={
                <TextInput.Icon
                  icon="microphone"
                  onPress={handleVoiceInput}
                  color="#2e7d32"
                />
              }
            />
            {loading && (
              <ActivityIndicator
                size="large"
                style={styles.loader}
                color="#2e7d32"
              />
            )}
            <Button
              mode="contained"
              onPress={handleQuery}
              style={styles.searchButton}
              disabled={loading || !query.trim()}
              buttonColor="#2e7d32"
              icon="magnify"
            >
              {loading
                ? getTranslation(language, "searching")
                : getTranslation(language, "findButton")}
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Searches */}
        <Text style={styles.sectionTitle}>Quick Searches</Text>
        <View style={styles.quickSearchContainer}>
          {quickSearches.map((item, index) => (
            <Chip
              key={index}
              icon={item.icon}
              onPress={() => handleQuickSearch(item.query)}
              style={styles.quickChip}
              textStyle={styles.quickChipText}
            >
              {item.label}
            </Chip>
          ))}
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard} elevation={3}>
          <Card.Content>
            <Text style={styles.cardLabel}>Quick Actions</Text>
            <Button
              mode="outlined"
              onPress={async () => {
                setLoading(true);
                try {
                  const userId = await AsyncStorage.getItem("userId");
                  const response = await ApiService.querySchemes(
                    "Show me all schemes I'm eligible for",
                    language,
                    userId,
                  );
                  navigation.navigate("SchemesList", {
                    schemes: response.schemes,
                    aiResponse: response.response,
                    language: language,
                  });
                } catch (error) {
                  Alert.alert(getTranslation(language, "error"), error.message);
                } finally {
                  setLoading(false);
                }
              }}
              style={styles.actionButton}
              icon="view-list"
              disabled={loading}
              textColor="#2e7d32"
            >
              {getTranslation(language, "viewAllSchemes")}
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("Profile")}
              style={styles.actionButton}
              icon="account"
              textColor="#2e7d32"
            >
              {getTranslation(language, "viewProfile")}
            </Button>
          </Card.Content>
        </Card>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🌾 Powered by AI • 🗣️ Multilingual • 🔒 Secure
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    backgroundColor: "#2e7d32",
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "#666",
  },
  languageSelector: {
    marginBottom: 16,
  },
  segmentButton: {
    borderColor: "#2e7d32",
  },
  searchCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  searchButton: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loader: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  quickSearchContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  quickChip: {
    margin: 4,
    backgroundColor: "#e8f5e9",
  },
  quickChipText: {
    color: "#2e7d32",
  },
  actionsCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  actionButton: {
    marginTop: 8,
    borderColor: "#2e7d32",
    borderWidth: 1.5,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});
