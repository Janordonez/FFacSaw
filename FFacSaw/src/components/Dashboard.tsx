import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import dashboardService from "../services/dashboardService";
import type { DashBoardData } from "../services/dashboardService";


const COLORS = [
  "#1E4D8C",
  "#64B5F6",
  "#3B6EA8",
  "#0D2B52",
  "#10b981",
  "#f59e0b",
];

export default function Dashboard() {
  const [data, setData] = useState<DashBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStockCriticalOpen, setIsStockCriticalOpen] = useState(true);

  useEffect(() => {
    dashboardService.get().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="dashboard-container">Cargando...</div>;
  if (!data) return <div className="dashboard-container">Error cargando datos</div>;

  return (
    <div className="dashboard-container">

      <div className="kpi-grid">
        <div className="kpi-card primary">
          <h3>Valor Total</h3>
          <p>${data.valorTotal.toLocaleString()}</p>
        </div>

        <div className="kpi-card">
          <h3>Total Repuestos</h3>
          <p>{data.totalRepuestos}</p>
        </div>

        <div className="kpi-card">
          <h3>Existencias</h3>
          <p>{data.existencias}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Categorías</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoriasYCantidad}
                dataKey="cantidad"
                nameKey="nombre"
                outerRadius={90}
                innerRadius={30}
                paddingAngle={4}
                label={({ name }) => name}
              >
                {data.categoriasYCantidad.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Clasificación</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.clasificacionYPorcentaje}>
              <XAxis
                dataKey="nombre"
                tickFormatter={(v) => v ?? "Sin clasificación"}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#1E4D8C" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card full">
        <button
          type="button"
          className="accordion-toggle"
          onClick={() => setIsStockCriticalOpen((prev) => !prev)}
          aria-expanded={isStockCriticalOpen}
        >
          <span>Stock Crítico</span>
          <span className="accordion-meta">
            {data.stockCritico.length} elemento{data.stockCritico.length === 1 ? "" : "s"}
            <span className="accordion-icon">{isStockCriticalOpen ? "▾" : "▸"}</span>
          </span>
        </button>

        {isStockCriticalOpen && (
          <div className="accordion-content">
            {data.stockCritico.length === 0 ? (
              <p className="accordion-empty">No hay productos en stock crítico 🎉</p>
            ) : (
              <div className="table-responsive">
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stockCritico.map((p, index) => {
                      const stock = p.stock ?? 0;
                      const state = stock <= 5 ? "Crítico" : stock <= 10 ? "Bajo" : "Atención";
                      const stateClass = stock <= 5 ? "danger" : stock <= 10 ? "warning" : "info";
                      const productItem = p as typeof p & {
                        producto?: {
                          nombre?: string;
                          categoria?: { nombre?: string };
                        };
                      };
                      const productName = productItem.producto?.nombre ?? p.nombre;
                      const categoryName = productItem.producto?.categoria?.nombre ?? "Sin categoría";

                      return (
                        <tr key={`${p.nombre}-${index}`}>
                          <td><strong>{productName}</strong></td>
                          <td>{categoryName}</td>
                          <td className="stock-td">{stock}</td>
                          <td>
                            <span className={`stock-badge ${stateClass}`}>{state}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chart-card full">
        <h3>Productos recomendados</h3>
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>EOQ</th>
                <th>Stock</th>
                <th>ROP</th>
              </tr>
            </thead>
            <tbody>
              {(data.productosInfoDTO ?? []).map((producto, index) => (
                <tr key={`${producto.nombre}-${index}`}>
                  <td>{producto.nombre}</td>
                  <td>{producto.eoq.toFixed(2)}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.rop.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}