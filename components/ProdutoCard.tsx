import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Produto } from '../types';
import { Colors, Spacing } from '../constants/Colors';

interface ProdutoCardProps {
  produto: Produto;
  onPress: (produto: Produto) => void;
}

export const ProdutoCard = React.memo<ProdutoCardProps>(({ produto, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, !produto.enabled && styles.indisponivel]}
      onPress={() => produto.enabled && onPress(produto)}
      activeOpacity={0.7}
      disabled={!produto.enabled}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.nome} numberOfLines={2}>
            {produto.name}
          </Text>
          <Text style={styles.preco}>
            R$ {produto.price.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        
        {produto.description && (
          <Text style={styles.descricao} numberOfLines={2}>
            {produto.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.categoria}>{produto.category.name}</Text>
          {!produto.enabled && (
            <View style={styles.indisponivelBadge}>
              <MaterialIcons name="close" size={12} color="white" />
              <Text style={styles.indisponivelText}>Indisponível</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  indisponivel: {
    opacity: 0.6
  },
  content: {
    padding: Spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm
  },
  preco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary
  },
  descricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoria: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '500'
  },
  indisponivelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8
  },
  indisponivelText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
    fontWeight: '500'
  }
});