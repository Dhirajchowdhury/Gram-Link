import React, { useState } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { Button, Title, Text, Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: "🌾 Welcome to GramLink AI",
      subtitle: "Your AI-powered guide to government schemes",
      description:
        "Discover schemes you're eligible for in seconds using natural language queries",
      icon: "🎯",
    },
    {
      title: "🗣️ Multilingual Support",
      subtitle: "Speak your language",
      description:
        "Ask questions in English, Hindi, or Bengali. Get responses in your preferred language",
      icon: "🌐",
    },
    {
      title: "🤖 AI-Powered Search",
      subtitle: "Smart recommendations",
      description:
        "Our AI understands your profile and suggests the most relevant schemes for you",
      icon: "✨",
    },
    {
      title: "📱 Easy Application",
      subtitle: "Apply in minutes",
      description:
        "Auto-fill forms with OCR, track applications, and get instant updates",
      icon: "🚀",
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.replace("Login");
    }
  };

  const handleSkip = () => {
    navigation.replace("Login");
  };

  const page = pages[currentPage];

  return (
    <LinearGradient colors={["#2e7d32", "#1b5e20"]} style={styles.container}>
      <View style={styles.content}>
        {/* Skip Button */}
        {currentPage < pages.length - 1 && (
          <Button
            mode="text"
            onPress={handleSkip}
            style={styles.skipButton}
            textColor="#fff"
          >
            Skip
          </Button>
        )}

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{page.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <Title style={styles.title}>{page.title}</Title>
          <Text style={styles.subtitle}>{page.subtitle}</Text>
          <Text style={styles.description}>{page.description}</Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentPage && styles.activeDot]}
            />
          ))}
        </View>

        {/* Next Button */}
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
          buttonColor="#fff"
          textColor="#2e7d32"
          contentStyle={styles.nextButtonContent}
        >
          {currentPage === pages.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipButton: {
    alignSelf: "flex-end",
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 120,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#e8f5e9",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    color: "#c8e6c9",
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#fff",
  },
  nextButton: {
    paddingVertical: 8,
    borderRadius: 12,
  },
  nextButtonContent: {
    paddingVertical: 4,
  },
});
