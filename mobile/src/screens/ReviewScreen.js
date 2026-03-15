import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { Card, Title, Text, Button, TextInput } from "react-native-paper";

export default function ReviewScreen({ navigation, route }) {
  const { formData: initialFormData, scheme } = route.params;
  const [formData, setFormData] = useState(initialFormData);
  const [isListening, setIsListening] = useState(false);
  const [correction, setCorrection] = useState("");

  const readAloud = () => {
    // TODO: Implement TTS when expo-speech is added
    Alert.alert("Read Aloud", "Text-to-speech will be implemented soon!");
  };

  const handleVoiceCorrection = () => {
    // TODO: Implement voice input
    setIsListening(true);
    Alert.alert("Voice Input", "Voice correction will be implemented soon!");
    setTimeout(() => setIsListening(false), 2000);
  };

  const handleTextCorrection = () => {
    if (!correction.trim()) {
      Alert.alert("Error", "Please enter a correction");
      return;
    }

    // Parse correction text and update formData
    // Example: "name is John Doe" or "aadhaar is 1234-5678-9012"
    const correctionLower = correction.toLowerCase().trim();

    // Try to match patterns like "field is value" or "field: value"
    const patterns = [
      /^(name|age|gender|aadhaar|bank|ifsc)\s+is\s+(.+)$/i,
      /^(name|age|gender|aadhaar|bank|ifsc)\s*:\s*(.+)$/i,
      /^change\s+(name|age|gender|aadhaar|bank|ifsc)\s+to\s+(.+)$/i,
      /^update\s+(name|age|gender|aadhaar|bank|ifsc)\s+to\s+(.+)$/i,
    ];

    let matched = false;
    for (const pattern of patterns) {
      const match = correctionLower.match(pattern);
      if (match) {
        const field = match[1].toLowerCase();
        const value = match[2].trim();

        // Update the form data
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }));

        Alert.alert("Success", `Updated ${field} to: ${value}`, [
          { text: "OK", onPress: () => setCorrection("") },
        ]);
        matched = true;
        break;
      }
    }

    if (!matched) {
      Alert.alert(
        "Format Help",
        "Please use format:\n• 'name is John Doe'\n• 'aadhaar: 1234-5678-9012'\n• 'change age to 30'\n• 'update bank to 987654321'",
      );
    }
  };

  const handleSubmit = () => {
    navigation.navigate("Submit", { formData, scheme });
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Review Your Application</Title>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Application Details</Title>
          {Object.entries(formData).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Scheme: {scheme.name}</Title>
          <Text style={styles.schemeInfo}>Benefit: {scheme.benefit}</Text>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={readAloud}
        icon="volume-high"
        style={styles.button}
      >
        Read Aloud
      </Button>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Need to make changes?</Title>
          <TextInput
            label="Type correction (e.g., 'Aadhaar number is 9876-5432-1098')"
            value={correction}
            onChangeText={setCorrection}
            multiline
            style={styles.input}
          />
          <Button
            mode="outlined"
            onPress={handleTextCorrection}
            style={styles.button}
          >
            Apply Correction
          </Button>
          <Button
            mode="outlined"
            onPress={handleVoiceCorrection}
            icon="microphone"
            style={styles.button}
          >
            {isListening ? "Listening..." : "Voice Correction"}
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
      >
        Proceed to Submit
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
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    width: 120,
  },
  value: {
    flex: 1,
  },
  schemeInfo: {
    marginTop: 8,
    fontSize: 16,
    color: "#2e7d32",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
