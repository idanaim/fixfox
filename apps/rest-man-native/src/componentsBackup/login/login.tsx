import React from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Dimensions } from 'react-native';
import { Button, TextInput, Text, Surface } from 'react-native-paper';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../queries/use-auth';
import useAuthStore from '../../store/auth.store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '../admin-dashboard/admin-dashboard-styles';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

// Define navigation types
type RootStackParamList = {
  Dashboard: undefined;
  ForgotPassword: undefined;
  Register: undefined;
  Onboarding: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define login credentials type
interface LoginCredentials {
  email: string;
  password: string;
}

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
  offlineAccess: true,
});

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { mutate: loginUser, isPending: isAuthLoading } = useAuth();
  const { signIn, isLoading, error, setLoading, setError } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  const handleLogin = (email: string, password: string) => {
    setLoading(true);
    setError(null);

    // Cast loginUser to accept any to bypass type checking temporarily
    // This is a workaround for the type mismatch between the hook and how it's used
    (loginUser as any)({ email, password }, {
      onSuccess: (data: any) => {
        setLoading(false);
        signIn(data?.access_token, data?.user);
        navigation.navigate('Dashboard');
      },
      onError: (error: any) => {
        setLoading(false);
        setError(error.message || 'Login failed. Please try again.');
        console.error('Login Error:', error);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Surface style={styles.container}>
          <View style={styles.logoContainer}>
            <View style={styles.headerRow}>
              <View style={styles.logoWrapper}>
                {!imageError ? (
                  <Image
                    source={require('../../../assets/fixfoxlogo.png')}
                    style={styles.logo}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View style={styles.logoFallback}>
                    <Icon name="tools" size={40} color={colors.primary} />
                  </View>
                )}
              </View>
              <View style={styles.languageSwitcherContainer}>
                <LanguageSwitcher />
              </View>
            </View>
            <Text style={styles.title}>Welcome to FixFox</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('common.email')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                left={<TextInput.Icon icon={() => <Icon name="email" size={20} color={colors.medium} />} />}
                theme={{ roundness: 8 }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('common.password')}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                left={<TextInput.Icon icon={() => <Icon name="lock" size={20} color={colors.medium} />} />}
                right={
                  <TextInput.Icon
                    icon={() => <Icon name={secureTextEntry ? "eye" : "eye-off"} size={20} color={colors.medium} />}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
                theme={{ roundness: 8 }}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => handleLogin(email, password)}
              loading={isLoading || isAuthLoading}
              disabled={isLoading || isAuthLoading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              buttonColor={colors.primary}
              textColor={colors.white}
              labelStyle={styles.buttonLabel}
            >
              {t('common.login')}
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.ssoContainer}>
              <Button
                mode="outlined"
                icon={() => <Icon name="google" size={20} color={colors.dark} />}
                style={styles.googleButton}
                contentStyle={styles.buttonContent}
                labelStyle={[styles.buttonLabel, { color: colors.dark }]}
              >
                Sign in with Google
              </Button>
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              textColor={colors.primary}
            >
              Forgot Password?
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Onboarding')}
              textColor={colors.secondary}
              icon={() => <Icon name="rocket-launch" size={16} color={colors.secondary} />}
            >
              New Account Setup
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height,
  },
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  languageSwitcherContainer: {
    position: 'absolute',
    right: 0,
  },
  logoFallback: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    padding: 24,
    backgroundColor: colors.white,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.dark,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.white,
  },
  inputOutline: {
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(224, 30, 90, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    marginLeft: 8,
  },
  loginButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    ...typography.button,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.medium,
    marginHorizontal: 16,
  },
  ssoContainer: {
    marginBottom: 8,
  },
  googleButton: {
    borderRadius: 8,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.lightGray,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default LoginScreen;
