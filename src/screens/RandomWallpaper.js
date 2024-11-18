import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Image, Switch, TextInput } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { NativeModules } from 'react-native'; // Import NativeModules
import ImageCropPicker from 'react-native-image-crop-picker';
const { IntervalModule } = NativeModules; // Reference to the IntervalModule

const RandomWallpaper = () => {
  const [images, setImages] = useState([]);
  const [timeValue, setTimeValue] = useState('5'); // Default value for time input (e.g., 5 seconds)
  const [timeUnit, setTimeUnit] = useState('seconds'); // Set default unit to seconds
  const [isEnabled, setIsEnabled] = useState(false); // For toggle button
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track current image index

  useEffect(() => {
    const loadStoredData = async () => {
      const storedImages = await AsyncStorage.getItem('wallpaperImages');
      const storedToggleState = await AsyncStorage.getItem('toggleState');
      const storedTimeValue = await AsyncStorage.getItem('timeValue');
      const storedTimeUnit = await AsyncStorage.getItem('timeUnit');
      const storedCurrentImageIndex = await AsyncStorage.getItem('currentImageIndex');

      if (storedImages) {
        setImages(JSON.parse(storedImages));
      }
      if (storedToggleState !== null) {
        setIsEnabled(JSON.parse(storedToggleState));
      }
      if (storedTimeValue !== null) {
        setTimeValue(storedTimeValue);
      }
      if (storedTimeUnit !== null) {
        setTimeUnit(storedTimeUnit);
      }
      if (storedCurrentImageIndex !== null) {
        setCurrentImageIndex(JSON.parse(storedCurrentImageIndex));
      }
    };
    loadStoredData();
  }, []);

  // Convert time input to milliseconds
  const getIntervalInMilliseconds = () => {
    const value = parseInt(timeValue, 10) || 0;
    let interval = 0;

    switch (timeUnit) {
      case 'hours':
        interval = value * 60 * 60 * 1000; // Convert hours to milliseconds
        break;
      case 'minutes':
        interval = value * 60 * 1000; // Convert minutes to milliseconds
        break;
      case 'seconds':
        interval = value * 1000; // Convert seconds to milliseconds
        break;
      default:
        break;
    }

    return interval;
  };

  const saveCurrentImageIndex = async (index) => {
    try {
      await AsyncStorage.setItem('currentImageIndex', JSON.stringify(index));
    } catch (error) {
      console.error('Error saving current image index to AsyncStorage:', error);
    }
  };

  // Set the wallpaper changes using IntervalModule
  const setWallpaperChangeHandler = async () => {
    if (images.length === 0) {
      Alert.alert('No images added!');
      return;
    }

    const interval = getIntervalInMilliseconds();

    if (interval === 0) {
      Alert.alert('Invalid interval!');
      return;
    }

    try {
      console.log('Scheduling wallpaper changes...');
      await IntervalModule.scheduleWallpaperChange(
        images, // Array of image URIs
        interval // Interval in milliseconds
      );
      console.log('Wallpaper change scheduled.');
    } catch (error) {
      console.error('Error scheduling wallpaper change:', error);
    }
  };

  const toggleWallpaperChange = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    await AsyncStorage.setItem('toggleState', JSON.stringify(newState)); // Save toggle state to AsyncStorage

    if (newState) {
      setWallpaperChangeHandler();
    } else {
      try {
        console.log('Disabling wallpaper change...');
        await IntervalModule.cancelWallpaperChange(); // Call the cancel function to stop wallpaper changes
        console.log('Wallpaper change disabled.');
      } catch (error) {
        console.error('Error cancelling wallpaper change:', error);
      }
    }
  };

  const cropImage = (index) => {
    const imageToCrop = images[index]; // Get the image URI to crop
  
    ImageCropPicker.openCropper({
      path: imageToCrop, // The image URI
      width: 300, // Set the desired crop width
      height: 300, // Set the desired crop height
      cropping: true,
      cropperCircleOverlay: false,
                cropperToolbarTitle: 'Adjust and Crop',
                freeStyleCropEnabled: true,
                cropperStatusBarColor: '#00796b',
                cropperToolbarColor: '#00796b',
                cropperActiveWidgetColor: '#00796b',
                cropperToolbarWidgetColor: '#ffffff',
    })
      .then(croppedImage => {
        // Update the cropped image in the state and AsyncStorage
        setImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = croppedImage.path; // Replace the original image with the cropped one
          AsyncStorage.setItem('wallpaperImages', JSON.stringify(newImages)); // Save the updated images to AsyncStorage
          return newImages;
        });
      })
      .catch(error => {
        console.error('Error cropping image: ', error);
      });
  };


  const handleTimeValueChange = async (value) => {
    setTimeValue(value);
    await AsyncStorage.setItem('timeValue', value); // Save time value to AsyncStorage
  };

  const handleTimeUnitChange = async (unit) => {
    setTimeUnit(unit);
    await AsyncStorage.setItem('timeUnit', unit); // Save time unit to AsyncStorage
  };

  const addImagesFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 0, // 0 means no limit, user can select multiple images
      },
      async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.error('ImagePicker Error: ', response.error);
        } else {
          const selectedImages = response.assets.map((asset) => asset.uri);
          setImages((prevImages) => {
            const newImages = [...prevImages, ...selectedImages];
            AsyncStorage.setItem('wallpaperImages', JSON.stringify(newImages)); // Save to AsyncStorage
            return newImages;
          });
        }
      }
    );
  };

  const removeImage = (index) => {
    setImages((prevImages) => {
      const newImages = prevImages.filter((_, i) => i !== index);
      AsyncStorage.setItem('wallpaperImages', JSON.stringify(newImages)); // Update AsyncStorage
      return newImages;
    });
  };

  const handleLongPress = (index) => {
    Alert.alert(
      'Delete Image',
      'Do you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => removeImage(index) },
        { 
          text: 'Crop', onPress: () => cropImage(index) // Call the cropImage function when 'Crop' is selected
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallpaper Intervals</Text>

      <TouchableOpacity style={styles.button} onPress={addImagesFromLibrary}>
        <Text style={styles.buttonText}>Add Images from Library</Text>
      </TouchableOpacity>

      <FlatList
        data={images}
        numColumns={3}
        style={styles.flatlist}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onLongPress={() => handleLongPress(index)} style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.image} />
          </TouchableOpacity>
        )}
      />

      <View style={styles.timeContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter time (e.g. 5)"
          placeholderTextColor="#a9a9a9"
          keyboardType="numeric"
          value={timeValue}
          onChangeText={handleTimeValueChange} // Save time value to AsyncStorage
        />
        <Picker
          selectedValue={timeUnit}
          onValueChange={handleTimeUnitChange} // Save time unit to AsyncStorage
          style={styles.picker}
        >
          <Picker.Item label="Sec" value="seconds" />
          <Picker.Item label="Min" value="minutes" />
          <Picker.Item label="Hours" value="hours" />
        </Picker>
      </View>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Enable Wallpaper Change</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#00796b' }}
          thumbColor={isEnabled ? '#00796b' : '#ffffff'}
          onValueChange={toggleWallpaperChange}
          value={isEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00796b',
  },
  button: {
    backgroundColor: '#00796b',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageWrapper: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00796b',
  },
  input: {
    width: 220,
    color: 'black',
    borderWidth: 1,
    borderColor: '#00796b',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: '#00796b',
    borderWidth: 1,
    borderColor: '#00796b',
    borderRadius: 5,
    color:'#ffffff'
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  toggleLabel: {
    fontSize: 20,
    color: '#00796b',
    fontWeight: 'bold',
  },
});

export default RandomWallpaper; 