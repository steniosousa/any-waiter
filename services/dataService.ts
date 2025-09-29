import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mesa, Produto, Pedido } from '../types';

// Mock data inicial
const mesasIniciais: Mesa[] = [
  { id: 1, numero: 1, status: 'livre' },
  { id: 2, numero: 2, status: 'ocupada', pessoas: 2, garcom: 'João' },
  { id: 3, numero: 3, status: 'livre' },
  { id: 4, numero: 4, status: 'reservada' },
  { id: 5, numero: 5, status: 'conta', pessoas: 4, garcom: 'Maria' },
  { id: 6, numero: 6, status: 'livre' },
  { id: 7, numero: 7, status: 'ocupada', pessoas: 3, garcom: 'Pedro' },
  { id: 8, numero: 8, status: 'livre' }
];

const produtosIniciais: Produto[] = [
  // Bebidas
  { id: 1, nome: 'Refrigerante', preco: 5.00, categoria: 'Bebidas', disponivel: true },
  { id: 2, nome: 'Suco Natural', preco: 8.00, categoria: 'Bebidas', disponivel: true },
  { id: 3, nome: 'Água', preco: 3.00, categoria: 'Bebidas', disponivel: true },
  { id: 4, nome: 'Cerveja', preco: 6.00, categoria: 'Bebidas', disponivel: true },
  
  // Pratos Principais
  { id: 5, nome: 'Hambúrguer Artesanal', preco: 25.00, categoria: 'Pratos Principais', descricao: 'Pão brioche, carne 180g, queijo, alface, tomate', disponivel: true },
  { id: 6, nome: 'Grelhado de Frango', preco: 22.00, categoria: 'Pratos Principais', descricao: 'Frango grelhado com arroz e salada', disponivel: true },
  { id: 7, nome: 'Peixe Grelhado', preco: 28.00, categoria: 'Pratos Principais', descricao: 'Salmão grelhado com legumes', disponivel: true },
  
  // Entradas
  { id: 8, nome: 'Batata Frita', preco: 12.00, categoria: 'Entradas', disponivel: true },
  { id: 9, nome: 'Salada Caesar', preco: 15.00, categoria: 'Entradas', disponivel: true },
  { id: 10, nome: 'Pastéis', preco: 8.00, categoria: 'Entradas', disponivel: true },
  
  // Sobremesas
  { id: 11, nome: 'Pudim', preco: 8.00, categoria: 'Sobremesas', disponivel: true },
  { id: 12, nome: 'Sorvete', preco: 10.00, categoria: 'Sobremesas', disponivel: true }
];

export const dataService = {
  // Mesas
  async getMesas(): Promise<Mesa[]> {
    try {
      const data = await AsyncStorage.getItem('@mesas');
      if (data) {
        return JSON.parse(data);
      } else {
        await AsyncStorage.setItem('@mesas', JSON.stringify(mesasIniciais));
        return mesasIniciais;
      }
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

  // Produtos
  async getProdutos(): Promise<Produto[]> {
    try {
      const data = await AsyncStorage.getItem('@produtos');
      if (data) {
        return JSON.parse(data);
      } else {
        await AsyncStorage.setItem('@produtos', JSON.stringify(produtosIniciais));
        return produtosIniciais;
      }
    } catch (error) {
      return produtosIniciais;
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