'use strict';

/* =========================================================
   PROCESSLAB — SIMULATOR MANAJEMEN PROSES
   Kelompok 3 | 2026

   Struktur file:
   1. Konfigurasi dan state simulator
   2. Helper dan data proses
   3. Aksi siklus hidup proses
   4. Demo, reset, dan ekspor laporan
   5. Render antarmuka
   6. Event listener simulator
   7. Navigasi mega menu
   8. Modul pembelajaran dan FAQ
   9. Efek visual dan inisialisasi

   Catatan: Ini tetap simulator edukasi. Nilai PC, AX, dan
   CPU Tick adalah data ilustrasi, bukan data CPU asli.
   ========================================================= */


/* =========================================================
   1. KONFIGURASI DAN STATE SIMULATOR
   ========================================================= */

const byId = (id) => document.getElementById(id);

const STATE_LABELS = [
  'NEW',
  'READY',
  'RUNNING',
  'WAITING',
  'TERMINATED'
];

const MAX_PROCESSES = 30;
const MAX_LOG_ENTRIES = 80;

let processes = [];
let selectedPid = null;
let nextPid = 1001;
let runningPid = null;
let cpuTicks = 0;
let contextSwitchCount = 0;
let events = [];


/* =========================================================
   2. HELPER DAN DATA PROSES
   ========================================================= */

/** Menghasilkan waktu untuk setiap catatan aktivitas. */
function getTimestamp() {
  return new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/** Mengambil proses yang sedang dipilih pengguna. */
function getSelectedProcess() {
  return processes.find((process) => process.pid === selectedPid) || null;
}

/** Mengambil proses yang sedang menggunakan CPU. */
function getRunningProcess() {
  return processes.find((process) => process.pid === runningPid) || null;
}

/** Mengambil proses pertama yang berada dalam antrean READY. */
function getFirstReadyProcess() {
  return processes.find((process) => process.state === 'READY') || null;
}

/** Menambahkan catatan aktivitas dengan batas jumlah maksimum. */
function addLog(message) {
  events.unshift({
    time: getTimestamp(),
    message
  });

  if (events.length > MAX_LOG_ENTRIES) {
    events.pop();
  }
}

/** Menampilkan pesan bantuan pada panel simulator. */
function showNote(message) {
  byId('hint').textContent = message;
}

/** Membuat objek proses baru dan langsung memilihnya. */
function makeProcess(name, state = 'NEW') {
  const process = {
    pid: nextPid++,
    name: name || 'Proses',
    state,
    pc: 0,
    ax: 0,
    ticks: 0
  };

  processes.push(process);
  selectedPid = process.pid;

  return process;
}


/* =========================================================
   3. AKSI SIKLUS HIDUP PROSES
   ========================================================= */

/** Membuat proses baru dari input pengguna. */
function createProcess() {
  if (processes.length >= MAX_PROCESSES) {
    showNote('Batas contoh 30 proses. Reset untuk memulai ulang.');
    return;
  }

  const inputName = byId('processName').value.trim();
  const processName = inputName || `Proses ${nextPid}`;
  const process = makeProcess(processName);

  addLog(`${process.name} (PID ${process.pid}) dibuat: NEW.`);

  const nextLetter = String.fromCharCode(
    65 + Math.min(processes.length, 25)
  );
  byId('processName').value = `Proses ${nextLetter}`;

  showNote(
    `PID ${process.pid} dibuat. Klik “New → Ready” untuk menerima proses ke antrean.`
  );

  renderSimulator();
}

/** Memindahkan proses terpilih dari NEW ke READY. */
function admitProcess() {
  const process = getSelectedProcess();

  if (!process || process.state !== 'NEW') {
    return;
  }

  process.state = 'READY';

  addLog(`PID ${process.pid}: NEW → READY (diterima ke antrean).`);
  showNote(
    `Proses ${process.name} siap. Pilih “Ready → Running” saat CPU kosong.`
  );

  renderSimulator();
}

/** Menjalankan proses READY ketika CPU sedang kosong. */
function dispatchProcess() {
  const process = getSelectedProcess();

  if (!process || process.state !== 'READY' || getRunningProcess()) {
    return;
  }

  process.state = 'RUNNING';
  runningPid = process.pid;

  addLog(
    `Dispatcher menjalankan PID ${process.pid}: READY → RUNNING, PC=${process.pc}.`
  );
  showNote(
    `${process.name} memakai CPU. Klik Eksekusi 1 Tick, Waiting, atau siapkan proses lain untuk context switch.`
  );

  renderSimulator();
}

/** Menjalankan satu CPU Tick pada proses yang sedang RUNNING. */
function executeTick() {
  const process = getRunningProcess();

  if (!process) {
    return;
  }

  process.pc += 1;
  process.ax = (process.ax + 3) % 256;
  process.ticks += 1;
  cpuTicks += 1;

  addLog(
    `PID ${process.pid} mengeksekusi 1 tick. PC=${process.pc}, AX=${process.ax}.`
  );
  showNote(
    `CPU menjalankan ${process.name}. Program Counter naik menjadi ${process.pc} (nilai simulasi).`
  );

  renderSimulator();
}

/**
 * Memindahkan CPU dari proses RUNNING ke proses READY.
 * Nilai PC, AX, dan tick masing-masing proses tetap tersimpan.
 */
function performContextSwitch() {
  const previousProcess = getRunningProcess();

  if (!previousProcess) {
    return;
  }

  const selectedProcess = getSelectedProcess();
  const nextProcess = selectedProcess && selectedProcess.state === 'READY'
    ? selectedProcess
    : getFirstReadyProcess();

  if (!nextProcess) {
    showNote(
      'Context switch memerlukan proses RUNNING dan setidaknya satu proses READY. Buat proses kedua dahulu.'
    );
    return;
  }

  previousProcess.state = 'READY';
  nextProcess.state = 'RUNNING';
  runningPid = nextProcess.pid;
  selectedPid = nextProcess.pid;
  contextSwitchCount += 1;

  addLog(
    `CONTEXT SWITCH #${contextSwitchCount}: konteks PID ${previousProcess.pid} disimpan (PC=${previousProcess.pc}, AX=${previousProcess.ax}); PID ${nextProcess.pid} dipulihkan (PC=${nextProcess.pc}, AX=${nextProcess.ax}).`
  );
  showNote(
    `CPU beralih dari ${previousProcess.name} ke ${nextProcess.name}. Nilai PC dan AX milik proses sebelumnya tetap tersimpan.`
  );

  renderSimulator();
}

/** Memindahkan proses RUNNING ke WAITING karena menunggu I/O. */
function moveProcessToWaiting() {
  const process = getSelectedProcess();

  if (!process || process.pid !== runningPid) {
    return;
  }

  process.state = 'WAITING';
  runningPid = null;

  addLog(
    `PID ${process.pid}: RUNNING → WAITING (menunggu I/O; PC=${process.pc} disimpan).`
  );
  showNote(
    `${process.name} kini menunggu I/O. Klik “Waiting → Ready” setelah I/O dianggap selesai.`
  );

  renderSimulator();
}

/** Mengembalikan proses WAITING ke READY setelah I/O selesai. */
function wakeProcessFromWaiting() {
  const process = getSelectedProcess();

  if (!process || process.state !== 'WAITING') {
    return;
  }

  process.state = 'READY';

  addLog(`PID ${process.pid}: WAITING → READY (I/O selesai).`);
  showNote(
    `${process.name} kembali siap. CPU dapat menjalankannya jika sedang kosong.`
  );

  renderSimulator();
}

/** Mengakhiri proses yang sedang menggunakan CPU. */
function finishProcess() {
  const process = getSelectedProcess();

  if (!process || process.pid !== runningPid) {
    return;
  }

  process.state = 'TERMINATED';
  runningPid = null;

  addLog(`PID ${process.pid}: RUNNING → TERMINATED (eksekusi selesai).`);
  showNote(
    `${process.name} selesai. Proses ini tidak bisa dijalankan kembali.`
  );

  renderSimulator();
}


/* =========================================================
   4. DEMO, RESET, DAN EKSPOR LAPORAN
   ========================================================= */

/** Menyiapkan tiga proses contoh untuk demonstrasi context switch. */
function loadDemo() {
  resetSimulator(false);

  const editorProcess = makeProcess('Editor Dokumen', 'RUNNING');
  editorProcess.pc = 8;
  editorProcess.ax = 24;
  editorProcess.ticks = 8;
  runningPid = editorProcess.pid;

  const browserProcess = makeProcess('Browser', 'READY');
  browserProcess.pc = 3;
  browserProcess.ax = 9;
  browserProcess.ticks = 3;

  const musicProcess = makeProcess('Pemutar Musik', 'WAITING');
  musicProcess.pc = 4;
  musicProcess.ax = 12;
  musicProcess.ticks = 4;

  cpuTicks = 15;
  selectedPid = browserProcess.pid;

  addLog(
    'Contoh siap: Editor menggunakan CPU, Browser menunggu READY, Musik menunggu I/O.'
  );
  showNote(
    'Mode demo siap. Browser (READY) telah dipilih. Klik “Context Switch” untuk mengalihkan CPU dari Editor ke Browser.'
  );

  renderSimulator();
}

/** Menghapus seluruh data simulasi dan mengembalikan PID awal. */
function resetSimulator(withMessage = true) {
  processes = [];
  selectedPid = null;
  nextPid = 1001;
  runningPid = null;
  cpuTicks = 0;
  contextSwitchCount = 0;
  events = [];

  if (withMessage) {
    showNote('Simulasi telah direset. Mulai dengan tombol “+ Buat Proses”.');
  }

  renderSimulator();
}

/** Mengunduh ringkasan data proses dan riwayat aktivitas sebagai TXT. */
function exportSimulationLog() {
  if (!processes.length) {
    showNote('Belum ada hasil simulasi. Buat atau jalankan proses terlebih dahulu.');
    return;
  }

  const reportLines = [
    'PROCESSLAB — LAPORAN DEMO KELOMPOK 3',
    'Simulator pendidikan, bukan data proses Windows asli.',
    `Tanggal: ${new Date().toLocaleString('id-ID')}`,
    `Total proses: ${processes.length}`,
    `CPU Tick: ${cpuTicks}`,
    `Context switch: ${contextSwitchCount}`,
    '',
    'DATA PCB:',
    ...processes.map((process) =>
      `PID ${process.pid} | ${process.name} | ${process.state} | PC=${process.pc} | AX=${process.ax} | Tick=${process.ticks}`
    ),
    '',
    'RIWAYAT:',
    ...events.slice().reverse().map((event) =>
      `[${event.time}] ${event.message}`
    )
  ];

  const reportBlob = new Blob(
    [reportLines.join('\n')],
    { type: 'text/plain;charset=utf-8' }
  );
  const downloadUrl = URL.createObjectURL(reportBlob);
  const downloadLink = document.createElement('a');

  downloadLink.href = downloadUrl;
  downloadLink.download = 'hasil_simulasi_kelompok_3.txt';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

  showNote('Laporan TXT telah dibuat dari kondisi simulasi saat ini.');
}


/* =========================================================
   5. RENDER ANTARMUKA SIMULATOR
   ========================================================= */

/** Memperbarui daftar proses, CPU, PCB, antrean, log, dan tombol. */
function renderSimulator() {
  const selectedProcess = getSelectedProcess();
  const runningProcess = getRunningProcess();

  renderProcessList(selectedProcess);
  renderCpuPanel(runningProcess);
  renderPcbPanel(selectedProcess);
  renderProcessStateCounts();
  renderProcessQueues();
  renderActivityLog();
  updateSimulatorButtons(selectedProcess, runningProcess);
}

/** Menampilkan daftar proses dan status setiap proses. */
function renderProcessList(selectedProcess) {
  const processList = byId('processList');
  processList.replaceChildren();

  if (!processes.length) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty';
    emptyMessage.textContent =
      'Belum ada proses. Klik “Buat Proses” atau “Siapkan Demo”.';
    processList.appendChild(emptyMessage);
    return;
  }

  processes.forEach((process) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `process-entry${
      selectedProcess && process.pid === selectedProcess.pid ? ' selected' : ''
    }`;
    row.setAttribute(
      'aria-pressed',
      String(Boolean(selectedProcess && process.pid === selectedProcess.pid))
    );

    const leftContent = document.createElement('span');
    const processName = document.createElement('strong');
    const processInfo = document.createElement('small');

    processName.textContent = process.name;
    processInfo.textContent = `PID ${process.pid} · ${process.ticks} tick`;
    leftContent.append(processName, processInfo);

    const status = document.createElement('span');
    status.className = `pill ${process.state.toLowerCase()}`;
    status.textContent = process.state;

    row.append(leftContent, status);
    row.addEventListener('click', () => {
      selectedPid = process.pid;
      showNote(
        `Memilih ${process.name} (PID ${process.pid}). Status saat ini: ${process.state}.`
      );
      renderSimulator();
    });

    processList.appendChild(row);
  });
}

/** Memperbarui panel proses yang sedang menggunakan CPU. */
function renderCpuPanel(runningProcess) {
  byId('cpuName').textContent = runningProcess
    ? runningProcess.name
    : 'Idle — belum ada proses';

  byId('cpuDesc').textContent = runningProcess
    ? `PID ${runningProcess.pid} · PC=${runningProcess.pc} · AX=${runningProcess.ax}`
    : 'CPU menunggu penjadwalan proses';

  byId('metricProcesses').textContent = processes.length;
  byId('metricTicks').textContent = cpuTicks;
  byId('metricSwitches').textContent = contextSwitchCount;
}

/** Memperbarui informasi Process Control Block proses terpilih. */
function renderPcbPanel(selectedProcess) {
  byId('pcbPid').textContent = selectedProcess ? selectedProcess.pid : '—';
  byId('pcbState').textContent = selectedProcess ? selectedProcess.state : '—';
  byId('pcbPc').textContent = selectedProcess ? selectedProcess.pc : '—';
  byId('pcbReg').textContent = selectedProcess ? selectedProcess.ax : '—';
  byId('pcbName').textContent = selectedProcess
    ? selectedProcess.name
    : 'Belum ada proses dipilih';
}

/** Menghitung jumlah proses pada masing-masing status. */
function renderProcessStateCounts() {
  STATE_LABELS.forEach((state) => {
    const stageCard = document.querySelector(
      `.stage-card[data-state="${state}"]`
    );

    if (!stageCard) {
      return;
    }

    const count = processes.filter((process) => process.state === state).length;
    stageCard.querySelector('.stage-count').textContent = count;
    stageCard.classList.toggle('is-active', count > 0);
  });
}

/** Menampilkan proses pada Ready Queue dan Waiting Queue. */
function renderProcessQueues() {
  const queueDefinitions = [
    {
      elementId: 'readyQueue',
      state: 'READY',
      emptyMessage: 'Belum ada proses menunggu.'
    },
    {
      elementId: 'waitingQueue',
      state: 'WAITING',
      emptyMessage: 'Belum ada proses menunggu I/O.'
    }
  ];

  queueDefinitions.forEach((queueDefinition) => {
    const queueElement = byId(queueDefinition.elementId);
    const queueProcesses = processes.filter(
      (process) => process.state === queueDefinition.state
    );

    queueElement.replaceChildren();

    if (!queueProcesses.length) {
      const emptyMessage = document.createElement('span');
      emptyMessage.className = 'tiny';
      emptyMessage.textContent = queueDefinition.emptyMessage;
      queueElement.appendChild(emptyMessage);
      return;
    }

    queueProcesses.forEach((process) => {
      const chip = document.createElement('span');
      chip.className = 'queue-chip';
      chip.textContent = `${process.name} · ${process.pid}`;
      queueElement.appendChild(chip);
    });
  });
}

/** Menampilkan catatan aktivitas terbaru. */
function renderActivityLog() {
  const eventLog = byId('eventLog');
  eventLog.replaceChildren();

  if (!events.length) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty';
    emptyMessage.textContent = 'Aktivitas simulasi akan ditampilkan di sini.';
    eventLog.appendChild(emptyMessage);
    return;
  }

  events.forEach((event) => {
    const eventElement = document.createElement('div');
    eventElement.className = 'event';

    const eventTime = document.createElement('time');
    eventTime.textContent = event.time;

    const eventMessage = document.createElement('b');
    eventMessage.textContent = event.message;

    eventElement.append(eventTime, eventMessage);
    eventLog.appendChild(eventElement);
  });
}

/** Mengaktifkan atau menonaktifkan tombol sesuai kondisi simulasi. */
function updateSimulatorButtons(selectedProcess, runningProcess) {
  byId('btnAdmit').disabled =
    !selectedProcess || selectedProcess.state !== 'NEW';

  byId('btnDispatch').disabled =
    !selectedProcess || selectedProcess.state !== 'READY' || Boolean(runningProcess);

  byId('btnTick').disabled = !runningProcess;
  byId('btnSwitch').disabled = !runningProcess || !getFirstReadyProcess();

  byId('btnWait').disabled =
    !selectedProcess || selectedProcess.pid !== runningPid;

  byId('btnWake').disabled =
    !selectedProcess || selectedProcess.state !== 'WAITING';

  byId('btnFinish').disabled =
    !selectedProcess || selectedProcess.pid !== runningPid;

  byId('btnSelectRunning').disabled = !runningProcess;
}


/* =========================================================
   6. EVENT LISTENER SIMULATOR
   ========================================================= */

/** Menghubungkan tombol pada laboratorium dengan fungsi simulator. */
function initSimulatorEvents() {
  byId('btnCreate').addEventListener('click', createProcess);

  byId('processName').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      createProcess();
    }
  });

  byId('btnAdmit').addEventListener('click', admitProcess);
  byId('btnDispatch').addEventListener('click', dispatchProcess);
  byId('btnTick').addEventListener('click', executeTick);
  byId('btnSwitch').addEventListener('click', performContextSwitch);
  byId('btnWait').addEventListener('click', moveProcessToWaiting);
  byId('btnWake').addEventListener('click', wakeProcessFromWaiting);
  byId('btnFinish').addEventListener('click', finishProcess);

  byId('btnSelectRunning').addEventListener('click', () => {
    if (!getRunningProcess()) {
      return;
    }

    selectedPid = runningPid;
    showNote('Proses yang sedang memakai CPU dipilih.');
    renderSimulator();
  });

  byId('btnExample').addEventListener('click', () => {
    if (
      processes.length &&
      !confirm('Memuat contoh akan mengganti simulasi saat ini. Lanjutkan?')
    ) {
      return;
    }

    loadDemo();
  });

  byId('btnReset').addEventListener('click', () => {
    if (
      processes.length &&
      !confirm('Hapus seluruh simulasi saat ini?')
    ) {
      return;
    }

    resetSimulator();
  });

  byId('btnExport').addEventListener('click', exportSimulationLog);

  renderSimulator();
}


/* =========================================================
   7. NAVIGASI MEGA MENU
   ========================================================= */

/** Mengatur dropdown navigasi utama. */
function initNavigation() {
  const triggers = document.querySelectorAll('.nav-trigger');
  const menus = document.querySelectorAll('.mega-menu');
  const backdrop = document.querySelector('.nav-backdrop');

  let openMenu = null;
  let closeTimer = null;

  function closeAllMenus() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    triggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    menus.forEach((menu) => {
      menu.setAttribute('aria-hidden', 'true');
    });

    if (backdrop) {
      backdrop.setAttribute('aria-hidden', 'true');
    }

    openMenu = null;
  }

  function openMenuForTrigger(trigger) {
    const menuId = trigger.getAttribute('aria-controls');
    const menu = document.getElementById(menuId);

    if (!menu) {
      return;
    }

    closeAllMenus();

    trigger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');

    if (backdrop) {
      backdrop.setAttribute('aria-hidden', 'false');
    }

    openMenu = trigger;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (openMenu === trigger) {
        closeAllMenus();
      } else {
        openMenuForTrigger(trigger);
      }
    });

    trigger.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        return;
      }

      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }

      if (!openMenu || openMenu !== trigger) {
        openMenuForTrigger(trigger);
      }
    });

    trigger.addEventListener('mouseleave', () => {
      if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        return;
      }

      closeTimer = setTimeout(closeAllMenus, 220);
    });

    trigger.addEventListener('focus', () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    });
  });

  menus.forEach((menu) => {
    menu.addEventListener('mouseenter', () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    });

    menu.addEventListener('mouseleave', () => {
      if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        return;
      }

      closeTimer = setTimeout(closeAllMenus, 220);
    });

    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a');

      if (!link) {
        return;
      }

      const target = link.getAttribute('href') || '';

      if (/^#module-\d+$/.test(target)) {
        const moduleCard = document.querySelector(target);

        if (moduleCard && !moduleCard.classList.contains('module-open')) {
          toggleModule(target.slice(1));
        }
      }

      closeAllMenus();
    });
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeAllMenus);
  }

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && openMenu) {
      closeAllMenus();
    }
  });
}


/* =========================================================
   8. MODUL PEMBELAJARAN DAN FAQ
   ========================================================= */

/** Membuka satu modul dan menutup modul lainnya. */
function toggleModule(moduleId) {
  const selectedModule = document.getElementById(moduleId);

  if (!selectedModule) {
    return;
  }

  const isAlreadyOpen = selectedModule.classList.contains('module-open');

  document.querySelectorAll('.module-card').forEach((moduleCard) => {
    moduleCard.classList.remove('module-open');

    const content = moduleCard.querySelector('.module-content');
    if (content) {
      content.style.maxHeight = '0px';
    }

    const header = moduleCard.querySelector('.module-header');
    if (header) {
      header.setAttribute('aria-expanded', 'false');
    }
  });

  if (!isAlreadyOpen) {
    selectedModule.classList.add('module-open');

    const content = selectedModule.querySelector('.module-content');
    if (content) {
      content.style.maxHeight = `${content.scrollHeight + 32}px`;
    }

    const header = selectedModule.querySelector('.module-header');
    if (header) {
      header.setAttribute('aria-expanded', 'true');
    }
  }
}

/** Membuat header modul dapat dioperasikan dengan keyboard. */
function initModuleKeyboardAccess() {
  document.querySelectorAll('.module-header').forEach((header) => {
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');

    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        header.click();
      }
    });
  });

  window.addEventListener('resize', () => {
    const openContent = document.querySelector(
      '.module-card.module-open .module-content'
    );

    if (openContent) {
      openContent.style.maxHeight = `${openContent.scrollHeight + 32}px`;
    }
  });
}

/** Membuka satu FAQ dan menutup FAQ lainnya. */
function toggleFaq(button) {
  const faqItem = button.parentElement;
  const isAlreadyOpen = faqItem.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach((item) => {
    item.classList.remove('open');
  });

  if (!isAlreadyOpen) {
    faqItem.classList.add('open');
  }
}

/** Menampilkan contoh perubahan nilai PC dan AX pada CPU Tick. */
function runTickDemo() {
  const noteElement = document.getElementById('tick-note');

  const tickStates = [
    { pc: 0, ax: 0, text: 'Sebelum Tick: PC=0, AX=0' },
    { pc: 1, ax: 3, text: 'Setelah 1 Tick: PC=1, AX=3' },
    { pc: 2, ax: 6, text: 'Setelah 2 Tick: PC=2, AX=6' }
  ];

  let currentStep = 0;
  noteElement.textContent = tickStates[0].text;

  const timer = setInterval(() => {
    currentStep += 1;

    if (currentStep >= tickStates.length) {
      clearInterval(timer);
      return;
    }

    noteElement.textContent = tickStates[currentStep].text;
  }, 1200);
}


/* =========================================================
   9. EFEK VISUAL DAN INISIALISASI
   ========================================================= */

/** Mengatur efek kartu modul yang merespons posisi kursor. */
function initCursorProximityEffect() {
  const cards = document.querySelectorAll('.module-card');

  if (!cards.length) {
    return;
  }

  if (window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const mousePosition = { x: 0, y: 0 };
  let animationFrame = null;

  const maxDistance = 140;
  const maxLift = -4;

  function getDistanceToCard(rect, mouseX, mouseY) {
    const closestX = Math.max(rect.left, Math.min(mouseX, rect.right));
    const closestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));

    return Math.hypot(mouseX - closestX, mouseY - closestY);
  }

  function updateCardEffects() {
    animationFrame = null;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const distance = getDistanceToCard(
        rect,
        mousePosition.x,
        mousePosition.y
      );

      if (distance < maxDistance) {
        const intensity = 1 - distance / maxDistance;
        const lift = maxLift * intensity;
        const scale = 1 + 0.008 * intensity;

        card.style.transform =
          `translateY(${lift}px) scale(${scale})`;
        card.style.boxShadow =
          `0 1px 1px rgba(0,0,0,.01), 0 ${Math.abs(lift)}px 28px rgba(0,113,227,${0.16 * intensity})`;
      } else {
        card.style.transform = '';
        card.style.boxShadow = '';
      }
    });
  }

  window.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(updateCardEffects);
    }
  }, { passive: true });
}

/** Menjalankan animasi reveal saat elemen masuk ke area pandang. */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!revealElements.length || !window.IntersectionObserver) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px'
  });

  revealElements.forEach((element) => {
    observer.observe(element);
  });
}

/** Menjalankan seluruh inisialisasi setelah HTML selesai dimuat. */
function initProcessLab() {
  initSimulatorEvents();
  initNavigation();
  initModuleKeyboardAccess();
  initCursorProximityEffect();
  initScrollReveal();
}

// File dipanggil menggunakan atribut defer, jadi elemen HTML sudah tersedia.
initProcessLab();
