import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Mesa } from '../types';
import { Colors, Spacing } from '../constants/Colors';

interface MesaCardProps {
  mesa: Mesa;
  onPress: (mesa: Mesa) => void;
}

export const MesaCard = React.memo<MesaCardProps>(({ mesa, onPress }) => {
  const getStatusColor = () => {
    switch (mesa.status) {
      case 'livre': return Colors.success;
      case 'ocupada': return Colors.error;
      case 'reservada': return Colors.warning;
      case 'conta': return Colors.secondary;
      default: return Colors.border;
    }
  };

  const getStatusIcon = () => {
    switch (mesa.status) {
      case 'livre': return 'event-available';
      case 'ocupada': return 'people';
      case 'reservada': return 'event-busy';
      case 'conta': return 'receipt';
      default: return 'table-restaurant';
    }
  };

  const getStatusText = () => {
    switch (mesa.status) {
      case 'livre': return 'Livre';
      case 'ocupada': return 'Ocupada';
      case 'reservada': return 'Reservada';
      case 'conta': return 'Conta';
      default: return 'Mesa';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: getStatusColor() }]}
      onPress={() => onPress(mesa)}
      activeOpacity={0.7}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
        <MaterialIcons name={getStatusIcon() as any} size={20} color="white" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.mesaNumero}>Mesa {mesa.numero}</Text>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        
        {mesa.pessoas && (
          <Text style={styles.pessoas}>{mesa.pessoas} pessoas</Text>
        )}
        
        {mesa.garcom && (
          <Text style={styles.garcom}>Garçom: {mesa.garcom}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    margin: Spacing.xs,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
    minWidth: 150,
    maxWidth: 180
  },
  statusIndicator: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: Spacing.md,
    alignItems: 'center'
  },
  mesaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs
  },
  pessoas: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  garcom: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  }
});