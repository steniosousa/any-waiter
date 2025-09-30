import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Mesa, Produto, Pedido, ItemPedido } from '../types';
import { dataService } from '../services/dataService';
import Api from '@/services/Api';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carrinhoMesa, setCarrinhoMesa] = useState<number | null>(null);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);

  const carregarDados = async () => {
    if (!user?.tag) return;
    try {
      const [mesasData, produtosData, pedidosData] = await Promise.all([
        Api.get('/tables/list'),
        Api.get("/products/list", {
          params: {
            tag: user?.tag,
            page: 1,
            limit: 10
          }
        }),
        dataService.getPedidos()
      ]);
      setMesas(mesasData.data);
      setProdutos(produtosData.data.products);
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const atualizarMesa = async (mesa: Mesa) => {
    console.log(mesa)
    try{
      await Api.put(`/tables/update/${mesa.id}`, {
        status: mesa.status,
      });
    }catch(error){
      console.error('Erro ao atualizar mesa:', error);
    }
    carregarDados();
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
     setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId.toString()));
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setCarrinhoMesa(null);
  };

  const finalizarPedido = async () => {
    if (!carrinhoMesa || carrinho.length === 0) return;

    const mesa = mesas.find(m => m.id === carrinhoMesa);
    if (!mesa) return;

    const total = carrinho.reduce((sum, item) => sum + (item.produto.price * item.quantidade), 0);

    const novoPedido: Pedido = {
      id: Date.now().toString(),
      mesaId: carrinhoMesa,
      numeroMesa: mesa.number,
      itens: [...carrinho],
      total,
      status: 'PREPARANDO',
      horario: new Date()
    };

    await dataService.adicionarPedido(novoPedido);
    setPedidos(prev => [...prev, novoPedido]);

    // Atualizar status da mesa para ocupada
    if (mesa.status === 'LIVRE') {
      const mesaAtualizada = { ...mesa, status: 'OCUPADA' as const };
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

  useEffect(() => {
    carregarDados();
  }, []);


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