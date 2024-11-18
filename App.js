import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingScreen from './src/screens/LoadingScreen';
import Set from './src/screens/Set';
import Birthdays from './src/screens/Birthdays';
import RandomWallpaper from './src/screens/RandomWallpaper';
import More from './src/screens/More';
import Instructions from './src/Services/Instructions';
import UnsupportedAndroidVersion from './src/exceptions/UnsupportedAndroidVersion';
import { StyleSheet, PermissionsAndroid, Alert, Platform, Linking, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { AlarmPermissionModule } = NativeModules;

// Enable optimized screen management
enableScreens();

const Tab = createBottomTabNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [isAndroid14, setIsAndroid14] = useState(false);

  // Request permissions for Android
  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {  // This includes Android 14 (API 34)
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs access to notifications to provide timely updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
  
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          console.log('Notification permission denied');
          Alert.alert(
            'Notification Permission Denied',
            'Without notifications, you might miss important updates. You can enable notifications later in the app settings.',
            [
              { text: 'OK' },
              { text: 'Go to Settings', onPress: () => openAppSettings() }
            ]
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      console.log('Notification permission is not required for this Android version.');
    }
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const requestExactAlarmPermission = () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {  // Android 12+ (API 31+)
      AlarmPermissionModule.requestExactAlarmPermission()
        .then(() => {
          Alert.alert('Permission requested', 'Exact alarm permission request initiated.');
        })
        .catch((error) => {
          Alert.alert('Permission Error', error.message || 'Something went wrong');
        });
    } else {
      console.log('Exact alarm permission not needed for this Android version.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('Loading data...');
      console.log('Android Version:', Platform.Version);

      // Check Android 14
      if (Platform.OS === 'android' && Platform.Version === 1) {
        console.log('Running on Android 34');
        setIsAndroid14(true);
        setLoading(false);
        return;
      }

      // Simulate data loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Simulated loading complete');

      // Check if instructions are complete
      const instructionsComplete = await AsyncStorage.getItem('instructionsComplete');
      console.log('Instructions complete:', instructionsComplete);

      if (instructionsComplete) {
        setShowInstructions(false);
      }

      // Request notifications and exact alarm permissions
      if (Platform.OS === 'android') {
        await requestPermissions();
        requestExactAlarmPermission();  // Call exact alarm permission after requesting notifications
      }

      setLoading(false);
      setAppReady(true);
    };

    loadData();
  }, []);

  const completeInstructions = async () => {
    await AsyncStorage.setItem('instructionsComplete', 'true');
    console.log('Instructions marked as complete');
    setShowInstructions(false);
  };

  if (loading) {
    console.log('Loading screen displayed');
    return <LoadingScreen />;
  }

  if (isAndroid14) {
    console.log('Displaying unsupported Android version screen');
    return <UnsupportedAndroidVersion />;
  }

  if (showInstructions) {
    console.log('Displaying instructions');
    return <Instructions onComplete={completeInstructions} />;
  }

  console.log('Navigating to main app');
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarOptions: {
            activeTintColor: '#ffffff',
            inactiveTintColor: 'black',
          },
          tabBarStyle: {
            backgroundColor: '#ffffff',
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
          lazy: false,
        }}>
        <Tab.Screen
          name="Set"
          component={Set}
          options={{
            tabBarLabel: 'ToSeeList',
            tabBarActiveTintColor: '#00796b',
            tabBarInactiveTintColor: 'black',
            tabBarIcon: ({ size }) => (
              <Icon name="checklist" color="#00796b" size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Birthdays"
          component={Birthdays}
          options={{
            tabBarLabel: 'Specials',
            tabBarActiveTintColor: '#00796b',
            tabBarInactiveTintColor: 'black',
            tabBarIcon: ({ size }) => (
              <Icon name="calendar-month" color="#00796b" size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Random"
          component={RandomWallpaper}
          options={{
            tabBarLabel: 'Intervals',
            tabBarActiveTintColor: '#00796b',
            tabBarInactiveTintColor: 'black',
            tabBarIcon: ({ size }) => (
              <Icon name="image" color="#00796b" size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="More"
          component={More}
          options={{
            tabBarLabel: 'More',
            tabBarActiveTintColor: '#00796b',
            tabBarInactiveTintColor: 'black',
            tabBarIcon: ({ size }) => (
              <Icon name="more" color="#00796b" size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#000000",
  },
});
