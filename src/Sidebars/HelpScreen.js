import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

const HelpScreen = () => {
    const [selectedTab, setSelectedTab] = useState('Add');

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'Add':
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.tabText}>How to Add:</Text>
                        <Text style={styles.subheading}>1. Setting Wallpapers:</Text>
                        <Text style={styles.text}>
                            - Navigate to the 'Set' tab and Click on + button
                        </Text>
                        <Text style={styles.text}>
                            - Select an image from your device.
                        </Text>
                        <Text style={styles.text}>
                            - Choose a time for the wallpaper and on the Toggle
                        </Text>
                        
                        <Text style={styles.subheading}>2. Adding Birthdays:</Text>
                        <Text style={styles.text}>
                            - Go to the 'Birthdays' tab.
                        </Text>
                        <Text style={styles.text}>
                            - Tap the '+' button to create a new birthday entry.
                        </Text>
                        <Text style={styles.text}>
                            - Give the Date and ON the toggle button
                        </Text>
                        
                        <Text style={styles.subheading}>3. Addinng Intervals:</Text>
                        <Text style={styles.text}>
                            - Click add images from library, select the images you want to include.
                        </Text>
                        <Text style={styles.text}>
                            - Set the interval for how often the wallpaper should change. and enable the toggle
                        </Text>
                    </ScrollView>
                );
            case 'Delete':
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.tabText}>How to Delete:</Text>
                        <Text style={styles.subheading}>1. Deleting Wallpapers:</Text>
                        <Text style={styles.text}>
                            - Go to the 'Set' tab.
                        </Text>
                        <Text style={styles.text}>
                            - Long Press Between image and toggle button
                        </Text>
                        <Text style={styles.text}>
                            - It will ask to delete or cancel
                        </Text>
                        
                        <Text style={styles.subheading}>2. Deleting Birthdays:</Text>
                        <Text style={styles.text}>
                            - Long Press Between image and toggle button
                        </Text>
                        <Text style={styles.text}>
                            - Find the birthday you want to delete.
                        </Text>
                        <Text style={styles.text}>
                            - It will ask to delete or cancel
                        </Text>
                        
                        <Text style={styles.subheading}>3. Removing Random Wallpaper:</Text>
                        <Text style={styles.text}>
                            - In the 'Random' tab, Long Press on the wallpaper you want to delete.
                        </Text>
                        <Text style={styles.text}>
                            - It will ask to delete or cancel
                        </Text>
                    </ScrollView>
                );
            case 'Usage':
                return (
                    <ScrollView style={styles.tabContent}>
                        <Text style={styles.tabText}>Usage Instructions:</Text>
                        <Text style={styles.subheading}>1. ToSeeList:</Text>
                        <Text style={styles.text}>
                            - Forget About TODO List From Now Its Time for TOSEE List
                        </Text>

                        <Text style={styles.subheading}>2. Specials:</Text>
                        <Text style={styles.text}>
                            - Use the 'Specials' tab to add special dates and receive reminders.
                        </Text>

                        <Text style={styles.subheading}>3. Intervals:</Text>
                        <Text style={styles.text}>
                            - Use the 'Random' tab to change wallpapers at specified intervals.
                        </Text>

                        <Text style={styles.text}>
                            - Enable the shake feature in the 'Shake' tab to change the wallpaper by shaking your device.
                        </Text>
                    </ScrollView>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.tabContainer}>
                <Button
                    title="Add"
                    onPress={() => setSelectedTab('Add')}
                    color={selectedTab === 'Add' ? '#00796b' : '#ccc'} // Change color if selected
                />
                <Button
                    title="Delete"
                    onPress={() => setSelectedTab('Delete')}
                    color={selectedTab === 'Delete' ? '#00796b' : '#ccc'} // Change color if selected
                />
                <Button
                    title="Usage"
                    onPress={() => setSelectedTab('Usage')}
                    color={selectedTab === 'Usage' ? '#00796b' : '#ccc'} // Change color if selected
                />
            </View>
            <View style={styles.contentContainer}>
                {renderTabContent()}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    buttons:{
    
        borderRadius:15
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff', // Light background color
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#00796b', // Dark teal color
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tabText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color:'#00796b'
    },
    subheading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color:'#00796b'
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 22,
        color:'#00796b'
    },
    tabContent: {
        marginTop: 20,
    },
    contentContainer: {
        marginTop: 7,
    },
});

export default HelpScreen;
