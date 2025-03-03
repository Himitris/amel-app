import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      {/* Route d'inscription supprimée - accessible uniquement par l'admin */}
    </Stack>
  );
}