import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, ChevronRight, Edit2, Save, X, Plus, Trash2, 
  Link as LinkIcon, Image as ImageIcon, ExternalLink, 
  Box, Activity, CheckCircle, AlertTriangle, 
  Layout, Settings, Share2, Globe, Check, Lock, Unlock, Shield,
  FileText, MoreHorizontal, LayoutGrid,
  Download, Upload, CloudUpload, CloudDownload, Palette,
  GitCommit, GitPullRequest, PlusCircle
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- Firebase Config (Fixed for Preview Environment) ---
// 在此預覽環境中使用 __firebase_config 全域變數
// 若在本地 Vite 開發，請改回 import.meta.env 寫法
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(__firebase_config);
} catch (e) {
  firebaseConfig = {
    apiKey: "DEMO_KEY",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Helper Functions ---
const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateShareId = () => Math.random().toString(36).substr(2, 6).toUpperCase();
const LOCAL_SAVE_KEY = 'sop_studio_local_draft';

// --- Constants & Styles ---
const STYLE_OPTIONS = {
  backgrounds: [
    { name: '白色', value: 'bg-white' },
    { name: '淺灰', value: 'bg-slate-50' },
    { name: '淺藍', value: 'bg-blue-50' },
    { name: '淺綠', value: 'bg-emerald-50' },
    { name: '淺黃', value: 'bg-amber-50' },
    { name: '淺紫', value: 'bg-violet-50' },
    { name: '淺紅', value: 'bg-rose-50' },
  ],
  borders: [
    { name: '灰色', value: 'border-slate-200' },
    { name: '藍色', value: 'border-blue-500' },
    { name: '綠色', value: 'border-emerald-500' },
    { name: '黃色', value: 'border-amber-500' },
    { name: '紫色', value: 'border-violet-500' },
    { name: '紅色', value: 'border-rose-500' },
  ],
  fonts: [
    { name: '黑體 (Sans)', value: 'font-sans' },
    { name: '宋體 (Serif)', value: 'font-serif' },
    { name: '等寬 (Mono)', value: 'font-mono' },
  ],
  sizes: [
    { name: '小', value: 'text-sm' },
    { name: '中', value: 'text-base' },
    { name: '大', value: 'text-lg' },
    { name: '特大', value: 'text-xl' },
  ]
};

// --- Initial Data Structure (Multi-Page) ---
const initialPages = [
  {
    id: "page-rcv",
    name: "驗收站點 (RCV)",
    root: {
      "id": "root-rcv",
      "title": "驗收站點作業總覽",
      "description": "主要處理的貨物稱為NYR(Not Yet Receive)。\n需依商品大小及數量區分板驗及散驗。",
      "notes": "驗收量需大於碼頭的卸貨量，否則會造成碼頭塞車。\n若有多餘人力，需要觀察上架暫存區是否足夠。",
      "type": "role",
      "isOpen": true,
      "images": [],
      "links": [],
      "style": { "bgColor": "bg-white", "borderColor": "border-blue-500", "fontFamily": "font-sans", "titleSize": "text-2xl", "contentSize": "text-base" },
      "children": [
        {
          "id": "process-loose",
          "title": "1. 散驗作業流程",
          "description": "驗收員會在輸送帶旁的工作台進行商品驗收與決定入庫位置。\n可裝入物流箱的為散貨。",
          "notes": "商品品名、外觀、規格是否與系統一致？商品是否需要效期？",
          "type": "process",
          "isOpen": false,
          "images": [],
          "links": [],
          "style": { "bgColor": "bg-white", "borderColor": "border-blue-500", "fontFamily": "font-sans", "titleSize": "text-xl", "contentSize": "text-base" },
          "children": [
            { "id": "step1", "title": "步驟 1：啟動輸送帶", "description": "按下綠色按鈕啟動輸送帶。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step2", "title": "步驟 2：開啟系統", "description": "打開 worker tool，選擇「入庫」。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step3", "title": "步驟 3：刷讀條碼", "description": "依序刷：1.工作台 2.IBC 3.商品。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step4", "title": "步驟 4：商品檢核", "description": "檢查外觀、品名、效期。", "notes": "⚠️ 效期需大於系統顯示日期。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step5", "title": "步驟 5：裝箱", "description": "驗收後放入物流箱。", "notes": "⚠️ 注意不要超過限高線。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step6", "title": "步驟 6：輸入數量", "description": "輸入數量與選擇儲位。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step7", "title": "步驟 7：確認入庫", "description": "掃物流箱條碼。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step8", "title": "步驟 8：資料查驗", "description": "確認資料正確，點選入庫。", "type": "step", "isOpen": false, "children": [] },
            { "id": "step9", "title": "步驟 9：完成作業", "description": "將物流箱推入輸送帶。", "type": "step", "isOpen": false, "children": [] }
          ]
        },
        {
          "id": "process-pallet",
          "title": "2. 板驗作業流程",
          "description": "負責棧板貨物的驗收、分類與入庫作業。\n區分為廠內用 (RCRT) 與轉出專用 (GCGP/GCGT)。",
          "notes": "【關鍵規範】\n• 板驗人員標示請用「白色膠帶」。\n• 驗效期以「抽查四角與中間」方式進行。",
          "type": "process",
          "isOpen": false,
          "images": [],
          "links": [],
          "style": { "bgColor": "bg-white", "borderColor": "border-purple-500", "fontFamily": "font-sans", "titleSize": "text-xl", "contentSize": "text-base" },
          "children": [
            {
              "id": "pallet-common",
              "title": "板驗通用流程 (步驟 1-9)",
              "description": "所有板驗貨物皆須執行的標準系統操作步驟。",
              "type": "process",
              "isOpen": true,
              "children": [
                { "id": "p-step1", "title": "① 開啟系統", "description": "開啟 WMS 系統驗收功能 (板驗台)。", "type": "step", "isOpen": false, "children": [] },
                { "id": "p-step2", "title": "② 刷入工作檯", "description": "刷入工作檯分類條碼。", "type": "step", "isOpen": false, "children": [] },
                { "id": "p-step3", "title": "③ 刷入 IBC", "description": "刷入待驗 IBC 條碼。", "type": "step", "isOpen": false, "children": [] },
                { "id": "p-step4", "title": "④ 查詢屬性", "description": "查詢是否為移轉貨物。", "notes": "⚠️ 轉出貨優先！", "type": "step", "isOpen": false, "children": [] },
                { "id": "p-step5", "title": "⑤ 盤點", "description": "盤點貨物數量與效期。", "type": "step", "isOpen": false, "children": [] },
                { "id": "p-step6", "title": "⑥ 輸入數量", "description": "輸入實際驗收數量。", "type": "step", "isOpen": false, "children": [] },
                { 
                  "id": "p-step7", "title": "⑦ 選擇物流箱分類", "description": "選擇 RCRT 或 GCGP。", "notes": "⚠️ 優先處理移轉貨。", "type": "step", "isOpen": true,
                  "children": [
                    { "id": "proc_gcgp", "title": "若為 GCGP (轉出專用)", "description": "輸入數量 -> 貼 GCGP 標籤 -> 換高角錐+紅白扁角錐。", "notes": "【GCGP 規範】\n• 每棧板最多五種貨物。\n• 需相同轉出位置。", "type": "step", "isOpen": true, "style": { "bgColor": "bg-rose-50", "borderColor": "border-rose-500", "fontFamily": "font-sans" }, "children": [] },
                    { "id": "proc_rcrt", "title": "若為 RCRT (廠內用)", "description": "寫轉出位置與碼頭號 -> 貼標籤 -> 換高角錐 -> 入庫。", "notes": "【RCRT 規範】\n• 一個標示對應一種貨物。", "type": "step", "isOpen": true, "style": { "bgColor": "bg-emerald-50", "borderColor": "border-emerald-500", "fontFamily": "font-sans" }, "children": [] }
                  ] 
                },
                { "id": "p-step8", "title": "⑧ 確認物流箱", "description": "刷入對應條碼確認。", "type": "step", "isOpen": false, "children": [] },
                { "id": "p-step9", "title": "⑨ 完成驗收", "description": "點選「入庫」。", "type": "step", "isOpen": false, "children": [] }
              ]
            }
          ]
        }
      ]
    }
  }
];

// --- Component: Share Modal ---
const ShareModal = ({ isOpen, onClose, cloudId, onGenerateLink }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const shareUrl = cloudId ? `https://sop-studio.app/s/${cloudId}` : '';

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Globe size={18} className="text-blue-500" /> 分享至 Web
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {!cloudId ? (
            <div className="text-center py-4">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload size={32} className="text-blue-500" />
              </div>
              <p className="text-gray-600 mb-4">將您的 SOP 發布到雲端，取得專屬分享連結。</p>
              <button onClick={onGenerateLink} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                發布並產生連結
              </button>
            </div>
          ) : (
            <div className="space-y-4">
               <p className="text-sm text-gray-500">任何擁有此連結的人皆可檢視此文件：</p>
               <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 font-mono truncate">{shareUrl}</div>
                  <button onClick={handleCopy} className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}>
                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Component: Inspector Panel ---
const InspectorPanel = ({ selectedNode, onUpdate, onClose, isEditable }) => {
  if (!selectedNode) return null;

  const safeStyle = selectedNode.style || {};
  const images = selectedNode.images || [];
  const links = selectedNode.links || [];
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const handleStyleChange = (key, value) => onUpdate(selectedNode.id, { ...selectedNode, style: { ...safeStyle, [key]: value } });
  
  const addImage = () => { if(newImgUrl) { onUpdate(selectedNode.id, { ...selectedNode, images: [...images, newImgUrl] }); setNewImgUrl(''); }};
  const removeImage = (idx) => { const n = [...images]; n.splice(idx, 1); onUpdate(selectedNode.id, { ...selectedNode, images: n }); };
  
  const addLink = () => { if(newLink.url) { onUpdate(selectedNode.id, { ...selectedNode, links: [...links, { title: newLink.title || newLink.url, url: newLink.url }] }); setNewLink({ title: '', url: '' }); }};
  const removeLink = (idx) => { const n = [...links]; n.splice(idx, 1); onUpdate(selectedNode.id, { ...selectedNode, links: n }); };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl z-20 w-80 lg:w-96 transition-all duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={16} /> 屬性面板</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-400"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">標題</label>
          <input type="text" disabled={!isEditable} value={selectedNode.title || ''} onChange={(e) => onUpdate(selectedNode.id, { ...selectedNode, title: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 disabled:bg-slate-50" />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">說明內容</label>
          <textarea rows={4} disabled={!isEditable} value={selectedNode.description || ''} onChange={(e) => onUpdate(selectedNode.id, { ...selectedNode, description: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-600 resize-none disabled:bg-slate-50" />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1"><AlertTriangle size={12} /> 注意事項</label>
          <textarea rows={3} disabled={!isEditable} value={selectedNode.notes || ''} onChange={(e) => onUpdate(selectedNode.id, { ...selectedNode, notes: e.target.value })} className="w-full p-2 border border-amber-200 bg-amber-50 rounded-md focus:ring-2 focus:ring-amber-500 outline-none text-sm text-slate-600 resize-none" />
        </div>
        {/* Images */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">圖片庫</label>
           <div className="space-y-2">
             {images.map((img, idx) => (
               <div key={idx} className="relative group rounded border border-slate-200 overflow-hidden">
                 <img src={img} className="w-full h-20 object-cover opacity-80" />
                 {isEditable && <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>}
               </div>
             ))}
           </div>
           {isEditable && <div className="flex gap-2 mt-2"><input type="text" placeholder="輸入圖片 URL..." value={newImgUrl} onChange={e => setNewImgUrl(e.target.value)} className="flex-1 text-xs p-2 border rounded bg-slate-50" /><button onClick={addImage} className="bg-slate-200 hover:bg-slate-300 p-2 rounded text-slate-600"><Plus size={14} /></button></div>}
        </div>
        {/* Links */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">相關連結</label>
           <div className="space-y-2">
             {links.map((link, idx) => (
               <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                 <a href={link.url} target="_blank" className="flex items-center gap-2 text-blue-600 truncate hover:underline"><LinkIcon size={12} /> {link.title}</a>
                 {isEditable && <button onClick={() => removeLink(idx)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>}
               </div>
             ))}
           </div>
           {isEditable && <div className="flex flex-col gap-2 mt-2"><input type="text" placeholder="連結名稱" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="text-xs p-2 border rounded bg-slate-50" /><div className="flex gap-2"><input type="text" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="flex-1 text-xs p-2 border rounded bg-slate-50" /><button onClick={addLink} className="bg-slate-200 hover:bg-slate-300 p-2 rounded text-slate-600"><Plus size={14} /></button></div></div>}
        </div>
        {/* Styles */}
        {isEditable && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Palette size={12} /> 外觀設定</label>
             <div className="grid grid-cols-2 gap-4">
               <div><span className="text-[10px] text-slate-400 block mb-1">背景</span><div className="flex flex-wrap gap-1.5">{STYLE_OPTIONS.backgrounds.map(opt => (<button key={opt.value} onClick={() => handleStyleChange('bgColor', opt.value)} className={`w-5 h-5 rounded-full border ${opt.value} ${safeStyle.bgColor === opt.value ? 'ring-2 ring-blue-500' : 'border-slate-200'}`} title={opt.name} />))}</div></div>
               <div><span className="text-[10px] text-slate-400 block mb-1">邊框</span><div className="flex flex-wrap gap-1.5">{STYLE_OPTIONS.borders.map(opt => (<button key={opt.value} onClick={() => handleStyleChange('borderColor', opt.value)} className={`w-5 h-5 rounded-full border-2 ${opt.value.replace('border', 'bg')} ${safeStyle.borderColor === opt.value ? 'ring-2 ring-blue-500' : 'border-transparent'}`} title={opt.name} />))}</div></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component: Tree Node ---
const TreeNode = ({ node, selectedId, onSelect, onToggle, onAction, depth = 0, isEditable }) => {
  const isSelected = selectedId === node.id;
  const nodeStyle = { bgColor: 'bg-white', borderColor: 'border-slate-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base', ...node.style };
  const images = node.images || [];
  const links = node.links || [];

  const getIcon = () => {
    if (node.type === 'role') return <Box className="w-5 h-5 text-blue-600" />;
    if (node.type === 'process') return <Activity className="w-5 h-5 text-violet-600" />;
    return <CheckCircle className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="relative flex flex-col select-none">
      {depth > 0 && <div className="absolute top-0 left-[-24px] h-full w-px bg-slate-300 transform -translate-x-1/2" />}
      {depth > 0 && <div className="absolute top-[28px] left-[-24px] w-6 h-px bg-slate-300" />}
      <div className="mb-4 relative group">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
            onToggle(node.id);
          }}
          className={`relative rounded-xl border p-4 transition-all duration-200 cursor-pointer ${nodeStyle.bgColor} ${nodeStyle.fontFamily} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg scale-[1.01]' : 'shadow-sm hover:shadow-md hover:border-blue-300'} ${nodeStyle.borderColor.includes('border-l-4') ? nodeStyle.borderColor : `border-l-4 ${nodeStyle.borderColor}`}`}
        >
          <div className="flex items-start justify-between gap-3">
             <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-50' : 'bg-white/80 border border-slate-100'}`}>{getIcon()}</div>
                <div className="flex-1"><h3 className={`font-bold text-slate-800 leading-tight ${nodeStyle.titleSize}`}>{node.title}</h3></div>
             </div>
             <div className={`flex items-center gap-1 transition-opacity duration-200 ${isSelected || 'group-hover:opacity-100 opacity-0'}`}>
                {isEditable && (
                  <>
                     <button onClick={(e) => { e.stopPropagation(); onAction('addSibling', node.id); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="新增同層"><GitPullRequest size={16} className="rotate-90" /></button>
                     <button onClick={(e) => { e.stopPropagation(); onAction('addChild', node.id); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="新增子層"><PlusCircle size={16} /></button>
                     {depth > 0 && <button onClick={(e) => { e.stopPropagation(); onAction('delete', node.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="刪除"><Trash2 size={16} /></button>}
                  </>
                )}
                {node.children && node.children.length > 0 && (
                   <button onClick={(e) => { e.stopPropagation(); onToggle(node.id); }} className={`p-1 rounded hover:bg-slate-100 text-slate-500 ${!node.isOpen && 'bg-slate-100 text-slate-800'}`}>{node.isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>
                )}
             </div>
          </div>
          {node.isOpen && (
            <div className="mt-3 pl-[3.25rem] animate-fadeIn">
               {node.description && <p className={`text-slate-600 whitespace-pre-line leading-relaxed mb-2 ${nodeStyle.contentSize}`}>{node.description}</p>}
               {node.notes && <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-md text-amber-900 text-sm mb-2"><AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" /><p className="whitespace-pre-line">{node.notes}</p></div>}
               {images.length > 0 && <div className="flex gap-2 overflow-x-auto pb-2 mt-2">{images.map((img, idx) => (<div key={idx} className="flex-none w-32 h-24 rounded-lg border border-slate-200 overflow-hidden bg-white"><img src={img} className="w-full h-full object-cover" /></div>))}</div>}
               {links.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{links.map((link, idx) => (<a key={idx} href={link.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-2 py-1 rounded transition-colors"><ExternalLink size={12} /> {link.title}</a>))}</div>}
            </div>
          )}
        </div>
      </div>
      {node.isOpen && node.children && <div className="pl-12">{node.children.map(child => (<TreeNode key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} onToggle={onToggle} onAction={onAction} depth={depth + 1} isEditable={isEditable} />))}</div>}
    </div>
  );
};

// --- Main Application ---
export default function App() {
  const [pages, setPages] = useState(initialPages);
  const [activePageId, setActivePageId] = useState(initialPages[0].id);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [user, setUser] = useState(null);
  const [cloudId, setCloudId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [globalPassword, setGlobalPassword] = useState('');
  const fileInputRef = useRef(null);

  const activePageIndex = pages.findIndex(p => p.id === activePageId);
  const activeTreeData = pages[activePageIndex]?.root;

  useEffect(() => {
    const initAuth = async () => {
       try {
         if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
         else await signInAnonymously(auth);
       } catch (e) { console.error("Auth init error:", e); }
    };
    initAuth();
    if (auth) return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_SAVE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.pages) {
          setPages(parsed.pages);
          setActivePageId(parsed.activePageId || parsed.pages?.[0]?.id || initialPages[0].id);
          setGlobalPassword(parsed.globalPassword || '');
          setStatusMsg('已載入本機草稿');
          setIsEditable(false);
        }
      }
    } catch (err) {
      console.warn('Local restore failed', err);
    }
  }, []);

  // --- Logic ---
  const findNode = (node, id) => {
    if (node.id === id) return node;
    if (node.children) { for (let child of node.children) { const found = findNode(child, id); if (found) return found; } }
    return null;
  };
  const updateNodeRec = (node, id, newData) => {
    if (node.id === id) return { ...newData, children: node.children };
    if (node.children) return { ...node, children: node.children.map(c => updateNodeRec(c, id, newData)) };
    return node;
  };
  const updatePagesWithNewTree = (newRoot) => {
    const newPages = [...pages];
    newPages[activePageIndex].root = newRoot;
    setPages(newPages);
  };
  const handleUpdateNode = (id, newData) => updatePagesWithNewTree(updateNodeRec(activeTreeData, id, newData));
  const handleToggleNode = (id) => { const node = findNode(activeTreeData, id); if(node) handleUpdateNode(id, { ...node, isOpen: !node.isOpen }); };
  const deleteNodeRec = (node, targetId) => {
    if (node.id === targetId) return null;
    if (!node.children) return node;
    const newChildren = node.children.map(c => deleteNodeRec(c, targetId)).filter(c => c !== null);
    return { ...node, children: newChildren };
  };
  const addSiblingRec = (node, targetId) => {
    if (node.children) {
      const idx = node.children.findIndex(c => c.id === targetId);
      if (idx !== -1) {
        const newNode = { id: generateId(), title: '新區塊', description: '', type: 'step', isOpen: true, images: [], links: [], style: { bgColor: 'bg-white', borderColor: 'border-slate-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' }, children: [] };
        const newArr = [...node.children]; newArr.splice(idx + 1, 0, newNode); return { ...node, children: newArr };
      }
      return { ...node, children: node.children.map(c => addSiblingRec(c, targetId)) };
    }
    return node;
  };
  const addChildRec = (node, parentId) => {
    if (node.id === parentId) {
      const newNode = { id: generateId(), title: '新子區塊', description: '', type: 'step', isOpen: true, images: [], links: [], style: { bgColor: 'bg-white', borderColor: 'border-slate-200', fontFamily: 'font-sans' }, children: [] };
      return { ...node, isOpen: true, children: [...(node.children || []), newNode] };
    }
    if (node.children) return { ...node, children: node.children.map(c => addChildRec(c, parentId)) };
    return node;
  };
  const handleNodeAction = (action, id) => {
    if (action === 'delete') {
      if (id === activeTreeData.id) return alert('根節點無法刪除');
      if (confirm('確定要刪除？')) { const res = deleteNodeRec(activeTreeData, id); updatePagesWithNewTree(res ? { ...res } : activeTreeData); if (selectedId === id) setSelectedId(null); }
    } else if (action === 'addSibling') {
      if (id === activeTreeData.id) return alert('根節點無法新增同層');
      updatePagesWithNewTree(addSiblingRec(activeTreeData, id));
    } else if (action === 'addChild') {
      updatePagesWithNewTree(addChildRec(activeTreeData, id));
      const parent = findNode(activeTreeData, id);
      if(parent && !parent.isOpen) handleUpdateNode(id, { ...parent, isOpen: true });
    }
  };

  const addNewPage = () => {
    const name = prompt("新頁面名稱:");
    if(!name) return;
    const newPage = { id: generateId(), name: name, root: { id: generateId(), title: `${name} 總覽`, description: "開始...", notes: "", type: "role", isOpen: true, images: [], links: [], style: { bgColor: "bg-white", borderColor: "border-blue-500", fontFamily: "font-sans", titleSize: "text-2xl", contentSize: "text-base" }, children: [] } };
    setPages([...pages, newPage]); setActivePageId(newPage.id);
  };
  const editPageName = (pageId) => { const p = pages.find(page => page.id === pageId); const newName = prompt("修改名稱:", p.name); if(newName) { setPages(pages.map(page => page.id === pageId ? { ...page, name: newName } : page)); } };
  const deletePage = (pageId) => { if(pages.length <= 1) return alert("至少保留一個頁面"); if(confirm("確定刪除？")) { const newPages = pages.filter(p => p.id !== pageId); setPages(newPages); setActivePageId(newPages[0].id); } };

  const handleCloudSave = async () => {
    if(!user) return;
    setIsLoading(true);
    try {
      const shareId = cloudId || generateShareId();
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sop_pages', shareId), { data: JSON.stringify({ pages, globalPassword }), createdAt: new Date().toISOString(), authorId: user.uid });
      setCloudId(shareId); window.history.pushState({}, '', `?s=${shareId}`); setStatusMsg(`已儲存: ${shareId}`);
    } catch(e) { setStatusMsg('上傳失敗'); }
    setIsLoading(false);
  };
  const handleCloudLoad = async () => {
    if(!cloudId) return;
    setIsLoading(true);
    try {
      const s = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sop_pages', cloudId.toUpperCase()));
      if(s.exists()){
        const d = JSON.parse(s.data().data);
        if(d.pages) { setPages(d.pages); setGlobalPassword(d.globalPassword || ''); } else { setPages([{ id: 'migrated', name: '匯入頁面', root: d }]); }
        setIsEditable(false); setStatusMsg('載入成功');
      } else setStatusMsg('代碼無效');
    } catch(e) { setStatusMsg('載入失敗'); }
    setIsLoading(false);
  };
  const handleExport = () => { const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ pages, globalPassword })); const a = document.createElement('a'); a.href = str; a.download = `SOP_${new Date().toISOString().slice(0,10)}.json`; a.click(); };
  const handleImport = (e) => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader(); r.onload = ev => { try { const d = JSON.parse(ev.target.result); if(d.pages) { setPages(d.pages); setGlobalPassword(d.globalPassword||''); } else { setPages([{ id: 'imp', name: '匯入', root: d }]); } setIsEditable(false); setStatusMsg('匯入成功'); } catch(x){ setStatusMsg('格式錯誤'); } }; r.readAsText(f);
  };

  const handleLocalSave = () => {
    try {
      localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify({ pages, globalPassword, activePageId, savedAt: new Date().toISOString() }));
      setStatusMsg('已儲存至本機');
    } catch (err) {
      console.error('Local save failed', err);
      setStatusMsg('本機儲存失敗');
    }
  };

  const selectedNode = selectedId ? findNode(activeTreeData, selectedId) : null;

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-800">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><div className="bg-blue-600 rounded-md p-1.5"><Layout className="text-white" size={18} /></div><span>SOP Studio</span></div>
          <div className="flex items-center gap-1 overflow-x-auto max-w-xl no-scrollbar">
            {pages.map(page => (
              <div key={page.id} onClick={() => { setActivePageId(page.id); setSelectedId(null); }} className={`group relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all border ${activePageId === page.id ? 'bg-slate-100 text-slate-800 border-slate-200 shadow-sm' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50'}`}>
                {page.name}
                {isEditable && activePageId === page.id && (<div className="flex gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); editPageName(page.id); }} className="hover:text-blue-600"><Edit2 size={12} /></button><button onClick={(e) => { e.stopPropagation(); deletePage(page.id); }} className="hover:text-red-600"><X size={12} /></button></div>)}
              </div>
            ))}
            {isEditable && <button onClick={addNewPage} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"><Plus size={16} /></button>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-slate-100 rounded-md px-3 py-1.5 text-xs w-48 border border-slate-200"><input value={cloudId} onChange={e => setCloudId(e.target.value.toUpperCase())} placeholder="CODE" className="bg-transparent border-none outline-none text-slate-700 w-full font-mono" />{cloudId && <button onClick={handleCloudLoad} className="text-blue-500 hover:text-blue-700"><Check size={14}/></button>}</div>
          <div className="flex gap-1">
            <button onClick={handleExport} className="p-2 hover:bg-slate-100 rounded text-slate-500" title="匯出 JSON"><Download size={18}/></button>
            <label className="p-2 hover:bg-slate-100 rounded text-slate-500 cursor-pointer" title="匯入 JSON"><Upload size={18}/><input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json"/></label>
          </div>
          <button onClick={handleLocalSave} className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors"><Save size={16} /> 快速儲存</button>
          <button onClick={() => { if(isEditable) { setIsEditable(false); setStatusMsg('已切換至預覽'); } else { if(globalPassword && prompt('輸入密碼')!==globalPassword) return alert('密碼錯誤'); setIsEditable(true); setStatusMsg('編輯模式'); } }} className={`p-2 rounded-lg text-slate-500 hover:bg-slate-100 ${isEditable && 'bg-blue-50 text-blue-600'}`}>{isEditable ? <Unlock size={18} /> : <Lock size={18} />}</button>
          {isEditable && <button onClick={() => { const p = prompt('設定新密碼:', globalPassword); if(p!==null) setGlobalPassword(p); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><Shield size={18} /></button>}
          <button onClick={() => { handleCloudSave(); setShowShareModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors"><Share2 size={16} /> 分享</button>
        </div>
      </header>
      <div className="h-6 bg-slate-50 border-b border-slate-200 flex items-center justify-center text-[10px] text-slate-400"><span>{statusMsg || (isEditable ? '編輯模式' : '預覽模式')}</span>{isLoading && <span className="ml-2 animate-pulse text-blue-500">處理中...</span>}</div>
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto bg-slate-50/50 p-8 md:p-12" onClick={() => setSelectedId(null)}>
           <div className="max-w-4xl mx-auto pb-32">
              {activeTreeData && <TreeNode node={activeTreeData} selectedId={selectedId} onSelect={setSelectedId} onToggle={handleToggleNode} onAction={handleNodeAction} isEditable={isEditable} />}
              <div className="pl-12 relative mt-4 opacity-50"><div className="absolute top-0 left-[-24px] h-8 w-px bg-slate-300 transform -translate-x-1/2" /><div className="ml-4 p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs text-center">END OF FLOW</div></div>
           </div>
        </div>
        {selectedId && <InspectorPanel selectedNode={selectedNode} onUpdate={handleUpdateNode} onClose={() => setSelectedId(null)} isEditable={isEditable} />}
      </main>
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} cloudId={cloudId} onGenerateLink={handleCloudSave} />
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }.animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; } ::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
