/**
 * API client for ISCOS backend.
 * All HTTP calls go through this module. No component calls fetch directly.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      let details = null;
      try {
        const data = await response.json();
        errorMsg = data.detail || errorMsg;
        details = data;
      } catch {
        // Non-JSON response
      }
      throw new ApiError(errorMsg, response.status, details);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed', 0);
  }
}

// System & Meta
export const getHealth = () => request('/health');
export const getMetaArchitecture = () => request('/api/meta/architecture');
export const getDashboardSummary = () => request('/api/dashboard/summary');
export const loadSeedData = () => request('/api/seed/load', { method: 'POST' });

// Master Entities
export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/products${qs ? `?${qs}` : ''}`);
};

export const createProduct = (payload) => 
  request('/api/products', { method: 'POST', body: JSON.stringify(payload) });

export const getSuppliers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/suppliers${qs ? `?${qs}` : ''}`);
};

export const createSupplier = (payload) => 
  request('/api/suppliers', { method: 'POST', body: JSON.stringify(payload) });

export const getWarehouses = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/warehouses${qs ? `?${qs}` : ''}`);
};

export const createWarehouse = (payload) => 
  request('/api/warehouses', { method: 'POST', body: JSON.stringify(payload) });


// Inventory & Alerts
export const getInventory = (warehouseId = null) => {
  const qs = warehouseId ? `?warehouse_id=${encodeURIComponent(warehouseId)}` : '';
  return request(`/api/inventory${qs}`);
};

export const adjustInventory = (payload) => 
  request('/api/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) });

export const getLowStockAlerts = () => request('/api/alerts/low-stock');
export const getRestockSuggestions = () => request('/api/optimizer/restock');

// Orders & Heap Queue
export const getOrders = () => request('/api/orders');
export const getOrder = (id) => request(`/api/orders/${id}`);
export const getOrderQueue = () => request('/api/orders/queue');
export const getOrdersQueue = getOrderQueue;
export const createOrder = (payload) => 
  request('/api/orders', { method: 'POST', body: JSON.stringify(payload) });

// Optimizer & Routes
export const optimizeNext = () => request('/api/optimize/next', { method: 'POST' });
export const optimizePreview = (orderId) => request(`/api/optimize/preview/${orderId}`, { method: 'POST' });
export const getRoutesGraph = () => request('/api/routes/graph');
export const getShortestRoute = (from, to) => 
  request(`/api/routes/shortest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

// Shipments & Deque Queue
export const getShipments = () => request('/api/shipments');
export const getShipmentQueue = () => request('/api/shipments/queue');
export const advanceShipment = () => request('/api/shipments/advance', { method: 'POST' });

// Lab & Benchmarks
export const getLabDijkstra = (from, to) => 
  request(`/api/lab/dijkstra?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

export const getLabHeapDemo = (values = '5,3,8,1,9,2') => 
  request(`/api/lab/heap-demo?values=${encodeURIComponent(values)}`);

export const getBenchmarks = (sizes = '50,100,200,400,800') => 
  request(`/api/benchmarks/dijkstra?sizes=${encodeURIComponent(sizes)}`);
