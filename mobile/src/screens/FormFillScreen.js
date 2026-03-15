import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Title, ProgressBar } from "react-native-paper";

export default function FormFillScreen({ navigation, route }) {
  const { scheme } = route.params;
  const [formData, setFormData] = useState({});
  const [currentField, setCurrentField] = useState(0);
  const [isAutoFilling, setIsAutoFilling] = useState(true);

  const formFields = [
    { key: "name", label: "Full Name", value: "Ramesh Kumar" },
    { key: "age", label: "Age", value: "45" },
    { key: "gender", label: "Gender", value: "Male" },
    { key: "aadhaar", label: "Aadhaar Number", value: "1234-5678-9012" },
    { key: "bank", label: "Bank Account", value: "123456789" },
    { key: "ifsc", label: "IFSC Code", value: "SBIN0001234" },
  ];

  useEffect(() => {
    // Simulate auto-filling
    if (isAutoFilling && currentField < formFields.length) {
      const timer = setTimeout(() => {
        const field = formFields[currentField];
        setFormData((prev) => ({ ...prev, [field.key]: field.value }));
        setCurrentField(currentField + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentField >= formFields.length) {
      setIsAutoFilling(false);
    }
  }, [currentField, isAutoFilling, formFields]);

  const handleReview = () => {
    navigation.navigate("Review", { formData, scheme });
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Application Form - {scheme.name}</Title>

      {isAutoFilling && (
        <ProgressBar
          progress={currentField / formFields.length}
          style={styles.progress}
        />
      )}

      {formFields.map((field, index) => (
        <TextInput
          key={field.key}
          label={field.label}
          value={formData[field.key] || ""}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, [field.key]: text }))
          }
          style={[
            styles.input,
            index === currentField - 1 && styles.highlightedInput,
          ]}
          disabled={isAutoFilling && index >= currentField}
        />
      ))}

      {!isAutoFilling && (
        <Button mode="contained" onPress={handleReview} style={styles.button}>
          Review Application
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 16,
  },
  progress: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  highlightedInput: {
    backgroundColor: "#e3f2fd",
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
});
