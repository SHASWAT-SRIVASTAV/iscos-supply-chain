import React, { useEffect, useState } from 'react';
import { getBenchmarks } from '../api/client';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { LineChart as ChartIcon, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

export function Benchmarks() {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sizesInput, setSizesInput] = useState('50,100,200,400,800');

  const runBenchmark = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBenchmarks(sizesInput);
      setBenchmarkData(res);
    } catch (err) {
      setError(err.message || 'Benchmark execution failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBenchmark();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">
            Empirical Asymptotic Complexity Analysis
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            Dijkstra Algorithmic Benchmarks
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Synthetic random connected graphs with fixed random seed (seed=42). 5 repeats per size, measuring median millisecond runtime vs O((V+E) log V).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={sizesInput}
            onChange={(e) => setSizesInput(e.target.value)}
            className="px-3 py-1.5 bg-surface-2 border border-border rounded text-xs font-mono text-text-main outline-none focus:border-accent"
            placeholder="50,100,200,400,800"
          />
          <button
            onClick={runBenchmark}
            disabled={loading}
            className="px-4 py-1.5 rounded bg-accent text-accent-fg font-semibold text-xs hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Measuring...' : 'Re-run'}
          </button>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-semibold text-text-main flex items-center gap-2">
            <ChartIcon className="w-4 h-4 text-accent" />
            <span>Measured Runtime vs Theoretical O((V+E) log V)</span>
          </h3>
          <div className="text-xs font-mono text-text-dim">
            Median of 5 runs (ms)
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center font-mono text-xs text-text-dim animate-pulse">
            Generating synthetic connected graphs and executing Dijkstra runs...
          </div>
        ) : error ? (
          <div className="h-72 flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-danger" />
            <p className="text-sm text-danger">{error}</p>
            <button onClick={runBenchmark} className="px-3 py-1.5 rounded bg-surface-2 text-xs">
              Retry
            </button>
          </div>
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={benchmarkData?.data || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="nodes" 
                  stroke="var(--text-dim)" 
                  fontSize={11}
                  fontFamily="monospace"
                  label={{ value: 'Graph Vertices (V)', position: 'insideBottom', offset: -10, fill: 'var(--text-dim)' }}
                />
                <YAxis 
                  stroke="var(--text-dim)" 
                  fontSize={11}
                  fontFamily="monospace"
                  label={{ value: 'Runtime (ms)', angle: -90, position: 'insideLeft', fill: 'var(--text-dim)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }} 
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                <Line 
                  type="monotone" 
                  dataKey="measured_ms" 
                  name="Empirical Measured (ms)" 
                  stroke="var(--accent)" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: 'var(--accent)' }} 
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="theoretical_ms" 
                  name="Theoretical O((V+E)log V)" 
                  stroke="var(--accent-2)" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Accessible Data Table & Complexity Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-sm font-display font-semibold text-text-main">
            Empirical Benchmark Measurements Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-2/60 border-b border-border text-text-dim">
                <tr>
                  <th className="py-2 px-3">Vertices (V)</th>
                  <th className="py-2 px-3">Edges (E)</th>
                  <th className="py-2 px-3">Empirical (ms)</th>
                  <th className="py-2 px-3">Theoretical (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {benchmarkData?.data?.map((row) => (
                  <tr key={row.nodes} className="hover:bg-surface-2/30">
                    <td className="py-2 px-3 text-text-main font-bold">{row.nodes}</td>
                    <td className="py-2 px-3 text-text-dim">{row.edges}</td>
                    <td className="py-2 px-3 text-accent font-semibold">{row.measured_ms} ms</td>
                    <td className="py-2 px-3 text-accent-2">{row.theoretical_ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-3 text-xs">
          <h3 className="text-sm font-display font-semibold text-text-main flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Viva Complexity Defense</span>
          </h3>
          <p className="text-text-dim leading-relaxed">
            Standard Dijkstra with an array search operates in <code className="text-text-main">O(V&sup2;)</code>. By replacing the minimum extraction with our custom array-backed <strong className="text-accent">MinHeap</strong>:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-text-dim">
            <li>Each node is popped from the heap at most once: <code className="text-text-main">V &times; O(log V)</code></li>
            <li>Each edge is relaxed at most once, pushing into heap: <code className="text-text-main">E &times; O(log V)</code></li>
            <li>Combined asymptotic bound: <strong className="text-accent-2 font-mono">O((V + E) log V)</strong></li>
            <li>In sparse road networks where <code className="text-text-main">E &approx; 2V</code>, this simplifies to <code className="text-text-main">O(V log V)</code>, vastly outperforming quadratic searches.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
