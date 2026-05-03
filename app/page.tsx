'use client'
import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Home() {
  const [bottles, setBottles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const qrRef = useRef<Html5Qrcode | null>(null)

  // 1. スプレッドシート読み込み
  useEffect(() => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrvNwjUCzQn96fo3pMMqvte6XZ89-cc5dbIqBDHSGjkgZnmOhSlu_oOc8ypSrWGcs8MvhZsKdCWJwU/pub?output=csv";
    fetch(csvUrl).then(res => res.text()).then(text => Papa.parse(text, { header: true, complete: (res) => setBottles(res.data) }));
  }, []);

  // 2. iPhone対応：ダイアログが開いてから少し遅れてカメラを起動
  useEffect(() => {
    if (isScannerOpen) {
      setTimeout(() => {
        const html5QrCode = new Html5Qrcode("reader");
        qrRef.current = html5QrCode;
        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 5, qrbox: 200 },
          (decodedText) => {
            setSearchTerm(decodedText);
            setIsScannerOpen(false);
            html5QrCode.stop().catch(() => {});
          }
        ).catch(err => {
          console.error("カメラ起動エラー:", err);
          alert("カメラを起動できませんでした。ブラウザの設定でカメラ許可を確認してください。");
        });
      }, 500); // 0.5秒待つことでダイアログの描画を待機
    } else if (qrRef.current) {
      qrRef.current.stop().catch(() => {});
    }
  }, [isScannerOpen]);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">ボトルキープ管理</h1>
      
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