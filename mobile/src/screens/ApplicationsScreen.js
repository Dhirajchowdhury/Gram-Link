import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Title,
  Text,
  Chip,
  Button,
  Surface,
  ProgressBar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../services/api";

export default function ApplicationsScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const response = await ApiService.getUserApplications(userId);
        setApplications(response.applications || []);
      }
    } catch (error) {
      console.log("Could not load applications");
      // Show mock data for demo
      setApplications([
        {
          id: 1,
          scheme_name: "PM-KISAN",
          reference_id: "APP20240225001",
          status: "submitted",
          submitted_at: "2024-02-20",
          progress: 60,
        },
        {
          id: 2,
          scheme_name: "Ayushman Bharat",
          reference_id: "APP20240225002",
          status: "approved",
          submitted_at: "2024-02-15",
          progress: 100,
        },
        {
          id: 3,
          scheme_name: "PM-MUDRA",
          reference_id: "APP20240225003",
          status: "draft",
          submitted_at: null,
          progress: 30,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "#ff9800",
      submitted: "#2196f3",
      approved: "#4caf50",
      rejected: "#f44336",
    };
    return colors[status] || "#757575";
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: "file-document-edit",
      submitted: "clock-outline",
      approved: "check-circle",
      rejected: "close-circle",
    };
    return icons[status] || "information";
  };

  const getStatusText = (status) => {
    const texts = {
      draft: "Draft",
      submitted: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>My Applications</Title>
        <Text style={styles.headerSubtitle}>
          Track your scheme applications
        </Text>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard} elevation={4}>
        <LinearGradient
          colors={["#2e7d32", "#1b5e20"]}
          style={styles.summaryGradient}
        >
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{applications.length}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {applications.filter((a) => a.status === "submitted").length}
                </Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {applications.filter((a) => a.status === "approved").length}
                </Text>
                <Text style={styles.summaryLabel}>Approved</Text>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Title style={styles.emptyTitle}>No Applications Yet</Title>
            <Text style={styles.emptyText}>
              Start exploring schemes and apply to get started
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Home")}
              style={styles.emptyButton}
              buttonColor="#2e7d32"
            >
              Browse Schemes
            </Button>
          </Card.Content>
        </Card>
      ) : (
        applications.map((app) => (
          <Card key={app.id} style={styles.appCard} elevation={3}>
            <Card.Content>
              {/* Status Badge */}
              <Chip
                icon={getStatusIcon(app.status)}
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(app.status) + "20" },
                ]}
                textStyle={[
                  styles.statusText,
                  { color: getStatusColor(app.status) },
                ]}
              >
                {getStatusText(app.status)}
              </Chip>

              {/* Scheme Name */}
              <Title style={styles.schemeName}>{app.scheme_name}</Title>

              {/* Reference ID */}
              <Surface style={styles.refSurface} elevation={1}>
                <Text style={styles.refLabel}>Reference ID:</Text>
                <Text style={styles.refId}>{app.reference_id}</Text>
              </Surface>

              {/* Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercent}>{app.progress}%</Text>
                </View>
                <ProgressBar
                  progress={app.progress / 100}
                  color={getStatusColor(app.status)}
                  style={styles.progressBar}
                />
              </View>

              {/* Date */}
              {app.submitted_at && (
                <Text style={styles.date}>
                  Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                </Text>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                {app.status === "draft" && (
                  <Button
                    mode="contained"
                    onPress={() => {}}
                    style={styles.actionButton}
                    buttonColor="#2e7d32"
                    icon="pencil"
                  >
                    Continue
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.actionButton}
                  textColor="#2e7d32"
                  icon="eye"
                >
                  View Details
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

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
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  summaryGradient: {
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#c8e6c9",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  appCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  statusChip: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  refSurface: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
  },
  refLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  refId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});
