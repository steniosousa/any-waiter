import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    
    const handleLogin = () => {
        // TODO: Implement login logic
        console.log('Login with:', { email, password });
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="headlineMedium" style={styles.title}>Bem-vindo de volta!</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>Faça login para continuar</Text>
                    
                    <View style={styles.form}>
                        <TextInput
                            label="Email"
                            mode="outlined"
                            left={<TextInput.Icon icon="email" />}
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                        />
                        
                        <TextInput
                            label="Senha"
                            mode="outlined"
                            left={<TextInput.Icon icon="lock" />}
                            right={
                                <TextInput.Icon 
                                    icon={secureTextEntry ? 'eye-off' : 'eye'}
                                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                                />
                            }
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={secureTextEntry}
                            autoComplete="password"
                        />
                        
                        <Button 
                            mode="contained" 
                            onPress={handleLogin}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                            disabled={!email || !password}
                        >
                            Entrar
                        </Button>
                    </View>
                </Surface>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    surface: {
        margin: 20,
        padding: 20,
        borderRadius: 10,
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 32,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        paddingVertical: 6,
    },
    buttonLabel: {
        fontSize: 16,
    },
});