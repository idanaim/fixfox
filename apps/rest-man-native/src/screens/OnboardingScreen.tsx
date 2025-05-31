import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Surface,
  IconButton,
  Appbar,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

// Slack-inspired color palette
const colors = {
  primary: '#4A154B',
  secondary: '#36C5F0',
  accent: '#ECB22E',
  success: '#2EB67D',
  error: '#E01E5A',
  dark: '#1D1C1D',
  medium: '#616061',
  light: '#868686',
  lightGray: '#F8F8F8',
  border: '#DDDDDD',
  white: '#FFFFFF',
};

const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.25 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: 0.15 },
  h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: 0.15 },
  body1: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0.5 },
  body2: { fontSize: 14, fontWeight: '400' as const, letterSpacing: 0.25 },
  caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.4 },
  button: { fontSize: 14, fontWeight: '500' as const, letterSpacing: 1.25 },
};

interface OnboardingData {
  // Account setup
  accountName: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  
  // Business setup
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessPhone: string;
  
  // Additional users
  teamMembers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
}

export const OnboardingScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    accountName: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessPhone: '',
    teamMembers: [],
  });

  const steps = [
    { id: 1, title: t('onboarding.steps.welcome'), icon: 'hand-wave' },
    { id: 2, title: t('onboarding.steps.account'), icon: 'account-circle' },
    { id: 3, title: t('onboarding.steps.business'), icon: 'domain' },
    { id: 4, title: t('onboarding.steps.team'), icon: 'account-group' },
    { id: 5, title: t('onboarding.steps.complete'), icon: 'check-circle' },
  ];

  const businessTypeOptions = [
    { key: 'Restaurant', label: t('onboarding.business.types.restaurant') },
    { key: 'Hotel', label: t('onboarding.business.types.hotel') },
    { key: 'Retail Store', label: t('onboarding.business.types.retail') },
    { key: 'Office Building', label: t('onboarding.business.types.office') },
    { key: 'Manufacturing', label: t('onboarding.business.types.manufacturing') },
    { key: 'Healthcare', label: t('onboarding.business.types.healthcare') },
    { key: 'Education', label: t('onboarding.business.types.education') },
    { key: 'Other', label: t('onboarding.business.types.other') },
  ];

  const userRoleOptions = [
    { key: 'Manager', label: t('onboarding.team.roles.manager') },
    { key: 'Technician', label: t('onboarding.team.roles.technician') },
    { key: 'Employee', label: t('onboarding.team.roles.employee') },
    { key: 'Admin', label: t('onboarding.team.roles.admin') },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, {
        firstName: '',
        lastName: '',
        email: '',
        role: 'Employee'
      }]
    }));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 2: // Account setup
        if (!formData.accountName || !formData.adminFirstName || !formData.adminLastName || !formData.adminEmail) {
          Alert.alert(t('onboarding.validation.missingInfo'), t('onboarding.validation.accountDetails'));
          return false;
        }
        if (!formData.adminEmail.includes('@')) {
          Alert.alert(t('onboarding.validation.invalidEmail'), t('onboarding.validation.validEmailRequired'));
          return false;
        }
        break;
      case 3: // Business setup
        if (!formData.businessName || !formData.businessType) {
          Alert.alert(t('onboarding.validation.missingInfo'), t('onboarding.validation.businessInfo'));
          return false;
        }
        break;
      case 4: // Team setup (optional, so always valid)
        break;
    }
    return true;
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Here you would make API calls to create the account, business, and users
      console.log('Onboarding data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        t('onboarding.success.title'), 
        t('onboarding.success.message'),
        [{ text: t('onboarding.success.buttonText'), onPress: () => navigation.replace('Dashboard') }]
      );
    } catch (error) {
      Alert.alert(t('onboarding.error.title'), t('onboarding.error.message'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <Surface style={styles.stepIndicator}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              currentStep >= step.id && styles.stepCircleActive,
              currentStep > step.id && styles.stepCircleCompleted
            ]}>
              {currentStep > step.id ? (
                <Icon name="check" size={16} color={colors.white} />
              ) : (
                <Icon 
                  name={step.icon} 
                  size={16} 
                  color={currentStep >= step.id ? colors.white : colors.medium} 
                />
              )}
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                currentStep > step.id && styles.stepConnectorActive
              ]} />
            )}
          </View>
        ))}
      </View>
      <ProgressBar 
        progress={currentStep / steps.length} 
        color={colors.primary} 
        style={styles.progressBar}
      />
    </Surface>
  );

  const renderWelcomeStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.welcomeContainer}>
        <Icon name="hand-wave" size={80} color={colors.accent} />
        <Text style={styles.welcomeTitle}>{t('onboarding.welcome.title')}</Text>
        <Text style={styles.welcomeSubtitle}>
          {t('onboarding.welcome.subtitle')}
        </Text>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>{t('onboarding.welcome.features.manageEquipment')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>{t('onboarding.welcome.features.trackCosts')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>{t('onboarding.welcome.features.coordinateTechnicians')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>{t('onboarding.welcome.features.aiSolutions')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAccountStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.formContainer}>
        <View style={styles.stepHeader}>
          <Icon name="account-circle" size={32} color={colors.primary} />
          <Text style={styles.stepTitle}>{t('onboarding.account.title')}</Text>
          <Text style={styles.stepSubtitle}>{t('onboarding.account.subtitle')}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupLabel}>{t('onboarding.account.accountInfo')}</Text>
          <TextInput
            label={t('onboarding.account.accountName')}
            value={formData.accountName}
            onChangeText={(value) => updateFormData('accountName', value)}
            mode="outlined"
            style={styles.slackInput}
            left={<TextInput.Icon icon="domain" />}
            placeholder={t('onboarding.account.accountNamePlaceholder')}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputGroupLabel}>{t('onboarding.account.adminDetails')}</Text>
          <View style={styles.nameRow}>
            <TextInput
              label={t('onboarding.account.firstName')}
              value={formData.adminFirstName}
              onChangeText={(value) => updateFormData('adminFirstName', value)}
              mode="outlined"
              style={[styles.slackInput, styles.halfWidth]}
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label={t('onboarding.account.lastName')}
              value={formData.adminLastName}
              onChangeText={(value) => updateFormData('adminLastName', value)}
              mode="outlined"
              style={[styles.slackInput, styles.halfWidth]}
            />
          </View>
          <TextInput
            label={t('onboarding.account.emailAddress')}
            value={formData.adminEmail}
            onChangeText={(value) => updateFormData('adminEmail', value)}
            mode="outlined"
            style={styles.slackInput}
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
            placeholder={t('onboarding.account.emailPlaceholder')}
          />
        </View>
      </View>
    </View>
  );

  const renderBusinessStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.formContainer}>
        <View style={styles.stepHeader}>
          <Icon name="domain" size={32} color={colors.primary} />
          <Text style={styles.stepTitle}>{t('onboarding.business.title')}</Text>
          <Text style={styles.stepSubtitle}>{t('onboarding.business.subtitle')}</Text>
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            label={t('onboarding.business.businessName')}
            value={formData.businessName}
            onChangeText={(value) => updateFormData('businessName', value)}
            mode="outlined"
            style={styles.slackInput}
            left={<TextInput.Icon icon="store" />}
            placeholder={t('onboarding.business.businessNamePlaceholder')}
          />
          
          <Text style={styles.inputGroupLabel}>{t('onboarding.business.businessType')}</Text>
          <View style={styles.chipContainer}>
            {businessTypeOptions.map((type) => (
              <Chip
                key={type.key}
                selected={formData.businessType === type.key}
                onPress={() => updateFormData('businessType', type.key)}
                style={[
                  styles.businessTypeChip,
                  formData.businessType === type.key && styles.businessTypeChipSelected
                ]}
                textStyle={formData.businessType === type.key ? styles.chipTextSelected : styles.chipText}
              >
                {type.label}
              </Chip>
            ))}
          </View>

          <TextInput
            label={t('onboarding.business.address')}
            value={formData.businessAddress}
            onChangeText={(value) => updateFormData('businessAddress', value)}
            mode="outlined"
            style={styles.slackInput}
            left={<TextInput.Icon icon="map-marker" />}
            placeholder={t('onboarding.business.addressPlaceholder')}
          />
          
          <TextInput
            label={t('onboarding.business.phone')}
            value={formData.businessPhone}
            onChangeText={(value) => updateFormData('businessPhone', value)}
            mode="outlined"
            style={styles.slackInput}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
            placeholder={t('onboarding.business.phonePlaceholder')}
          />
        </View>
      </View>
    </View>
  );

  const renderTeamStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.formContainer}>
        <View style={styles.stepHeader}>
          <Icon name="account-group" size={32} color={colors.primary} />
          <Text style={styles.stepTitle}>{t('onboarding.team.title')}</Text>
          <Text style={styles.stepSubtitle}>{t('onboarding.team.subtitle')}</Text>
        </View>

        <ScrollView style={styles.teamMembersContainer} showsVerticalScrollIndicator={false}>
          {formData.teamMembers.map((member, index) => (
            <Card key={index} style={styles.teamMemberCard}>
              <Card.Content>
                <View style={styles.teamMemberHeader}>
                  <Text style={styles.teamMemberTitle}>{t('onboarding.team.teamMember')} {index + 1}</Text>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => removeTeamMember(index)}
                    iconColor={colors.error}
                  />
                </View>
                
                <View style={styles.nameRow}>
                  <TextInput
                    label={t('onboarding.team.firstName')}
                    value={member.firstName}
                    onChangeText={(value) => updateTeamMember(index, 'firstName', value)}
                    mode="outlined"
                    style={[styles.slackInput, styles.halfWidth]}
                  />
                  <TextInput
                    label={t('onboarding.team.lastName')}
                    value={member.lastName}
                    onChangeText={(value) => updateTeamMember(index, 'lastName', value)}
                    mode="outlined"
                    style={[styles.slackInput, styles.halfWidth]}
                  />
                </View>
                
                <TextInput
                  label={t('onboarding.team.email')}
                  value={member.email}
                  onChangeText={(value) => updateTeamMember(index, 'email', value)}
                  mode="outlined"
                  style={styles.slackInput}
                  keyboardType="email-address"
                />
                
                <Text style={styles.inputGroupLabel}>{t('onboarding.team.role')}</Text>
                <View style={styles.chipContainer}>
                  {userRoleOptions.map((role) => (
                    <Chip
                      key={role.key}
                      selected={member.role === role.key}
                      onPress={() => updateTeamMember(index, 'role', role.key)}
                      style={[
                        styles.roleChip,
                        member.role === role.key && styles.roleChipSelected
                      ]}
                      textStyle={member.role === role.key ? styles.chipTextSelected : styles.chipText}
                    >
                      {role.label}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          ))}
          
          <TouchableOpacity style={styles.addMemberButton} onPress={addTeamMember}>
            <Icon name="plus-circle" size={24} color={colors.primary} />
            <Text style={styles.addMemberText}>{t('onboarding.team.addMember')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.completeContainer}>
        <Icon name="check-circle" size={80} color={colors.success} />
        <Text style={styles.completeTitle}>{t('onboarding.complete.title')}</Text>
        <Text style={styles.completeSubtitle}>
          {t('onboarding.complete.subtitle')}
        </Text>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Icon name="account-circle" size={20} color={colors.primary} />
            <Text style={styles.summaryText}>{t('onboarding.complete.account')}: {formData.accountName}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="domain" size={20} color={colors.primary} />
            <Text style={styles.summaryText}>{t('onboarding.complete.business')}: {formData.businessName}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="account-group" size={20} color={colors.primary} />
            <Text style={styles.summaryText}>
              {t('onboarding.complete.teamMembers')}: {formData.teamMembers.length + 1} {t('onboarding.complete.includingYou')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderWelcomeStep();
      case 2:
        return renderAccountStep();
      case 3:
        return renderBusinessStep();
      case 4:
        return renderTeamStep();
      case 5:
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        {currentStep > 1 && (
          <Appbar.BackAction onPress={handleBack} color={colors.white} />
        )}
        <Appbar.Content title={t('onboarding.title')} titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="close" 
          onPress={() => navigation.goBack()} 
          color={colors.white} 
        />
      </Appbar.Header>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <Surface style={styles.navigationBar}>
        <View style={styles.navigationButtons}>
          {currentStep > 1 && currentStep < 5 && (
            <Button
              mode="outlined"
              onPress={handleBack}
              style={styles.backButton}
              labelStyle={styles.backButtonLabel}
            >
              {t('onboarding.navigation.back')}
            </Button>
          )}
          
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            labelStyle={styles.nextButtonLabel}
            loading={isLoading}
            disabled={isLoading}
            icon={currentStep === 5 ? "rocket-launch" : "arrow-right"}
          >
            {currentStep === 1 ? t('onboarding.navigation.getStarted') : 
             currentStep === 5 ? (isLoading ? t('onboarding.navigation.creatingAccount') : t('onboarding.navigation.launch')) : 
             t('onboarding.navigation.continue')}
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  headerTitle: {
    color: colors.white,
    ...typography.h3,
  },
  stepIndicator: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  stepConnectorActive: {
    backgroundColor: colors.success,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    padding: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  welcomeTitle: {
    ...typography.h1,
    color: colors.dark,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...typography.body1,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresList: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    ...typography.body1,
    color: colors.dark,
  },
  formContainer: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.dark,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  stepSubtitle: {
    ...typography.body1,
    color: colors.medium,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputGroupLabel: {
    ...typography.h3,
    color: colors.dark,
    marginBottom: 12,
  },
  slackInput: {
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  businessTypeChip: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
  },
  businessTypeChipSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  roleChip: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
  },
  roleChipSelected: {
    backgroundColor: colors.secondary + '20',
    borderColor: colors.secondary,
  },
  chipText: {
    color: colors.medium,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  teamMembersContainer: {
    flex: 1,
    maxHeight: 400,
  },
  teamMemberCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
  },
  teamMemberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamMemberTitle: {
    ...typography.h3,
    color: colors.dark,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    gap: 8,
  },
  addMemberText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  completeContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  completeTitle: {
    ...typography.h1,
    color: colors.dark,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  completeSubtitle: {
    ...typography.body1,
    color: colors.medium,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  summaryContainer: {
    width: '100%',
    maxWidth: 300,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  summaryText: {
    ...typography.body1,
    color: colors.dark,
  },
  navigationBar: {
    padding: 16,
    elevation: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
  },
  backButtonLabel: {
    color: colors.medium,
    ...typography.button,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
  },
  nextButtonLabel: {
    color: colors.white,
    ...typography.button,
  },
}); 