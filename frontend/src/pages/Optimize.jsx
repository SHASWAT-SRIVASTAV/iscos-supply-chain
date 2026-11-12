import React, { useEffect, useState, useMemo } from 'react';
import { 
  getOrderQueue, 
  optimizeNext, 
  optimizePreview, 
  getRoutesGraph,
  getWarehouses 
} from '../api/client';
import { Zap, Truck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { motion, useReducedMotion } from 'framer-motion';

// City node coordinates on normalized 800x600 canvas
const CITY_COORDS = {
  Delhi: { x: 340, y: 110 },
  Ahmedabad: { x: 210, y: 240 },
  Mumbai: { x: 220, y: 350 },
  Pune: { x: 270, y: 380 },
  Hyderabad: { x: 390, y: 360 },
  Bengaluru: { x: 360, y: 470 },
  Chennai: { x: 440, y: 460 },
  Kolkata: { x: 620, y: 220 },
};

export function Optimize() {
  const [orderQueue, setOrderQueue] = useState([]);
  const [graphData, setGraphData] = useState({ cities: [], road_edges: [] });
  const [warehouses, setWarehouses] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatingPath, setAnimatingPath] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [queue, graph, whs] = await Promise.all([
        getOrderQueue(),
        getRoutesGraph(),
        getWarehouses(),
      ]);
      setOrderQueue(queue || []);
      setGraphData(graph);
      setWarehouses(whs || []);

      // If there are pending orders and no result yet, preview top order
      if (queue && queue.length > 0 && !latestResult) {
        try {
          const preview = await optimizePreview(queue[0].id);
          setLatestResult(preview);
        } catch {
          // Ignore preview error on startup
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize optimizer view.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOptimizeNext = async () => {
    try {
      setIsOptimizing(true);
      setAnimatingPath(false);
      const result = await optimizeNext();
      setLatestResult(result);
      // Trigger route animation
      setAnimatingPath(true);
      // Refresh order queue
      const q = await getOrderQueue();
      setOrderQueue(q || []);
    } catch (err) {
      alert(err.message || 'Optimizer execution failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const winningRoute = latestResult?.winner?.route || [];
  const destinationCity = latestResult?.order?.destination_city;
  const winningWarehouseId = latestResult?.winner?.warehouse_id;

  // Build SVG path string for winning route
  const winningPathD = useMemo(() => {
    if (!winningRoute || winningRoute.length < 2) return '';
    return winningRoute.reduce((acc, city, i) => {
      const coord = CITY_COORDS[city];
      if (!coord) return acc;
      return i === 0 ? `M ${coord.x} ${coord.y}` : `${acc} L ${coord.x} ${coord.y}`;
    }, '');
  }, [winningRoute]);

  const rejectedReasonsMap = useMemo(() => {
    const map = {};
    if (latestResult?.candidates) {
      for (const c of latestResult.candidates) {
        if (c.status === 'rejected') {
          map[c.warehouse_id] = c.rejection_reason;
        }
      }
    }
    return map;
  }, [latestResult]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">
            Hero Multi-Criteria Engine
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            Order Dispatch Optimization
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Pops top MinHeap order, executes Dijkstra on road graph, min-max normalizes distance & cost, and selects lowest score.
          </p>
        </div>

        <button
          onClick={handleOptimizeNext}
          disabled={isOptimizing || orderQueue.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:brightness-110 shadow-lg shadow-accent/20 transition-all disabled:opacity-40"
        >
          <Zap className={`w-4 h-4 fill-current ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Evaluating Candidates...' : 'Optimize Next Order'}</span>
        </button>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 8 Columns - Hero Road Network Map & Shipment Status Strip */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-4 relative overflow-hidden bg-surface/80 border border-border shadow-xl">
            <div className="flex items-center justify-between mb-2 px-2 text-xs">
              <span className="font-mono text-text-dim font-medium">Logistics Road Network Canvas</span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-text-dim">
                  <span className="w-2.5 h-2.5 rounded-full border border-border bg-surface-2" />
                  Road Edge
                </span>
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  Winning Dijkstra Route
                </span>
                <span className="flex items-center gap-1.5 text-warn font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-warn" />
                  Destination
                </span>
              </div>
            </div>

            {/* SVG Network Map */}
            <div className="relative w-full aspect-[4/3] bg-bg/90 rounded-lg border border-border/80 overflow-hidden flex items-center justify-center">
              {/* Background Map Grid */}
              <div className="absolute inset-0 bg-grid-pattern opacity-15" />

              <svg 
                viewBox="0 0 760 560" 
                className="w-full h-full select-none"
              >
                {/* 1. Base Road Edges */}
                {graphData.road_edges.map((edge, idx) => {
                  const from = CITY_COORDS[edge.from];
                  const to = CITY_COORDS[edge.to];
                  if (!from || !to) return null;
                  return (
                    <g key={idx}>
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="var(--border)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="opacity-70"
                      />
                      {/* Distance Label on Edge Midpoint */}
                      <text
                        x={(from.x + to.x) / 2}
                        y={(from.y + to.y) / 2 - 4}
                        fill="var(--text-dim)"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="opacity-60"
                      >
                        {edge.km}km
                      </text>
                    </g>
                  );
                })}

                {/* 2. Winning Route Path (Animates in 700ms) */}
                {winningPathD && (
                  <>
                    <motion.path
                      d={winningPathD}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: shouldReduceMotion ? 1 : 0, opacity: 0.2 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                    
                    {/* Travelling shipment dots along the route */}
                    {!shouldReduceMotion && (
                      <circle r="4" fill="var(--accent-fg)" stroke="var(--accent)" strokeWidth="2">
                        <animateMotion 
                          path={winningPathD} 
                          dur="2.5s" 
                          repeatCount="indefinite" 
                        />
                      </circle>
                    )}
                  </>
                )}

                {/* 3. City Nodes & Warehouse Markers */}
                {Object.entries(CITY_COORDS).map(([city, coord]) => {
                  const wh = warehouses.find(w => w.city === city);
                  const isDestination = city === destinationCity;
                  const isWinningWarehouse = wh && wh.id === winningWarehouseId;
                  const isRejectedWarehouse = wh && rejectedReasonsMap[wh.id];
                  const inWinningRoute = winningRoute.includes(city);

                  return (
                    <g 
                      key={city} 
                      className={`transition-opacity duration-300 ${isRejectedWarehouse ? 'opacity-35' : 'opacity-100'}`}
                    >
                      {/* Outer pulse ring for winner */}
                      {isWinningWarehouse && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="18"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="2"
                          className="animate-ping origin-center opacity-75"
                        />
                      )}

                      {/* Destination pulse ring */}
                      {isDestination && !isWinningWarehouse && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="16"
                          fill="none"
                          stroke="var(--warn)"
                          strokeWidth="2"
                          className="animate-pulse origin-center opacity-70"
                        />
                      )}

                      {/* Node Body */}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={wh ? 11 : 8}
                        fill={isWinningWarehouse ? 'var(--accent)' : isDestination ? 'var(--warn)' : inWinningRoute ? 'var(--surface)' : 'var(--surface-2)'}
                        stroke={isWinningWarehouse ? 'var(--accent)' : isDestination ? 'var(--warn)' : inWinningRoute ? 'var(--accent)' : 'var(--border)'}
                        strokeWidth="2.5"
                      />

                      {/* Hub Indicator glyph */}
                      {wh && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="3"
                          fill={isWinningWarehouse ? 'var(--accent-fg)' : 'var(--text-main)'}
                        />
                      )}

                      {/* City Name Label */}
                      <text
                        x={coord.x}
                        y={coord.y + 22}
                        fill={isDestination ? 'var(--warn)' : inWinningRoute ? 'var(--accent)' : 'var(--text-main)'}
                        fontSize="11"
                        fontWeight={inWinningRoute || isDestination ? 'bold' : 'normal'}
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {city}
                      </text>

                      {/* Warehouse Badge or Rejection Reason Note */}
                      {wh && (
                        <text
                          x={coord.x}
                          y={coord.y - 15}
                          fill={isWinningWarehouse ? 'var(--accent)' : isRejectedWarehouse ? 'var(--danger)' : 'var(--text-dim)'}
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {isRejectedWarehouse ? `[${rejectedReasonsMap[wh.id]}]` : wh.id}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Shipment Status Strip Under Map */}
          {latestResult?.shipment ? (
            <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-accent/40 bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-accent">
                      {latestResult.shipment.id}
                    </span>
                    <StatusBadge status={latestResult.shipment.status} />
                  </div>
                  <div className="text-xs text-text-dim mt-0.5">
                    Order <strong>{latestResult.shipment.order_id}</strong> &bull; From Warehouse <strong>{latestResult.shipment.from_warehouse_id}</strong> to <strong>{latestResult.shipment.to_city}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-text-dim">Route Distance:</span>{' '}
                  <strong className="text-text-main">{latestResult.shipment.distance_km} km</strong>
                </div>
                <div>
                  <span className="text-text-dim">Est. Cost:</span>{' '}
                  <strong className="text-text-main">${latestResult.shipment.cost}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-4 text-center text-xs text-text-dim font-mono">
              Ready to dispatch. Press "Optimize Next Order" to process the most urgent pending order.
            </div>
          )}
        </div>

        {/* Right: 4 Columns - Evaluation Result & Full Scoring Table */}
        <div className="lg:col-span-4 space-y-4">
          {/* Target Order Card */}
          <div className="glass-panel p-5 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-text-dim font-semibold">
              Pending Order Under Evaluation
            </span>

            {latestResult?.order ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-accent">
                    {latestResult.order.id}
                  </span>
                  <StatusBadge status={latestResult.order.status} />
                </div>

                <div className="text-xs text-text-main font-medium">
                  {latestResult.order.customer_name}
                </div>

                <div className="p-3 rounded-lg bg-surface-2/60 border border-border/50 text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-text-dim">Destination:</span>
                    <strong className="text-text-main">{latestResult.order.destination_city}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Urgency Priority:</span>
                    <strong className={latestResult.order.priority === 1 ? 'text-danger' : 'text-warn'}>
                      P{latestResult.order.priority}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Items:</span>
                    <span className="text-text-dim">
                      {latestResult.order.items?.map(it => `${it.product_id} (x${it.qty})`).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-text-dim font-mono">
                No orders pending in queue.
              </div>
            )}
          </div>

          {/* Full Scoring Decision Table */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-text-main">
                Warehouse Evaluation Table
              </h3>
              <span className="text-[10px] font-mono text-text-dim">
                W_dist: 0.6 | W_cost: 0.4
              </span>
            </div>

            <div className="space-y-2">
              {latestResult?.candidates?.map((c) => {
                const isWinner = c.warehouse_id === winningWarehouseId;
                const isRejected = c.status === 'rejected';

                return (
                  <div
                    key={c.warehouse_id}
                    className={`p-3 rounded-lg border transition-all ${
                      isWinner 
                        ? 'bg-accent/15 border-accent text-text-main shadow-md' 
                        : isRejected 
                        ? 'opacity-35 bg-surface-2/20 border-border/30 text-text-dim' 
                        : 'bg-surface-2/50 border-border text-text-dim'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-bold">
                        <span>{c.warehouse_id}</span>
                        <span className="font-normal text-text-dim">({c.warehouse_city})</span>
                      </div>
                      {isWinner ? (
                        <span className="px-2 py-0.5 rounded-full bg-accent text-accent-fg font-mono font-bold text-[10px]">
                          WINNER
                        </span>
                      ) : isRejected ? (
                        <span className="px-1.5 py-0.5 rounded bg-danger/20 text-danger font-mono text-[10px]">
                          {c.rejection_reason}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-text-main font-semibold">
                          Score: {c.score}
                        </span>
                      )}
                    </div>

                    {!isRejected && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/40 text-[11px] font-mono">
                        <div>
                          <span className="text-text-dim">Dist:</span> {c.distance_km}km
                          <div className="text-[9px] text-text-dim">norm: {c.norm_distance}</div>
                        </div>
                        <div>
                          <span className="text-text-dim">Cost:</span> ${c.cost}
                          <div className="text-[9px] text-text-dim">norm: {c.norm_cost}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
