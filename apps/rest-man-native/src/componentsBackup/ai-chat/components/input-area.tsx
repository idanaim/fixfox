import React from 'react';
import { TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from '../components/animated-button';
import { styles } from '../styles/chat-styles';

interface InputAreaProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
}

const InputArea = ({ inputText, onInputChange, onSend, isSending }: InputAreaProps) => (
  <View style={styles.inputWrapper}>
    <TextInput
      style={styles.input}
      value={inputText}
      onChangeText={onInputChange}
      placeholder="Type your message here..."
      placeholderTextColor="#999"
      multiline
      selectionColor="#6C63FF"
    />
    <AnimatedButton onPress={onSend}>
      <LinearGradient colors={['#6C63FF', '#8B82FF']} style={styles.sendButton}>
        {isSending ? (
          <Ionicons name="time-outline" size={24} color="white" />
        ) : (
          <Ionicons name="send" size={24} color="white" />
        )}
      </LinearGradient>
    </AnimatedButton>
  </View>
);

export default InputArea;
