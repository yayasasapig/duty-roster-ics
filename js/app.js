lucide.createIcons();
    function updateMonthLabel(){var d=new Date(currentWardDate);document.getElementById('currentMonthLabel').textContent=d.getFullYear()+'\u5e74'+(d.getMonth()+1)+'\u6708';}
    updateMonthLabel();
    document.getElementById('prevMonth').addEventListener('click',function(){
      var p=new Date(currentWardDate);p.setMonth(p.getMonth()-1);
      var parts=currentWardDate.split('-');var day=parseInt(parts[2]);
      var lastDay=new Date(p.getFullYear(),p.getMonth()+1,0).getDate();
      if(p.getDate()>lastDay)p.setDate(lastDay);
      if(p>=new Date(MIN_DATE)&&p<=new Date(MAX_DATE)){
        currentWardDate=p.toISOString().split('T')[0];
        updateMonthLabel();
        if(document.getElementById('tabWard').classList.contains('active'))renderWardView();
      }
    });
    document.getElementById('nextMonth').addEventListener('click',function(){
      var p=new Date(currentWardDate);p.setMonth(p.getMonth()+1);
      var parts=currentWardDate.split('-');var day=parseInt(parts[2]);
      var lastDay=new Date(p.getFullYear(),p.getMonth()+1,0).getDate();
      if(p.getDate()>lastDay)p.setDate(lastDay);
      if(p>=new Date(MIN_DATE)&&p<=new Date(MAX_DATE)){
        currentWardDate=p.toISOString().split('T')[0];
        updateMonthLabel();
        if(document.getElementById('tabWard').classList.contains('active'))renderWardView();
      }
    });
    const tabs=document.querySelectorAll('.tab-btn');
    const panels=document.querySelectorAll('.tab-panel');
    tabs.forEach(function(tab){tab.addEventListener('click',function(){
      var target=tab.dataset.tab;
      tabs.forEach(function(t){t.classList.toggle('active',t.dataset.tab===target);});
      panels.forEach(function(p){p.classList.toggle('hidden',p.id!=='panel'+(target.charAt(0).toUpperCase()+target.slice(1)));});
      if(target==='ward')renderWardView();
      if(target==='print')renderPrintView();
      lucide.createIcons();
    });});
    const shiftFilters={A:true,P:true,AN:true,OFF:true};
    const filterActiveClass={A:'bg-mint border-mint text-white',P:'bg-blue-400 border-blue-400 text-white',AN:'bg-violet-400 border-violet-400 text-white',OFF:'bg-slate-400 border-slate-400 text-white'};
    const filterInactiveClass={A:'bg-bg border-slate-200 text-slate-400',P:'bg-bg border-slate-200 text-slate-400',AN:'bg-bg border-slate-200 text-slate-400',OFF:'bg-bg border-slate-200 text-slate-400'};
    function updateFilterUI(){document.querySelectorAll('.shift-filter-btn').forEach(function(btn){var f=btn.dataset.filter;btn.className='shift-filter-btn px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 '+(shiftFilters[f]?filterActiveClass[f]:filterInactiveClass[f]);});}
    updateFilterUI();
    document.querySelectorAll('.shift-filter-btn').forEach(function(btn){btn.addEventListener('click',function(){var f=btn.dataset.filter;shiftFilters[f]=!shiftFilters[f];updateFilterUI();lucide.createIcons();applyShiftFilters();});});
    function isOffShift(shift){var s=shift.toUpperCase();return s==='WO'||s==='O'||s==='AL'||s==='NDD'||s==='MY1'||s==='MY2'||s==='SD'||s==='CCLV'||s.match(/^AP/)!==null;}
    function fmtDate(d){return d.getFullYear().toString()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}
    function fmtTime(h,m){return String(h).padStart(2,'0')+String(m).padStart(2,'0')+'00';}
    function makeVEVENT(dtstart,dtend,summary,uid){return['BEGIN:VEVENT','DTSTART;VALUE=DATE-TIME:'+dtstart+'+08:00','DTEND;VALUE=DATE-TIME:'+dtend+'+08:00','SUMMARY:'+summary,'UID:'+uid,'END:VEVENT'].join('\r\n');}
    function generateICS(staffId,startDate,endDate){var name=STAFF[staffId]||staffId;var events=[];var seq=0;for(var i=0;i<ROSTER_RAW.length;i++){var r=ROSTER_RAW[i];if(r[0]!==staffId||r[1]<startDate||r[1]>endDate)continue;var times=shiftToTimes(r[2]);if(!times)continue;var parts=r[1].split('-');var y=parseInt(parts[0]),mo=parseInt(parts[1])-1,d=parseInt(parts[2]);for(var j=0;j<times.length;j++){var t=times[j];var startDt=new Date(y,mo,d,t.sh,t.sm);var endDt=new Date(y,mo,d,t.eh,t.em);var dtstart=fmtDate(startDt)+'T'+fmtTime(t.sh,t.sm);var dtend=fmtDate(endDt)+'T'+fmtTime(t.eh,t.em);events.push(makeVEVENT(dtstart,dtend,shiftLabel(r[2])+' - '+name,r[1].replace(/-/g,'')+'-'+staffId+'-'+(++seq)+'@dutyroster'));}}var hdr=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PYNEH A5 Duty Roster//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:東區醫院A5病房更表 - '+name,'X-WR-TIMEZONE:Asia/Hong_Kong','BEGIN:VTIMEZONE','TZID:Asia/Hong_Kong','BEGIN:STANDARD','TZOFFSETFROM:+0800','TZOFFSETTO:+0800','TZNAME:HKT','DTSTART:19701025T020000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','BEGIN:DAYLIGHT','TZOFFSETFROM:+0800','TZOFFSETTO:+0800','TZNAME:HKT','DTSTART:19700405T020000','RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU','END:DAYLIGHT','END:VTIMEZONE'].join('\r\n');return[hdr].concat(events).concat(['END:VCALENDAR']).join('\r\n');}
    function shiftToTimes(shift){var s=shift.toUpperCase();if(isOffShift(shift))return null;if(s==='A5')return[{sh:7,sm:0,eh:15,em:0}];if(s==='P5')return[{sh:14,sm:0,eh:22,em:0}];if(s==='AN')return[{sh:7,sm:0,eh:14,em:0},{sh:21,sm:0,eh:23,em:59}];if(s==='N*')return[{sh:7,sm:0,eh:13,em:0}];if(s==='D*')return[{sh:7,sm:0,eh:15,em:0}];if(s==='D5')return[{sh:9,sm:0,eh:17,em:48}];return null;}
    function shiftLabel(shift){var s=shift.toUpperCase();var m={'\u300aA5\u300b':'\u8fd4A','\u300aP5\u300b':'\u8fd4P','\u300aAN\u300b':'\u8fd4AN','\u300aN*\u300b':'Sleeping','\u300aD*\u300b':'\u4e3b\u7ba1\u66f4','\u300aD5\u300b':'Renal\u57f9\u8a13'};return m[s]||shift;}
    function shiftTimeDesc(shift){var s=shift.toUpperCase();var m={'\u300aA5\u300b':'07:00\u201315:00','\u300aP5\u300b':'14:00\u201322:00','\u300aAN\u300b':'07:00\u201314:00 / 21:00\u201323:59','\u300aN*\u300b':'07:00\u201313:00','\u300aD*\u300b':'07:00\u201315:00','\u300aD5\u300b':'09:00\u201317:48'};return m[s]||'\u2014';}
    function getShiftCodeClass(shift){if(isOffShift(shift))return'bg-slate-400';var s=shift.toUpperCase();if(s==='AN')return'bg-violet-400';if(s==='N*'||s==='NDD')return'bg-indigo-400';if(s==='D5')return'bg-fuchsia-400';if(s.startsWith('D'))return'bg-rose-400';if(s.startsWith('A'))return'bg-mint';if(s.startsWith('P'))return'bg-blue-400';return'bg-slate-400';}
    function getPreviewData(staffId,start,end){var rows=[];for(var i=0;i<ROSTER_RAW.length;i++){var r=ROSTER_RAW[i];if(r[0]===staffId&&r[1]>=start&&r[1]<=end)rows.push({date:r[1],shift:r[2]});}rows.sort(function(a,b){return a.date.localeCompare(b.date);});return rows;}
    const staffSelect=document.getElementById('staffSelect');
    const startDate=document.getElementById('startDate');
    const endDate=document.getElementById('endDate');
    const downloadBtn=document.getElementById('downloadBtn');
    const previewBtn=document.getElementById('previewBtn');
    const msgBox=document.getElementById('msgBox');
    var staffKeys=Object.keys(STAFF).sort();
    staffKeys.forEach(function(id){var opt=document.createElement('option');opt.value=id;opt.textContent=id+'\u2014'+STAFF[id];staffSelect.appendChild(opt);});
    startDate.value='2026-03-01';endDate.value='2026-05-31';startDate.max='2026-05-31';endDate.min='2026-03-01';endDate.max='2026-05-31';
    function validateForm(){var staffOk=staffSelect.value!=='';var startOk=startDate.value!=='';var endOk=endDate.value!=='';var rangeOk=startOk&&endOk&&startDate.value<=endDate.value;var allOk=staffOk&&rangeOk;downloadBtn.disabled=!allOk;previewBtn.disabled=!allOk;}
    staffSelect.addEventListener('change',function(){
      localStorage.setItem('dutyRoster_lastStaffId', staffSelect.value);
      document.getElementById('previewArea').classList.add('hidden');
      validateForm();
    });
    startDate.addEventListener('change',function(){endDate.min=startDate.value;document.getElementById('previewArea').classList.add('hidden');validateForm();});
    endDate.addEventListener('change',function(){startDate.max=endDate.value;document.getElementById('previewArea').classList.add('hidden');validateForm();});
    previewBtn.addEventListener('click',function(){
      var data=getPreviewData(staffSelect.value,startDate.value,endDate.value);
      var area=document.getElementById('previewArea');
      var content=document.getElementById('previewContent');
      if(data.length===0){area.classList.remove('hidden');content.innerHTML='<div class="text-center py-8 text-slate3 text-sm">在指定日期範圍內找不到任何更期記錄<br><span class="text-xs text-slate-400 mt-1 block">請選擇 2026年3月 至 2026年5月 期間的日期範圍</span></div>';return;}
      var ics=generateICS(staffSelect.value,startDate.value,endDate.value);
      var wkday=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      var tableHtml='<div class="mb-4"><div class="flex items-center gap-2 mb-3"><button id="icsViewToggle" class="px-3 py-1.5 rounded-lg bg-mint/10 text-mint text-xs font-bold hover:bg-mint/20 transition-colors flex items-center gap-1.5"><i data-lucide="code" class="w-3.5 h-3.5" stroke-width="2"></i>檢視原始 ICS</button><span class="text-xs text-slate-400">顯示更期摘要表格</span></div><div id="icsRawBlock" class="hidden mb-4"><pre class="bg-slate-800 text-green-400 text-xs p-4 rounded-xl overflow-x-auto max-h-80 font-mono leading-relaxed">'+ics.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre></div></div>';
      tableHtml+='<div class="overflow-x-auto"><table class="w-full text-sm border-collapse"><thead><tr class="bg-bg"><th class="text-left px-3 py-2 text-xs font-bold text-slate3 uppercase tracking-wider border-b border-border">日期</th><th class="text-left px-3 py-2 text-xs font-bold text-slate3 uppercase tracking-wider border-b border-border">星期</th><th class="text-left px-3 py-2 text-xs font-bold text-slate3 uppercase tracking-wider border-b border-border">班次</th><th class="text-left px-3 py-2 text-xs font-bold text-slate3 uppercase tracking-wider border-b border-border">時間</th><th class="text-left px-3 py-2 text-xs font-bold text-slate3 uppercase tracking-wider border-b border-border">說明</th></tr></thead><tbody>';
      for(var i=0;i<data.length;i++){
        var row=data[i];var parts=row.date.split('-');var y=parseInt(parts[0]),mo=parseInt(parts[1]),d=parseInt(parts[2]);
        var dt=new Date(y,mo-1,d);var w=wkday[dt.getDay()];
        var dayStr=(mo<10?'0':'')+mo+'/'+(d<10?'0':'')+d;
        var off=isOffShift(row.shift);var codeClass=off?'bg-slate-400':getShiftCodeClass(row.shift);
        tableHtml+='<tr class="'+(off?'text-slate-400':'hover:bg-bg/50')+' border-b border-border/50 transition-colors"><td class="px-3 py-2 font-mono text-xs">'+dayStr+'</td><td class="px-3 py-2 text-xs">'+w+'</td><td class="px-3 py-2"><span class="inline-block px-2 py-0.5 rounded text-xs font-bold text-white '+codeClass+'">'+row.shift+'</span></td><td class="px-3 py-2 text-xs text-slate3 font-mono">'+shiftTimeDesc(row.shift)+'</td><td class="px-3 py-2 text-xs text-slate3">'+(off?'放假':'')+'</td></tr>';
      }
      tableHtml+='</tbody></table></div>';area.classList.remove('hidden');content.innerHTML=tableHtml;lucide.createIcons();
      document.getElementById('icsViewToggle').addEventListener('click',function(){
        var blk=document.getElementById('icsRawBlock');blk.classList.toggle('hidden');
        this.innerHTML=blk.classList.contains('hidden')?'<i data-lucide="code" class="w-3.5 h-3.5" stroke-width="2"></i>檢視原始 ICS':'<i data-lucide="table" class="w-3.5 h-3.5" stroke-width="2"></i>返回摘要表格';
        lucide.createIcons();
      });
    });
    downloadBtn.addEventListener('click',function(){
      msgBox.className='hidden';
      var ics=generateICS(staffSelect.value,startDate.value,endDate.value);
      var blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
      var url=URL.createObjectURL(blob);var a=document.createElement('a');
      a.href=url;a.download='A5_'+staffSelect.value+'_'+startDate.value+'_'+endDate.value+'.ics';
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
      var rawRows=getPreviewData(staffSelect.value,startDate.value,endDate.value);
      var eventCount=0;for(var i=0;i<rawRows.length;i++){var t=shiftToTimes(rawRows[i].shift);eventCount+=t?t.length:0;}
      var offCount=0;for(var i=0;i<rawRows.length;i++){if(isOffShift(rawRows[i].shift))offCount++;}
      var workCount=rawRows.length-offCount;
      msgBox.innerHTML=workCount>0?'<i data-lucide="check-circle" class="w-4 h-4" stroke-width="2"></i> \u5df2\u4e0b\u8f09\uff0c\u5171 <b>'+eventCount+'</b> \u500b\u884c\u4e8b\u6bdc\u6e1b\u4e8b\u4ef6\uff08'+workCount+' \u500b\u5de5\u4f5c\u5929\uff09':'<i data-lucide="alert-triangle" class="w-4 h-4" stroke-width="2"></i> \u5728\u6307\u5b9a\u65e5\u671f\u7bc4\u570f\u5167\u627e\u4e0d\u5230\u5de5\u4f5c\u73ed\u6b21';
      msgBox.className='mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 '+(workCount>0?'bg-green-50 text-green-700':'bg-amber-50 text-amber-700');
      lucide.createIcons();
    });
    const MIN_DATE='2026-03-01';const MAX_DATE='2026-05-31';let currentWardDate=MIN_DATE;let wardSearchQuery='';
    function applyShiftFilters(){
      var rows=document.querySelectorAll('.ward-row[data-shift]');
      rows.forEach(function(row){
        var shift=row.getAttribute('data-shift');var u=shift.toUpperCase();
        var isOff=u==='WO'||u==='O'||u==='AL'||u==='NDD'||u==='MY1'||u==='MY2'||u==='SD'||u==='CCLV'||u.match(/^AP/)!==null;
        if(isOff){row.classList.toggle('hidden',!shiftFilters.OFF);return;}
        if(u==='A5'){row.classList.toggle('hidden',!shiftFilters.A);return;}
        if(u==='P5'){row.classList.toggle('hidden',!shiftFilters.P);return;}
        if(u==='AN'){row.classList.toggle('hidden',!shiftFilters.AN);return;}
      });
    }
    function renderWardView(){
      const dateStr=currentWardDate;const parts=dateStr.split('-');
      const y=parseInt(parts[0]),mo=parseInt(parts[1]),d=parseInt(parts[2]);
      const wkday=['\u661f\u671f\u65e5','\u661f\u671f\u4e00','\u661f\u671f\u4e8c','\u661f\u671f\u4e09','\u661f\u671f\u56db','\u661f\u671f\u4e94','\u661f\u671f\u516d'];
      const dt=new Date(y,mo-1,d);const dayLabel=wkday[dt.getDay()];const dateLabel=mo+'\u6708'+d+'\u65e5 '+dayLabel;
      const rotaMap={};for(var i=0;i<ROSTER_RAW.length;i++){var r=ROSTER_RAW[i];if(r[1]===dateStr)rotaMap[r[0]]=r[2];}
      const groups=[{key:'WM',label:'WM \u75c5\u623f\u7d93\u7406',ids:[]},{key:'APN',label:'APN \u9ad8\u7d1a\u8b77\u5e2b',ids:[]},{key:'RN',label:'RN \u6ce8\u518a\u8b77\u5e2b',ids:[]},{key:'EN',label:'EN \u767b\u8a18\u8b77\u5e2b',ids:[]},{key:'LOC',label:'Locum \u66ff\u5047\u8b77\u5e2b',ids:[]}];
      const staffKeys2=Object.keys(STAFF).sort();
      for(var i=0;i<staffKeys2.length;i++){var sid=staffKeys2[i];if(sid.startsWith('WM'))groups[0].ids.push(sid);else if(sid.startsWith('APN'))groups[1].ids.push(sid);else if(sid.startsWith('RN'))groups[2].ids.push(sid);else if(sid.startsWith('EN'))groups[3].ids.push(sid);else groups[4].ids.push(sid);}
      let totalWork=0,totalOff=0;const rotaVals=Object.values(rotaMap);
      if (rotaVals.length === 0) {
        var dataRangeHint='資料覆盖 2026年3月 至 2026年5月，請選擇該範圍內的工作日';document.getElementById('wardContent').innerHTML='<div class="text-center py-12 text-slate3"><div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><i data-lucide="calendar-x" class="w-8 h-8 text-slate-400" stroke-width="1.5"></i></div><p class="text-base font-medium text-slate2 mb-1">此日期暫無更表資料</p><p class="text-sm text-slate-400">'+dataRangeHint+'</p><button onclick="document.getElementById(\'wardTodayBtn\').click()" class="mt-4 px-4 py-2 rounded-xl bg-mint/10 text-mint text-sm font-bold hover:bg-mint/20 transition-colors">跳到今日</button></div>';
        document.getElementById('wardStats').innerHTML='';
        lucide.createIcons();
        return;
      }
      for(var i=0;i<rotaVals.length;i++){if(isOffShift(rotaVals[i]))totalOff++;else totalWork++;}
      const unassigned=Object.keys(STAFF).length-totalWork-totalOff;
      document.getElementById('wardStats').innerHTML='<div class="px-3 py-1.5 rounded-full text-xs font-bold bg-mint/10 text-mint flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> \u4e0a\u73ed <span class="text-base ml-1">'+totalWork+'</span></div>'+'<div class="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-3 flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/></svg> \u653e\u5047 <span class="text-base ml-1">'+totalOff+'</span></div>'+(unassigned>0?'<div class="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> \u672a\u6709\u66f4\u8868 <span class="text-base ml-1">'+unassigned+'</span></div>':'')+'<div class="px-3 py-1.5 rounded-full text-xs font-bold bg-bg text-slate-3 flex items-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> '+dateLabel+'</div>';
      const groupColors={WM:'bg-slate-2',APN:'bg-blue-500',RN:'bg-mint',EN:'bg-violet-400',LOC:'bg-slate-400'};
      var html='';
      groups.forEach(function(g){if(g.ids.length===0)return;html+='<div class="ward-group mb-4"><div class="ward-group-header rounded-t-xl px-4 py-2.5 text-white text-xs font-bold flex items-center justify-between '+groupColors[g.key]+'"><span>'+g.label+'</span><span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">'+g.ids.length+'</span></div><div class="ward-group-body border border-t-0 border-border rounded-b-xl overflow-hidden">';g.ids.forEach(function(id){const shift=rotaMap[id]||null;if(shift){const codeClass=getShiftCodeClass(shift);const shiftUpper=shift.toUpperCase();const fk=shiftUpper.startsWith('A')?'A':shiftUpper.startsWith('P')?'P':shiftUpper.startsWith('AN')?'AN':'OFF';const badgeLabel=shiftUpper==='AN'?'AN<span class="text-[9px] ml-0.5 opacity-75">1+2</span>':shift;html+='<div class="ward-row flex items-center gap-3 px-4 py-2.5 border-b border-border/50 hover:bg-bg/60 transition-colors '+(shiftFilters[fk]?'':'hidden')+'" data-shift="'+shiftUpper+'" data-search="'+(STAFF[id]+' '+id).toLowerCase()+'"><div class="flex-1 min-w-0"><span class="font-medium text-slate2 text-sm truncate block">'+STAFF[id]+'</span><span class="text-xs text-slate3 font-mono">'+id+'</span></div><span class="inline-block px-2 py-0.5 rounded text-xs font-bold text-white '+codeClass+'">'+badgeLabel+'</span><span class="text-xs text-slate3 hidden sm:block">'+shiftLabel(shift)+' \u00b7 '+shiftTimeDesc(shift)+'</span></div>';}else{html+='<div class="ward-row flex items-center gap-3 px-4 py-2.5 border-b border-border/50 hover:bg-bg/60 transition-colors" data-search="'+(STAFF[id]+' '+id).toLowerCase()+'"><div class="flex-1 min-w-0"><span class="font-medium text-slate2 text-sm truncate block">'+STAFF[id]+'</span><span class="text-xs text-slate3 font-mono">'+id+'</span></div><span class="text-xs text-slate-400 italic">\u672a\u6392\u66f4</span></div>';}});html+='</div></div>';});
      document.getElementById('wardContent').innerHTML=html||'<div class="text-center py-12 text-slate3"><div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><i data-lucide="calendar-x" class="w-8 h-8 text-slate-400" stroke-width="1.5"></i></div><p class="text-base font-medium text-slate2 mb-1">此日期暫無更表資料</p><p class="text-sm text-slate3">請嘗試選擇另一日期</p></div>';
      document.getElementById('wardDate').value=dateStr;
      applyShiftFilters();
      applyWardSearch();
    }
    function applyWardSearch(){
      var q=wardSearchQuery.trim().toLowerCase();
      document.querySelectorAll('.ward-row').forEach(function(row){
        var searchAttr=row.getAttribute('data-search')||'';
        var shiftAttr=row.getAttribute('data-shift')||'';
        var matchName=searchAttr.includes(q);
        var matchShift=q!==''&&(shiftAttr.includes(q.toUpperCase())||shiftAttr.toLowerCase().includes(q));
        row.classList.toggle('hidden',q!==''&&!matchName&&!matchShift);
      });
    }
    document.getElementById('wardPrevBtn').addEventListener('click',function(){var p=new Date(currentWardDate);p.setDate(p.getDate()-1);if(p>=MIN_DATE){currentWardDate=p.toISOString().split('T')[0];updateHash();renderWardView();}});
    document.getElementById('wardNextBtn').addEventListener('click',function(){var p=new Date(currentWardDate);p.setDate(p.getDate()+1);if(p<=MAX_DATE){currentWardDate=p.toISOString().split('T')[0];updateHash();renderWardView();}});
    document.getElementById('wardDate').addEventListener('change',function(){var v=this.value;if(v>=MIN_DATE&&v<=MAX_DATE){currentWardDate=v;updateHash();renderWardView();}});
    function renderPrintView(){
      var weekStart=document.getElementById('printWeekStart').value||'2026-03-02';
      var days=[];for(var i=0;i<7;i++){var d2=new Date(weekStart);d2.setDate(d2.getDate()+i);days.push(d2.toISOString().split('T')[0]);}
      var wkday=['\u661f\u671f\u65e5','\u661f\u671f\u4e00','\u661f\u671f\u4e8c','\u661f\u671f\u4e09','\u661f\u671f\u56db','\u661f\u671f\u4e94','\u661f\u671f\u516d'];
      var endDateObj=new Date(weekStart);endDateObj.setDate(endDateObj.getDate()+6);
      var endMonth=endDateObj.getMonth()+1,endDay=endDateObj.getDate();
      var startParts=weekStart.split('-');var startMonth=parseInt(startParts[1]),startDay=parseInt(startParts[2]);
      var dateRangeStr='\u300a'+startMonth+'\u6708'+startDay+'\u65e5\u81f3'+endMonth+'\u6708'+endDay+'\u65e5\u300b';
      var legendHtml='<div class="print-legend" style="margin-bottom:12px;padding:10px 14px;background:#f0f9f7;border:1px solid #E8EEF0;border-radius:12px;"><div style="font-size:16px;font-weight:700;color:#1E2A32;margin-bottom:2px;letter-spacing:0.03em;">\u6771\u5340\u91ab\u9662 A5 \u75c5\u623f\u66f4\u8868</div><div style="font-size:12px;color:#6B7C86;margin-bottom:10px;">'+dateRangeStr+'</div><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;"><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:28px;height:28px;background:#5BBCAD;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">A5</span><span style="font-size:11px;color:#6B7C86;font-family:JetBrains Mono,monospace;">07:00\u201315:00</span></span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:28px;height:28px;background:#3B82F6;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">P5</span><span style="font-size:11px;color:#6B7C86;font-family:JetBrains Mono,monospace;">14:00\u201322:00</span></span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:28px;height:28px;background:#8B5CF6;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">AN</span><span style="font-size:11px;color:#6B7C86;font-family:JetBrains Mono,monospace;">07:00\u201314:00 / 21:00\u201323:59</span></span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:28px;height:28px;background:#6366F1;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">N*</span><span style="font-size:11px;color:#6B7C86;font-family:JetBrains Mono,monospace;">07:00\u201313:00</span></span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:28px;height:28px;background:#F43F5E;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">D*</span><span style="font-size:11px;color:#6B7C86;font-family:JetBrains Mono,monospace;">\u4e3b\u7ba1\u66f4</span></span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:28px;height:28px;background:#D946EF;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">D5</span><span style="font-size:11px;color:#6B7C86;font-family:JetBrains Mono,monospace;">Renal\u57f9\u8a13</span></span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:28px;height:28px;background:#94A3B8;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">OFF</span><span style="font-size:11px;color:#6B7C86;">WO / O / AL / NDD / MY1 / SD / CCLV / AP* \u2014 \u653e\u5047</span></span></div></div>';
      var groupOrder=['WM','APN','RN','EN','L'];
      var groupNames={WM:'\u75c5\u623f\u7d93\u7406 WM',APN:'\u9ad8\u7d1a\u8b77\u5e2b APN',RN:'\u6ce8\u518a\u8b77\u5e2b RN',EN:'\u767b\u8a18\u8b77\u5e2b EN',L:'\u66ff\u5047 Locum'};
      var groupColor={WM:'#003087',APN:'#005EB8',RN:'#007F3B',EN:'#7B2D8B',L:'#37474F'};
      var html=legendHtml+'<div class="overflow-x-auto rounded-xl border border-border"><table class="print-table" style="border-collapse:collapse;width:100%;font-size:12px;table-layout:fixed;">';
      html+='<thead><tr><th class="staff-col" style="width:180px;background:#003087;color:#fff;text-align:left;padding:6px 8px;border:1px solid #000;font-weight:700;">\u7d93\u7406\u4eba\u54e1 / \u8cc7\u6e90</th>';
      days.forEach(function(day,i){var parts=day.split('-');var mo=parseInt(parts[1]),d2=parseInt(parts[2]);html+='<th style="padding:6px 4px;border:1px solid #000;background:#D0DCE8;font-weight:700;font-size:11px;text-align:center;">'+wkday[i].replace('\u661f\u671f','')+'<br>'+mo+'/'+d2+'</th>';});
      html+='<th style="width:140px;background:#F0F4F8;border:1px solid #000;font-weight:700;font-size:11px;text-align:center;">\u5098\u8a3b</th></tr></thead><tbody>';
      const rotaMap={};for(var i=0;i<ROSTER_RAW.length;i++){var r=ROSTER_RAW[i];if(days.indexOf(r[1])!==-1){if(!rotaMap[r[0]])rotaMap[r[0]]={};rotaMap[r[0]][r[1]]=r[2];}}
      groupOrder.forEach(function(gk){const ids=Object.keys(STAFF).filter(function(id){return id.startsWith(gk);}).sort();if(ids.length===0)return;html+='<tr><td colspan="9" style="background:'+groupColor[gk]+'!important;color:#fff;font-weight:700;font-size:12px;text-align:left;padding:6px 8px;border:1.5px solid #000;letter-spacing:0.03em;">'+groupNames[gk]+'</td></tr>';ids.forEach(function(id){html+='<tr><td class="staff-cell" style="text-align:left;font-size:11px;white-space:nowrap;padding:4px 6px;border:1px solid #333;"><span class="print-staff-name">'+STAFF[id]+'</span><br><span style="font-size:10px;color:#666;font-weight:400;">'+id+'</span></td>';days.forEach(function(day){const shift=rotaMap[id]&&rotaMap[id][day];if(shift){const off=isOffShift(shift);const codeClass=off?'print-off':getShiftCodeClass(shift);html+='<td style="text-align:center;vertical-align:middle;border:1px solid #333;padding:4px;"><span class="print-cell '+codeClass+'">'+shift+'</span></td>';}else{html+='<td style="background:#F5F5F5;text-align:center;vertical-align:middle;border:1px solid #333;padding:4px;"><span class="print-empty-cell"></span></td>';}});html+='<td class="notes-cell" style="background:#F9F9F9;border:1px solid #333;padding:4px;"></td></tr>';});html+='<tr><td colspan="9" style="border:none;height:6px;background:transparent;"></td></tr>';});
      html+='<tr class="print-footer-row"><td colspan="9" style="background:#F0F4F8;border-top:2px solid #000;font-size:11px;text-align:left;padding:8px 10px;"><div class="print-footer-check"><label>\u6aa2\u6c42\u4eba \u7b71\u8f49:</label><input type="checkbox" style="width:14px;height:14px;"/><label>\u6aa2\u6c42\u4eba \u7b71\u8f49:</label><input type="checkbox" style="width:14px;height:14px;"/><label>\u4ee3\u7406\u8ab2\u9577:</label><input type="checkbox" style="width:14px;height:14px;"/></div></td></tr>';
      html+='</tbody></table></div>';
      html+='<div class="flex gap-2 mt-4 no-print"><button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate2 text-white text-sm font-semibold flex items-center gap-2 hover:bg-slate-700 transition-colors"><i data-lucide="printer" class="w-4 h-4" stroke-width="2"></i>\u6253\u5370</button><button id="copyPrintBtn" onclick="copyPrintTable()" class="px-4 py-2 rounded-xl border border-border text-slate2 text-sm font-semibold flex items-center gap-2 hover:bg-bg transition-colors"><i data-lucide="clipboard" class="w-4 h-4" stroke-width="2"></i>\u8907\u88fd\u5230\u5265\u8cbc\u677f</button></div>';
      window.copyPrintTable=function(){
        var tbl=document.querySelector('.print-table');
        if(!tbl){alert('\u7b49\u5f85\u5217\u8868\u52a0\u8f09\u5b8c\u6210');return;}
        var txt=Array.from(tbl.querySelectorAll('tr')).map(function(row){
          return Array.from(row.querySelectorAll('th,td')).map(function(cell){return cell.textContent.trim();}).join('\t');
        }).join('\n');
        navigator.clipboard.writeText(txt).then(function(){
          var btn=document.getElementById('copyPrintBtn');
          var orig=btn.innerHTML;
          btn.innerHTML='<i data-lucide="check" class="w-4 h-4" stroke-width="2"></i>\u5df2\u8907\u88fd\uff01';
          btn.classList.add('bg-green-50','text-green-600','border-green-200');
          lucide.createIcons();
          setTimeout(function(){btn.innerHTML=orig;btn.classList.remove('bg-green-50','text-green-600','border-green-200');lucide.createIcons();},2000);
        }).catch(function(){alert('\u8907\u88fd\u593e\u593e\u5931\u6557\uff0c\u8acb\u624b\u52d5\u8907\u88fd');});
      };
      document.getElementById('printContent').innerHTML=html;
      document.getElementById('printWeekStart').value=weekStart;
    }
    document.getElementById('printPrevBtn').addEventListener('click',function(){var p=new Date(document.getElementById('printWeekStart').value||'2026-03-02');p.setDate(p.getDate()-7);document.getElementById('printWeekStart').value=p.toISOString().split('T')[0];renderPrintView();});
    document.getElementById('printNextBtn').addEventListener('click',function(){var p=new Date(document.getElementById('printWeekStart').value||'2026-03-02');p.setDate(p.getDate()+7);document.getElementById('printWeekStart').value=p.toISOString().split('T')[0];renderPrintView();});
    document.getElementById('printWeekStart').addEventListener('change',function(){renderPrintView();});
    document.getElementById('wardSearch').addEventListener('input',function(){
      wardSearchQuery=this.value;
      applyWardSearch();
    });

    // #15: Quick date navigation - next week, prev week
    document.getElementById('wardNextWeekBtn')&&document.getElementById('wardNextWeekBtn').addEventListener('click',function(){
      var p=new Date(currentWardDate);p.setDate(p.getDate()+7);
      if(p<=new Date(MAX_DATE)){currentWardDate=p.toISOString().split('T')[0];updateHash();renderWardView();}
    });
    document.getElementById('wardPrevWeekBtn')&&document.getElementById('wardPrevWeekBtn').addEventListener('click',function(){
      var p=new Date(currentWardDate);p.setDate(p.getDate()-7);
      if(p>=new Date(MIN_DATE)){currentWardDate=p.toISOString().split('T')[0];updateHash();renderWardView();}
    });
    document.getElementById('wardTodayBtn').addEventListener('click',function(){
      var today=new Date();
      var y=today.getFullYear(),m=today.getMonth()+1,d=today.getDate();
      var todayStr=y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      if(todayStr>=MIN_DATE&&todayStr<=MAX_DATE){
        currentWardDate=todayStr;
        updateHash();renderWardView();
      }
    });
    var savedStaffId = localStorage.getItem('dutyRoster_lastStaffId');
    if (savedStaffId && STAFF[savedStaffId]) {
      staffSelect.value = savedStaffId;
    }
    validateForm();

  // #10: URL hash for date sharing
  function updateHash(){history.replaceState(null,'',location.pathname+'#date='+currentWardDate);}
  function readHash(){
    var m=location.hash.match(/date=(\d{4}-\d{2}-\d{2})/);
    if(m&&m[1]>=MIN_DATE&&m[1]<=MAX_DATE){currentWardDate=m[1];updateMonthLabel();renderWardView();}
  }
  readHash();

  // PWA: register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // Offline banner
  function showOffline() {
    const b = document.createElement('div');
    b.id = 'offline-banner';
    b.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate2 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50 flex items-center gap-2';
    b.innerHTML = '<i data-lucide="wifi-off" class="w-4 h-4"></i> 離線模式';
    document.body.appendChild(b);
    if (window.lucide) lucide.createIcons();
  }
  function hideOffline() {
    const b = document.getElementById('offline-banner');
    if (b) b.remove();
  }
  window.addEventListener('offline', showOffline);
  window.addEventListener('online', hideOffline);
  if (!navigator.onLine) showOffline();

  validateForm();
