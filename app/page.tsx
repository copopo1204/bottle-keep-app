'use client'
import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function Home() {
  const [bottles, setBottles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: '', customer: '', brand: '', date: '', note: '', memo: '' })
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const scannerRef = useRef<any>(null)

  // 1. スプレッドシート読み込み
  const loadData = () => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrvNwjUCzQn96fo3pMMqvte6XZ89-cc5dbIqBDHSGjkgZnmOhSlu_oOc8ypSrWGcs8MvhZsKdCWJwU/pub?output=csv";
    fetch(csvUrl).then(res => res.text()).then(text => Papa.parse(text, { header: true, skipEmptyLines: true, complete: (res) => setBottles(res.data) }));
  };

  useEffect(() => { loadData(); }, []);

  // 2. スキャナー制御
  useEffect(() => {
    if (isScannerOpen) {
      scannerRef.current = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scannerRef.current.render((text) => { setSearchTerm(text); setIsScannerOpen(false); }, () => {});
    } else if (scannerRef.current) {
      scannerRef.current.clear();
    }
  }, [isScannerOpen]);

  // 3. データ登録
  const handleRegister = async () => {
    const GAS_URL = "https://script.google.com/macros/s/（ここに新しいデプロイURL）/exec";
    await fetch(`${GAS_URL}?action=register`, { method: "POST", body: JSON.stringify(formData) });
    alert("登録しました！");
    loadData(); // 即座に更新
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">三島店 ボトルキープ管理</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        
        <Dialog>
          <DialogTrigger asChild><Button size="lg">🔍 ボトル検索</Button></DialogTrigger>
          <DialogContent className="h-[80vh] overflow-y-auto">
            <Input placeholder="検索..." onChange={(e) => setSearchTerm(e.target.value)} />
            {bottles.filter(b => b["顧客名（漢字）"]?.includes(searchTerm)).map((b, i) => (
              <div key={i} className="p-2 border-b">{b["顧客名（漢字）"]}様 - {b["ボトル銘柄"]}</div>
            ))}
          </DialogContent>
        </Dialog>

        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogTrigger asChild><Button variant="outline" size="lg">📷 QR読み取り</Button></DialogTrigger>
          <DialogContent><div id="reader"></div></DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild><Button variant="secondary" size="lg">＋ 新規登録</Button></DialogTrigger>
          <DialogContent>
            <div className="space-y-4">
              <Input placeholder="ボトル名" onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input placeholder="顧客名" onChange={e => setFormData({...formData, customer: e.target.value})} />
              <Input placeholder="銘柄" onChange={e => setFormData({...formData, brand: e.target.value})} />
              <Button onClick={handleRegister}>送信</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}