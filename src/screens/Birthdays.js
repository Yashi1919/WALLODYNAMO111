import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Switch } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native'; // Import NativeModules for AlarmModule

const { AlarmModule } = NativeModules; // Assuming you have AlarmModule implemented

const Birthdays = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentFrameIndex, setCurrentFrameIndex] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Load the birthdays and trigger the alarms when the component is mounted
    loadBirthdays();
  }, []);

  const loadBirthdays = async () => {
    try {
      const storedBirthdays = await AsyncStorage.getItem('birthdays');
      if (storedBirthdays) {
        let parsedBirthdays = JSON.parse(storedBirthdays);
        parsedBirthdays = updatePastBirthdays(parsedBirthdays);
        setBirthdays(parsedBirthdays);
        saveBirthdays(parsedBirthdays);

        // Trigger alarms for birthdays that have toggles enabled
        triggerAlarmsForToggledBirthdays(parsedBirthdays);
      }
    } catch (error) {
      console.error('Error loading birthdays from AsyncStorage:', error);
    }
  };

  const updatePastBirthdays = (birthdaysArray) => {
    const now = new Date();
    const updatedBirthdays = birthdaysArray.map((birthday) => {
      const birthdayDate = new Date(`${birthday.date}T00:00:00`);
      if (birthdayDate < now) {
        // Move the birthday to the next year if it has passed
        birthdayDate.setFullYear(now.getFullYear() + 1);
        birthday.date = birthdayDate.toISOString().split('T')[0]; // Update the birthday to the next year
      }
      return birthday;
    });
    return updatedBirthdays;
  };

  const saveBirthdays = async (birthdaysToSave) => {
    try {
      await AsyncStorage.setItem('birthdays', JSON.stringify(birthdaysToSave));
    } catch (error) {
      console.error('Error saving birthdays to AsyncStorage:', error);
    }
  };

  const triggerAlarmsForToggledBirthdays = (birthdaysArray) => {
    birthdaysArray.forEach((birthday) => {
      if (birthday.toggle) {
        setAlarmForBirthday(birthday.date, birthday.photo, birthday.requestCode);
      }
    });
  };

  const addBirthday = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        Alert.alert('Photo selection cancelled');
      } else if (response.error) {
        Alert.alert('Error selecting photo: ' + response.error);
      } else {
        // Create a new birthday after photo is selected
        const newBirthday = {
          id: birthdays.length, // Use length as unique ID
          photo: response.assets[0].uri, // Set the selected photo URI
          date: '',
          toggle: false,
          requestCode: birthdays.length, // Use index as requestCode
        };

        const newBirthdays = [...birthdays, newBirthday];
        const sortedBirthdays = sortBirthdaysByDate(newBirthdays);
        setBirthdays(sortedBirthdays);
        saveBirthdays(sortedBirthdays);
      }
    });
  };

  const handlePhotoUpload = (index) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        // Handle cancellation if needed
      } else if (response.error) {
        Alert.alert('Error selecting photo: ' + response.error);
      } else {
        const newBirthdays = [...birthdays];
        newBirthdays[index].photo = response.assets[0].uri;
        const sortedBirthdays = sortBirthdaysByDate(newBirthdays);
        setBirthdays(sortedBirthdays);
        saveBirthdays(sortedBirthdays);
      }
    });
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || selectedTime;
      setShowDatePicker(false);
      setSelectedDate(currentDate);

      if (currentFrameIndex !== null) {
        const newBirthdays = [...birthdays];
        newBirthdays[currentFrameIndex].date = formatDate(currentDate);
        const sortedBirthdays = sortBirthdaysByDate(newBirthdays);
        setBirthdays(sortedBirthdays);
        saveBirthdays(sortedBirthdays);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  };

  const sortBirthdaysByDate = (birthdaysArray) => {
    return birthdaysArray.sort((a, b) => {
      const dateA = new Date(a.date || '1970-01-01');
      const dateB = new Date(b.date || '1970-01-01');
      return dateA - dateB;
    });
  };

  const toggleBirthday = (index) => {
    const newBirthdays = [...birthdays];

    // Only toggle on if the date is set
    if (newBirthdays[index].date) {
      newBirthdays[index].toggle = !newBirthdays[index].toggle;
      setBirthdays(newBirthdays);
      saveBirthdays(newBirthdays);

      // If the toggle is ON, set the alarm using AlarmModule with a unique request code
      if (newBirthdays[index].toggle) {
        setAlarmForBirthday(newBirthdays[index].date, newBirthdays[index].photo, newBirthdays[index].requestCode);
      }
    } else {
      Alert.alert('Set Date', 'Please set the date before enabling the wallpaper toggle.');
    }
  };

  const setAlarmForBirthday = (date, photoUri) => {
    if (!photoUri || !date) {
      console.error('Missing parameters for setting the alarm.');
      return;
    }

    const now = new Date();
    const birthdayDate = new Date(`${date}T00:00:00`); // The start of the birthday date

    // If the birthday date has passed, move it to next year
    if (birthdayDate <= now) {
      birthdayDate.setFullYear(now.getFullYear() + 1);
    }

    const timeInMillis = birthdayDate.getTime() - now.getTime();

    if (timeInMillis > 0) {
      try {
        // Generate a random number for requestCode
        const requestCode = Math.floor(Math.random() * 1000000); // Random number between 0 and 999999
        console.log(`Generated requestCode: ${requestCode}`);

        // Call AlarmModule to set the alarm with time difference, photo URI, and generated request code
        AlarmModule.setAlarm(timeInMillis, photoUri, requestCode);
        console.log(`Alarm set for ${timeInMillis} milliseconds for photo: ${photoUri} with request code: ${requestCode}`);
      } catch (error) {
        console.error('Error setting alarm:', error);
      }
    } else {
      Alert.alert('Invalid Time', 'The selected time is in the past.');
    }
  };

  const confirmDeleteBirthday = (birthdayId) => {
    Alert.alert(
      'Delete Birthday',
      'Are you sure you want to delete this birthday?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => deleteBirthday(birthdayId) }
      ]
    );
  };

  const deleteBirthday = (birthdayId) => {
    const updatedBirthdays = birthdays.filter(birthday => birthday.id !== birthdayId);
    setBirthdays(updatedBirthdays);
    saveBirthdays(updatedBirthdays);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Specials</Text>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
        {birthdays.length === 0 ? (
          <View style={styles.emptyText}>
            <Text style={styles.emptyTextItem}>Click + button to add to see Tasks</Text>
            <Text style={styles.emptyTextItem}>To Delete a task Long Press between image and Toggle bar</Text>
          </View>
        ) : (
          birthdays.map((birthday, index) => (
            <View key={index} style={styles.frame}>
              
              <View style={styles.photoToggleContainer}>
                <TouchableOpacity
                  key={birthday.id}
                  onLongPress={() => confirmDeleteBirthday(birthday.id)}
                  style={styles.photoToggleInnerContainer}
                >
                  {birthday.photo ? (
                    <TouchableOpacity onPress={() => handlePhotoUpload(index)}>
                      <Image source={{ uri: birthday.photo }} style={styles.image} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handlePhotoUpload(index)}>
                      <Text style={styles.uploadButtonText}>Upload Photo</Text>
                    </TouchableOpacity>
                  )}
                  <Switch
                    value={birthday.toggle}
                    onValueChange={() => toggleBirthday(index)}
                    trackColor={{ false: '#767577', true: '#e0f7fa' }}
                    thumbColor={birthday.toggle ? '#00796b' : '#f4f3f4'}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  setCurrentFrameIndex(index);
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.timeButtonText}>Select Date: {birthday.date || 'Not Set'}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addBirthday}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
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
    color:'#00796b'
  },
  scrollContainer: {
    flexGrow: 1,
  },
  emptyText:{
    marginTop: '50%'
  },
  emptyTextItem:{
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    textAlign: 'center',
    marginTop:'10%'
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
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 2,
    borderColor: '#000000',
  },
});

export default Birthdays;
