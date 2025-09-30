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
import { PedidoCard } from '../../components/PedidoCard';
import { useApp } from '../../hooks/useApp';
import { Pedido } from '../../types';
import { Colors, Spacing } from '../../constants/Colors';

export default function PedidosScreen() {
  const insets = useSafeAreaInsets();
  const { pedidos, atualizarStatusPedido } = useApp();
  const [filtroStatus, setFiltroStatus] = useState<string>('Todos');

  const statusOptions = ['Todos', 'Preparando', 'Pronto', 'Entregue', 'Pago'];

  const pedidosFiltrados = useMemo(() => {
    if (filtroStatus === 'Todos') {
      return pedidos.sort((a, b) => new Date(b.horario).getTime() - new Date(a.horario).getTime());
    }
    return pedidos
      .filter(p => {
        switch (filtroStatus.toLowerCase()) {
          case 'preparando': return p.status === 'PREPARANDO';
          case 'pronto': return p.status === 'PRONTO';
          case 'entregue': return p.status === 'ENTREGUE';
          case 'pago': return p.status === 'PAGO';
          default: return true;
        }
      })
      .sort((a, b) => new Date(b.horario).getTime() - new Date(a.horario).getTime());
  }, [pedidos, filtroStatus]);

  const estatisticas = useMemo(() => {
    return {
      preparando: pedidos.filter(p => p.status === 'PREPARANDO').length,
      pronto: pedidos.filter(p => p.status === 'PRONTO').length,
      entregue: pedidos.filter(p => p.status === 'ENTREGUE').length,
      pago: pedidos.filter(p => p.status === 'PAGO').length
    };
  }, [pedidos]);

  const renderFiltro = (status: string) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.filtroButton,
        filtroStatus === status && styles.filtroSelecionado
      ]}
      onPress={() => setFiltroStatus(status)}
    >
      <Text style={[
        styles.filtroText,
        filtroStatus === status && styles.filtroTextSelecionado
      ]}>
        {status}
      </Text>
    </TouchableOpacity>
  );

  const renderPedido = ({ item }: { item: Pedido }) => (
    <PedidoCard 
      pedido={item} 
      onUpdateStatus={atualizarStatusPedido}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="receipt-long" size={64} color={Colors.border} />
      <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
      <Text style={styles.emptySubtitle}>
        {filtroStatus === 'Todos' 
          ? 'Quando houver pedidos, eles aparecerão aqui'
          : `Não há pedidos com status: ${filtroStatus}`
        }
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Pedidos</Text>
        
        <View style={styles.estatisticas}>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.warning }]}>
              {estatisticas.preparando}
            </Text>
            <Text style={styles.estatisticaLabel}>Preparando</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.primary }]}>
              {estatisticas.pronto}
            </Text>
            <Text style={styles.estatisticaLabel}>Pronto</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.success }]}>
              {estatisticas.entregue}
            </Text>
            <Text style={styles.estatisticaLabel}>Entregue</Text>
          </View>
          <View style={styles.estatisticaItem}>
            <Text style={[styles.estatisticaNumero, { color: Colors.textSecondary }]}>
              {estatisticas.pago}
            </Text>
            <Text style={styles.estatisticaLabel}>Pago</Text>
          </View>
        </View>
      </View>

      <View style={styles.filtrosContainer}>
        <FlatList
          data={statusOptions}
          renderItem={({ item }) => renderFiltro(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosList}
        />
      </View>

      <FlatList
        data={pedidosFiltrados}
        renderItem={renderPedido}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pedidosList}
        ListEmptyComponent={renderEmpty}
      />
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
    fontSize: 18,
    fontWeight: 'bold'
  },
  estatisticaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  filtrosContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  filtrosList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  filtroButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border
  },
  filtroSelecionado: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  filtroText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  filtroTextSelecionado: {
    color: 'white'
  },
  pedidosList: {
    paddingVertical: Spacing.sm
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl
  }
});