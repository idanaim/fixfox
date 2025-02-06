import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, TextInput, Text, Title, useTheme } from 'react-native-paper';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
  offlineAccess: true,
});

const LoginScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      navigation.navigate('Dashboard'); // Replace with your main screen
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image
        source={require('../../../assets/fixfoxlogo.png')}
        style={[styles.logo, { tintColor: theme.colors.primary }]}
      />

      <Title style={[styles.title, { color: theme.colors.primary }]}>
        Welcome to FixFox
      </Title>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        theme={theme}
        left={<TextInput.Icon name="email" />}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        theme={theme}
        left={<TextInput.Icon name="lock" />}
      />

      <Button
        mode="contained"
        onPress={() => console.log('Login pressed')}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        labelStyle={styles.buttonLabel}>
        Login
      </Button>

      <Text style={[styles.orText, { color: theme.colors.disabled }]}>
        ─────── OR ───────
      </Text>

      <GoogleSigninButton
        style={styles.googleButton}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      />

      <View style={styles.footer}>
        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          labelStyle={{ color: theme.colors.accent }}>
          Forgot Password?
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('SignUp')}
          labelStyle={{ color: theme.colors.accent }}>
          Create Account
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 24,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  buttonLabel: {
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginBottom: 20,
    backgroundColor: 'red',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default LoginScreen;
