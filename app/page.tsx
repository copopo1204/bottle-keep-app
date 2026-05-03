'use client'
import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// 動的インポート用の型定義
const useQrScanner = () => {
  const [Html5Qrcode, setHtml5Qrcode] = useState<any>(null);
  useEffect(() => {
    import('html5-qrcode').then((module) => {
      setHtml5Qrcode(module.Html5Qrcode);
    });
  }, []);
  return Html5Qrcode;
};

export default function Home() {
  const [bottles, setBottles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const qrRef = useRef<any>(null)
  const Html5Qrcode = useQrScanner();

  useEffect(() => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrvNwjUCzQn96fo3pMMqvte6XZ89-cc5dbIqBDHSGjkgZnmOhSlu_oOc8ypSrWGcs8MvhZsKdCWJwU/pub?output=csv";
    fetch(csvUrl).then(res => res.text()).then(text => Papa.parse(text, { header: true, complete: (res) => setBottles(res.data) }));
  }, []);

  useEffect(() => {
    if (isScannerOpen && Html5Qrcode) {
      setTimeout(() => {
        const html5QrCode = new Html5Qrcode("reader");
        qrRef.current = html5QrCode;
        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 5, qrbox: 200 },
          (decodedText: string) => { // ★ここを decodedText: string に修正
            setSearchTerm(decodedText);
            setIsScannerOpen(false);
            html5QrCode.stop().catch(() => {});
          },
          (errorMessage: any) => { /* 必要であればログ出力 */ }
        ).catch((err: any) => console.error("カメラ起動失敗:", err));
      }, 500);
    } else if (qrRef.current) {
      qrRef.current.stop().catch(() => {});
    }
  }, [isScannerOpen, Html5Qrcode]);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">三島店 ボトルキープ管理</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" onClick={() => setIsScannerOpen(true)}>📷 QR読み取り</Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] h-[60vh] flex flex-col items-center">
            <DialogHeader><DialogTitle>カメラをかざしてください</DialogTitle></DialogHeader>
            <div id="reader" className="w-full h-full"></div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}