import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';

const UnsupportedAndroidVersion = () => {
  const handleDownload = () => {
    // Replace with your download link
    const downloadUrl = 'https://wallodynamo.vercel.app/'; // Update this URL with the actual link to download your app
    Linking.openURL(downloadUrl).catch(err => console.error("Failed to open URL:", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This app is not supported on Android 14.</Text>
      
      <Text style={styles.whyText}>
        Why should you install the app through this link?
      </Text>
      <Text style={styles.explanation}>
        Please Install Through That link,We are not Gonna Steal your Data but for the android 14 we cant meet the
        Compatibility Requirements of playstore so please download through the link and your device will
        automatically scan the app before installing in your device
      </Text>
<Text>Thank You</Text>
      <TouchableOpacity onPress={handleDownload}>
        <Text style={styles.link}>download the app from our website.</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Match the app background color
  },
  text: {
    color: '#00796b', // Use the primary theme color
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  whyText: {
    color: '#00796b', // Use the primary theme color
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  explanation: {
    color: 'black', // Use a contrasting color for better readability
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  link: {
    color: '#00796b', // Use the same primary theme color for the link
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});

export default UnsupportedAndroidVersion;
