
    "use strict";
    const byId = id => document.getElementById(id);
    const STATE_LABELS = ["NEW","READY","RUNNING","WAITING","TERMINATED"];
    let processes = [], selectedPid = null, nextPid = 1001, runningPid = null, cpuTicks = 0, contextSwitchCount = 0, events = [];
    const stamp = () => new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const selected = () => processes.find(p => p.pid === selectedPid) || null;
    const running = () => processes.find(p => p.pid === runningPid) || null;
    const findReady = () => processes.find(p => p.state === 'READY') || null;
    function log(message){ events.unshift({time:stamp(),message}); if(events.length>80) events.pop(); }
    function note(message){byId('hint').textContent=message;}
    function makeProcess(name, state='NEW'){
      const process = {pid:nextPid++,name:name||'Proses',state,pc:0,ax:0,ticks:0};
      processes.push(process); selectedPid=process.pid; return process;
    }
    function createProcess(){
      if(processes.length>=30){note('Batas contoh 30 proses. Reset untuk memulai ulang.');return;}
      const name=byId('processName').value.trim() || `Proses ${nextPid}`;
      const p=makeProcess(name); log(`${p.name} (PID ${p.pid}) dibuat: NEW.`);
      byId('processName').value=`Proses ${String.fromCharCode(65+Math.min(processes.length,25))}`;
      note(`PID ${p.pid} dibuat. Klik “New → Ready” untuk menerima proses ke antrean.`); render();
    }
    function admit(){const p=selected();if(!p||p.state!=='NEW')return;p.state='READY';log(`PID ${p.pid}: NEW → READY (diterima ke antrean).`);note(`Proses ${p.name} siap. Pilih “Ready → Running” saat CPU kosong.`);render();}
    function dispatch(){const p=selected();if(!p||p.state!=='READY'||running())return;p.state='RUNNING';runningPid=p.pid;log(`Dispatcher menjalankan PID ${p.pid}: READY → RUNNING, PC=${p.pc}.`);note(`${p.name} memakai CPU. Klik Eksekusi 1 Tick, Waiting, atau siapkan proses lain untuk context switch.`);render();}
    function tick(){const p=running();if(!p)return;p.pc++;p.ax=(p.ax+3)%256;p.ticks++;cpuTicks++;log(`PID ${p.pid} mengeksekusi 1 tick. PC=${p.pc}, AX=${p.ax}.`);note(`CPU menjalankan ${p.name}. Program Counter naik menjadi ${p.pc} (nilai simulasi).`);render();}
    function doSwitch(){
      const old=running();if(!old)return;
      const target=selected() && selected().state==='READY' ? selected() : findReady();
      if(!target){note('Context switch memerlukan proses RUNNING dan setidaknya satu proses READY. Buat proses kedua dahulu.');return;}
      old.state='READY';target.state='RUNNING';runningPid=target.pid;selectedPid=target.pid;contextSwitchCount++;
      log(`CONTEXT SWITCH #${contextSwitchCount}: konteks PID ${old.pid} disimpan (PC=${old.pc}, AX=${old.ax}); PID ${target.pid} dipulihkan (PC=${target.pc}, AX=${target.ax}).`);
      note(`CPU beralih dari ${old.name} ke ${target.name}. Nilai PC dan AX milik proses sebelumnya tetap tersimpan.`);render();
    }
    function waitIO(){const p=selected();if(!p||p.pid!==runningPid)return;p.state='WAITING';runningPid=null;log(`PID ${p.pid}: RUNNING → WAITING (menunggu I/O; PC=${p.pc} disimpan).`);note(`${p.name} kini menunggu I/O. Klik “Waiting → Ready” setelah I/O dianggap selesai.`);render();}
    function wakeIO(){const p=selected();if(!p||p.state!=='WAITING')return;p.state='READY';log(`PID ${p.pid}: WAITING → READY (I/O selesai).`);note(`${p.name} kembali siap. CPU dapat menjalankannya jika sedang kosong.`);render();}
    function finish(){const p=selected();if(!p||p.pid!==runningPid)return;p.state='TERMINATED';runningPid=null;log(`PID ${p.pid}: RUNNING → TERMINATED (eksekusi selesai).`);note(`${p.name} selesai. Proses ini tidak bisa dijalankan kembali.`);render();}
    function demo(){
      reset(false);const a=makeProcess('Editor Dokumen','RUNNING');a.pc=8;a.ax=24;a.ticks=8;runningPid=a.pid;
      const b=makeProcess('Browser','READY');b.pc=3;b.ax=9;b.ticks=3;
      const c=makeProcess('Pemutar Musik','WAITING');c.pc=4;c.ax=12;c.ticks=4;
      cpuTicks=15;selectedPid=b.pid;
      log('Contoh siap: Editor menggunakan CPU, Browser menunggu READY, Musik menunggu I/O.');
      note('Mode demo siap. Browser (READY) telah dipilih. Klik “Context Switch” untuk mengalihkan CPU dari Editor ke Browser.');render();
    }
    function reset(withMessage=true){processes=[];selectedPid=null;nextPid=1001;runningPid=null;cpuTicks=0;contextSwitchCount=0;events=[];if(withMessage){note('Simulasi telah direset. Mulai dengan tombol “+ Buat Proses”.');}render();}
    function exportLog(){
      if(!processes.length){note('Belum ada hasil simulasi. Buat atau jalankan proses terlebih dahulu.');return;}
      const lines=["PROCESSLAB — LAPORAN DEMO KELOMPOK 3","Simulator pendidikan, bukan data proses Windows asli.",`Tanggal: ${new Date().toLocaleString('id-ID')}`,`Total proses: ${processes.length}`,`CPU Tick: ${cpuTicks}`,`Context switch: ${contextSwitchCount}`,"", "DATA PCB:",...processes.map(p=>`PID ${p.pid} | ${p.name} | ${p.state} | PC=${p.pc} | AX=${p.ax} | Tick=${p.ticks}`),"","RIWAYAT:",...events.slice().reverse().map(e=>`[${e.time}] ${e.message}`)];
      const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='hasil_simulasi_kelompok_3.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);note('Laporan TXT telah dibuat dari kondisi simulasi saat ini.');
    }
    function render(){
      const chosen=selected();const current=running();
      byId('processList').replaceChildren();
      if(!processes.length){const e=document.createElement('div');e.className='empty';e.textContent='Belum ada proses. Klik “Buat Proses” atau “Siapkan Demo”.';byId('processList').appendChild(e);}
      processes.forEach(p=>{const row=document.createElement('button');row.type='button';row.className=`process-entry${chosen&&p.pid===chosen.pid?' selected':''}`;row.setAttribute('aria-pressed',String(Boolean(chosen&&p.pid===chosen.pid)));const left=document.createElement('span');const name=document.createElement('strong');name.textContent=p.name;const pid=document.createElement('small');pid.textContent=`PID ${p.pid} · ${p.ticks} tick`;left.append(name,pid);const status=document.createElement('span');status.className=`pill ${p.state.toLowerCase()}`;status.textContent=p.state;row.append(left,status);row.addEventListener('click',()=>{selectedPid=p.pid;note(`Memilih ${p.name} (PID ${p.pid}). Status saat ini: ${p.state}.`);render();});byId('processList').appendChild(row);});
      byId('cpuName').textContent=current?current.name:'Idle — belum ada proses';byId('cpuDesc').textContent=current?`PID ${current.pid} · PC=${current.pc} · AX=${current.ax}`:'CPU menunggu penjadwalan proses';
      byId('metricProcesses').textContent=processes.length;byId('metricTicks').textContent=cpuTicks;byId('metricSwitches').textContent=contextSwitchCount;
      byId('pcbPid').textContent=chosen?chosen.pid:'—';byId('pcbState').textContent=chosen?chosen.state:'—';byId('pcbPc').textContent=chosen?chosen.pc:'—';byId('pcbReg').textContent=chosen?chosen.ax:'—';byId('pcbName').textContent=chosen?chosen.name:'Belum ada proses dipilih';
      STATE_LABELS.forEach(s=>{const el=document.querySelector(`.stage-card[data-state="${s}"]`);const count=processes.filter(p=>p.state===s).length;el.querySelector('.stage-count').textContent=count;el.classList.toggle('is-active',count>0);});
      for(const [id,state] of [['readyQueue','READY'],['waitingQueue','WAITING']]){const q=byId(id);q.replaceChildren();const queue=processes.filter(p=>p.state===state);if(!queue.length){const span=document.createElement('span');span.className='tiny';span.textContent=state==='READY'?'Belum ada proses menunggu.':'Belum ada proses menunggu I/O.';q.appendChild(span);}queue.forEach(p=>{const chip=document.createElement('span');chip.className='queue-chip';chip.textContent=`${p.name} · ${p.pid}`;q.appendChild(chip);});}
      const entries=byId('eventLog');entries.replaceChildren();if(!events.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='Aktivitas simulasi akan ditampilkan di sini.';entries.appendChild(empty);}else events.forEach(e=>{const el=document.createElement('div');el.className='event';const t=document.createElement('time');t.textContent=e.time;const msg=document.createElement('b');msg.textContent=e.message;el.append(t,msg);entries.appendChild(el);});
      byId('btnAdmit').disabled=!chosen||chosen.state!=='NEW';byId('btnDispatch').disabled=!chosen||chosen.state!=='READY'||Boolean(current);byId('btnTick').disabled=!current;byId('btnSwitch').disabled=!current||!findReady();byId('btnWait').disabled=!chosen||chosen.pid!==runningPid;byId('btnWake').disabled=!chosen||chosen.state!=='WAITING';byId('btnFinish').disabled=!chosen||chosen.pid!==runningPid;byId('btnSelectRunning').disabled=!current;
    }
    byId('btnCreate').addEventListener('click',createProcess);
    byId('processName').addEventListener('keydown',e=>{if(e.key==='Enter')createProcess();});
    byId('btnAdmit').addEventListener('click',admit);byId('btnDispatch').addEventListener('click',dispatch);byId('btnTick').addEventListener('click',tick);byId('btnSwitch').addEventListener('click',doSwitch);byId('btnWait').addEventListener('click',waitIO);byId('btnWake').addEventListener('click',wakeIO);byId('btnFinish').addEventListener('click',finish);byId('btnSelectRunning').addEventListener('click',()=>{if(running()){selectedPid=runningPid;note('Proses yang sedang memakai CPU dipilih.');render();}});
    byId('btnExample').addEventListener('click',()=>{if(processes.length&& !confirm('Memuat contoh akan mengganti simulasi saat ini. Lanjutkan?'))return;demo();});
    byId('btnReset').addEventListener('click',()=>{if(processes.length&&!confirm('Hapus seluruh simulasi saat ini?'))return;reset();});
    byId('btnExport').addEventListener('click',exportLog);
    render();

    (function(){
      var triggers = document.querySelectorAll('.nav-trigger');
      var menus = document.querySelectorAll('.mega-menu');
      var backdrop = document.querySelector('.nav-backdrop');
      var openMenu = null;
      var closeTimer = null;

      function closeAll(){
        if (closeTimer){clearTimeout(closeTimer);closeTimer=null;}
        triggers.forEach(function(t){t.setAttribute('aria-expanded','false');});
        menus.forEach(function(m){m.setAttribute('aria-hidden','true');});
        if (backdrop) backdrop.setAttribute('aria-hidden','true');
        openMenu = null;
      }

      function openTrigger(trigger){
        var menuId = trigger.getAttribute('aria-controls');
        var menu = document.getElementById(menuId);
        closeAll();
        trigger.setAttribute('aria-expanded','true');
        menu.setAttribute('aria-hidden','false');
        backdrop.setAttribute('aria-hidden','false');
        openMenu = trigger;
      }

      triggers.forEach(function(trigger){
        trigger.addEventListener('click',function(){
          if (openMenu === trigger){closeAll();} else {openTrigger(trigger);};
        });
        trigger.addEventListener('mouseenter',function(){
          if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
          if (closeTimer){clearTimeout(closeTimer);closeTimer=null;}
          if (!openMenu || openMenu !== trigger){openTrigger(trigger);}
        });
        trigger.addEventListener('mouseleave',function(){
          if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
          closeTimer = setTimeout(closeAll,220);
        });
        trigger.addEventListener('focus',function(){
          if (closeTimer){clearTimeout(closeTimer);closeTimer=null;}
        });
      });

      menus.forEach(function(menu){
        menu.addEventListener('mouseenter',function(){
          if (closeTimer){clearTimeout(closeTimer);closeTimer=null;}
        });
        menu.addEventListener('mouseleave',function(){
          if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
          closeTimer = setTimeout(closeAll,220);
        });
        menu.addEventListener('click',function(e){
          var link = e.target.closest('a');
          if (!link) return;
          var target = link.getAttribute('href') || '';
          if (/^#module-\d+$/.test(target)){
            var card = document.querySelector(target);
            if (card && !card.classList.contains('module-open')) toggleModule(target.slice(1));
          }
          closeAll();
        });
      });

      backdrop.addEventListener('click',closeAll);

      window.addEventListener('keydown',function(e){
        if (e.key === 'Escape' && openMenu){closeAll();}
      });
    })();

    function toggleModule(moduleId){
      var card = document.getElementById(moduleId);
      if (!card) return;
      var isOpen = card.classList.contains('module-open');
      document.querySelectorAll('.module-card').forEach(function(c){
        c.classList.remove('module-open');
        var panel = c.querySelector('.module-content');
        if (panel) panel.style.maxHeight = '0px';
        var header = c.querySelector('.module-header');
        if (header) header.setAttribute('aria-expanded','false');
      });
      if (!isOpen){
        card.classList.add('module-open');
        var panel = card.querySelector('.module-content');
        if (panel) panel.style.maxHeight = (panel.scrollHeight + 32) + 'px';
        var header = card.querySelector('.module-header');
        if (header) header.setAttribute('aria-expanded','true');
      }
    }
    // Make existing module headers keyboard-accessible without altering simulator state.
    document.querySelectorAll('.module-header').forEach(function(header){
      header.setAttribute('role','button');
      header.setAttribute('tabindex','0');
      header.setAttribute('aria-expanded','false');
      header.addEventListener('keydown',function(e){
        if (e.key==='Enter' || e.key===' '){e.preventDefault(); header.click();}
      });
    });
    window.addEventListener('resize',function(){
      var open = document.querySelector('.module-card.module-open .module-content');
      if (open) open.style.maxHeight = (open.scrollHeight + 32)+'px';
    });

    function toggleFaq(btn){
      var item = btn.parentElement;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(f){f.classList.remove('open');});
      if (!isOpen){item.classList.add('open');}
    }

    function runTickDemo(){
      var note = document.getElementById('tick-note');
      var states = [
        {pc:0, ax:0, text:'Sebelum Tick: PC=0, AX=0'},
        {pc:1, ax:3, text:'Setelah 1 Tick: PC=1, AX=3'},
        {pc:2, ax:6, text:'Setelah 2 Tick: PC=2, AX=6'}
      ];
      var i = 0;
      note.textContent = states[0].text;
      var timer = setInterval(function(){
        i++;
        if (i >= states.length){clearInterval(timer);return;}
        note.textContent = states[i].text;
      }, 1200);
    }

    (function(){
      var cards = document.querySelectorAll('.module-card');
      if (!cards.length) return;
      if (window.matchMedia('(pointer: coarse)').matches) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var mouse = {x:0, y:0};
      var raf = null;
      var maxDist = 140;
      var maxLift = -4;
      function distToRect(rect, mx, my){
        var cx = Math.max(rect.left, Math.min(mx, rect.right));
        var cy = Math.max(rect.top, Math.min(my, rect.bottom));
        return Math.hypot(mx - cx, my - cy);
      }
      function update(){
        raf = null;
        cards.forEach(function(card){
          var rect = card.getBoundingClientRect();
          var dist = distToRect(rect, mouse.x, mouse.y);
          if (dist < maxDist){
            var intensity = 1 - dist/maxDist;
            var lift = maxLift * intensity;
            var scale = 1 + 0.008 * intensity;
            card.style.transform = 'translateY(' + lift + 'px) scale(' + scale + ')';
            card.style.boxShadow = '0 1px 1px rgba(0,0,0,.01), 0 ' + Math.abs(lift) + 'px 28px rgba(0,113,227,' + (0.16 * intensity) + ')';
          } else {
            card.style.transform = '';
            card.style.boxShadow = '';
          }
        });
      }
      window.addEventListener('mousemove', function(e){
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        if (!raf) raf = requestAnimationFrame(update);
      }, {passive:true});
    })();

    (function(){
      var revealElements = document.querySelectorAll('.reveal');
      if (!revealElements.length || !window.IntersectionObserver) return;
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {threshold: 0.12, rootMargin: '0px 0px -7% 0px'});
      revealElements.forEach(function(el){ observer.observe(el); });
    })();
  