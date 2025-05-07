import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <NotificationProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="verify-email" options={{ title: 'Verify Email' }} />
            <Stack.Screen name="reset-password" options={{ title: 'Reset Password' }} />
            <Stack.Screen name="reset-password-sent" options={{ title: 'Check Your Email' }} />
            <Stack.Screen name="create-business-profile" options={{ title: 'Create Business Profile' }} />
            <Stack.Screen name="create-listing" options={{ title: 'Create Listing' }} />
            <Stack.Screen name="upload-document" options={{ title: 'Upload Document' }} />
            <Stack.Screen name="access-requests" options={{ title: 'Access Requests' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
          </Stack>
          <StatusBar style="auto" />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
