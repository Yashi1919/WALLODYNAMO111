import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking, TouchableOpacity } from 'react-native';

const ContactDeveloperScreen = () => {
    const handleLink = (url) => {
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Contact the Developer</Text>
            <Text style={styles.text}>
                If you have any questions, feedback, or issues, feel free to reach out!
            </Text>
            <Text style={styles.subtitle}>Email:</Text>
            <Text style={styles.email}>wallodynamo@example.com</Text>

            <View style={styles.socialContainer}>
                <Text style={styles.socialTitle}>Connect with me:</Text>
                <View style={styles.iconContainer}>
                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={() => handleLink('https://www.facebook.com/share/gghbYbY3EdKqJ4iC/?mibextid=qi20mg')}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/00796b/facebook-new.png' }} // Facebook icon
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={() => handleLink('https://x.com/WalloDynamo')}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/00796b/twitter-squared.png' }} // Twitter icon
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.iconWrapper}>
                        <TouchableOpacity onPress={() => handleLink('https://www.instagram.com/wallodynamo/')}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/00796b/instagram-new.png' }} // Instagram icon
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    text: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 22,
        color: '#00796b',
    },
    subtitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        marginBottom: 10,
        color: '#00796b', // Dark teal color
    },
    socialContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    socialTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%', // Use full width of the container
    },
    iconWrapper: {
        flex: 1, // Allow each icon to occupy equal space
        alignItems: 'center', // Center the icons horizontally
    },
    icon: {
        width: 50,
        height: 50,
    },
});

export default ContactDeveloperScreen;
