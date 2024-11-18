import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Switch, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker'; 
import { NativeModules } from 'react-native'; 

const { AlarmModule } = NativeModules; 

const Set = () => {
  const [frames, setFrames] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [currentFrameIndex, setCurrentFrameIndex] = useState(null);
  const scrollViewRef = useRef(null);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    loadFrames();
  }, []);

  const loadFrames = async () => {
    try {
      const storedFrames = await AsyncStorage.getItem('frames');
      if (storedFrames) {
        const parsedFrames = JSON.parse(storedFrames);
        setFrames(parsedFrames);
        toggleFramesOffThenOn(parsedFrames); // Ensure alarms are re-triggered
      }
    } catch (error) {
      console.error('Error loading frames from AsyncStorage:', error);
    }
  };

  const toggleFramesOffThenOn = (frames) => {
    // Check which frames are currently toggled on
    const toggledOnFrames = frames.filter(frame => frame.toggle);
  
    // If there are no frames toggled on, do nothing
    if (toggledOnFrames.length === 0) return;
  
    // Toggle off the frames that are currently on
    const toggledOffFrames = frames.map(frame => {
      if (frame.toggle) {
        return { ...frame, toggle: false }; // Turn off the frame
      }
      return frame; // Keep the frame as is if it's off
    });
  
    setFrames(toggledOffFrames);
    saveFrames(toggledOffFrames);
  
    // Set a timeout to toggle back on the frames that were originally on
    setTimeout(() => {
      const updatedFrames = toggledOffFrames.map(frame => {
        if (toggledOnFrames.some(f => f.id === frame.id)) {
          return { ...frame, toggle: true }; // Turn back on the frames that were originally on
        }
        return frame; // Keep the frame as is if it wasn't on
      });
  
      setFrames(updatedFrames);
      saveFrames(updatedFrames);
  
      // Set alarms for frames that have a time set and are toggled on
      updatedFrames.forEach((frame, index) => {
        if (frame.time && frame.toggle) {
          setWallpaperAtTime(frame.photo, frame.time, index); // Set the alarm
        }
      });
    }, 100);
  };
  

  const saveFrames = async (framesToSave) => {
    try {
      await AsyncStorage.setItem('frames', JSON.stringify(framesToSave));
    } catch (error) {
      console.error('Error saving frames to AsyncStorage:', error);
    }
  };

  const addFrame = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        openCropper(imageUri)
       
      }
    });
  };

  const openCropper = (path) => {
    ImagePicker.openCropper({
      path,
      width: 1080,
                height: 1920,
                cropperCircleOverlay: false, // Optionally, set to true if you want a circular cropper
                cropperToolbarTitle: 'Adjust and Crop', // Title of the cropper toolbar
                freeStyleCropEnabled: true, // Allow the user to freely adjust the cropping rectangle
                cropperStatusBarColor: '#00796b',
                cropperToolbarColor: '#00796b',
                cropperActiveWidgetColor: '#00796b',
                cropperToolbarWidgetColor: '#ffffff',
    }).then(croppedImage => {
      addNewFrame(croppedImage.path);
    }).catch(error => {
      console.log('Cropping canceled or error:', error);
      addNewFrame(path);
    });
  };

  const addNewFrame = (photoUri) => {
    const newFrame = {
      id: frames.length,
      photo: photoUri,
      time: '',
      toggle: true, // Automatically activate the frame when it's added
    };
    const updatedFrames = sortFramesByTime([...frames, newFrame]);
    setFrames(updatedFrames);
    saveFrames(updatedFrames);
  };

  const handlePhotoUpload = (index) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        Alert.alert(
          'Crop Image',
          'Would you like to crop the image?',
          [
            {
              text: 'Yes',
              onPress: () => openCropperForUpdate(imageUri, index),
            },
            {
              text: 'No',
              onPress: () => updateFrame(index, imageUri),
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      }
    });
  };

  const openCropperForUpdate = (path, index) => {
    ImagePicker.openCropper({
      path,
      width: 1080,
                height: 1920,
                cropperCircleOverlay: false,
                cropperToolbarTitle: 'Adjust and Crop',
                freeStyleCropEnabled: true,
                cropperStatusBarColor: '#00796b',
                cropperToolbarColor: '#00796b',
                cropperActiveWidgetColor: '#00796b',
                cropperToolbarWidgetColor: '#ffffff',
    }).then(croppedImage => {
      updateFrame(index, croppedImage.path);
    }).catch(error => {
      console.log('Cropping canceled or error:', error);
      updateFrame(index, path);
    });
  };

  const updateFrame = async (index, photoUri) => {
    const updatedFrames = frames.map((frame, idx) => {
      if (idx === index) {
        return { ...frame, photo: photoUri, toggle: true };
      }
      return frame;
    });
    const sortedFrames = sortFramesByTime(updatedFrames);
    setFrames(sortedFrames);
    saveFrames(sortedFrames);

    if (sortedFrames[index].time && sortedFrames[index].toggle) {
      setWallpaperAtTime(sortedFrames[index].photo, sortedFrames[index].time, index);
    }

    await loadFrames(); // Reload frames after updating the photo
  };

  const handleTimeChange = async (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || selectedTime;
      setShowTimePicker(false);
      setSelectedTime(currentDate);

      if (currentFrameIndex !== null) {
        const updatedFrames = frames.map((frame, index) => {
          if (index === currentFrameIndex) {
            return { ...frame, time: formatTime(currentDate) };
          }
          return frame;
        });
        const sortedFrames = sortFramesByTime(updatedFrames);
        setFrames(sortedFrames);
        saveFrames(sortedFrames);

        setWallpaperAtTime(sortedFrames[currentFrameIndex].photo, sortedFrames[currentFrameIndex].time, currentFrameIndex);
      }

      await loadFrames(); // Reload frames after updating the time
    } else {
      setShowTimePicker(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const sortFramesByTime = (framesArray) => {
    return framesArray.sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  const toggleFrame = (index) => {
    const updatedFrames = frames.map((frame, idx) => {
      if (idx === index) {
        if (!frame.time) {
          Alert.alert('Set Time', 'Please set the time before enabling the wallpaper toggle.');
          return frame;
        }
        return { ...frame, toggle: !frame.toggle };
      }
      return frame;
    });
    setFrames(updatedFrames);
    saveFrames(updatedFrames);

    if (updatedFrames[index].toggle) {
      setWallpaperAtTime(updatedFrames[index].photo, updatedFrames[index].time, index);
    }
  };

  const setWallpaperAtTime = async (photoUri, time, requestCode) => {
    if (!photoUri || !time) {
      console.error('No image or time selected.');
      return;
    }

    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    let scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeout = scheduledTime.getTime() - now.getTime();

    try {
      const randomRequestCode = Math.floor(1000000 + Math.random() * 9000000); // Generate random 6-digit number
      await AlarmModule.setAlarm(timeout, photoUri, randomRequestCode);
      console.log(`Alarm set successfully for ${timeout} milliseconds with requestCode: ${randomRequestCode}`);
    } catch (error) {
      console.error('Error setting alarm:', error);
    }
  };

  const confirmDeleteFrame = (frameId) => {
    Alert.alert(
      'Delete Frame',
      'Are you sure you want to delete this frame?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteFrame(frameId) }
      ]
    );
  };

  const deleteFrame = (frameId) => {
    const updatedFrames = frames.filter(frame => frame.id !== frameId);
    setFrames(updatedFrames);
    saveFrames(updatedFrames);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ToSeeList</Text>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
        {frames.length === 0 ? (
          <View style={styles.emptyText}>
            <Text style={styles.emptyTextItem}>Click + button to add a wallpaper schedule</Text>
            <Text style={styles.emptyTextItem}>Long Press between image and toggle to delete</Text>
          </View>
        ) : (
          frames.map((frame, index) => (
            <View key={frame.id} style={styles.frame}>
              <View style={styles.photoToggleContainer}>
                <TouchableOpacity
                  onLongPress={() => confirmDeleteFrame(frame.id)}
                  style={styles.photoToggleInnerContainer}
                >
                  {frame.photo ? (
                    <TouchableOpacity onPress={() => handlePhotoUpload(index)}>
                      <Image source={{ uri: frame.photo }} style={styles.image} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handlePhotoUpload(index)}>
                      <Text style={styles.uploadButtonText}>Upload Photo</Text>
                    </TouchableOpacity>
                  )}
                  <Switch
                    value={frame.toggle}
                    onValueChange={() => toggleFrame(index)}
                    trackColor={{ false: '#767577', true: '#767577' }}
                    thumbColor={frame.toggle ? '#00796b' : '#f4f3f4'}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  setCurrentFrameIndex(index);
                  setShowTimePicker(true);
                }}
              >
                <Text style={styles.timeButtonText}>Select Time: {frame.time || 'Not Set'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={addFrame}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00796b',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  emptyText: {
    marginTop: '50%',
  },
  emptyTextItem: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    textAlign: 'center',
    marginTop: '10%',
  },
  frame: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderColor: '#00796',
    borderWidth: 1,
  },
  photoToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoToggleInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#00796b',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  toggleText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  timeButton: {
    backgroundColor: '#00796b',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  timeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    backgroundColor: '#00796b',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    alignSelf: 'center',
    bottom: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
});

export default Set;
