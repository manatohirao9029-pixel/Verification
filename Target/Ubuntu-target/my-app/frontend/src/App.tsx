import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

// --- 型定義 ---
interface WeightEntry {
  date: string;
  weight: number;
}

// ==========================================
// 1. ホーム画面
// ==========================================
function Home() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>ようこそ！体重管理アプリへ</h1>
      <p>メニューから記録やグラフを確認してください。</p>
    </div>
  );
}

// ==========================================
// 2. グラフ表示ページ (/chart)
// ==========================================
function ChartPage({ records }: { records: WeightEntry[] }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>体重推移グラフ</h1>
      <div style={{ height: '400px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={records}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#4caf50" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/weight">記録画面に戻る</Link>
      </div>
    </div>
  );
}

// ==========================================
// 3. 体重記録ページ (/weight)
// ==========================================
function WeightTracker({ records, refresh }: { records: WeightEntry[], refresh: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(today);
  const [weight, setWeight] = useState<number | ''>('');

  const handleSubmit = () => {
    if (!date || weight === '') return alert("入力してください");

    fetch('http://localhost:8000/api/insertweight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, weight: Number(weight) }),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        refresh(); // 親のデータを更新
        setWeight('');
      });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1>体重を記録</h1>
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="体重(kg)" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        <button onClick={handleSubmit} style={buttonStyle}>保存する</button>
      </div>
      <h2>記録一覧</h2>
      {records.map((r, i) => <div key={i} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>{r.date}: {r.weight}kg</div>)}
    </div>
  );
}

// ==========================================
// 4. メインApp（データ管理の親）
// ==========================================
function App() {
  const [records, setRecords] = useState<WeightEntry[]>([]);

  const fetchRecords = () => {
    fetch('http://localhost:8000/api/getweight')
      .then(res => res.json())
      .then(data => setRecords(data));
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <BrowserRouter>
      <nav style={{ textAlign: 'center', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/">ホーム</Link> | <Link to="/weight">記録一覧</Link> | <Link to="/chart">グラフ</Link>
      </nav>
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/weight" element={<WeightTracker records={records} refresh={fetchRecords} />} />
          <Route path="/chart" element={<ChartPage records={records} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const buttonStyle: React.CSSProperties = {
  width: '100%', padding: '10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
};

export default App;