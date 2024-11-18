import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('./Wallo.png')} // Adjust the path to your logo image
        style={styles.logo} 
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7fffc', // White background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 240, // Adjust width as necessary
    height: 240, // Adjust height as necessary
  },
});

export default LoadingScreen;
