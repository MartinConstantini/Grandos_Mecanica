
import { getDb, resetDb, exportDb, upsertItem, deleteItem, toCsv } from './storage.js';

let db = getDb();
let charts = {};

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function downloadFile(content, filename, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function statusClass(text = '') {
  const normalized = text.toLowerCase();
  if (['finalizada','atendida','confirmada','operativo','lista para entrega'].some(t => normalized.includes(t))) return 'success';
  if (['cancelada','fuera de servicio'].some(t => normalized.includes(t))) return 'danger';
  if (['en reparación','en diagnóstico','en proceso','mantenimiento','en revisión','monitoreo'].some(t => normalized.includes(t))) return 'warn';
  return '';
}

function renderNav() {
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    $$('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  }));
}

function renderSummaryCards() {
  const totalExpenses = db.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalRepairs = db.repairs.length;
  const pendingRepairs = db.repairs.filter(r => !['Finalizada','Lista para entrega'].includes(r.status)).length;
  const operationalAssets = db.assets.filter(a => a.status === 'Operativo').length;
  const activeNodes = db.network.filter(n => n.status === 'Operativo').length;

  const cards = [
    ['Citas registradas', db.appointments.length, 'Control de agenda y recepción'],
    ['Servicios técnicos', totalRepairs, `${pendingRepairs} con seguimiento activo`],
    ['Gasto acumulado', money.format(totalExpenses), 'Acumulado en registros cargados'],
    ['Equipos operativos', operationalAssets, `${db.assets.length} equipos inventariados`],
    ['Nodos de red activos', activeNodes, 'Infraestructura con seguimiento técnico']
  ];

  $('#summaryCards').innerHTML = cards.map(([title, value, note]) => `
    <div class="card metric">
      <h3>${title}</h3>
      <p>${value}</p>
      <span>${note}</span>
    </div>
  `).join('');
}

function getMonthlyCounts(items, dateField) {
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const counts = new Array(12).fill(0);
  items.forEach(item => {
    const value = item[dateField];
    if (!value) return;
    const d = new Date(value + 'T00:00:00');
    if (!Number.isNaN(d.getTime())) counts[d.getMonth()] += 1;
  });
  return { labels: months, data: counts };
}

function renderCharts() {
  const appts = getMonthlyCounts(db.appointments, 'date');
  const repairsByStatus = db.repairs.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const expensesByCategory = db.expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  const configs = {
    appointmentsChart: {
      type: 'bar',
      data: { labels: appts.labels, datasets: [{ label: 'Citas', data: appts.data }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    },
    repairsChart: {
      type: 'doughnut',
      data: { labels: Object.keys(repairsByStatus), datasets: [{ data: Object.values(repairsByStatus) }] },
      options: { responsive: true }
    },
    expensesChart: {
      type: 'bar',
      data: { labels: Object.keys(expensesByCategory), datasets: [{ label: 'Monto', data: Object.values(expensesByCategory) }] },
      options: { responsive: true, plugins: { legend: { display: false } } }
    }
  };

  Object.entries(configs).forEach(([id, config]) => {
    if (charts[id]) charts[id].destroy();
    const ctx = document.getElementById(id);
    charts[id] = new Chart(ctx, config);
  });
}

function renderKpiTable() {
  const indicators = [
    ['Cobertura inalámbrica interna', '58%', '92%', 'Incremento por instalación mesh'],
    ['Tiempo medio de registro de cita', '12 min', '4 min', 'Menor tiempo de captura'],
    ['Consulta de historial de servicio', '8 min', '1.5 min', 'Centralización de información'],
    ['Disponibilidad de conectividad', '71%', '95%', 'Menos zonas muertas y desconexiones']
  ];
  $('#kpiTable').innerHTML = `
    <thead><tr><th>Indicador</th><th>Antes</th><th>Después</th><th>Comentario</th></tr></thead>
    <tbody>
      ${indicators.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}
    </tbody>
  `;
}

function renderTable(targetId, columns, rows, collectionName, filters = '') {
  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(filters.toLowerCase()));
  const table = $(targetId);
  if (!filtered.length) {
    table.innerHTML = `<tbody><tr><td class="empty">No hay registros para mostrar.</td></tr></tbody>`;
    return;
  }
  table.innerHTML = `
    <thead>
      <tr>${columns.map(c => `<th>${c.label}</th>`).join('')}<th>Acciones</th></tr>
    </thead>
    <tbody>
      ${filtered.map(row => `
        <tr>
          ${columns.map(c => {
            const value = row[c.key] ?? '';
            if (c.type === 'tag') return `<td><span class="tag ${statusClass(value)}">${value}</span></td>`;
            if (c.type === 'money') return `<td>${money.format(Number(value || 0))}</td>`;
            return `<td>${value}</td>`;
          }).join('')}
          <td>
            <div class="actions">
              <button class="link-btn" data-edit="${collectionName}" data-id="${row.id}">Editar</button>
              <button class="link-btn" data-delete="${collectionName}" data-id="${row.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function renderAppointments() {
  renderTable('#appointmentsTable', [
    { key: 'date', label: 'Fecha' },
    { key: 'time', label: 'Hora' },
    { key: 'client', label: 'Cliente' },
    { key: 'vehicle', label: 'Vehículo' },
    { key: 'model', label: 'Modelo' },
    { key: 'plate', label: 'Placa' },
    { key: 'status', label: 'Estado', type: 'tag' },
    { key: 'notes', label: 'Observaciones' }
  ], db.appointments, 'appointments', $('#searchAppointments').value || '');
}

function renderRepairs() {
  renderTable('#repairsTable', [
    { key: 'entryDate', label: 'Ingreso' },
    { key: 'client', label: 'Cliente' },
    { key: 'technician', label: 'Técnico' },
    { key: 'vehicle', label: 'Vehículo' },
    { key: 'status', label: 'Estatus', type: 'tag' },
    { key: 'labor', label: 'Mano de obra', type: 'money' },
    { key: 'parts', label: 'Refacciones', type: 'money' },
    { key: 'diagnosis', label: 'Diagnóstico' }
  ], db.repairs, 'repairs', $('#searchRepairs').value || '');
}

function renderExpenses() {
  renderTable('#expensesTable', [
    { key: 'date', label: 'Fecha' },
    { key: 'category', label: 'Categoría', type: 'tag' },
    { key: 'provider', label: 'Proveedor' },
    { key: 'amount', label: 'Monto', type: 'money' },
    { key: 'method', label: 'Método' },
    { key: 'concept', label: 'Concepto' }
  ], db.expenses, 'expenses', $('#searchExpenses').value || '');
}

function renderNetwork() {
  renderTable('#networkTable', [
    { key: 'date', label: 'Fecha' },
    { key: 'location', label: 'Ubicación' },
    { key: 'device', label: 'Dispositivo' },
    { key: 'mode', label: 'Modo' },
    { key: 'ip', label: 'IP' },
    { key: 'status', label: 'Estado', type: 'tag' },
    { key: 'actions', label: 'Acciones' }
  ], db.network, 'network', $('#searchNetwork').value || '');
}

function renderAssets() {
  renderTable('#assetsTable', [
    { key: 'type', label: 'Tipo' },
    { key: 'name', label: 'Equipo' },
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'serial', label: 'Serie' },
    { key: 'status', label: 'Estado', type: 'tag' },
    { key: 'lastService', label: 'Último mant.' },
    { key: 'actions', label: 'Actividad' }
  ], db.assets, 'assets', $('#searchAssets').value || '');
}

function renderReports() {
  const totalExpenses = db.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalLabor = db.repairs.reduce((sum, item) => sum + Number(item.labor || 0), 0);
  const totalParts = db.repairs.reduce((sum, item) => sum + Number(item.parts || 0), 0);
  $('#financialSummary').innerHTML = `
    <div><strong>Total de gastos registrados:</strong> ${money.format(totalExpenses)}</div>
    <div><strong>Mano de obra acumulada:</strong> ${money.format(totalLabor)}</div>
    <div><strong>Refacciones acumuladas:</strong> ${money.format(totalParts)}</div>
    <div><strong>Promedio por gasto:</strong> ${money.format(db.expenses.length ? totalExpenses / db.expenses.length : 0)}</div>
  `;
  $('#operationsSummary').innerHTML = `
    <div><strong>Citas activas:</strong> ${db.appointments.filter(a => !['Atendida', 'Cancelada'].includes(a.status)).length}</div>
    <div><strong>Reparaciones finalizadas:</strong> ${db.repairs.filter(r => r.status === 'Finalizada').length}</div>
    <div><strong>Nodos de red operativos:</strong> ${db.network.filter(n => n.status === 'Operativo').length}</div>
    <div><strong>Equipos con mantenimiento vigente:</strong> ${db.assets.filter(a => a.status === 'Operativo').length}</div>
  `;
  const latestLogs = [
    ...db.network.map(item => ({ date: item.date, type: 'Red', detail: `${item.location}: ${item.actions}` })),
    ...db.assets.map(item => ({ date: item.lastService || '', type: 'Equipo', detail: `${item.name}: ${item.actions}` })),
    ...db.repairs.map(item => ({ date: item.entryDate, type: 'Servicio', detail: `${item.vehicle}: ${item.diagnosis}` }))
  ].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8);

  $('#logSummary').innerHTML = latestLogs.map(item => `<div><strong>${item.date || 'Sin fecha'} - ${item.type}</strong><br>${item.detail}</div>`).join('');
}

function refreshAll() {
  db = getDb();
  renderSummaryCards();
  renderCharts();
  renderKpiTable();
  renderAppointments();
  renderRepairs();
  renderExpenses();
  renderNetwork();
  renderAssets();
  renderReports();
  bindTableActions();
}

function fillForm(prefix, record) {
  Object.entries(record).forEach(([key, value]) => {
    const el = document.getElementById(prefix + key.charAt(0).toUpperCase() + key.slice(1));
    if (el) el.value = value ?? '';
  });
}

function resetForm(formId) {
  document.getElementById(formId).reset();
  const hidden = document.querySelector(`#${formId} input[type="hidden"]`);
  if (hidden) hidden.value = '';
}

function bindTableActions() {
  $$('[data-delete]').forEach(btn => btn.onclick = () => {
    const collection = btn.dataset.delete;
    if (!confirm('¿Deseas eliminar este registro?')) return;
    deleteItem(collection, btn.dataset.id);
    refreshAll();
  });

  $$('[data-edit]').forEach(btn => btn.onclick = () => {
    const collection = btn.dataset.edit;
    const id = btn.dataset.id;
    const record = db[collection].find(item => item.id === id);
    if (!record) return;

    const mappers = {
      appointments: () => {
        $('#appointmentId').value = record.id;
        $('#appointmentDate').value = record.date;
        $('#appointmentTime').value = record.time;
        $('#appointmentClient').value = record.client;
        $('#appointmentPhone').value = record.phone;
        $('#appointmentVehicle').value = record.vehicle;
        $('#appointmentModel').value = record.model;
        $('#appointmentPlate').value = record.plate;
        $('#appointmentStatus').value = record.status;
        $('#appointmentNotes').value = record.notes;
        document.querySelector('[data-target="citas"]').click();
      },
      repairs: () => {
        $('#repairId').value = record.id;
        $('#repairEntryDate').value = record.entryDate;
        $('#repairDeliveryDate').value = record.deliveryDate;
        $('#repairClient').value = record.client;
        $('#repairTechnician').value = record.technician;
        $('#repairVehicle').value = record.vehicle;
        $('#repairModel').value = record.model;
        $('#repairStatus').value = record.status;
        $('#repairLabor').value = record.labor;
        $('#repairParts').value = record.parts;
        $('#repairDiagnosis').value = record.diagnosis;
        $('#repairAction').value = record.action;
        $('#repairNotes').value = record.notes;
        document.querySelector('[data-target="reparaciones"]').click();
      },
      expenses: () => {
        $('#expenseId').value = record.id;
        $('#expenseDate').value = record.date;
        $('#expenseCategory').value = record.category;
        $('#expenseProvider').value = record.provider;
        $('#expenseAmount').value = record.amount;
        $('#expenseMethod').value = record.method;
        $('#expenseConcept').value = record.concept;
        document.querySelector('[data-target="gastos"]').click();
      },
      network: () => {
        $('#networkId').value = record.id;
        $('#networkDate').value = record.date;
        $('#networkLocation').value = record.location;
        $('#networkDevice').value = record.device;
        $('#networkMode').value = record.mode;
        $('#networkIp').value = record.ip;
        $('#networkStatus').value = record.status;
        $('#networkActions').value = record.actions;
        $('#networkNotes').value = record.notes;
        document.querySelector('[data-target="red"]').click();
      },
      assets: () => {
        $('#assetId').value = record.id;
        $('#assetType').value = record.type;
        $('#assetName').value = record.name;
        $('#assetBrand').value = record.brand;
        $('#assetModel').value = record.model;
        $('#assetSerial').value = record.serial;
        $('#assetStatus').value = record.status;
        $('#assetLastService').value = record.lastService;
        $('#assetNextService').value = record.nextService;
        $('#assetActions').value = record.actions;
        $('#assetNotes').value = record.notes;
        document.querySelector('[data-target="equipos"]').click();
      }
    };

    mappers[collection]?.();
  });
}

function bindForms() {
  $('#appointmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    upsertItem('appointments', {
      id: $('#appointmentId').value || crypto.randomUUID(),
      date: $('#appointmentDate').value,
      time: $('#appointmentTime').value,
      client: $('#appointmentClient').value,
      phone: $('#appointmentPhone').value,
      vehicle: $('#appointmentVehicle').value,
      model: $('#appointmentModel').value,
      plate: $('#appointmentPlate').value,
      status: $('#appointmentStatus').value,
      notes: $('#appointmentNotes').value
    });
    resetForm('appointmentForm');
    refreshAll();
  });

  $('#repairForm').addEventListener('submit', (e) => {
    e.preventDefault();
    upsertItem('repairs', {
      id: $('#repairId').value || crypto.randomUUID(),
      entryDate: $('#repairEntryDate').value,
      deliveryDate: $('#repairDeliveryDate').value,
      client: $('#repairClient').value,
      technician: $('#repairTechnician').value,
      vehicle: $('#repairVehicle').value,
      model: $('#repairModel').value,
      status: $('#repairStatus').value,
      labor: Number($('#repairLabor').value || 0),
      parts: Number($('#repairParts').value || 0),
      diagnosis: $('#repairDiagnosis').value,
      action: $('#repairAction').value,
      notes: $('#repairNotes').value
    });
    resetForm('repairForm');
    refreshAll();
  });

  $('#expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    upsertItem('expenses', {
      id: $('#expenseId').value || crypto.randomUUID(),
      date: $('#expenseDate').value,
      category: $('#expenseCategory').value,
      provider: $('#expenseProvider').value,
      amount: Number($('#expenseAmount').value || 0),
      method: $('#expenseMethod').value,
      concept: $('#expenseConcept').value
    });
    resetForm('expenseForm');
    refreshAll();
  });

  $('#networkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    upsertItem('network', {
      id: $('#networkId').value || crypto.randomUUID(),
      date: $('#networkDate').value,
      location: $('#networkLocation').value,
      device: $('#networkDevice').value,
      mode: $('#networkMode').value,
      ip: $('#networkIp').value,
      status: $('#networkStatus').value,
      actions: $('#networkActions').value,
      notes: $('#networkNotes').value
    });
    resetForm('networkForm');
    refreshAll();
  });

  $('#assetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    upsertItem('assets', {
      id: $('#assetId').value || crypto.randomUUID(),
      type: $('#assetType').value,
      name: $('#assetName').value,
      brand: $('#assetBrand').value,
      model: $('#assetModel').value,
      serial: $('#assetSerial').value,
      status: $('#assetStatus').value,
      lastService: $('#assetLastService').value,
      nextService: $('#assetNextService').value,
      actions: $('#assetActions').value,
      notes: $('#assetNotes').value
    });
    resetForm('assetForm');
    refreshAll();
  });

  $('#appointmentReset').onclick = () => resetForm('appointmentForm');
  $('#repairReset').onclick = () => resetForm('repairForm');
  $('#expenseReset').onclick = () => resetForm('expenseForm');
  $('#networkReset').onclick = () => resetForm('networkForm');
  $('#assetReset').onclick = () => resetForm('assetForm');
}

function bindSearch() {
  ['Appointments','Repairs','Expenses','Network','Assets'].forEach(name => {
    $('#search' + name).addEventListener('input', refreshAll);
  });
}

function bindExports() {
  $('#exportJsonBtn').onclick = () => downloadFile(exportDb(), 'sistema_taller_respaldo.json', 'application/json');
  $('#importDemoBtn').onclick = () => {
    if (!confirm('Esto reemplazará los registros actuales por el conjunto demo.')) return;
    resetDb();
    refreshAll();
  };
  $('#downloadExpensesCsv').onclick = () => downloadFile(toCsv(db.expenses), 'gastos_taller.csv', 'text/csv;charset=utf-8');
  $('#downloadAppointmentsCsv').onclick = () => downloadFile(toCsv(db.appointments), 'citas_taller.csv', 'text/csv;charset=utf-8');
}

function init() {
  renderNav();
  bindForms();
  bindSearch();
  bindExports();
  refreshAll();
}

init();
