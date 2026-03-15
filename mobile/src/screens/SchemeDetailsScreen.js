import React from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import { Card, Title, Paragraph, List, Button, Chip } from "react-native-paper";
import { getTranslation } from "../utils/translations";

export default function SchemeDetailsScreen({ navigation, route }) {
  const { scheme, language = "en" } = route.params;

  const readAloud = () => {
    // TODO: Implement TTS when expo-speech is added
    Alert.alert("Read Aloud", "Text-to-speech will be implemented soon!");
  };

  const handleApply = () => {
    navigation.navigate("DocumentUpload", { scheme });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>{scheme.name}</Title>
          <Paragraph style={styles.description}>{scheme.description}</Paragraph>
          <Chip style={styles.chip} icon="currency-inr" mode="flat">
            {scheme.benefit}
          </Chip>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            {getTranslation(language, "eligibility")}
          </Title>
          {Array.isArray(scheme.eligibility) ? (
            scheme.eligibility.map((criteria, index) => (
              <List.Item
                key={index}
                title={criteria}
                left={(props) => <List.Icon {...props} icon="check-circle" />}
              />
            ))
          ) : scheme.eligibility && typeof scheme.eligibility === "object" ? (
            Object.entries(scheme.eligibility).map(([key, value], index) => (
              <List.Item
                key={index}
                title={`${key}: ${Array.isArray(value) ? value.join(", ") : value}`}
                left={(props) => <List.Icon {...props} icon="check-circle" />}
              />
            ))
          ) : (
            <List.Item
              title="Eligibility information not available"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            {getTranslation(language, "documents")}
          </Title>
          {Array.isArray(scheme.documents) ? (
            scheme.documents.map((doc, index) => (
              <List.Item
                key={index}
                title={doc}
                left={(props) => <List.Icon {...props} icon="file-document" />}
              />
            ))
          ) : (
            <List.Item
              title="Document information not available"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
          )}
        </Card.Content>
      </Card>

      {scheme.applicationProcess &&
        Array.isArray(scheme.applicationProcess) && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>
                {getTranslation(language, "applicationProcess")}
              </Title>
              {scheme.applicationProcess.map((step, index) => (
                <List.Item
                  key={index}
                  title={`${index + 1}. ${step}`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={`numeric-${index + 1}-circle`}
                    />
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        )}

      {(scheme.helpline || scheme.website || scheme.application_process) && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Contact Information</Title>
            {scheme.helpline && (
              <List.Item
                title={`${getTranslation(language, "helpline")}: ${scheme.helpline}`}
                left={(props) => <List.Icon {...props} icon="phone" />}
              />
            )}
            {scheme.website && (
              <List.Item
                title={getTranslation(language, "website")}
                description={scheme.website}
                left={(props) => <List.Icon {...props} icon="web" />}
              />
            )}
            {scheme.application_process &&
              !Array.isArray(scheme.application_process) && (
                <List.Item
                  title={getTranslation(language, "applicationProcess")}
                  description={scheme.application_process}
                  left={(props) => <List.Icon {...props} icon="information" />}
                />
              )}
          </Card.Content>
        </Card>
      )}

      <Button
        mode="outlined"
        onPress={readAloud}
        icon="volume-high"
        style={styles.button}
      >
        Read Aloud
      </Button>

      <Button mode="contained" onPress={handleApply} style={styles.button}>
        {getTranslation(language, "applyNow")}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  chip: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  button: {
    marginBottom: 12,
  },
});
