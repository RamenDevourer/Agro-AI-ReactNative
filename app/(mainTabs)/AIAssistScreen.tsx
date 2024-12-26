import React, { useState, useCallback } from 'react';
import {View,Text,TextInput,FlatList,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function AIAssistantScreen() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');

    const handleSend = useCallback(() => {
        if (inputText.trim()) {
            setMessages(prevMessages => {
                return [
                    ...prevMessages,
                    {id: Date.now(), text: inputText, sender: 'user'},
                ];
            });
            setInputText('');
            // Simulate AI response
            setTimeout(() => {
                setMessages(prevMessages => {
                    return [
                        ...prevMessages,
                        {
                            id: Date.now(),
                            text: "I'm your farming assistant. How can I help you with your crops today?",
                            sender: 'ai',
                        },
                    ];
                });
            }, 1000);
        }
    }, [inputText]);

    const renderMessage = ({ item }) => (
        <View
            style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userMessage : styles.aiMessage,
            ]}
        >
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Assistant</Text>
                <Text style={styles.headerSubtitle}>
                    Get instant help with your farming queries
                </Text>
            </View>

            {/* Chat Area */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.messageList,
                    messages.length === 0 && styles.emptyMessageList,
                ]}
                ListEmptyComponent={() => (
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructionsTitle}>How can I help you?</Text>
                        <View style={styles.instructionItem}>
                            <FontAwesome5
                                name="leaf"
                                size={16}
                                color="#2D6A4F"
                                accessibilityLabel="Ask about plant diseases"
                            />
                            <Text style={styles.instructionText}>
                                Ask about plant diseases
                            </Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <FontAwesome5
                                name="cloud-sun"
                                size={16}
                                color="#2D6A4F"
                                accessibilityLabel="Get weather-based advice"
                            />
                            <Text style={styles.instructionText}>
                                Get weather-based advice
                            </Text>
                        </View>
                        <View style={styles.instructionItem}>
                            <FontAwesome5
                                name="seedling"
                                size={16}
                                color="#2D6A4F"
                                accessibilityLabel="Learn about crop management"
                            />
                            <Text style={styles.instructionText}>
                                Learn about crop management
                            </Text>
                        </View>
                    </View>
                )}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask your farming assistant..."
                    placeholderTextColor="#6B7280"
                    multiline
                    maxLength={200}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                >
                    <FontAwesome5 name="paper-plane" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    messageList: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    emptyMessageList: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
    },
    aiMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    messageText: {
        fontSize: 16,
        color: '#1F2937',
    },
    instructionsContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        marginVertical: 20,
        marginHorizontal: 10,
        alignItems: 'flex-start',
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    instructionText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#4B5563',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        color: '#1F2937',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#2D6A4F',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
});