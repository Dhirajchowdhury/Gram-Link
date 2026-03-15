import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Card, Title, Text, Chip, Surface } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function CategoriesScreen({ navigation }) {
  const categories = [
    {
      name: "Agriculture",
      icon: "🌾",
      color: ["#4caf50", "#388e3c"],
      count: 3,
      schemes: ["PM-KISAN", "PMFBY", "PM-AWAS-GRAMIN"],
    },
    {
      name: "Health",
      icon: "🏥",
      color: ["#2196f3", "#1976d2"],
      count: 1,
      schemes: ["Ayushman Bharat"],
    },
    {
      name: "Business",
      icon: "💼",
      color: ["#f44336", "#d32f2f"],
      count: 2,
      schemes: ["PM-MUDRA", "PMEGP"],
    },
    {
      name: "Housing",
      icon: "🏠",
      color: ["#ff9800", "#f57c00"],
      count: 1,
      schemes: ["PM-AWAS-GRAMIN"],
    },
    {
      name: "Pension",
      icon: "👴",
      color: ["#795548", "#5d4037"],
      count: 2,
      schemes: ["PM-SYM", "NSAP"],
    },
    {
      name: "Women",
      icon: "👩",
      color: ["#e91e63", "#c2185b"],
      count: 2,
      schemes: ["Sukanya Samriddhi", "PMUY"],
    },
    {
      name: "Energy",
      icon: "⚡",
      color: ["#ffc107", "#ffa000"],
      count: 1,
      schemes: ["PMUY"],
    },
    {
      name: "Social",
      icon: "🤝",
      color: ["#607d8b", "#455a64"],
      count: 1,
      schemes: ["NSAP"],
    },
  ];

  const handleCategoryPress = (category) => {
    navigation.navigate("Home");
    // In real implementation, would filter schemes by category
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Browse by Category</Title>
        <Text style={styles.headerSubtitle}>
          Explore schemes organized by category
        </Text>
      </View>

      {/* Stats Card */}
      <Card style={styles.statsCard} elevation={4}>
        <LinearGradient
          colors={["#2e7d32", "#1b5e20"]}
          style={styles.statsGradient}
        >
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10</Text>
                <Text style={styles.statLabel}>Total Schemes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Languages</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>

      {/* Categories Grid */}
      <View style={styles.grid}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
            style={styles.categoryCardWrapper}
          >
            <Card style={styles.categoryCard} elevation={3}>
              <LinearGradient
                colors={category.color}
                style={styles.categoryGradient}
              >
                <Card.Content style={styles.categoryContent}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Title style={styles.categoryName}>{category.name}</Title>
                  <Chip
                    style={styles.countChip}
                    textStyle={styles.countChipText}
                  >
                    {category.count} Schemes
                  </Chip>
                </Card.Content>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

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
  header: {
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  statsGradient: {
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#c8e6c9",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  categoryCardWrapper: {
    width: cardWidth,
    padding: 8,
  },
  categoryCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  categoryGradient: {
    borderRadius: 12,
  },
  categoryContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  countChip: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  countChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});
