import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  Link as LinkIcon,
  Image as ImageIcon,
  ExternalLink,
  Box,
  Activity,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Download,
  Upload,
  Palette,
  GitCommit,
  GitPullRequest,
  Lock,
  Unlock,
  Eye,
  Settings
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'sop_tree_offline_v1';
const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const STYLE_OPTIONS = {
  backgrounds: [
    { name: '白色', value: 'bg-white' },
    { name: '淺灰', value: 'bg-slate-50' },
    { name: '淺藍', value: 'bg-blue-50' },
    { name: '淺綠', value: 'bg-green-50' },
    { name: '淺黃', value: 'bg-amber-50' },
    { name: '淺紫', value: 'bg-purple-50' },
    { name: '淺紅', value: 'bg-red-50' },
  ],
  borders: [
    { name: '灰色', value: 'border-gray-200' },
    { name: '藍色', value: 'border-blue-500' },
    { name: '綠色', value: 'border-green-500' },
    { name: '黃色', value: 'border-amber-500' },
    { name: '紫色', value: 'border-purple-500' },
    { name: '紅色', value: 'border-red-500' },
    { name: '無框', value: 'border-transparent' },
  ],
  fonts: [
    { name: '預設黑體', value: 'font-sans' },
    { name: '明體/宋體', value: 'font-serif' },
    { name: '等寬字體', value: 'font-mono' },
  ],
  textSizes: [
    { name: '小', value: 'text-sm' },
    { name: '中', value: 'text-base' },
    { name: '大', value: 'text-lg' },
    { name: '特大', value: 'text-xl' },
    { name: '超大', value: 'text-2xl' },
  ]
};

const initialData = {
  id: 'root',
  title: '散驗人員 (Role)',
  description: '在輸送帶旁的工作台進行較小型商品驗收與入庫。\n可裝入物流箱的為散貨，無法裝入箱或太大者為板貨。',
  notes: '',
  type: 'role',
  isOpen: true,
  globalPassword: '',
  style: {
    bgColor: 'bg-white',
    borderColor: 'border-blue-500',
    fontFamily: 'font-sans',
    titleSize: 'text-2xl',
    contentSize: 'text-base'
  },
  children: [
    {
      id: 'process',
      title: '散驗作業流程 (Process)',
      description: '點擊展開查看詳細的驗收步驟與規範。',
      notes: '',
      type: 'process',
      isOpen: true,
      style: {
        bgColor: 'bg-white',
        borderColor: 'border-purple-500',
        fontFamily: 'font-sans',
        titleSize: 'text-xl',
        contentSize: 'text-base'
      },
      children: [
        {
          id: 'step1',
          title: '步驟 1：啟動輸送帶',
          description: '按下綠色按鈕啟動輸送帶，讓貨到達工作台。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step2',
          title: '步驟 2：開啟系統',
          description: '打開 worker tool，選擇「入庫」功能。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step3',
          title: '步驟 3：刷讀條碼',
          description: '依序刷以下條碼：\n1. 工作台條碼\n2. IBC 條碼（麥頭上）\n3. 商品條碼',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step4',
          title: '步驟 4：商品檢核',
          description: '檢查外觀、品名、圖片、效期等是否與系統相符。',
          notes: '⚠️ 效期需大於系統顯示日期，若小於請報警示。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step5',
          title: '步驟 5：裝箱',
          description: '驗收完成後，將商品放入物流箱內。',
          notes: '⚠️ 注意不要超過限高線，以免造成後續自動倉儲卡貨。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step6',
          title: '步驟 6：輸入數量與儲位',
          description: '在系統輸入數量，選擇要送去的倉庫位置（一樓或二樓）。\n部分商品會自動分配儲位，其他需手動選取。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step7',
          title: '步驟 7：確認入庫',
          description: '掃物流箱條碼，確認入庫完成。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step8',
          title: '步驟 8：資料查驗',
          description: '開啟物流箱條碼查驗資料，若正確，點選「入庫」。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        },
        {
          id: 'step9',
          title: '步驟 9：完成作業',
          description: '將物流箱推入下方輸送帶，完成本次散驗。',
          type: 'step',
          isOpen: false,
          style: { bgColor: 'bg-white', borderColor: 'border-gray-200', fontFamily: 'font-sans', titleSize: 'text-lg', contentSize: 'text-base' },
          children: []
        }
      ]
    }
  ]
};

const StyleEditor = ({ currentStyle, onChange }) => {
  const safeStyle = currentStyle || {};

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-5">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
        <Palette size={14} /> 外觀與文字設定
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">文字字型</label>
          <div className="flex flex-col gap-1">
            {STYLE_OPTIONS.fonts.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...safeStyle, fontFamily: opt.value })}
                className={`px-2 py-1 text-xs text-left rounded border transition-colors ${opt.value} ${
                  safeStyle.fontFamily === opt.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300 ring-1 ring-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.name} (AaBb)
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1.5">標題大小</label>
          <div className="flex flex-wrap gap-1">
            {STYLE_OPTIONS.textSizes.map((opt) => (
              <button
                key={`t-${opt.value}`}
                onClick={() => onChange({ ...safeStyle, titleSize: opt.value })}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  safeStyle.titleSize === opt.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1.5">內文大小 (說明/注意)</label>
          <div className="flex flex-wrap gap-1">
            {STYLE_OPTIONS.textSizes.map((opt) => (
              <button
                key={`c-${opt.value}`}
                onClick={() => onChange({ ...safeStyle, contentSize: opt.value })}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  safeStyle.contentSize === opt.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">區塊背景顏色</label>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.backgrounds.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...safeStyle, bgColor: opt.value })}
                className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${
                  opt.value === 'bg-white' ? 'bg-white' : opt.value
                } ${safeStyle.bgColor === opt.value ? 'ring-2 ring-offset-1 ring-blue-400' : 'border-gray-300'}`}
                title={opt.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1.5">側邊框顏色</label>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.borders.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...safeStyle, borderColor: opt.value })}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  opt.value.replace('border', 'bg')
                } ${safeStyle.borderColor === opt.value ? 'ring-2 ring-offset-1 ring-blue-400' : 'border-transparent'}`}
                title={opt.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TreeNode = ({ node, parentId, onUpdate, onAddChild, onAddSibling, onDelete, isEditable, depth = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);

  const defaultStyle = {
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    fontFamily: 'font-sans',
    titleSize: 'text-lg',
    contentSize: 'text-base'
  };

  const nodeStyle = { ...defaultStyle, ...node.style };

  const [editData, setEditData] = useState({
    title: node.title,
    description: node.description || '',
    notes: node.notes || '',
    imageUrl: node.imageUrl || '',
    linkUrl: node.linkUrl || '',
    style: nodeStyle
  });

  useEffect(() => {
    if (!isEditable && isEditing) {
      setIsEditing(false);
    }
  }, [isEditable, isEditing]);

  const handleToggle = () => {
    if (!isEditing) onUpdate(node.id, { ...node, isOpen: !node.isOpen });
  };

  const handleSave = () => {
    onUpdate(node.id, { ...node, ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: node.title,
      description: node.description || '',
      notes: node.notes || '',
      imageUrl: node.imageUrl || '',
      linkUrl: node.linkUrl || '',
      style: nodeStyle
    });
    setIsEditing(false);
  };

  const handleDeleteSelf = () => {
    if (window.confirm(`【刪除確認】\n確定要刪除「${node.title}」嗎？\n\n注意：此操作將一併刪除該區塊下的所有子區塊，且無法復原！`)) {
      onDelete(node.id);
    }
  };

  const getIcon = () => {
    if (node.type === 'role') return <Box className="w-5 h-5 text-blue-600" />;
    if (node.type === 'process') return <Activity className="w-5 h-5 text-purple-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const containerClass = `
    rounded-lg shadow-sm hover:shadow-md p-4 transition-all relative
    ${isEditing ? 'ring-2 ring-blue-400' : ''}
    ${nodeStyle.bgColor}
    ${nodeStyle.borderColor.includes('border-l-4') ? nodeStyle.borderColor : `border-l-4 ${nodeStyle.borderColor}`}
    border border-gray-100
    ${nodeStyle.fontFamily}
  `;

  return (
    <div className="relative flex flex-col">
      {depth > 0 && (
        <div className="absolute top-0 left-[-20px] h-full w-px bg-gray-300 transform -translate-x-1/2"></div>
      )}
      {depth > 0 && (
        <div className="absolute top-6 left-[-20px] w-5 h-px bg-gray-300"></div>
      )}

      <div className="mb-4 relative group transition-all duration-300">
        <div className={containerClass}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={handleToggle}>
              <div className={`p-2 rounded-full shrink-0 shadow-sm border border-gray-100 bg-white/80`}>
                {getIcon()}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className={`w-full font-bold text-gray-800 border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 bg-transparent ${editData.style.titleSize}`}
                  placeholder="輸入標題"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="flex flex-col">
                  <h3 className={`font-bold text-gray-800 select-none ${nodeStyle.titleSize}`}>
                    {node.title}
                  </h3>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!isEditing && isEditable && (
                <>
                  {depth > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAddSibling(node.id); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      title="新增同級區塊"
                    >
                      <GitPullRequest size={18} className="rotate-90" />
                    </button>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAddChild(node.id); }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="新增子區塊"
                  >
                    <GitCommit size={18} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsEditing(true); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="編輯內容與外觀"
                  >
                    <Edit2 size={16} />
                  </button>

                  {depth > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteSelf(); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      title="刪除此區塊"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </>
              )}

              {(node.children && node.children.length > 0) && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full"
                >
                  {node.isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
              )}
            </div>
          </div>

          {(node.isOpen || isEditing) && (
            <div className="mt-3 pl-[3.25rem]">
              {isEditing ? (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">作業說明</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className={`w-full min-h-[80px] p-2 border rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none ${editData.style.fontFamily} ${editData.style.contentSize}`}
                      placeholder="輸入說明內容..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-600 mb-1 flex items-center gap-1">
                      <AlertTriangle size={12} /> 注意事項
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className={`w-full min-h-[60px] p-2 border border-amber-200 bg-amber-50 rounded-md focus:ring-2 focus:ring-amber-100 ${editData.style.fontFamily} ${editData.style.contentSize}`}
                      placeholder="輸入注意事項..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-2 py-1 bg-white rounded border border-gray-200">
                      <ImageIcon size={14} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="圖片網址 (https://...)"
                        value={editData.imageUrl}
                        onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                        className="w-full bg-transparent text-xs outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-white rounded border border-gray-200">
                      <LinkIcon size={14} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="相關連結 (https://...)"
                        value={editData.linkUrl}
                        onChange={(e) => setEditData({ ...editData, linkUrl: e.target.value })}
                        className="w-full bg-transparent text-xs outline-none"
                      />
                    </div>
                  </div>

                  <StyleEditor
                    currentStyle={editData.style}
                    onChange={(newStyle) => setEditData({ ...editData, style: newStyle })}
                  />

                  <div className="flex justify-end items-center pt-2 border-t border-gray-100 mt-4 gap-2">
                    <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">取消</button>
                    <button onClick={handleSave} className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm flex items-center gap-1">
                      <Save size={14} /> 儲存
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`space-y-3 animate-fadeIn ${nodeStyle.fontFamily}`}>
                  {node.description && (
                    <p className={`text-gray-700 whitespace-pre-line leading-relaxed ${nodeStyle.contentSize}`}>
                      {node.description}
                    </p>
                  )}

                  {node.notes && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50/80 border border-amber-100 rounded-md text-amber-900">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                      <p className={`whitespace-pre-line font-medium ${nodeStyle.contentSize}`}>{node.notes}</p>
                    </div>
                  )}

                  {node.imageUrl && (
                    <img src={node.imageUrl} alt="preview" className="rounded-lg border border-gray-100 max-h-60 object-cover w-full shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}

                  {node.linkUrl && (
                    <a href={node.linkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                      <ExternalLink size={12} /> 相關資源連結
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {node.isOpen && node.children && (
        <div className="pl-8">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              parentId={node.id}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onAddSibling={onAddSibling}
              onDelete={onDelete}
              isEditable={isEditable}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [treeData, setTreeData] = useState(initialData);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isEditable, setIsEditable] = useState(false);
  const [isRestoredFromLocal, setIsRestoredFromLocal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setTreeData(JSON.parse(cached));
        setIsRestoredFromLocal(true);
        setMessage({ text: '已從本機暫存載入資料', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 2000);
      }
    } catch (error) {
      console.warn('Failed to restore local data', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(treeData));
      } catch (error) {
        console.warn('Failed to persist data locally', error);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [treeData]);

  const updateNodeRecursive = (node, id, data) => {
    if (node.id === id) return { ...data, children: node.children };
    if (node.children) return { ...node, children: node.children.map(c => updateNodeRecursive(c, id, data)) };
    return node;
  };
  const handleUpdateNode = (id, data) => setTreeData(prev => updateNodeRecursive(prev, id, data));

  const addChildNodeRecursive = (node, parentId) => {
    if (node.id === parentId) {
      const newNode = {
        id: generateId(),
        title: '新子區塊',
        description: '請編輯說明...',
        type: 'step',
        isOpen: true,
        style: {
          bgColor: 'bg-white',
          borderColor: 'border-gray-300',
          fontFamily: 'font-sans',
          titleSize: 'text-lg',
          contentSize: 'text-base'
        },
        children: []
      };
      return { ...node, isOpen: true, children: [...(node.children || []), newNode] };
    }
    if (node.children) return { ...node, children: node.children.map(c => addChildNodeRecursive(c, parentId)) };
    return node;
  };
  const handleAddChild = (parentId) => setTreeData(prev => addChildNodeRecursive(prev, parentId));

  const addSiblingNodeRecursive = (node, targetId) => {
    if (node.children) {
      const index = node.children.findIndex(c => c.id === targetId);
      if (index !== -1) {
        const newNode = {
          id: generateId(),
          title: '新同級區塊',
          description: '請編輯說明...',
          type: 'step',
          isOpen: true,
          style: {
            bgColor: 'bg-white',
            borderColor: 'border-gray-300',
            fontFamily: 'font-sans',
            titleSize: 'text-lg',
            contentSize: 'text-base'
          },
          children: []
        };
        const newChildren = [...node.children];
        newChildren.splice(index + 1, 0, newNode);
        return { ...node, children: newChildren };
      }
      return { ...node, children: node.children.map(c => addSiblingNodeRecursive(c, targetId)) };
    }
    return node;
  };
  const handleAddSibling = (targetId) => {
    if (targetId === treeData.id) {
      setMessage({ text: '無法在根節點新增同級區塊', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
      return;
    }
    setTreeData(prev => addSiblingNodeRecursive(prev, targetId));
  };

  const deleteNodeRecursive = (node, targetId) => {
    if (node.id === targetId) return null;
    if (!node.children || node.children.length === 0) return node;
    const newChildren = node.children
      .map(child => deleteNodeRecursive(child, targetId))
      .filter(child => child !== null);
    return { ...node, children: newChildren };
  };

  const handleDeleteNode = (id) => {
    if (id === treeData.id) {
      alert('根節點無法刪除');
      return;
    }
    setTreeData(prevTree => {
      const newTree = deleteNodeRecursive(prevTree, id);
      return newTree || prevTree;
    });
    setMessage({ text: '區塊已刪除', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(treeData, null, 2));
    const anchor = document.createElement('a');
    anchor.href = dataStr;
    anchor.download = `SOP_Tree_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setMessage({ text: '檔案已匯出', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const importFromJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const newData = JSON.parse(event.target.result);
        setTreeData(newData);
        setIsEditable(false);
        setMessage({ text: '匯入成功', type: 'success' });
      } catch (err) {
        setMessage({ text: '格式錯誤', type: 'error' });
      }
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };
    reader.readAsText(file);
  };

  const clearLocalData = () => {
    if (window.confirm('確定要清除本機暫存並回到預設流程嗎？')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setTreeData(initialData);
      setIsEditable(false);
      setMessage({ text: '已清除本機資料並載入預設流程', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
    }
  };

  const toggleEditMode = () => {
    if (isEditable) {
      setIsEditable(false);
      setMessage({ text: '已切換至唯讀模式', type: 'success' });
    } else {
      if (treeData.globalPassword) {
        const pwd = prompt('請輸入檔案密碼以進入編輯模式：');
        if (pwd === treeData.globalPassword) {
          setIsEditable(true);
          setMessage({ text: '密碼正確，進入編輯模式', type: 'success' });
        } else {
          alert('密碼錯誤');
        }
      } else {
        setIsEditable(true);
        setMessage({ text: '已進入編輯模式', type: 'success' });
      }
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const handleSetPassword = () => {
    const currentPwd = treeData.globalPassword || '';
    const newPwd = prompt('請設定新的檔案密碼 (留空則移除密碼)：', currentPwd);
    if (newPwd !== null) {
      setTreeData(prev => ({ ...prev, globalPassword: newPwd }));
      if (newPwd) {
        alert('密碼已設定。下次進入編輯模式時需輸入此密碼。');
      } else {
        alert('密碼已移除。');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto bg-white min-h-[80vh] rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-800 text-white p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-md z-10">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Activity className="text-blue-400" /> SOP 互動編輯器
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              {isEditable ? (
                <span className="text-green-400 flex items-center gap-1"><Edit2 size={10} /> 編輯模式</span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1"><Eye size={10} /> 唯讀模式</span>
              )}
              {treeData.globalPassword && <span className="text-slate-500 flex items-center gap-1 border-l border-slate-600 pl-2"><Lock size={10} /> 密碼保護中</span>}
              {isRestoredFromLocal && <span className="text-slate-400 flex items-center gap-1 border-l border-slate-600 pl-2"><Save size={10} /> 已載入本機暫存</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-end">
            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                onClick={toggleEditMode}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded transition-all ${
                  isEditable
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/50'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isEditable ? <><Unlock size={14} /> 退出編輯</> : <><Lock size={14} /> 進入編輯模式</>}
              </button>

              {isEditable && (
                <button
                  onClick={handleSetPassword}
                  className="ml-1 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-700"
                  title="設定檔案密碼"
                >
                  <Settings size={16} />
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-slate-600 mx-1 hidden lg:block"></div>

            <div className="flex bg-slate-700 rounded-lg p-1">
              <button onClick={exportToJson} className="flex items-center gap-1 px-3 py-1.5 text-xs hover:bg-slate-600 rounded transition-colors text-slate-200">
                <Download size={14} /> 匯出
              </button>
              <div className="w-px bg-slate-600 mx-1 my-1"></div>
              <label className="flex items-center gap-1 px-3 py-1.5 text-xs hover:bg-slate-600 rounded transition-colors text-slate-200 cursor-pointer">
                <Upload size={14} /> 匯入
                <input type="file" ref={fileInputRef} onChange={importFromJson} className="hidden" accept=".json" />
              </label>
            </div>

            <div className="flex bg-slate-700 rounded-lg p-1 items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 text-xs text-slate-200">
                <Save size={14} /> 本機自動儲存
              </div>
              <div className="w-px bg-slate-600 h-4"></div>
              <button
                onClick={clearLocalData}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-100 hover:bg-red-500/20 rounded transition-colors"
              >
                <Trash2 size={14} /> 清除本機暫存
              </button>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`px-4 py-2 text-sm text-center font-medium animate-fadeIn ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className={`flex-1 p-6 md:p-10 overflow-y-auto transition-colors ${isEditable ? 'bg-slate-50' : 'bg-gray-100'}`}>
          <div className="max-w-4xl mx-auto pb-20">
            {!isEditable && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg flex items-center justify-center gap-2">
                <Eye size={16} /> 目前為預覽模式。如需修改內容，請點擊右上角「進入編輯模式」。
              </div>
            )}

            <TreeNode
              node={treeData}
              onUpdate={handleUpdateNode}
              onAddChild={handleAddChild}
              onAddSibling={handleAddSibling}
              onDelete={handleDeleteNode}
              isEditable={isEditable}
            />
            <div className="pl-8 relative mt-2">
              <div className="absolute top-0 left-[-20px] h-8 w-px bg-gray-300 transform -translate-x-1/2"></div>
              <div className="absolute top-8 left-[-23px] w-2 h-2 rounded-full bg-gray-300 transform -translate-x-1/2"></div>
              <div className="ml-4 p-3 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">流程結束</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
