// components/ChatMessages.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChatMessage, Equipment, Solution } from '../../../api/chatAPI';
import useAuthStore from '../../../store/auth.store';
import { colors, typography } from '../../admin-dashboard/admin-dashboard-styles';
import ApplianceSelector from '../ApplianceSelector';
import EquipmentForm from '../EquipmentForm';
import ConfirmationDialog from '../ConfirmationDialog';
import SolutionSuggestion from '../SolutionSuggestion';
import TypingIndicator from '../TypingIndicator';
import OpenIssuesDisplay from '../OpenIssuesDisplay';

interface ChatMessagesProps {
  messages: ChatMessage[];
  renderMessageActions?: (message: ChatMessage) => React.ReactNode;
  // Handlers for interactive components
  onEquipmentSelect: (equipment: Equipment) => void;
  onAddNewEquipment: () => void;
  onEquipmentFormSubmit: (formData: Partial<Equipment>) => void;
  onConfirm: (action: string) => void;
  onCancel: (action: string) => void;
  onSolutionFeedback?: (solution: Solution) => void;
  onSelectOpenIssue?: (issue: any) => void;
  onContinueWithNewIssue?: () => void;
  isSubmitting: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
}

interface MessageGroup {
  type: 'user' | 'system' | 'assistant';
  messages: ChatMessage[];
  avatar: React.ReactNode;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages,
  renderMessageActions,
  onEquipmentSelect,
  onAddNewEquipment,
  onEquipmentFormSubmit,
  onConfirm,
  onCancel,
  onSolutionFeedback,
  onSelectOpenIssue,
  onContinueWithNewIssue,
  isSubmitting,
  isLoading,
  loadingMessage,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const getUserAvatar = () => {
    const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
    return (
      <View style={[styles.avatar, styles.userAvatar]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const getBotAvatar = () => (
    <Image 
      source={require('../../../../assets/fixfoxlogo.png')} 
      style={styles.avatar}
    />
  );

  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = messages[index - 1];
    const isNewGroup = !prevMessage || prevMessage.type !== message.type;

    if (isNewGroup) {
      acc.push({
        type: message.type,
        messages: [message],
        avatar: message.type === 'user' ? getUserAvatar() : getBotAvatar(),
      });
    } else {
      acc[acc.length - 1].messages.push(message);
    }
    return acc;
  }, [] as MessageGroup[]);

  const renderMessageGroup = ({ item: group }: { item: MessageGroup }) => {
    const isUser = group.type === 'user';
    return (
      <View style={[styles.groupContainer, isUser ? styles.userGroup : styles.botGroup]}>
        {!isUser && <View style={styles.avatarContainer}>{group.avatar}</View>}
        <View style={styles.messageList}>
          {group.messages.map((message, index) => {
            // Render interactive components based on metadata
            if (message.metadata?.type === 'appliance_selector' && message.metadata.options) {
              return (
                <ApplianceSelector
                  key={`appliance-selector-${message.id || index}`}
                  equipmentList={message.metadata.options}
                  onSelect={onEquipmentSelect}
                  onAddNew={onAddNewEquipment}
                />
              );
            }

            if (message.metadata?.type === 'equipment_form') {
              return (
                <EquipmentForm
                  key={`equipment-form-${message.id || index}`}
                  onSubmit={onEquipmentFormSubmit}
                  loading={isSubmitting}
                />
              );
            }

            if (message.metadata?.type === 'open_issues' && message.metadata.openIssues) {
              return (
                <View key={`open-issues-${message.id || index}`}>
                  <View
                    style={[
                      styles.messageBubble,
                      styles.botMessage,
                      group.messages.length > 1 && index < group.messages.length - 1 ? styles.middleMessage : {}
                    ]}
                  >
                    <Text style={styles.botMessageText}>{message.content}</Text>
                  </View>
                  {onSelectOpenIssue && onContinueWithNewIssue && (
                    <OpenIssuesDisplay
                      issues={message.metadata.openIssues}
                      onSelectIssue={onSelectOpenIssue}
                      onContinue={onContinueWithNewIssue}
                    />
                  )}
                </View>
              );
            }

            if (message.metadata?.type === 'confirmation') {
              console.log('Rendering confirmation message:', message);
              return (
                <View key={`confirmation-${message.id || index}`}>
                  <View
                    style={[
                      styles.messageBubble,
                      styles.botMessage,
                      group.messages.length > 1 && index < group.messages.length - 1 ? styles.middleMessage : {}
                    ]}
                  >
                    <Text style={styles.botMessageText}>{message.content}</Text>
                  </View>
                  <ConfirmationDialog
                    onConfirm={() => onConfirm(message.metadata?.action || '')}
                    onCancel={() => onCancel(message.metadata?.action || '')}
                  />
                </View>
              );
            }

            if (message.metadata?.type === 'solution' && message.metadata.solutions) {
              console.log('Rendering solution message:', message);
              console.log('Solutions data:', message.metadata.solutions);
              return (
                <View key={`solution-${message.id || index}`}>
                  <View
                    style={[
                      styles.messageBubble,
                      styles.botMessage,
                      group.messages.length > 1 && index < group.messages.length - 1 ? styles.middleMessage : {}
                    ]}
                  >
                    <Text style={styles.botMessageText}>{message.content}</Text>
                  </View>
                  {onSolutionFeedback && (
                    <SolutionSuggestion
                      solutions={message.metadata.solutions}
                      onAcceptSolution={onSolutionFeedback}
                      onRejectSolution={() => {}}
                    />
                  )}
                </View>
              );
            }
            
            return (
              <View key={message.id || index} style={styles.messageWithActions}>
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userMessage : styles.botMessage,
                    group.messages.length > 1 && index < group.messages.length - 1 ? styles.middleMessage : {}
                  ]}
                >
                  <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
                    {message.content}
                  </Text>
                </View>
                {renderMessageActions && renderMessageActions(message)}
              </View>
            );
          })}
        </View>
        {isUser && <View style={styles.avatarContainer}>{group.avatar}</View>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={groupedMessages}
        renderItem={renderMessageGroup}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        style={styles.listContainer}
        contentContainerStyle={styles.contentContainer}
      />
      {isLoading && (
        <TypingIndicator message={loadingMessage || t('chat.loading_questions')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  groupContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userGroup: {
    justifyContent: 'flex-end',
  },
  botGroup: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.white,
    ...typography.caption,
  },
  messageList: {
    flex: 1,
    maxWidth: '85%',
  },
  messageWithActions: {
    marginBottom: 2,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  botMessage: {
    backgroundColor: colors.lightGray,
    borderTopLeftRadius: 4,
  },
  middleMessage: {
    marginBottom: 2,
  },
  userMessageText: {
    ...typography.body2,
    color: colors.white,
  },
  botMessageText: {
    ...typography.body2,
    color: colors.dark,
  },
  listContainer: {
    flex: 1,
  },
});

export default ChatMessages;
