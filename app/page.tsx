'use client'
import { useState, useEffect } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog"

export default function Home() {
  const [bottles, setBottles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: '', customer: '', brand: '', date: '', note: '', memo: '' })

  // 1. スプレッドシートからデータを読み込み
  useEffect(() => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrvNwjUCzQn96fo3pMMqvte6XZ89-cc5dbIqBDHSGjkgZnmOhSlu_oOc8ypSrWGcs8MvhZsKdCWJwU/pub?output=csv";
    fetch(csvUrl)
      .then(res => res.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => setBottles(results.data)
        });
      });
  }, []);

  // 2. 新規登録処理 (ご自身のGAS URLをセットしてください)
  const handleRegister = async () => {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbyDsiR_hGlU_cu35nqZ1ApvOv6AoKsuwK6COfKTznv9p_AwJ37dfK998oH0Pdwh7qG9/exec";
    await fetch(`${GAS_URL}?action=register`, {
      method: "POST",
      body: JSON.stringify(formData)
    });
    alert("登録しました！");
  };

  const filteredBottles = bottles.filter(b => 
    b["顧客名（漢字）"]?.includes(searchTerm) || 
    b["ボトル銘柄"]?.includes(searchTerm) ||
    b["ボトル番号"]?.includes(searchTerm)
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-6 gap-6">
      <h1 className="text-2xl font-bold">三島店 ボトルキープ管理</h1>
      
      <div className="flex flex-col w-full max-w-sm gap-4">
        {/* 検索・一覧 */}
        <Dialog>
          <DialogTrigger asChild><Button size="lg">🔍 ボトル検索・一覧</Button></DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>ボトル検索</DialogTitle></DialogHeader>
            <Input placeholder="名前、銘柄、または番号で検索" onChange={(e) => setSearchTerm(e.target.value)} />
            {filteredBottles.map((b, i) => (
              <div key={i} className="p-3 border rounded text-sm">
                <p className="font-bold">{b["顧客名（漢字）"]}様</p>
                <p>{b["ボトル銘柄"]} (No.{b["ボトル番号"]})</p>
              </div>
            ))}
          </DialogContent>
        </Dialog>

        {/* QR検索（擬似機能） */}
        <Button variant="outline" size="lg" onClick={() => alert("スマホのカメラでQRを読み取ってください")}>
          📷 QRコード検索
        </Button>

        {/* 新規登録 */}
        <Dialog>
          <DialogTrigger asChild><Button variant="secondary" size="lg">＋ 新規ボトル登録</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>新規ボトル登録</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="ボトルネーム" onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input placeholder="顧客名（漢字）" onChange={e => setFormData({...formData, customer: e.target.value})} />
              <Input placeholder="銘柄" onChange={e => setFormData({...formData, brand: e.target.value})} />
              <Input type="date" onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <DialogFooter>
              <Button onClick={handleRegister}>登録する</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}