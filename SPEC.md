# 東區醫院 A5 更表網頁 — 設計規格書

**日期：** 2026-04-18
**負責：** Orchestrator arFU
**版本：** 1.0

---

## 1. 概念與願景

一個為香港東區醫院護士而設的更表查詢工具——乾淨、暖調、不浪費時間。不是嘩眾取寵的網頁，是凌晨三點想確認明日更表時，會多謝的介面。

**關鍵詞：** 暖色、清晰、護士友好、夜班適用

---

## 2. 設計語言

### 色盤（Palette）
| 用途 | 色碼 | 備註 |
|------|------|------|
| 背景 | `#fafcfb` | 暖白 |
| 卡片 | `#ffffff` | 純白 |
| 主色 | `#5BBCAD` | 薄荷綠 |
| 次色 | `#7BA09E` | 灰青 |
| 文字主 | `#1E2A32` | 深石墨 |
| 文字副 | `#6B7C86` | 中灰 |
| 邊框 | `#E8EEF0` | 淺灰線 |
| 強調 | `#E07A5F` | 暖橙（只在緊急時用）|

### 字體
- **標題：** Outfit（Sans-serif）
- **內文：** Outfit
- **代碼/時間：** JetBrains Mono（monospace）

### 圓角與間距
- 卡片：`rounded-2xl`（~16px）
- 按鈕：`rounded-xl`（~12px）
- 內距：Standard `p-6` / `p-8`
- 間距：`gap-4` 或 `gap-6`

### 陰影
- 卡片：`shadow-[0_2px_12px_rgba(0,0,0,0.06)]`
- 按鈕 hover：`shadow-[0_4px_16px_rgba(0,0,0,0.10)]`

### 動效（適度）
- `transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`
- Hover：`-translate-y-[1px]` + 陰影加深
- Focus：`ring-2 ring-[#5BBCAD]/30`

---

## 3. 佈局結構

```
┌──────────────────────────────────────┐
│  HEADER：醫院名 + 病房名 + 月份       │
├──────────────────────────────────────┤
│  CONTROL BAR                         │
│  [姓名揀選] [日期範圍] [下載按鈕]    │
├──────────────────────────────────────┤
│  班次代碼說明（摺疊式）              │
├──────────────────────────────────────┤
│  更表預覽區（主要內容）              │
│  日曆視圖 / 列表視圖切換             │
├──────────────────────────────────────┤
│  FOOTER：版權 + GitHub 連結          │
└──────────────────────────────────────┘
```

### 響應式策略
- Desktop：`max-w-5xl mx-auto`
- Mobile：`w-full px-4 py-6`，控制欄垂直堆疊

---

## 4. 功能模組

### 4.1 Header
- 醫院 icon（SVG/Lucide） + 名稱
- 病房名（`A5` 加粗）
- 月份切換（< > 箭頭）

### 4.2 控制欄
- **護士姓名：** 下拉揀選
- **日期範圍：** 起始/終止 datepicker
- **預覽按鈕：** 主色 solid button
- **下載按鈕：** 次色 outline button

### 4.3 班次代碼說明
- 內嵌面板（非摺疊）
- 色碼標籤（例：`A5` = 薄荷綠 chip）

### 4.4 更表預覽
- 表格視圖：每行顯示日期、星期、班次代碼、時間
- 今日不特別高亮
- 預覽區在按鈕下方展開

### 4.5 Footer
- 低對比度文字
- GitHub Repo 連結

---

## 5. 組件清單

| 組件 | 狀態 |
|------|------|
| Button（Primary / Secondary） | default, hover, active, disabled |
| Select Dropdown | default, open, selected |
| Date Picker | default, selected |
| Shift Chip（色碼標籤） | 每種班次代碼一個顏色 |
| Table Row | default, hover, off-shift (muted) |
| Msg Box | success, warning, info |
| Tab | active, inactive |

---

## 6. 技術棧

- **框架：** 純 HTML + Vanilla JS（最簡單，維護成本低）
- **樣式：** Tailwind CSS（CDN）
- **圖標：** Lucide Icons（CDN）
- **字體：** Google Fonts（Outfit + JetBrains Mono）
- **數據：** `data.js`（現有，不改動）

---

## 7. 排斥清單

- ❌ 深色模式（除非用戶要求）
- ❌ 卡通/幼稚設計
- ❌ emoji（使用 Lucide icons 代替）
- ❌ 第三方 analytics

---

*本規格由 Orchestrator arFU 撰寫，用於指導 Builder Agent 執行。*
