'use client'
import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Home() {
  const [bottles, setBottles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const qrRef = useRef<any>(null)

  // 1. マウント判定（サーバーサイドレンダリング対策）
  useEffect(() => {
    setIsClient(true);
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrvNwjUCzQn96fo3pMMqvte6XZ89-cc5dbIqBDHSGjkgZnmOhSlu_oOc8ypSrWGcs8MvhZsKdCWJwU/pub?output=csv";
    fetch(csvUrl).then(res => res.text()).then(text => Papa.parse(text, { header: true, complete: (res: any) => setBottles(res.data) }));
  }, []);

  // 2. カメラ起動処理
  useEffect(() => {
    if (!isClient || !isScannerOpen) return;

    let html5QrCode: any = null;
    
    // ダイアログが開いた後にカメラを初期化
    import('html5-qrcode').then((module) => {
      html5QrCode = new module.Html5Qrcode("reader");
      qrRef.current = html5QrCode;
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 5, qrbox: 200 },
        (decodedText: string) => {
          setSearchTerm(decodedText);
          setIsScannerOpen(false);
          html5QrCode.stop().catch(() => {});
        },
        () => {}
      ).catch((err: any) => console.error("Camera error:", err));
    });

    return () => {
      if (qrRef.current) qrRef.current.stop().catch(() => {});
    };
  }, [isScannerOpen, isClient]);

  if (!isClient) return null; // サーバーサイドでは描画しない

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