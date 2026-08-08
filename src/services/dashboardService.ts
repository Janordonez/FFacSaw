export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  categoria?: Categoria;
  stock?: number;
  precioProveedor?: number;
  precioVenta?: number;
  impuesto?: boolean;
  stockMinimo?: number;
}

export interface ProductoInfoDTO {
  nombre: string;
  eoq: number;
  stock: number;
  rop: number;
  valorInventario?: number;
  porcentajeInventario?: number;
  acumulado?: number;
  tipo?: string;
}

export interface Categoria {
  id?: number;
  nombre: string;
}

export interface CantidadCategorias {
  nombre: string;
  cantidad: number;
}

export interface Clasificacion {
  nombre: string | null;
  cantidad: number;
}

import { API } from './apiConfig'

export interface DashBoardData {
  valorTotal: number;
  totalRepuestos: number;
  existencias: number;
  stockCritico: Producto[];
  categoriasYCantidad: CantidadCategorias[];
  clasificacionYPorcentaje: Clasificacion[];
  productosInfoDTO: ProductoInfoDTO[];
}

export const dashboardService = {
  async get(): Promise<DashBoardData | null> {
    const res = await fetch(`${API}/dashboard/all`, { method: "GET" });

    if (!res.ok) return null;

    return await res.json();
  },
};

export default dashboardService;
