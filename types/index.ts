export interface Mesa {
  id: number;
  numero: number;
  status: 'livre' | 'ocupada' | 'reservada' | 'conta';
  pessoas?: number;
  garcom?: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  descricao?: string;
  disponivel: boolean;
}

export interface ItemPedido {
  produto: Produto;
  quantidade: number;
  observacoes?: string;
}

export interface Pedido {
  id: string;
  mesaId: number;
  numeroMesa: number;
  itens: ItemPedido[];
  total: number;
  status: 'preparando' | 'pronto' | 'entregue' | 'pago';
  horario: Date;
}