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

export interface DashBoardData {
  valorTotal: number;
  totalRepuestos: number;
  existencias: number;
  stockCritico: Producto[];
  categoriasYCantidad: CantidadCategorias[];
  clasificacionYPorcentaje: Clasificacion[];
  productosInfoDTO: ProductoInfoDTO[];
}

const BASE = "http://localhost:8081";

export const dashboardService = {
  async get(): Promise<DashBoardData | null> {
    const res = await fetch(`${BASE}/dashboard/all`, { method: "GET" });

    if (!res.ok) return null;

    return await res.json();
  },
};

export default dashboardService;
