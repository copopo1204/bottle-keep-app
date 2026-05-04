'use client'
import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Home() {
  const [bottles, setBottles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const qrRef = useRef<any>(null)

  // フォームデータ用
  const [formData, setFormData] = useState({ name: '', customer: '', brand: '', date: new Date().toISOString().slice(0, 10), note: '', memo: '' })

  // 1. スプレッドシート読み込み
  const loadBottles = () => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrvNwjUCzQn96fo3pMMqvte6XZ89-cc5dbIqBDHSGjkgZnmOhSlu_oOc8ypSrWGcs8MvhZsKdCWJwU/pub?output=csv";
    fetch(csvUrl).then(res => res.text()).then(text => Papa.parse(text, { header: true, complete: (res: any) => setBottles(res.data) }));
  };

  useEffect(() => { 
    setIsClient(true);
    loadBottles(); 
  }, []);

  // 2. カメラ起動処理
  useEffect(() => {
    if (!isClient || !isScannerOpen) return;
    setTimeout(() => {
      import('html5-qrcode').then((module) => {
        const html5QrCode = new module.Html5Qrcode("reader");
        qrRef.current = html5QrCode;
        html5QrCode.start({ facingMode: "environment" }, { fps: 5, qrbox: 200 }, (decodedText: string) => {
          setSearchTerm(decodedText);
          setIsScannerOpen(false);
          html5QrCode.stop().catch(() => {});
        }, () => {}).catch((err: any) => console.error(err));
      });
    }, 500);
    return () => { if (qrRef.current) qrRef.current.stop().catch(() => {}); };
  }, [isScannerOpen, isClient]);

  // 3. GAS経由での登録処理
  const handleRegister = async () => {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbyDsiR_hGlU_cu35nqZ1ApvOv6AoKsuwK6COfKTznv9p_AwJ37dfK998oH0Pdwh7qG9/exec";
    await fetch(`${GAS_URL}?action=register`, { method: "POST", body: JSON.stringify(formData) });
    alert("登録完了しました！");
    loadBottles();
  };

  // すでに登録されているボトル名（または銘柄）の重複しないリストを作成
  const uniqueBottleNames = Array.from(new Set(bottles.map(b => b["ボトル名"] || b["ボトル銘柄"]).filter(Boolean)));

  if (!isClient) return null;

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-8 text-center tracking-widest drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
        三島店 ボトルキープ管理
      </h1>
      
      <div className="flex flex-col gap-4">
        {/* 検索・一覧 */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full bg-[#D4AF37] text-black hover:bg-[#b5952f] transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.2)] font-bold">
              🔍 検索・一覧
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto bg-black border border-[#D4AF37] text-[#D4AF37]">
            <DialogHeader><DialogTitle className="text-[#D4AF37]">検索・一覧</DialogTitle></DialogHeader>
            <Input className="bg-transparent border-[#D4AF37] text-[#D4AF37] placeholder:text-[#D4AF37]/50 focus-visible:ring-[#D4AF37]" placeholder="名前・銘柄・番号で検索" onChange={(e) => setSearchTerm(e.target.value)} />
            {bottles.filter(b => b["顧客名（漢字）"]?.includes(searchTerm) || b["ボトル番号"]?.includes(searchTerm)).map((b, i) => (
              <div key={i} className="p-3 border-b border-[#D4AF37]/30">{b["顧客名（漢字）"]}様 - {b["ボトル銘柄"]} (No.{b["ボトル番号"]})</div>
            ))}
          </DialogContent>
        </Dialog>

        {/* QR検索 */}
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="bg-transparent border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 hover:scale-105 shadow-[0_0_10px_rgba(212,175,55,0.1)] font-bold">
              📷 QRコード検索
            </Button>
          </DialogTrigger>
          <DialogContent className="h-[60vh] bg-black border border-[#D4AF37] text-[#D4AF37]">
            <DialogHeader><DialogTitle className="text-[#D4AF37]">QRコード検索</DialogTitle></DialogHeader>
            <div id="reader" className="w-full h-full rounded overflow-hidden border border-[#D4AF37]/50"></div>
          </DialogContent>
        </Dialog>

        {/* 新規登録 */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="lg" className="bg-zinc-900 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 hover:scale-105 font-bold">
              ＋ 新規登録
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border border-[#D4AF37] text-[#D4AF37]">
            <DialogHeader><DialogTitle className="text-[#D4AF37]">新規登録</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input 
                list="bottle-names"
                placeholder="ボトル名" 
                className="bg-transparent border-[#D4AF37] text-[#D4AF37] placeholder:text-[#D4AF37]/50 focus-visible:ring-[#D4AF37]"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <datalist id="bottle-names">
                {uniqueBottleNames.map((name: any, i) => (
                  <option key={i} value={name} />
                ))}
              </datalist>
              <Input placeholder="顧客名" className="bg-transparent border-[#D4AF37] text-[#D4AF37] placeholder:text-[#D4AF37]/50 focus-visible:ring-[#D4AF37]" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} />
              <Input placeholder="銘柄" className="bg-transparent border-[#D4AF37] text-[#D4AF37] placeholder:text-[#D4AF37]/50 focus-visible:ring-[#D4AF37]" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              <Input type="date" className="bg-transparent border-[#D4AF37] text-[#D4AF37] placeholder:text-[#D4AF37]/50 focus-visible:ring-[#D4AF37] [color-scheme:dark]" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              <Button onClick={handleRegister} className="w-full bg-[#D4AF37] text-black hover:bg-[#b5952f] transition-all duration-300 hover:scale-105 font-bold mt-2">登録する</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}