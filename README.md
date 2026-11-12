# ISCOS - Intelligent Supply Chain Optimization System

ISCOS is an explainable logistics and distribution "mission control" prototype built for a college DSA-II full-stack project. The system manages multi-echelon supply chain entities (products, suppliers, warehouses, inventory, orders, and shipments) and features an explainable multi-criteria dispatch optimizer paired with an interactive Algorithm Lab. All core data structures and algorithms—including an array-backed binary `MinHeap`, `Dijkstra` shortest path with step tracing, `BFS` graph traversal, stable `MergeSort`, and logarithmic `BinarySearch`—are implemented by hand in pure Python without third-party graph or heap libraries to ensure total transparency during viva examination.

---

## Quick Start (Run Locally)

### 1. Backend Service (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (if not already active)
python -m venv .venv
.\.venv\Scripts\activate   # On Windows
# source .venv/bin/activate  # On Linux/macOS

# Install pinned dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on port 8000)
python -m uvicorn app.main:app --reload --port 8000
```
* **API Documentation**: Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Application (React + Vite + Tailwind)
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server (runs on port 5173)
npm run dev

# Or build for production and preview
npm run build
npm run preview
```
* **Web Application**: Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Verification Tests

To run the complete automated test suite (27 unit and integration tests covering all DSA modules, CRUD APIs, and optimizer logic):
```bash
cd backend
.\.venv\Scripts\pytest -v
```

To run the frontend production build verification:
```bash
cd frontend
npm run build
```

---

## Documentation Deliverables
All project documentation and examination guides are located in the `docs/` directory:
* [`docs/PROGRESS.md`](file:///C:/Users/Lenovo/Desktop/SupplyChain/docs/PROGRESS.md) - Milestone progress tracker (M0 through M10).
* [`docs/ARCHITECTURE.md`](file:///C:/Users/Lenovo/Desktop/SupplyChain/docs/ARCHITECTURE.md) - Layer definitions and `/optimize/next` dataflow.
* [`docs/DSA_NOTES.md`](file:///C:/Users/Lenovo/Desktop/SupplyChain/docs/DSA_NOTES.md) - Complexity table and algorithmic proofs for viva defense.
* [`docs/API.md`](file:///C:/Users/Lenovo/Desktop/SupplyChain/docs/API.md) - Complete REST API specification with sample requests and responses.
* [`docs/VIVA_QA.md`](file:///C:/Users/Lenovo/Desktop/SupplyChain/docs/VIVA_QA.md) - 28 essential viva questions and concise model answers.
* [`docs/DEMO_SCRIPT.md`](file:///C:/Users/Lenovo/Desktop/SupplyChain/docs/DEMO_SCRIPT.md) - 5-minute presentation click path and script.
* [`docs/evidence/`](file:///C:/Users/Lenovo/Desktop/SupplyChain/docs/evidence/) - Headless browser screenshot captures.
