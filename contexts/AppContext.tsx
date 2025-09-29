import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Mesa, Produto, Pedido, ItemPedido } from '../types';
import { dataService } from '../services/dataService';

interface AppContextType {
  mesas: Mesa[];
  produtos: Produto[];
  pedidos: Pedido[];
  carrinhoMesa: number | null;
  carrinho: ItemPedido[];
  
  atualizarMesa: (mesa: Mesa) => Promise<void>;
  selecionarMesa: (mesaId: number) => void;
  adicionarAoCarrinho: (produto: Produto, quantidade: number, observacoes?: string) => void;
  removerDoCarrinho: (produtoId: number) => void;
  limparCarrinho: () => void;
  finalizarPedido: () => Promise<void>;
  atualizarStatusPedido: (pedidoId: string, status: Pedido['status']) => Promise<void>;
  carregarDados: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carrinhoMesa, setCarrinhoMesa] = useState<number | null>(null);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);

  const carregarDados = async () => {
    try {
      const [mesasData, produtosData, pedidosData] = await Promise.all([
        dataService.getMesas(),
        dataService.getProdutos(),
        dataService.getPedidos()
      ]);
      
      setMesas(mesasData);
      setProdutos(produtosData);
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const atualizarMesa = async (mesa: Mesa) => {
    await dataService.atualizarMesa(mesa);
    setMesas(prev => prev.map(m => m.id === mesa.id ? mesa : m));
  };

  const selecionarMesa = (mesaId: number) => {
    setCarrinhoMesa(mesaId);
    setCarrinho([]);
  };

  const adicionarAoCarrinho = (produto: Produto, quantidade: number, observacoes?: string) => {
    setCarrinho(prev => {
      const itemExistente = prev.find(item => item.produto.id === produto.id);
      
      if (itemExistente) {
        return prev.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade, observacoes }
            : item
        );
      } else {
        return [...prev, { produto, quantidade, observacoes }];
      }
    });
  };

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setCarrinhoMesa(null);
  };

  const finalizarPedido = async () => {
    if (!carrinhoMesa || carrinho.length === 0) return;

    const mesa = mesas.find(m => m.id === carrinhoMesa);
    if (!mesa) return;

    const total = carrinho.reduce((sum, item) => sum + (item.produto.preco * item.quantidade), 0);
    
    const novoPedido: Pedido = {
      id: Date.now().toString(),
      mesaId: carrinhoMesa,
      numeroMesa: mesa.numero,
      itens: [...carrinho],
      total,
      status: 'preparando',
      horario: new Date()
    };

    await dataService.adicionarPedido(novoPedido);
    setPedidos(prev => [...prev, novoPedido]);

    // Atualizar status da mesa para ocupada
    if (mesa.status === 'livre') {
      const mesaAtualizada = { ...mesa, status: 'ocupada' as const };
      await atualizarMesa(mesaAtualizada);
    }

    limparCarrinho();
  };

  const atualizarStatusPedido = async (pedidoId: string, status: Pedido['status']) => {
    const pedidoAtualizado = pedidos.find(p => p.id === pedidoId);
    if (!pedidoAtualizado) return;

    const novoStatusPedido = { ...pedidoAtualizado, status };
    await dataService.atualizarPedido(novoStatusPedido);
    setPedidos(prev => prev.map(p => p.id === pedidoId ? novoStatusPedido : p));
  };

  return (
    <AppContext.Provider value={{
      mesas,
      produtos,
      pedidos,
      carrinhoMesa,
      carrinho,
      atualizarMesa,
      selecionarMesa,
      adicionarAoCarrinho,
      removerDoCarrinho,
      limparCarrinho,
      finalizarPedido,
      atualizarStatusPedido,
      carregarDados
    }}>
      {children}
    </AppContext.Provider>
  );
}