import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import { useAdNavigation } from '../components/AdNavigationProvider';
import AdBanner from '../components/AdBanner';

export default function HomeScreen() {
  const { navigateWithAd } = useAdNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Trang chủ
        </Text>

        <Text style={styles.description}>
          Đây là màn hình thứ nhất của ứng dụng AdMobDemo.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => navigateWithAd('/explore')}
        >
          <Text style={styles.buttonText}>
            Chuyển sang màn hình 2
          </Text>
        </Pressable>
      </View>

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222222',
  },

  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    color: '#555555',
  },

  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});