import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Button, Text } from "react-native-paper";

export default function SubmitScreen({ navigation, route }) {
  const { formData, scheme } = route.params;

  const submitOnline = async () => {
    // Simulate API call
    setTimeout(() => {
      alert(
        `Application for ${scheme.name} submitted successfully!\n\nReference ID: ${Date.now()}\n\nYou will receive updates on your registered mobile number.`,
      );
      navigation.navigate("Home");
    }, 1500);
  };

  const downloadPDF = async () => {
    // Simulate PDF generation
    setTimeout(() => {
      alert(
        `PDF generated successfully!\n\nScheme: ${scheme.name}\nSaved to: Downloads/application_${Date.now()}.pdf\n\nYou can submit this at your nearest CSC.`,
      );
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Ready to Submit</Title>
          <Text style={styles.text}>
            Your application for {scheme.name} is ready. Choose how you want to
            proceed:
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={submitOnline}
        icon="cloud-upload"
        style={styles.button}
      >
        Submit Online
      </Button>

      <Button
        mode="outlined"
        onPress={downloadPDF}
        icon="download"
        style={styles.button}
      >
        Save as PDF
      </Button>

      <Text style={styles.note}>
        Note: Online submission will directly send your application to the
        government portal. PDF can be used for offline submission at your
        nearest CSC.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  card: {
    marginBottom: 24,
  },
  text: {
    marginTop: 8,
    fontSize: 16,
  },
  button: {
    marginBottom: 16,
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
