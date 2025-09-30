import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }
        try {
            setIsLoading(true);
            await signIn(email, password);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível fazer login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
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
                    <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
                    <Text variant="bodyMedium" style={styles.subtitle}>Faça login para começar seus pedidos</Text>
                    
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
                            onPress={(e:any) => handleLogin(e)}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                            disabled={isLoading}
                            loading={isLoading}
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
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
        alignItems: 'center',
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
        backgroundColor: '#FDD835',
    },
    buttonLabel: {
        fontSize: 16,
        color: '#000',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
});