// ChatFlow.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useMutation, useQueryClient } from 'react-query';
import  API  from './api';
import Animated, { FadeInRight, SlideInUp } from 'react-native-reanimated';

const ChatFlow = ({ businessId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState('problem');


  const { mutate: startIssue } = useMutation(API.createIssue, {
    onSuccess: (data) => {
      setMessages([
        ...messages,
        { type: 'bot', text: 'Analyzing your issue...' },
        ...data.solutions.map(s => ({
          type: 'solution',
          data: s,
          id: s.id
        }))
      ]);
      setCurrentStep('solutions');
    }
  });

  const handleSend = async () => {
    if (currentStep === 'problem') {
      startIssue({
        businessId,
        userId,
        problemDescription: input,
        equipmentDescription: input
      });
    }
    setInput('');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Animated.FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInRight.delay(index * 100)}
            className={`p-4 my-2 mx-4 rounded-2xl ${
              item.type === 'user' ? 'bg-blue-500 self-end' : 'bg-white self-start'
            }`}
          >
            {item.type === 'solution' ? (
              <SolutionCard solution={item.data} />
            ) : (
              <Text className={`${item.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {item.text}
              </Text>
            )}
          </Animated.View>
        )}
      />

      <Animated.View
        entering={SlideInUp}
        className="p-4 bg-white border-t border-gray-200"
      >
        <TextInput
          className="h-12 px-4 bg-gray-100 rounded-full"
          placeholder="Describe your issue..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          className="absolute right-6 top-6"
          onPress={handleSend}
        >
          <Text className="text-blue-500 font-bold">Send</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const SolutionCard = ({ solution }) => (
  <View className="bg-white rounded-xl p-4 shadow-sm">
    <View className="flex-row items-center mb-3">
      <Text className="text-lg font-semibold flex-1">{solution.cause}</Text>
      <View className="bg-green-100 px-2 py-1 rounded-full">
        <Text className="text-green-600 text-sm">{solution.effectiveness}% Effective</Text>
      </View>
    </View>
    <Text className="text-gray-600 mb-4">{solution.treatment}</Text>
    <View className="flex-row gap-2">
      <TouchableOpacity className="flex-1 bg-green-500 p-3 rounded-lg items-center">
        <Text className="text-white">This worked</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-1 bg-red-500 p-3 rounded-lg items-center">
        <Text className="text-white">Didn't work</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ChatFlow;
