import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Linking } from 'react-native';
const Instructions = ({ onComplete }) => {
  const handleDownload = () => {
    // Replace with your download link
    const downloadUrl = 'https://www.youtube.com/playlist?list=PLy5Oj6MAgO0jH-rO-cTkwy8_1PgKV49Ca'; // Update this URL with the actual link to download your app
    Linking.openURL(downloadUrl).catch(err => console.error("Failed to open URL:", err));
  };
  return (

    <View style={styles.container}>
     
      <View style={styles.content}>
      <Text style={styles.title}>Most Important!</Text>
        
        
      
        <TouchableOpacity>
        <Text style={styles.link}>Click on completed </Text>
      </TouchableOpacity>
      </View>

      
      
      <TouchableOpacity style={styles.complete} onPress={onComplete}>
        <Text style={styles.completetext}>Completed</Text>
      </TouchableOpacity>
 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color:'#00796b'
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',  // Set a color for subheadings if desired
    marginTop: 20,
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
    textAlign: 'left', // Aligns instruction content to the left
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  complete:{
    position:'absolute',
    backgroundColor: '#00796b',
    borderRadius: 5, // Half of the width/height to make it round
    width: 150, // Set the width
    height: 40, // Set the height
    alignItems: 'center',
    justifyContent: 'center', // Center the content inside
    marginTop: 16,
    alignSelf: 'center',
    bottom:10,
    marginBottom:25
  },
  completetext: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#00796b', // Use the same primary theme color for the link
    fontSize: 30,
    marginTop: 10,
    fontWeight:'bold',
    alignSelf:'center'
  },
});

export default Instructions;
