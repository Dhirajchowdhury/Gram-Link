import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";

// Screens
import OnboardingScreen from "./src/screens/OnboardingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import MainTabs from "./src/navigation/MainTabs";
import SchemesListScreen from "./src/screens/SchemesListScreen";
import SchemeDetailsScreen from "./src/screens/SchemeDetailsScreen";
import DocumentUploadScreen from "./src/screens/DocumentUploadScreen";
import FormFillScreen from "./src/screens/FormFillScreen";
import ReviewScreen from "./src/screens/ReviewScreen";
import SubmitScreen from "./src/screens/SubmitScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Onboarding">
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileSetup"
            component={ProfileSetupScreen}
            options={{ title: "Setup Profile" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "My Profile" }}
          />
          <Stack.Screen
            name="Home"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SchemesList"
            component={SchemesListScreen}
            options={{ title: "Eligible Schemes" }}
          />
          <Stack.Screen
            name="SchemeDetails"
            component={SchemeDetailsScreen}
            options={{ title: "Scheme Details" }}
          />
          <Stack.Screen
            name="DocumentUpload"
            component={DocumentUploadScreen}
            options={{ title: "Upload Documents" }}
          />
          <Stack.Screen
            name="FormFill"
            component={FormFillScreen}
            options={{ title: "Application Form" }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{ title: "Review Application" }}
          />
          <Stack.Screen
            name="Submit"
            component={SubmitScreen}
            options={{ title: "Submit" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
