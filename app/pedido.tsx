import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ProdutoCard } from '../components/ProdutoCard';
import { useApp } from '../hooks/useApp';
import { Produto, ItemPedido } from '../types';
import { Colors, Spacing } from '../constants/Colors';

export default function PedidoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ produtoId?: string }>();
  const { 
    produtos, 
    carrinho, 
    carrinhoMesa, 
    mesas,
    adicionarAoCarrinho, 
    removerDoCarrinho,
    finalizarPedido,
    limparCarrinho
  } = useApp();

  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const mesa = useMemo(() => {
    return mesas.find(m => m.id === carrinhoMesa);
  }, [mesas, carrinhoMesa]);

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((sum, item) => sum + (item.produto.preco * item.quantidade), 0);
  }, [carrinho]);

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  useEffect(() => {
    if (params.produtoId) {
      const produto = produtos.find(p => p.id === parseInt(params.produtoId!));
      if (produto && produto.disponivel) {
        setModalProduto(produto);
      }
    }
  }, [params.produtoId, produtos]);

  if (!carrinhoMesa || !mesa) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="table-restaurant" size={64} color={Colors.border} />
        <Text style={styles.errorTitle}>Mesa não selecionada</Text>
        <Text style={styles.errorSubtitle}>
          Selecione uma mesa na tela principal para fazer um pedido
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleProdutoPress = (produto: Produto) => {
    setModalProduto(produto);
    setQuantidade(1);
    setObservacoes('');
  };

  const handleAdicionarProduto = () => {
    if (!modalProduto) return;
    
    adicionarAoCarrinho(modalProduto, quantidade, observacoes);
    setModalProduto(null);
    setQuantidade(1);
    setObservacoes('');
    showAlert('Produto adicionado', `${modalProduto.nome} foi adicionado ao pedido`);
  };

  const handleFinalizarPedido = async () => {
    if (carrinho.length === 0) {
      showAlert('Erro', 'Adicione pelo menos um item ao pedido');
      return;
    }

    await finalizarPedido();
    showAlert(
      'Pedido enviado!', 
      `Pedido para Mesa ${mesa.numero} foi enviado para a cozinha`,
      () => router.back()
    );
  };

  const handleLimparCarrinho = () => {
    if (Platform.OS === 'web') {
      setAlertConfig({
        visible: true,
        title: 'Limpar carrinho',
        message: 'Deseja realmente remover todos os itens?',
        onOk: () => {
          limparCarrinho();
          router.back();
        }
      });
    } else {
      Alert.alert(
        'Limpar carrinho',
        'Deseja realmente remover todos os itens?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Limpar', style: 'destructive', onPress: () => {
            limparCarrinho();
            router.back();
          }}
        ]
      );
    }
  };

  const renderProduto = ({ item }: { item: Produto }) => (
    <ProdutoCard produto={item} onPress={handleProdutoPress} />
  );

  const renderItemCarrinho = ({ item }: { item: ItemPedido }) => (
    <View style={styles.itemCarrinho}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.produto.nome}</Text>
        <Text style={styles.itemDetalhes}>
          {item.quantidade}x R$ {item.produto.preco.toFixed(2).replace('.', ',')}
        </Text>
        {item.observacoes && (
          <Text style={styles.itemObservacoes}>Obs: {item.observacoes}</Text>
        )}
      </View>
      <View style={styles.itemPrecoContainer}>
        <Text style={styles.itemPreco}>
          R$ {(item.produto.preco * item.quantidade).toFixed(2).replace('.', ',')}
        </Text>
        <TouchableOpacity
          onPress={() => removerDoCarrinho(item.produto.id)}
          style={styles.removerButton}
        >
          <MaterialIcons name="delete" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.mesaInfo}>
          <MaterialIcons name="table-restaurant" size={24} color={Colors.primary} />
          <Text style={styles.mesaTitulo}>Mesa {mesa.numero}</Text>
        </View>
        {carrinho.length > 0 && (
          <TouchableOpacity onPress={handleLimparCarrinho}>
            <MaterialIcons name="delete-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {carrinho.length > 0 && (
        <View style={styles.carrinhoSection}>
          <Text style={styles.carrinhoTitulo}>Itens do Pedido</Text>
          <FlatList
            data={carrinho}
            renderItem={renderItemCarrinho}
            keyExtractor={(item) => item.produto.id.toString()}
            style={styles.carrinhoList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: R$ {totalCarrinho.toFixed(2).replace('.', ',')}
            </Text>
            <TouchableOpacity
              style={styles.finalizarButton}
              onPress={handleFinalizarPedido}
            >
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.finalizarButtonText}>Enviar Pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.produtosSection}>
        <Text style={styles.produtosTitulo}>Adicionar Produtos</Text>
        <FlatList
          data={produtos}
          renderItem={renderProduto}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.produtosList}
        />
      </View>

      {/* Modal de Adicionar Produto */}
      <Modal
        visible={!!modalProduto}
        transparent
        animationType="slide"
        onRequestClose={() => setModalProduto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>{modalProduto?.nome}</Text>
              <TouchableOpacity
                onPress={() => setModalProduto(null)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalPreco}>
                R$ {modalProduto?.preco.toFixed(2).replace('.', ',')}
              </Text>
              
              {modalProduto?.descricao && (
                <Text style={styles.modalDescricao}>{modalProduto.descricao}</Text>
              )}

              <View style={styles.quantidadeContainer}>
                <Text style={styles.quantidadeLabel}>Quantidade:</Text>
                <View style={styles.quantidadeControls}>
                  <TouchableOpacity
                    style={styles.quantidadeButton}
                    onPress={() => setQuantidade(Math.max(1, quantidade - 1))}
                  >
                    <MaterialIcons name="remove" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantidadeText}>{quantidade}</Text>
                  <TouchableOpacity
                    style={styles.quantidadeButton}
                    onPress={() => setQuantidade(quantidade + 1)}
                  >
                    <MaterialIcons name="add" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.observacoesInput}
                placeholder="Observações (opcional)"
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.adicionarButton}
                onPress={handleAdicionarProduto}
              >
                <Text style={styles.adicionarButtonText}>
                  Adicionar - R$ {modalProduto ? (modalProduto.preco * quantidade).toFixed(2).replace('.', ',') : '0,00'}
                </Text>
              </TouchableOpacity>
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
              <View style={styles.alertButtons}>
                <TouchableOpacity 
                  style={[styles.alertButton, styles.alertButtonCancel]}
                  onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                >
                  <Text style={styles.alertButtonTextCancel}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.alertButton, styles.alertButtonConfirm]}
                  onPress={() => {
                    alertConfig.onOk?.();
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                  }}
                >
                  <Text style={styles.alertButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  mesaInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mesaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: Spacing.sm
  },
  carrinhoSection: {
    backgroundColor: Colors.surface,
    maxHeight: '40%'
  },
  carrinhoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  carrinhoList: {
    maxHeight: 200
  },
  itemCarrinho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  itemInfo: {
    flex: 1
  },
  itemNome: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text
  },
  itemDetalhes: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  itemObservacoes: {
    fontSize: 12,
    color: Colors.primaryLight,
    marginTop: 2,
    fontStyle: 'italic'
  },
  itemPrecoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemPreco: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: Spacing.sm
  },
  removerButton: {
    padding: Spacing.xs
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.primaryLight + '10'
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text
  },
  finalizarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8
  },
  finalizarButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.xs
  },
  produtosSection: {
    flex: 1
  },
  produtosTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  produtosList: {
    paddingVertical: Spacing.sm
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
    maxHeight: '80%'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1
  },
  modalCloseButton: {
    padding: Spacing.xs
  },
  modalContent: {
    padding: Spacing.lg
  },
  modalPreco: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm
  },
  modalDescricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20
  },
  quantidadeContainer: {
    marginBottom: Spacing.lg
  },
  quantidadeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm
  },
  quantidadeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantidadeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary
  },
  quantidadeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: Spacing.lg,
    minWidth: 40,
    textAlign: 'center'
  },
  observacoesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 14,
    color: Colors.text,
    marginBottom: Spacing.lg,
    minHeight: 80
  },
  adicionarButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center'
  },
  adicionarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
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
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  alertButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 5
  },
  alertButtonCancel: {
    backgroundColor: Colors.border
  },
  alertButtonConfirm: {
    backgroundColor: Colors.primary
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  alertButtonTextCancel: {
    color: Colors.textSecondary,
    fontWeight: 'bold'
  }
});