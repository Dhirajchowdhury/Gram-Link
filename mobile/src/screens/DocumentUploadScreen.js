import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Title, Button, List, Checkbox } from "react-native-paper";

export default function DocumentUploadScreen({ navigation, route }) {
  const { scheme } = route.params;
  // Initialize document state based on scheme requirements
  const [documents, setDocuments] = useState(
    scheme.documents.reduce((acc, doc, index) => {
      acc[`doc_${index}`] = false;
      return acc;
    }, {}),
  );

  // Generate document checklist from scheme data
  const requiredDocs = scheme.documents.map((doc, index) => ({
    key: `doc_${index}`,
    label: doc,
  }));

  const uploadDocument = (key) => {
    // Simulate document upload with delay
    setTimeout(() => {
      setDocuments((prev) => ({ ...prev, [key]: true }));
    }, 500);
  };

  const handleContinue = () => {
    navigation.navigate("FormFill", { scheme, documents });
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Upload Required Documents</Title>

      <Card style={styles.card}>
        <Card.Content>
          {requiredDocs.map((doc) => (
            <List.Item
              key={doc.key}
              title={doc.label}
              left={() => (
                <Checkbox
                  status={documents[doc.key] ? "checked" : "unchecked"}
                />
              )}
              right={() => (
                <Button
                  mode="outlined"
                  onPress={() => uploadDocument(doc.key)}
                  compact
                >
                  {documents[doc.key] ? "Uploaded" : "Upload"}
                </Button>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleContinue}
        style={styles.button}
        disabled={!Object.values(documents).every(Boolean)}
      >
        Continue to Form
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
  title: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
