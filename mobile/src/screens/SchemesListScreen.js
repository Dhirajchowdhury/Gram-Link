import React from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  Surface,
  Text,
} from "react-native-paper";
import { getTranslation } from "../utils/translations";
import { LinearGradient } from "expo-linear-gradient";

export default function SchemesListScreen({ navigation, route }) {
  const schemes = route.params?.schemes || [];
  const aiResponse = route.params?.aiResponse || "";
  const language = route.params?.language || "en";

  const getCategoryColor = (category) => {
    const colors = {
      Agriculture: "#4caf50",
      Health: "#2196f3",
      Housing: "#ff9800",
      "Savings & Investment": "#9c27b0",
      "Business & Entrepreneurship": "#f44336",
      Pension: "#795548",
      "Agriculture Insurance": "#8bc34a",
      "Employment & Entrepreneurship": "#ff5722",
      "Social Security": "#607d8b",
      "Energy & Fuel": "#ffc107",
    };
    return colors[category] || "#757575";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Agriculture: "sprout",
      Health: "hospital-box",
      Housing: "home",
      "Savings & Investment": "piggy-bank",
      "Business & Entrepreneurship": "briefcase",
      Pension: "account-clock",
      "Agriculture Insurance": "shield-check",
      "Employment & Entrepreneurship": "account-tie",
      "Social Security": "account-group",
      "Energy & Fuel": "fire",
    };
    return icons[category] || "information";
  };

  return (
    <ScrollView style={styles.container}>
      {/* AI Response Card */}
      {aiResponse && (
        <Card style={styles.aiCard} elevation={4}>
          <LinearGradient
            colors={["#e3f2fd", "#bbdefb"]}
            style={styles.aiGradient}
          >
            <Card.Content>
              <View style={styles.aiHeader}>
                <Chip
                  icon="robot"
                  style={styles.aiChip}
                  textStyle={styles.aiChipText}
                >
                  AI Response
                </Chip>
              </View>
              <Paragraph style={styles.aiText}>{aiResponse}</Paragraph>
            </Card.Content>
          </LinearGradient>
        </Card>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Title style={styles.resultsTitle}>
          {schemes.length} {getTranslation(language, "eligibleSchemes")}
        </Title>
        <Text style={styles.resultsSubtitle}>
          Tap any scheme to view details and apply
        </Text>
      </View>

      {/* No Results */}
      {schemes.length === 0 && (
        <Card style={styles.noResultsCard}>
          <Card.Content style={styles.noResultsContent}>
            <Text style={styles.noResultsIcon}>🔍</Text>
            <Title style={styles.noResultsTitle}>No Schemes Found</Title>
            <Paragraph style={styles.noResultsText}>
              Try a different search or browse all schemes
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Schemes List */}
      {schemes.map((scheme, index) => (
        <TouchableOpacity
          key={scheme.id}
          onPress={() =>
            navigation.navigate("SchemeDetails", { scheme, language })
          }
          activeOpacity={0.7}
        >
          <Card style={styles.schemeCard} elevation={3}>
            <Card.Content>
              {/* Category Badge */}
              <View style={styles.categoryBadge}>
                <Chip
                  icon={getCategoryIcon(scheme.category)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: getCategoryColor(scheme.category) + "20",
                    },
                  ]}
                  textStyle={[
                    styles.categoryText,
                    { color: getCategoryColor(scheme.category) },
                  ]}
                >
                  {scheme.category}
                </Chip>
                {scheme.score && scheme.score > 70 && (
                  <Chip
                    icon="check-circle"
                    style={styles.matchChip}
                    textStyle={styles.matchText}
                  >
                    {scheme.score}% Match
                  </Chip>
                )}
              </View>

              {/* Scheme Name */}
              <Title style={styles.schemeName} numberOfLines={2}>
                {scheme.name}
              </Title>

              {/* Description */}
              <Paragraph style={styles.schemeDescription} numberOfLines={3}>
                {scheme.description}
              </Paragraph>

              {/* Benefit */}
              <Surface style={styles.benefitSurface} elevation={1}>
                <Text style={styles.benefitLabel}>💰 Benefit:</Text>
                <Text style={styles.benefitText}>{scheme.benefit}</Text>
              </Surface>

              {/* Action Button */}
              <Button
                mode="contained"
                onPress={() =>
                  navigation.navigate("SchemeDetails", { scheme, language })
                }
                style={styles.viewButton}
                buttonColor={getCategoryColor(scheme.category)}
                icon="arrow-right"
                contentStyle={styles.viewButtonContent}
              >
                {getTranslation(language, "viewDetails")}
              </Button>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}

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
  aiCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  aiGradient: {
    borderRadius: 12,
  },
  aiHeader: {
    marginBottom: 12,
  },
  aiChip: {
    alignSelf: "flex-start",
    backgroundColor: "#1976d2",
  },
  aiChipText: {
    color: "#fff",
    fontWeight: "600",
  },
  aiText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#1565c0",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  noResultsCard: {
    margin: 16,
    borderRadius: 12,
  },
  noResultsContent: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  noResultsText: {
    textAlign: "center",
    color: "#666",
  },
  schemeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  categoryBadge: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontWeight: "600",
    fontSize: 12,
  },
  matchChip: {
    backgroundColor: "#e8f5e9",
    marginBottom: 4,
  },
  matchText: {
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: 12,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  schemeDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 12,
  },
  benefitSurface: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
  },
  benefitLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  benefitText: {
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "bold",
  },
  viewButton: {
    marginTop: 4,
    borderRadius: 8,
  },
  viewButtonContent: {
    flexDirection: "row-reverse",
  },
  bottomSpacing: {
    height: 16,
  },
});
