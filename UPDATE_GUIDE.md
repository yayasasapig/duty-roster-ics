# 如何更新更表數據（data.js）

目前 `data.js` 為靜態 JavaScript 檔案，需手動更新。以下說明資料格式及更新流程。

---

## 📋 ROSTER_RAW 資料格式

`ROSTER_RAW` 是一個二維陣列，每筆記錄格式：

```javascript
[員工ID, "YYYY-MM-DD", 班次代碼]
```

**範例：**
```javascript
["RN001", "2026-03-02", "A5"]   // RN001 在 2026-03-02 上 A5 班（07:00–15:00）
["RN008", "2026-03-02", "WO"]  // RN008 在 2026-03-02放假（WO = Week Off）
["APN001", "2026-03-03", "P5"] // APN001 在 2026-03-03 上 P5 班（14:00–22:00）
```

---

## 🗂️ STAFF 名冊格式

```javascript
const STAFF = {
  "WM001": "CHOW, HANG LUNG ANTHONY",
  "RN001": "TSUI, KI CHUN",
  // ...
};
```

格式：`"員工ID": "姓名"`

---

## 🔄 更新步驟

### Step 1：取得最新更表
從醫院系統或主管處取得最新更表（通常為 Excel 或 PDF 格式）。

### Step 2：確認日期範圍
記下開始日期（如 `2026-03-01`）和結束日期（如 `2026-05-31`），以及 MIN_DATE / MAX_DATE 的相應更新。

### Step 3：轉換資料格式
將原始更表轉換為 `[ID, "日期", 班次]` 格式。

**班次代碼對照：**
| 代碼 | 意義 | 是否產生 Calendar 事件 |
|------|------|----------------------|
| `A5` | 早班 07:00–15:00 | ✅ |
| `P5` | 中班 14:00–22:00 | ✅ |
| `AN` | 上午 + 夜班（07–14 / 21–23:59）| ✅ |
| `N*` | 夜班 07:00–13:00 | ✅ |
| `D*` | 主管更 07:00–15:00 | ✅ |
| `D5` | Renal 培訓 09:00–17:48 | ✅ |
| `WO` | 週假 | ❌（放假）|
| `O` | 年假（Off）| ❌ |
| `AL` | 年假（Annual Leave）| ❌ |
| `NDD` | 無薪假 | ❌ |
| `MY1/MY2` | 義工假 | ❌ |
| `SD` | 病假 | ❌ |
| `CCLV` | 補償假 | ❌ |
| `AP1/AP2/AP3...` | 補假（Appear）| ❌ |

### Step 4：編輯 data.js
1. 用文字編輯器打開 `data.js`
2. 更新 `ROSTER_RAW` 陣列（通常在檔案底部）
3. 如有新員工，更新 `STAFF` 名冊
4. 如日期範圍改變，更新 `MIN_DATE`（最早日期）和 `MAX_DATE`（最遠日期）

### Step 5：更新 HTML 中的日期範圍
在 `index.html` 中搜尋以下位置，更新硬編碼的日期範圍：
```javascript
startDate.value='2026-03-01';endDate.value='2026-05-31';startDate.max='2026-05-31';endDate.min='2026-03-01';endDate.max='2026-05-31';
```

---

## ⚡ 長期自動化方案建議

### 方案 A：Google Sheets + Apps Script
1. 建立 Google Sheet 作為更表資料庫
2. 用 Apps Script 自動匯出為 CSV/JSON
3. GitHub Actions 定期 fetch 更新

### 方案 B：iCal Feed（需醫院系統支援）
部分醫院更表系統支援 iCal 輸出，可直接引入 feed URL，自動同步到 Google Calendar。

### 方案 C：Zapier / Make.com
連結醫院更表系統（Email/Excel）→ 自動轉換 → 更新 data.js 或直接觸發 GitHub commit。

### 方案 D：醫院 API（需 IT 支援）
如醫院有 REST API，直接串接定時拉取更表資料。

---

## 🔧 快速確認清單

更新前請確認：
- [ ] 日期格式為 `YYYY-MM-DD`
- [ ] 員工 ID 與 `STAFF` 名冊一致
- [ ] 放假（WO/O/AL 等）不產生 Calendar 事件
- [ ] MIN_DATE / MAX_DATE 範圍涵蓋新數據
- [ ] `startDate` / `endDate` input 的 min/max 已更新

---

## 📝 注意事項

- **data.js 更新後需重新 commit 到 Git**，GitHub Pages 才會自動更新（約 1–2 分鐘）
- 若更表數據過期，Ward View 會显示「未排班」而不是錯誤，影響較小
- 建議至少每月更新一次，或在收到新更表時立即更新