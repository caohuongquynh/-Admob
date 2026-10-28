import { Stack } from 'expo-router';
import { AdNavigationProvider } from '../components/AdNavigationProvider';

export default function RootLayout() {
  return (
    <AdNavigationProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          contentStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Trang chủ',
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            title: 'Màn hình 2',
          }}
        />
      </Stack>
    </AdNavigationProvider>
  );
}