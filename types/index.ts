export interface Mesa {
  id: number;
  number: number;
  status: 'LIVRE' | 'OCUPADA' | 'RESERVADA' | 'CONTA';
  pessoas?: number;
  garcom?: string;
}

interface ProductOption {
  id?: string;
  name: string;
  price: number | string;
  multiple: boolean;
}

interface ProductOptionGroup {
  id?: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections?: number;
  options: ProductOption[];
}

export interface Produto {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  enabled: boolean;
  image_url?: string;
  file_image: File;
  optionGroups?: ProductOptionGroup[];
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
  status: 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'PAGO';
  horario: Date;
}