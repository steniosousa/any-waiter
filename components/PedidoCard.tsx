import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Pedido } from '../types';
import { Colors, Spacing } from '../constants/Colors';

interface PedidoCardProps {
  pedido: Pedido;
  onUpdateStatus: (pedidoId: string, status: Pedido['status']) => void;
}

export const PedidoCard = React.memo<PedidoCardProps>(({ pedido, onUpdateStatus }) => {
  const getStatusColor = () => {
    switch (pedido.status) {
      case 'preparando': return Colors.warning;
      case 'pronto': return Colors.primary;
      case 'entregue': return Colors.success;
      case 'pago': return Colors.textSecondary;
      default: return Colors.border;
    }
  };

  const getStatusText = () => {
    switch (pedido.status) {
      case 'preparando': return 'Preparando';
      case 'pronto': return 'Pronto';
      case 'entregue': return 'Entregue';
      case 'pago': return 'Pago';
      default: return 'Status';
    }
  };

  const getNextStatus = (): Pedido['status'] | null => {
    switch (pedido.status) {
      case 'preparando': return 'pronto';
      case 'pronto': return 'entregue';
      case 'entregue': return 'pago';
      default: return null;
    }
  };

  const getNextStatusText = () => {
    const nextStatus = getNextStatus();
    switch (nextStatus) {
      case 'pronto': return 'Marcar Pronto';
      case 'entregue': return 'Marcar Entregue';
      case 'pago': return 'Marcar Pago';
      default: return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.mesaInfo}>
          <MaterialIcons name="table-restaurant" size={20} color={Colors.primary} />
          <Text style={styles.mesaNumero}>Mesa {pedido.numeroMesa}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.itensContainer}>
          {pedido.itens.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.itemQuantidade}>{item.quantidade}x</Text>
              <Text style={styles.itemNome}>{item.produto.nome}</Text>
              <Text style={styles.itemPreco}>
                R$ {(item.produto.preco * item.quantidade).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              R$ {pedido.total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          
          <Text style={styles.horario}>{formatTime(pedido.horario)} atrás</Text>
        </View>

        {getNextStatus() && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getStatusColor() }]}
            onPress={() => onUpdateStatus(pedido.id, getNextStatus()!)}
          >
            <Text style={styles.actionButtonText}>{getNextStatusText()}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  mesaInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mesaNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: Spacing.xs
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  content: {
    padding: Spacing.md
  },
  itensContainer: {
    marginBottom: Spacing.md
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2
  },
  itemQuantidade: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    width: 30
  },
  itemNome: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.sm
  },
  itemPreco: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.text,
    marginRight: Spacing.xs
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary
  },
  horario: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  actionButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  }
});