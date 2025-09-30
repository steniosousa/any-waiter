import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mesa, Pedido } from '../types';
import Api from './Api';

// Mock data inicial
const mesasIniciais: Mesa[] = [
  { id: 1, number: 1, status: 'LIVRE' },
  { id: 2, number: 2, status: 'OCUPADA', pessoas: 2, garcom: 'João' },
  { id: 3, number: 3, status: 'LIVRE' },
  { id: 4, number: 4, status: 'RESERVADA' },
  { id: 5, number: 5, status: 'CONTA', pessoas: 4, garcom: 'Maria' },
  { id: 6, number: 6, status: 'LIVRE' },
  { id: 7, number: 7, status: 'OCUPADA', pessoas: 3, garcom: 'Pedro' },
  { id: 8, number: 8, status: 'LIVRE' }
];



export const dataService = {

  async getMesas(): Promise<Mesa[]> {
    try {
      const { data } = await Api.get('/tables/list');
      return data;
    } catch (error) {
      return mesasIniciais;
    }
  },



  async salvarMesas(mesas: Mesa[]): Promise<void> {
    try {
      await AsyncStorage.setItem('@mesas', JSON.stringify(mesas));
    } catch (error) {
      console.error('Erro ao salvar mesas:', error);
    }
  },

  async atualizarMesa(mesa: Mesa): Promise<void> {
    const mesas = await this.getMesas();
    const index = mesas.findIndex(m => m.id === mesa.id);
    if (index !== -1) {
      mesas[index] = mesa;
      await this.salvarMesas(mesas);
    }
  },

  // Pedidos
  async getPedidos(): Promise<Pedido[]> {
    try {
      const data = await AsyncStorage.getItem('@pedidos');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  async salvarPedidos(pedidos: Pedido[]): Promise<void> {
    try {
      await AsyncStorage.setItem('@pedidos', JSON.stringify(pedidos));
    } catch (error) {
      console.error('Erro ao salvar pedidos:', error);
    }
  },

  async adicionarPedido(pedido: Pedido): Promise<void> {
    const pedidos = await this.getPedidos();
    pedidos.push(pedido);
    await this.salvarPedidos(pedidos);
  },

  async atualizarPedido(pedidoAtualizado: Pedido): Promise<void> {
    const pedidos = await this.getPedidos();
    const index = pedidos.findIndex(p => p.id === pedidoAtualizado.id);
    if (index !== -1) {
      pedidos[index] = pedidoAtualizado;
      await this.salvarPedidos(pedidos);
    }
  }
};