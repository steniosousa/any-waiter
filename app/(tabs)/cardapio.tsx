import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProdutoCard } from '../../components/ProdutoCard';
import { useApp } from '../../hooks/useApp';
import { Produto } from '../../types';
import { Colors, Spacing } from '../../constants/Colors';
import { router } from 'expo-router';

export default function CardapioScreen() {
  const insets = useSafeAreaInsets();
  const { produtos, carrinho, carrinhoMesa, selecionarMesa } = useApp();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todas');

  const categorias = useMemo(() => {
    const cats = ['Todas', ...new Set(produtos.map(p => p.category))];
    return cats;
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    if (categoriaSelecionada === 'Todas') {
      return produtos;
    }
    return produtos.filter(p => p.category.id === categoriaSelecionada);
  }, [produtos, categoriaSelecionada]);

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((sum, item) => sum + (item.produto.price * item.quantidade), 0);
  }, [carrinho]);

  const handleProdutoPress = (produto: Produto) => {
    if (!carrinhoMesa) {
      // Se não há mesa selecionada, redirecionar para seleção de mesa
      router.push('/');
      return;
    }
    
    // Navegar para tela de pedido com o produto selecionado
    router.push({
      pathname: '/pedido',
      params: { produtoId: produto.id.toString() }
    });
  };

  const renderCategoria = (categoria: string) => (
    console.log(categoria),
    <TouchableOpacity
      key={categoria}
      style={[
        styles.categoriaButton,
        categoriaSelecionada === categoria && styles.categoriaSelecionada
      ]}
      onPress={() => setCategoriaSelecionada(categoria)}
    >
      <Text style={[
        styles.categoriaText,
        categoriaSelecionada === categoria && styles.categoriaTextSelecionada
      ]}>
        {categoria}
      </Text>
    </TouchableOpacity>
  );

  const renderProduto = ({ item }: { item: Produto }) => (
    <ProdutoCard produto={item} onPress={handleProdutoPress} />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Cardápio</Text>
        
        {carrinhoMesa && (
          <View style={styles.mesaAtiva}>
            <MaterialIcons name="table-restaurant" size={16} color={Colors.primary} />
            <Text style={styles.mesaAtivaText}>Mesa Ativa</Text>
          </View>
        )}
      </View>

      <View style={styles.categoriasContainer}>
        <FlatList
          data={categorias}
          renderItem={({ item }) => renderCategoria(item.toString())}
          keyExtractor={(item) => item.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasList}
        />
      </View>

      <FlatList
        data={produtosFiltrados}
        renderItem={renderProduto}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.produtosList}
      />

      {carrinho.length > 0 && carrinhoMesa && (
        <TouchableOpacity
          style={styles.carrinhoFixo}
          onPress={() => router.push('/pedido')}
        >
          <View style={styles.carrinhoContent}>
            <View style={styles.carrinhoInfo}>
              <MaterialIcons name="shopping-cart" size={20} color="white" />
              <Text style={styles.carrinhoItens}>
                {carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'}
              </Text>
            </View>
            <Text style={styles.carrinhoTotal}>
              R$ {totalCarrinho.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </TouchableOpacity>
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
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text
  },
  mesaAtiva: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16
  },
  mesaAtivaText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: Spacing.xs
  },
  categoriasContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  categoriasList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  categoriaButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border
  },
  categoriaSelecionada: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  categoriaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  categoriaTextSelecionada: {
    color: 'white'
  },
  produtosList: {
    paddingVertical: Spacing.sm,
    paddingBottom: 100
  },
  carrinhoFixo: {
    position: 'absolute',
    bottom: 20,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  carrinhoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md
  },
  carrinhoInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  carrinhoItens: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.xs
  },
  carrinhoTotal: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});