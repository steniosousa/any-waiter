import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MesaCard } from '../../components/MesaCard';
import { useApp } from '../../hooks/useApp';
import { Mesa } from '../../types';
import { Colors, Spacing } from '../../constants/Colors';
import { router } from 'expo-router';

export default function MesasScreen() {
  const insets = useSafeAreaInsets();
  const { mesas, atualizarMesa, selecionarMesa } = useApp();
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const estatisticas = useMemo(() => {
    return {
      livres: mesas.filter(m => m.status === 'livre').length,
      ocupadas: mesas.filter(m => m.status === 'ocupada').length,
      reservadas: mesas.filter(m => m.status === 'reservada').length,
      contas: mesas.filter(m => m.status === 'conta').length
    };
  }, [mesas]);

  const handleMesaPress = (mesa: Mesa) => {
    setMesaSelecionada(mesa);
    setModalVisible(true);
  };

  const handleAcaoMesa = async (acao: string) => {
    if (!mesaSelecionada) return;

    let novoStatus: Mesa['status'] = mesaSelecionada.status;
    
    switch (acao) {
      case 'ocupar':
        if (mesaSelecionada.status === 'livre') {
          novoStatus = 'ocupada';
        }
        break;
      case 'liberar':
        novoStatus = 'livre';
        break;
      case 'reservar':
        if (mesaSelecionada.status === 'livre') {
          novoStatus = 'reservada';
        }
        break;
      case 'conta':
        if (mesaSelecionada.status === 'ocupada') {
          novoStatus = 'conta';
        }
        break;
      case 'pedido':
        if (mesaSelecionada.status === 'livre' || mesaSelecionada.status === 'ocupada') {
          selecionarMesa(mesaSelecionada.id);
          setModalVisible(false);
          router.push('/pedido');
          return;
        }
        break;
    }

    if (novoStatus !== mesaSelecionada.status) {
      const mesaAtualizada = { ...mesaSelecionada, status: novoStatus };
      await atualizarMesa(mesaAtualizada);
      showAlert('Sucesso', `Mesa ${mesaSelecionada.numero} atualizada para: ${novoStatus}`);
    }

    setModalVisible(false);
  };

  const renderMesa = ({ item }: { item: Mesa }) => (
    <MesaCard mesa={item} onPress={handleMesaPress} />
  );

  const renderModalAcoes = () => {
    if (!mesaSelecionada) return null;

    const acoes = [];
    
    if (mesaSelecionada.status === 'livre') {
      acoes.push(
        { id: 'ocupar', titulo: 'Ocupar Mesa', icone: 'people', cor: Colors.error },
        { id: 'reservar', titulo: 'Reservar Mesa', icone: 'event-busy', cor: Colors.warning },
        { id: 'pedido', titulo: 'Fazer Pedido', icone: 'add-shopping-cart', cor: Colors.primary }
      );
    } else if (mesaSelecionada.status === 'ocupada') {
      acoes.push(
        { id: 'pedido', titulo: 'Fazer Pedido', icone: 'add-shopping-cart', cor: Colors.primary },
        { id: 'conta', titulo: 'Pedir Conta', icone: 'receipt', cor: Colors.secondary },
        { id: 'liberar', titulo: 'Liberar Mesa', icone: 'event-available', cor: Colors.success }
      );
    } else if (mesaSelecionada.status === 'reservada') {
      acoes.push(
        { id: 'ocupar', titulo: 'Ocupar Mesa', icone: 'people', cor: Colors.error },
        { id: 'liberar', titulo: 'Liberar Mesa', icone: 'event-available', cor: Colors.success }
      );
    } else if (mesaSelecionada.status === 'conta') {
      acoes.push(
        { id: 'liberar', titulo: 'Liberar Mesa', icone: 'event-available', cor: Colors.success }
      );
    }

    return acoes.map((acao) => (
      <TouchableOpacity
        key={acao.id}
        style={[styles.modalButton, { backgroundColor: acao.cor }]}
        onPress={() => handleAcaoMesa(acao.id)}
      >
        <MaterialIcons name={acao.icone as any} size={24} color="white" />
        <Text style={styles.modalButtonText}>{acao.titulo}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Controle de Mesas</Text>
        
        <View style={styles.estatisticas}>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.success }]}>
              {estatisticas.livres}
            </Text>
            <Text style={styles.estatisticaLabel}>Livres</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.error }]}>
              {estatisticas.ocupadas}
            </Text>
            <Text style={styles.estatisticaLabel}>Ocupadas</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.warning }]}>
              {estatisticas.reservadas}
            </Text>
            <Text style={styles.estatisticaLabel}>Reservadas</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.secondary }]}>
              {estatisticas.contas}
            </Text>
            <Text style={styles.estatisticaLabel}>Contas</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={mesas}
        renderItem={renderMesa}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                Mesa {mesaSelecionada?.numero}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {renderModalAcoes()}
            </View>
          </View>
        </View>
      </Modal>

      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={styles.alertButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md
  },
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  estatisticaItem: {
    alignItems: 'center'
  },
  estatisticaNumero: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  estatisticaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  listContainer: {
    padding: Spacing.sm
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text
  },
  modalCloseButton: {
    padding: Spacing.xs
  },
  modalContent: {
    padding: Spacing.lg
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginVertical: Spacing.xs
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.md
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    minWidth: 280,
    margin: 20
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20
  },
  alertButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center'
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});