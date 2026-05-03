'use client'
import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { Html5Qrcode } from "html5-qrcode" // Html5QrcodeScanner から変更
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog"

export default function Home() {
  const [bottles, setBottles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({ name: '', customer: '', brand: '', date: '', note: '', memo: '' })
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const qrRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrvNwjUCzQn96fo3pMMqvte6XZ89-cc5dbIqBDHSGjkgZnmOhSlu_oOc8ypSrWGcs8MvhZsKdCWJwU/pub?output=csv";
    fetch(csvUrl).then(res => res.text()).then(text => Papa.parse(text, { header: true, complete: (res) => setBottles(res.data) }));
  }, []);

  // iPhone用にカメラ起動処理を改善
  useEffect(() => {
    if (isScannerOpen) {
      const html5QrCode = new Html5Qrcode("reader");
      qrRef.current = html5QrCode;
      html5QrCode.start(
        { facingMode: "environment" }, // 背面カメラを強制
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setSearchTerm(decodedText);
          setIsScannerOpen(false);
          html5QrCode.stop();
        }
      ).catch(err => console.error("カメラ起動失敗:", err));
    } else if (qrRef.current) {
      qrRef.current.stop().catch(() => {});
    }
  }, [isScannerOpen]);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">三島店 ボトルキープ管理</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        
        <Dialog>
          <DialogTrigger asChild><Button size="lg">🔍 ボトル検索</Button></DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <Input placeholder="検索..." onChange={(e) => setSearchTerm(e.target.value)} />
            {bottles.filter(b => b["顧客名（漢字）"]?.includes(searchTerm)).map((b, i) => (
              <div key={i} className="p-2 border-b">{b["顧客名（漢字）"]}様 - {b["ボトル銘柄"]}</div>
            ))}
          </DialogContent>
        </Dialog>

        {/* カメラ用ダイアログ */}
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogTrigger asChild><Button variant="outline" size="lg">📷 QR読み取り</Button></DialogTrigger>
          <DialogContent className="w-[95vw] h-[80vh] flex flex-col">
            <DialogHeader><DialogTitle>カメラをかざしてください</DialogTitle></DialogHeader>
            {/* id="reader" が必要 */}
            <div id="reader" className="w-full flex-grow"></div>
            <Button onClick={() => setIsScannerOpen(false)}>閉じる</Button>
          </DialogContent>
        </Dialog>
        
        {/* 新規登録などはそのまま... */}
      </div>
    </main>
  )
}