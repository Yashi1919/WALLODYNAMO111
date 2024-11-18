import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HelpScreen from '../Sidebars/HelpScreen'; // Ensure this path is correct
import ContactDeveloperScreen from '../Sidebars/ContactDeveloperScreen'; // Ensure this path is correct

const More = () => {
    const [selectedComponent, setSelectedComponent] = useState('Help'); // Set default to 'Help'

    const renderComponent = () => {
        switch (selectedComponent) {
            case 'Help':
                return <HelpScreen />;
            case 'ContactDeveloper':
                return <ContactDeveloperScreen />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedComponent === 'Help' && styles.activeButton // Highlight active button
                    ]}
                    onPress={() => setSelectedComponent('Help')} // Set to 'Help'
                >
                    <Text style={[
                        styles.buttonText,
                        selectedComponent === 'Help' ? styles.activeButtonText : styles.inactiveButtonText
                    ]}>
                        Help
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedComponent === 'ContactDeveloper' && styles.activeButton // Highlight active button
                    ]}
                    onPress={() => setSelectedComponent('ContactDeveloper')} // Set to 'ContactDeveloper'
                >
                    <Text style={[
                        styles.buttonText,
                        selectedComponent === 'ContactDeveloper' ? styles.activeButtonText : styles.inactiveButtonText
                    ]}>
                        Contact
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.componentContainer}>
                {renderComponent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    button: {
        flex: 1, // Fill the available space
        marginHorizontal: 5,
        borderColor: '#00796b',
        borderWidth: 2, // Increase border width
        borderRadius: 30, // Increased border radius for rounded buttons
        padding: 10,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#00796b', // Background color for the active button
    },
    buttonText: {
        fontWeight: 'bold',
    },
    activeButtonText: {
        color: '#fff', // White text color for the active button
    },
    inactiveButtonText: {
        color: 'black', // Black text color for inactive buttons
    },
    componentContainer: {
        flex: 1, // Allow the component container to fill the remaining space
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#00796b',
        borderRadius: 5,
    },
});

export default More;
