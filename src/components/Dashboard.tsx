import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
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
  const [isParetoExpanded, setIsParetoExpanded] = useState(false);

  const formatInventoryAxis = (value: number | null | undefined) => {
    const numericValue = Number(value ?? 0);
    if (!Number.isFinite(numericValue)) return "$0";
    if (Math.abs(numericValue) >= 1000000) {
      return `$${(numericValue / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(numericValue) >= 1000) {
      return `$${Math.round(numericValue / 1000)}K`;
    }
    return `$${numericValue.toLocaleString()}`;
  };

  const formatCurrency = (amount: number | null | undefined) => {
    const numericAmount = Number(amount ?? 0);
    if (!Number.isFinite(numericAmount)) return "$0";
    return `$${numericAmount.toLocaleString()}`;
  };

  const getClassBoundaryInfo = () => {
    if (!data) return { firstBIndex: undefined, firstCIndex: undefined };
    const firstBIndex = data.productosInfoDTO.findIndex((item) => item.tipo === "B");
    const firstCIndex = data.productosInfoDTO.findIndex((item) => item.tipo === "C");
    return { firstBIndex, firstCIndex };
  };

  const { firstBIndex, firstCIndex } = getClassBoundaryInfo();

  const maxInventario = data?.productosInfoDTO?.reduce(
    (max, item) => Math.max(max, item.valorInventario ?? 0),
    0,
  ) ?? 0;

  const paretoChartWidth = Math.max((data?.productosInfoDTO?.length ?? 0) * 110, 1100);
  const inventoryDomainMax = Math.max(Math.ceil((maxInventario * 1.5) / 100000) * 100000, 500000);
  const maxClasificacionCantidad = Math.max(
    0,
    ...(data?.clasificacionYPorcentaje?.map((item) => item.cantidad ?? 0) ?? []),
  );
  const clasificacionDomainMax = Math.max(Math.ceil(maxClasificacionCantidad / 5) * 5, 20);

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
          <p>{formatCurrency(data.valorTotal)}</p>
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
              <YAxis domain={[0, clasificacionDomainMax]} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#1E4D8C" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card full">
        <div className="chart-card-header">
          <h3>Diagrama de Pareto</h3>
          <div className="chart-controls">
            <button
              type="button"
              className="control-button"
              onClick={() => setIsParetoExpanded((prev) => !prev)}
            >
              {isParetoExpanded ? "Ver pequeño" : "Ver grande"}
            </button>
          </div>
        </div>
        <div className="chart-scrollable">
          <div style={{ minWidth: paretoChartWidth, height: isParetoExpanded ? 560 : 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.productosInfoDTO}
                margin={{ top: 20, right: 40, left: 0, bottom: 10 }}
              >
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="nombre" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={70} />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => formatInventoryAxis(Number(value))}
              width={90}
              domain={[0, inventoryDomainMax]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                const numericValue = typeof value === 'number' ? value : Number(value);
                if (name === "acumulado") return [`${numericValue.toFixed(1)}%`, "Acumulado"];
                if (name === "valorInventario") return [`$${Number(numericValue).toLocaleString()}`, "Valor inventario"];
                return [value, name];
              }}
            />
            <Legend verticalAlign="top" height={36} />
            {firstBIndex !== undefined && firstBIndex >= 0 && (
              <ReferenceLine
                x={firstBIndex}
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{ value: "Clase B", position: "insideTop", fill: "#2563eb", fontSize: 12 }}
              />
            )}
            {firstCIndex !== undefined && firstCIndex >= 0 && (
              <ReferenceLine
                x={firstCIndex}
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{ value: "Clase C", position: "insideTop", fill: "#dc2626", fontSize: 12 }}
              />
            )}
          
            <Bar yAxisId="left" dataKey="valorInventario" fill="#1E4D8C" radius={[6, 6, 0, 0]} barSize={28} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="acumulado"
              name="Acumulado (%)"
              stroke="#f59e0b"
              strokeWidth={4}
              dot={{ r: 5, fill: "#f59e0b" }}
              activeDot={{ r: 6, fill: "#f59e0b" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
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

