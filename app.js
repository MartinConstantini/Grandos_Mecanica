const STORAGE_KEY = 'taller_netlify_root_v1';
const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const NUM = new Intl.NumberFormat('es-MX');

const ui = {};
const charts = { vehicleStatus: null, costs: null, payroll: null };

const sectionTitles = {
  dashboard: 'Dashboard',
  vehiculos: 'Vehículos',
  nominas: 'Nóminas',
  piezas: 'Piezas',
  facturas: 'Facturas'
};

let state = loadState() || buildDemoState();

document.addEventListener('DOMContentLoaded', () => {
  cacheUI();
  bindNavigation();
  bindGlobalActions();
  bindVehicleModule();
  bindEmployeeModule();
  bindPartModule();
  bindInvoiceModule();
  setDefaultDates();
  renderAll();
});

function cacheUI() {
  Object.assign(ui, {
    sectionTitle: document.getElementById('sectionTitle'),
    summaryCards: document.getElementById('summaryCards'),
    dashboardTable: document.getElementById('dashboardTable'),
    vehicleCards: document.getElementById('vehicleCards'),
    vehicleTable: document.getElementById('vehicleTable'),
    employeeTable: document.getElementById('employeeTable'),
    partTable: document.getElementById('partTable'),
    assignmentTable: document.getElementById('assignmentTable'),
    invoiceTable: document.getElementById('invoiceTable'),
    invoicePreview: document.getElementById('invoicePreview'),
    vehicleSearch: document.getElementById('vehicleSearch'),
    employeeSearch: document.getElementById('employeeSearch'),
    partSearch: document.getElementById('partSearch'),
    invoiceSearch: document.getElementById('invoiceSearch'),
    toastContainer: document.getElementById('toastContainer')
  });
}

function buildDemoState() {
  const vehicles = [
    {
      id: uid('veh'),
      entryDate: '2026-04-08',
      deliveryDate: '2026-04-10',
      client: 'Luis García',
      phone: '4291234567',
      plate: 'GTO-482-A',
      brand: 'Nissan',
      model: 'Versa',
      year: '2019',
      color: 'Plata',
      status: 'finalizado',
      laborCost: 1800,
      extraCost: 250,
      diagnosis: 'Falla en sistema de enfriamiento por desgaste en manguera superior y termostato.',
      notes: 'Se sustituyó termostato, manguera y se purgó el sistema.',
      photo: '',
      createdAt: nowIso()
    },
    {
      id: uid('veh'),
      entryDate: '2026-04-12',
      deliveryDate: '2026-04-15',
      client: 'María Negrete',
      phone: '4297654321',
      plate: 'ABC-921-B',
      brand: 'Chevrolet',
      model: 'Aveo',
      year: '2017',
      color: 'Rojo',
      status: 'en_trabajo',
      laborCost: 1200,
      extraCost: 0,
      diagnosis: 'Ruidos en tren delantero y vibración en frenado.',
      notes: 'Pendiente autorización para cambio de piezas adicionales.',
      photo: '',
      createdAt: nowIso()
    },
    {
      id: uid('veh'),
      entryDate: '2026-04-15',
      deliveryDate: '',
      client: 'Carlos Romero',
      phone: '4299988776',
      plate: 'PQR-110-C',
      brand: 'Volkswagen',
      model: 'Jetta',
      year: '2020',
      color: 'Blanco',
      status: 'esperando',
      laborCost: 0,
      extraCost: 0,
      diagnosis: 'Vehículo pendiente de inspección integral por testigo de motor.',
      notes: 'En espera de ingreso a bahía de diagnóstico.',
      photo: '',
      createdAt: nowIso()
    }
  ];

  const employees = [
    { id: uid('emp'), name: 'Emanuel Arturo Negrete Ayala', role: 'Supervisor técnico', phone: '4296980633', hireDate: '2023-01-05', salary: 16800, status: 'activo' },
    { id: uid('emp'), name: 'María del Consuelo Negrete Ayala', role: 'Administración', phone: '4296980601', hireDate: '2023-02-10', salary: 14200, status: 'activo' },
    { id: uid('emp'), name: 'Jesús Martínez', role: 'Técnico mecánico', phone: '4297781234', hireDate: '2024-08-11', salary: 11400, status: 'activo' }
  ];

  const parts = [
  // piezas demo originales (se dejan para no romper las asignaciones ya existentes)
  { id: uid('part'), code: 'PT-001', name: 'Termostato Versa', stock: 4, minStock: 2, unitCost: 420, supplier: 'AutoPartes Centro', location: 'Anaquel A-1' },
  { id: uid('part'), code: 'PT-002', name: 'Manguera superior radiador', stock: 6, minStock: 2, unitCost: 360, supplier: 'Refaccionaria del Bajio', location: 'Anaquel A-2' },
  { id: uid('part'), code: 'PT-003', name: 'Juego de balatas delanteras', stock: 3, minStock: 2, unitCost: 740, supplier: 'Frenos y Mas', location: 'Anaquel B-4' },

  // aceites de motor 1 litro / 946 ml
  { id: uid('part'), code: '8043107', name: 'Aceite motor sintetico Pentosin 5W-30 1L', stock: 24, minStock: 8, unitCost: 298, supplier: 'Pentosin / Mercado Libre', location: 'Lubricantes L-1' },
  { id: uid('part'), code: 'HMOSL-20W50-946M', name: 'Aceite motor mineral Hella 20W-50 1L', stock: 30, minStock: 10, unitCost: 103, supplier: 'Hella / Mercado Libre', location: 'Lubricantes L-2' },
  { id: uid('part'), code: '315503', name: 'Aceite motor sintetico Valvoline 5W-30 946ml', stock: 18, minStock: 6, unitCost: 160, supplier: 'Valvoline / AutoZone', location: 'Lubricantes L-3' },
  { id: uid('part'), code: 'EML5W3TA7BDD', name: 'Aceite motor sintetico Nissan 5W-30 1L', stock: 12, minStock: 4, unitCost: 185, supplier: 'Nissan / Mercado Libre', location: 'Lubricantes L-4' },

  // aceites de motor 1 galon / 3.78 L aprox
  { id: uid('part'), code: 'B0D43FQXVS', name: 'Aceite motor sintetico 5W-30 SP GF-6A 1 galon', stock: 8, minStock: 2, unitCost: 2699, supplier: 'Mercado Libre', location: 'Lubricantes G-1' },
  { id: uid('part'), code: '19239697', name: 'Aceite motor mineral ACDelco 15W-40 3.78L', stock: 14, minStock: 4, unitCost: 269, supplier: 'ACDelco / Mercado Libre', location: 'Lubricantes G-2' },
  { id: uid('part'), code: '19186238', name: 'Aceite motor mineral ACDelco 20W-50 3.78L', stock: 12, minStock: 4, unitCost: 646, supplier: 'ACDelco / Mercado Libre', location: 'Lubricantes G-3' },
  { id: uid('part'), code: 'VAL-PB7800-15W40-1G', name: 'Aceite motor Valvoline Premium Blue 7800 15W-40 1 galon', stock: 10, minStock: 3, unitCost: 723, supplier: 'Valvoline / Mercado Libre', location: 'Lubricantes G-4' },

  // bujias
  { id: uid('part'), code: '3887', name: 'Bujia NGK BKR6ES cobre', stock: 40, minStock: 12, unitCost: 95, supplier: 'NGK / AutoZone - Mercado Libre', location: 'Encendido E-1' },
  { id: uid('part'), code: '6418', name: 'Bujia NGK BKR6EIX iridium', stock: 24, minStock: 8, unitCost: 130, supplier: 'NGK / AutoZone - Mercado Libre', location: 'Encendido E-2' },
  { id: uid('part'), code: '4469', name: 'Bujia NGK LFR5AIX-11 iridium', stock: 20, minStock: 6, unitCost: 205, supplier: 'NGK / AutoZone - Mercado Libre', location: 'Encendido E-3' },
  { id: uid('part'), code: '93501', name: 'Bujia NGK LKAR7BIX-11S laser iridium', stock: 12, minStock: 4, unitCost: 360, supplier: 'NGK / AutoZone - Mercado Libre', location: 'Encendido E-4' },

  // filtros de aceite
  { id: uid('part'), code: 'PH6607', name: 'Filtro de aceite FRAM PH6607', stock: 28, minStock: 10, unitCost: 135, supplier: 'FRAM / Mercado Libre', location: 'Filtros F-1' },
  { id: uid('part'), code: 'GP91', name: 'Filtro de aceite Gonher GP-91', stock: 26, minStock: 10, unitCost: 120, supplier: 'Gonher / Mercado Libre', location: 'Filtros F-2' },
  { id: uid('part'), code: '1072091', name: 'Filtro de aceite STP SL5796', stock: 20, minStock: 6, unitCost: 145, supplier: 'STP / AutoZone', location: 'Filtros F-3' },
  { id: uid('part'), code: '1075997', name: 'Filtro de aceite STP SL3985', stock: 18, minStock: 6, unitCost: 149, supplier: 'STP / AutoZone', location: 'Filtros F-4' },

  // anticongelantes
  { id: uid('part'), code: 'HELLA-ANT-AMARILLO-1G', name: 'Anticongelante Hella amarillo listo para usar 1 galon', stock: 20, minStock: 6, unitCost: 231, supplier: 'Hella / Mercado Libre', location: 'Fluidos C-1' },
  { id: uid('part'), code: '8115203', name: 'Anticongelante Pentosin Pentofrost A1 rojo 1 galon', stock: 8, minStock: 2, unitCost: 1253, supplier: 'Pentosin / Mercado Libre', location: 'Fluidos C-2' },
  { id: uid('part'), code: '8115209', name: 'Anticongelante Pentosin Pentofrost A4 rosa 1 galon', stock: 8, minStock: 2, unitCost: 1052, supplier: 'Pentosin / Mercado Libre', location: 'Fluidos C-3' },
  { id: uid('part'), code: '939290', name: 'Anticongelante Prestone AF12050M premezclado', stock: 16, minStock: 4, unitCost: 289, supplier: 'Prestone / AutoZone', location: 'Fluidos C-4' },

  // aceite / liquido de direccion
  { id: uid('part'), code: '569359', name: 'Fluido direccion hidraulica Prestone 946ml', stock: 18, minStock: 6, unitCost: 186, supplier: 'Prestone / Mercado Libre - AutoZone', location: 'Direccion D-1' },
  { id: uid('part'), code: '672817', name: 'Liquido direccion hidraulica AutoZone 3330', stock: 16, minStock: 5, unitCost: 170, supplier: 'AutoZone', location: 'Direccion D-2' },
  { id: uid('part'), code: '183720', name: 'Liquido direccion hidraulica AutoZone 3262 350ml', stock: 22, minStock: 6, unitCost: 82, supplier: 'AutoZone', location: 'Direccion D-3' },

  // aceite / liquido de transmision
  { id: uid('part'), code: '19371512', name: 'Aceite transmision automatica ACDelco Dexron VI 946ml', stock: 20, minStock: 6, unitCost: 450, supplier: 'ACDelco / Mercado Libre', location: 'Transmision T-1' },
  { id: uid('part'), code: '88862170', name: 'Aceite transmision automatica ACDelco Dexron VI 946ml', stock: 20, minStock: 6, unitCost: 429, supplier: 'ACDelco / Mercado Libre', location: 'Transmision T-2' },
  { id: uid('part'), code: '93436060', name: 'Aceite transmision automatica ACDelco Dexron III 946ml', stock: 16, minStock: 5, unitCost: 360, supplier: 'ACDelco / Mercado Libre', location: 'Transmision T-3' },
  { id: uid('part'), code: '741347', name: 'Fluido transmision automatica Valvoline convencional 1 cuarto', stock: 14, minStock: 4, unitCost: 230, supplier: 'Valvoline / AutoZone', location: 'Transmision T-4' }
];

  const assignments = [
    { id: uid('asg'), vehicleId: vehicles[0].id, partId: parts[0].id, quantity: 1, unitCost: 420, subtotal: 420, notes: 'Cambio preventivo', date: '2026-04-09' },
    { id: uid('asg'), vehicleId: vehicles[0].id, partId: parts[1].id, quantity: 1, unitCost: 360, subtotal: 360, notes: 'Sustitución por fuga', date: '2026-04-09' },
    { id: uid('asg'), vehicleId: vehicles[1].id, partId: parts[2].id, quantity: 1, unitCost: 740, subtotal: 740, notes: 'Pendiente de instalación', date: '2026-04-13' }
  ];

  parts[0].stock -= 1;
  parts[1].stock -= 1;
  parts[2].stock -= 1;

  const invoices = [];
  const invoice = buildInvoice(vehicles[0].id, '2026-04-10', 'Transferencia', 'Trabajo concluido con prueba de ruta.', vehicles, parts, assignments);
  if (invoice) invoices.push(invoice);

  return {
    vehicles,
    employees,
    parts,
    assignments,
    invoices,
    meta: { version: 1, updatedAt: nowIso() }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    console.error('No se pudo cargar el almacenamiento local.', error);
    return null;
  }
}

function saveState() {
  state.meta = { ...(state.meta || {}), version: 1, updatedAt: nowIso() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindNavigation() {
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach((item) => item.classList.remove('active'));
      document.querySelectorAll('.page-section').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const section = button.dataset.section;
      document.getElementById(section).classList.add('active');
      ui.sectionTitle.textContent = sectionTitles[section] || 'Sistema';
    });
  });
}

function bindGlobalActions() {
  document.getElementById('resetDemoBtn').addEventListener('click', () => {
    if (!confirm('Se reemplazarán los datos actuales por el entorno demo.')) return;
    state = buildDemoState();
    saveState();
    clearAllForms();
    renderAll();
    toast('Se restableció la base demo.', 'success');
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sistema_taller_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importInput').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      const requiredKeys = ['vehicles', 'employees', 'parts', 'assignments', 'invoices'];
      const valid = requiredKeys.every((key) => Array.isArray(imported[key]));
      if (!valid) throw new Error('Estructura inválida');
      state = imported;
      saveState();
      clearAllForms();
      renderAll();
      toast('Datos importados correctamente.', 'success');
    } catch (error) {
      console.error(error);
      toast('No se pudo importar el archivo JSON.', 'danger');
    } finally {
      event.target.value = '';
    }
  });
}

function bindVehicleModule() {
  const form = document.getElementById('vehicleForm');
  const resetBtn = document.getElementById('vehicleResetBtn');
  const photoInput = document.getElementById('vehiclePhotoInput');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('vehicleId').value || uid('veh');
    const existing = state.vehicles.find((item) => item.id === id);
    const record = {
      id,
      entryDate: document.getElementById('vehicleEntryDate').value,
      deliveryDate: document.getElementById('vehicleDeliveryDate').value,
      client: clean(document.getElementById('vehicleClient').value),
      phone: clean(document.getElementById('vehiclePhone').value),
      plate: clean(document.getElementById('vehiclePlate').value).toUpperCase(),
      brand: clean(document.getElementById('vehicleBrand').value),
      model: clean(document.getElementById('vehicleModel').value),
      year: clean(document.getElementById('vehicleYear').value),
      color: clean(document.getElementById('vehicleColor').value),
      status: document.getElementById('vehicleStatus').value,
      laborCost: toNumber(document.getElementById('vehicleLaborCost').value),
      extraCost: toNumber(document.getElementById('vehicleExtraCost').value),
      diagnosis: clean(document.getElementById('vehicleDiagnosis').value),
      notes: clean(document.getElementById('vehicleNotes').value),
      photo: document.getElementById('vehiclePhotoData').value || existing?.photo || '',
      createdAt: existing?.createdAt || nowIso()
    };

    upsert(state.vehicles, record);
    saveState();
    clearVehicleForm();
    renderAll();
    toast(existing ? 'Vehículo actualizado.' : 'Vehículo registrado.', 'success');
  });

  resetBtn.addEventListener('click', clearVehicleForm);

  photoInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      document.getElementById('vehiclePhotoData').value = '';
      paintVehiclePreview('');
      return;
    }
    try {
      const photo = await resizeImage(file, 960, 640, 0.84);
      document.getElementById('vehiclePhotoData').value = photo;
      paintVehiclePreview(photo);
      toast('Foto del vehículo cargada.', 'info');
    } catch (error) {
      console.error(error);
      toast('No se pudo procesar la imagen.', 'danger');
    }
  });

  ui.vehicleSearch.addEventListener('input', renderVehicles);

  ui.vehicleCards.addEventListener('click', handleVehicleAction);
  ui.vehicleTable.addEventListener('click', handleVehicleAction);
}

function handleVehicleAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'edit') editVehicle(id);
  if (action === 'delete') deleteVehicle(id);
  if (action === 'invoice') prepareInvoiceFromVehicle(id);
}

function bindEmployeeModule() {
  const form = document.getElementById('employeeForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('employeeId').value || uid('emp');
    const existing = state.employees.find((item) => item.id === id);
    const record = {
      id,
      name: clean(document.getElementById('employeeName').value),
      role: clean(document.getElementById('employeeRole').value),
      phone: clean(document.getElementById('employeePhone').value),
      hireDate: document.getElementById('employeeHireDate').value,
      salary: toNumber(document.getElementById('employeeSalary').value),
      status: document.getElementById('employeeStatus').value,
      createdAt: existing?.createdAt || nowIso()
    };
    upsert(state.employees, record);
    saveState();
    clearEmployeeForm();
    renderAll();
    toast(existing ? 'Empleado actualizado.' : 'Empleado registrado.', 'success');
  });

  document.getElementById('employeeResetBtn').addEventListener('click', clearEmployeeForm);
  ui.employeeSearch.addEventListener('input', renderEmployees);
  ui.employeeTable.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'edit') editEmployee(id);
    if (action === 'delete') deleteEmployee(id);
  });
}

function bindPartModule() {
  const form = document.getElementById('partForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('partId').value || uid('part');
    const existing = state.parts.find((item) => item.id === id);
    const record = {
      id,
      code: clean(document.getElementById('partCode').value).toUpperCase(),
      name: clean(document.getElementById('partName').value),
      stock: parseInt(document.getElementById('partStock').value || '0', 10),
      minStock: parseInt(document.getElementById('partMinStock').value || '0', 10),
      unitCost: toNumber(document.getElementById('partUnitCost').value),
      supplier: clean(document.getElementById('partSupplier').value),
      location: clean(document.getElementById('partLocation').value),
      createdAt: existing?.createdAt || nowIso()
    };
    upsert(state.parts, record);
    saveState();
    clearPartForm();
    renderAll();
    toast(existing ? 'Pieza actualizada.' : 'Pieza registrada.', 'success');
  });

  document.getElementById('partResetBtn').addEventListener('click', clearPartForm);
  ui.partSearch.addEventListener('input', renderParts);

  ui.partTable.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'edit') editPart(id);
    if (action === 'delete') deletePart(id);
  });

  const partSelect = document.getElementById('assignmentPartId');
  partSelect.addEventListener('change', () => {
    const part = state.parts.find((item) => item.id === partSelect.value);
    document.getElementById('assignmentUnitCost').value = part ? Number(part.unitCost).toFixed(2) : '0.00';
  });

  document.getElementById('assignmentForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const vehicleId = document.getElementById('assignmentVehicleId').value;
    const partId = document.getElementById('assignmentPartId').value;
    const quantity = parseInt(document.getElementById('assignmentQty').value || '0', 10);
    const unitCost = toNumber(document.getElementById('assignmentUnitCost').value);
    const notes = clean(document.getElementById('assignmentNotes').value);

    const vehicle = state.vehicles.find((item) => item.id === vehicleId);
    const part = state.parts.find((item) => item.id === partId);
    if (!vehicle || !part) {
      toast('Selecciona un vehículo y una pieza válidos.', 'danger');
      return;
    }
    if (quantity <= 0) {
      toast('La cantidad debe ser mayor a cero.', 'danger');
      return;
    }
    if (part.stock < quantity) {
      toast('No hay suficiente stock para esta operación.', 'danger');
      return;
    }

    part.stock -= quantity;
    state.assignments.push({
      id: uid('asg'),
      vehicleId,
      partId,
      quantity,
      unitCost,
      subtotal: quantity * unitCost,
      notes,
      date: today()
    });

    saveState();
    document.getElementById('assignmentForm').reset();
    document.getElementById('assignmentQty').value = 1;
    renderAll();
    toast('Pieza enlazada al vehículo.', 'success');
  });

  ui.assignmentTable.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    if (button.dataset.action === 'delete-assignment') {
      deleteAssignment(button.dataset.id);
    }
  });
}

function bindInvoiceModule() {
  document.getElementById('invoiceForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const vehicleId = document.getElementById('invoiceVehicleId').value;
    if (!vehicleId) {
      toast('No hay vehículos finalizados disponibles.', 'danger');
      return;
    }
    const invoice = buildInvoice(
      vehicleId,
      document.getElementById('invoiceDate').value,
      document.getElementById('invoicePaymentMethod').value,
      clean(document.getElementById('invoiceNotes').value),
      state.vehicles,
      state.parts,
      state.assignments
    );
    if (!invoice) {
      toast('No se pudo generar la factura.', 'danger');
      return;
    }
    const existingIndex = state.invoices.findIndex((item) => item.vehicleId === vehicleId);
    if (existingIndex >= 0) {
      state.invoices[existingIndex] = invoice;
      toast('Factura actualizada.', 'success');
    } else {
      state.invoices.unshift(invoice);
      toast('Factura generada.', 'success');
    }
    saveState();
    renderAll();
    showInvoice(invoice.id);
  });

  document.getElementById('invoicePreviewBtn').addEventListener('click', () => {
    const vehicleId = document.getElementById('invoiceVehicleId').value;
    if (!vehicleId) {
      toast('Selecciona un vehículo finalizado.', 'danger');
      return;
    }
    const preview = buildInvoice(
      vehicleId,
      document.getElementById('invoiceDate').value,
      document.getElementById('invoicePaymentMethod').value,
      clean(document.getElementById('invoiceNotes').value),
      state.vehicles,
      state.parts,
      state.assignments
    );
    if (!preview) return;
    ui.invoicePreview.classList.remove('empty');
    ui.invoicePreview.innerHTML = renderInvoiceHTML(preview);
  });

  ui.invoiceSearch.addEventListener('input', renderInvoices);
  ui.invoiceTable.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'show') showInvoice(id);
    if (action === 'print') printInvoice(id);
    if (action === 'delete') deleteInvoice(id);
  });
}

function renderAll() {
  renderDashboard();
  renderVehicles();
  renderEmployees();
  renderParts();
  renderAssignments();
  refreshSelects();
  renderInvoices();
}

function renderDashboard() {
  const vehicles = state.vehicles;
  const employees = state.employees;
  const activeEmployees = employees.filter((item) => item.status === 'activo');
  const finalizados = vehicles.filter((item) => item.status === 'finalizado');

  const totalLabor = sum(vehicles.map((item) => toNumber(item.laborCost)));
  const totalExtras = sum(vehicles.map((item) => toNumber(item.extraCost)));
  const totalParts = sum(state.assignments.map((item) => toNumber(item.subtotal)));
  const totalRepairs = sum(vehicles.map((item) => vehicleTotal(item.id)));
  const payroll = sum(activeEmployees.map((item) => toNumber(item.salary)));
  const pendingStock = state.parts.filter((item) => Number(item.stock) <= Number(item.minStock)).length;

  const cards = [
    { label: 'Vehículos registrados', value: NUM.format(vehicles.length), foot: `${statusCount('esperando')} esperando / ${statusCount('en_trabajo')} en trabajo / ${statusCount('finalizado')} finalizados` },
    { label: 'Costo total registrado', value: MXN.format(totalRepairs), foot: `Incluye mano de obra, extras y piezas` },
    { label: 'Nómina activa', value: MXN.format(payroll), foot: `${activeEmployees.length} empleados activos` },
    { label: 'Alertas de inventario', value: NUM.format(pendingStock), foot: `Piezas en stock mínimo o menor` }
  ];

  ui.summaryCards.innerHTML = cards.map((card) => `
    <div class="col-12 col-md-6 col-xl-3">
      <div class="panel-card summary-card">
        <div class="summary-label">${escapeHTML(card.label)}</div>
        <div class="summary-value">${escapeHTML(card.value)}</div>
        <div class="summary-foot">${escapeHTML(card.foot)}</div>
      </div>
    </div>
  `).join('');

  ui.dashboardTable.innerHTML = `
    <thead>
      <tr>
        <th>Indicador</th>
        <th>Valor</th>
        <th>Comentario</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Vehículos finalizados</td><td>${NUM.format(finalizados.length)}</td><td>Unidades listas para entrega o facturación.</td></tr>
      <tr><td>Mano de obra acumulada</td><td>${MXN.format(totalLabor)}</td><td>Importe total capturado en órdenes.</td></tr>
      <tr><td>Extras acumulados</td><td>${MXN.format(totalExtras)}</td><td>Costos adicionales asociados a los trabajos.</td></tr>
      <tr><td>Piezas aplicadas</td><td>${MXN.format(totalParts)}</td><td>Subtotal consolidado de piezas enlazadas.</td></tr>
      <tr><td>Facturas generadas</td><td>${NUM.format(state.invoices.length)}</td><td>Documentos internos emitidos desde el sistema.</td></tr>
    </tbody>
  `;

  paintVehicleStatusChart();
  paintCostChart(totalLabor, totalExtras, totalParts);
  paintPayrollChart(activeEmployees);
}

function renderVehicles() {
  const term = clean(ui.vehicleSearch.value).toLowerCase();
  const vehicles = state.vehicles
    .filter((item) => {
      const blob = `${item.client} ${item.plate} ${item.brand} ${item.model}`.toLowerCase();
      return blob.includes(term);
    })
    .sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1));

  ui.vehicleCards.innerHTML = vehicles.length ? vehicles.map((vehicle) => {
    const piecesTotal = vehiclePartsTotal(vehicle.id);
    const total = vehicleTotal(vehicle.id);
    return `
      <article class="vehicle-item">
        ${vehicle.photo
          ? `<img class="vehicle-photo" src="${vehicle.photo}" alt="Vehículo ${escapeHTML(vehicle.plate)}">`
          : `<div class="vehicle-photo empty-card">Sin foto</div>`}
        <div class="vehicle-body">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <div>
              <div class="vehicle-card-title">${escapeHTML(vehicle.brand)} ${escapeHTML(vehicle.model)}</div>
              <div class="text-secondary-emphasis">${escapeHTML(vehicle.plate)} · ${escapeHTML(vehicle.client)}</div>
            </div>
            ${statusBadge(vehicle.status)}
          </div>
          <div class="vehicle-meta mb-3">
            <div><strong>Diagnóstico:</strong> ${escapeHTML(truncate(vehicle.diagnosis, 95))}</div>
            <div><strong>Mano de obra:</strong> ${MXN.format(toNumber(vehicle.laborCost))}</div>
            <div><strong>Piezas:</strong> ${MXN.format(piecesTotal)}</div>
            <div><strong>Total:</strong> ${MXN.format(total)}</div>
          </div>
          <div class="actions-inline">
            <button class="btn btn-sm btn-outline-light" data-action="edit" data-id="${vehicle.id}"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${vehicle.id}"><i class="bi bi-trash"></i></button>
            ${vehicle.status === 'finalizado' ? `<button class="btn btn-sm btn-warning text-dark" data-action="invoice" data-id="${vehicle.id}"><i class="bi bi-receipt"></i></button>` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('') : `<div class="panel-card"><p class="mb-0">No hay vehículos que coincidan con la búsqueda.</p></div>`;

  ui.vehicleTable.innerHTML = `
    <thead>
      <tr>
        <th>Ingreso</th>
        <th>Vehículo</th>
        <th>Cliente</th>
        <th>Estado</th>
        <th>Diagnóstico</th>
        <th>Piezas</th>
        <th>Total</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${vehicles.map((vehicle) => `
        <tr>
          <td>${escapeHTML(vehicle.entryDate || '-')}</td>
          <td>
            <div class="fw-semibold">${escapeHTML(vehicle.brand)} ${escapeHTML(vehicle.model)}</div>
            <div class="small">${escapeHTML(vehicle.plate)} · ${escapeHTML(vehicle.year || '-')}</div>
          </td>
          <td>${escapeHTML(vehicle.client)}</td>
          <td>${statusBadge(vehicle.status)}</td>
          <td>${escapeHTML(truncate(vehicle.diagnosis, 70))}</td>
          <td>${MXN.format(vehiclePartsTotal(vehicle.id))}</td>
          <td class="fw-semibold">${MXN.format(vehicleTotal(vehicle.id))}</td>
          <td>
            <div class="actions-inline">
              <button class="btn btn-sm btn-outline-light" data-action="edit" data-id="${vehicle.id}"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${vehicle.id}"><i class="bi bi-trash"></i></button>
              ${vehicle.status === 'finalizado' ? `<button class="btn btn-sm btn-warning text-dark" data-action="invoice" data-id="${vehicle.id}"><i class="bi bi-receipt"></i></button>` : ''}
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function renderEmployees() {
  const term = clean(ui.employeeSearch.value).toLowerCase();
  const employees = state.employees.filter((item) => `${item.name} ${item.role}`.toLowerCase().includes(term));
  ui.employeeTable.innerHTML = `
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Puesto</th>
        <th>Teléfono</th>
        <th>Ingreso</th>
        <th>Sueldo</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${employees.map((item) => `
        <tr>
          <td class="fw-semibold">${escapeHTML(item.name)}</td>
          <td>${escapeHTML(item.role)}</td>
          <td>${escapeHTML(item.phone || '-')}</td>
          <td>${escapeHTML(item.hireDate || '-')}</td>
          <td>${MXN.format(toNumber(item.salary))}</td>
          <td>${statusBadge(item.status)}</td>
          <td>
            <div class="actions-inline">
              <button class="btn btn-sm btn-outline-light" data-action="edit" data-id="${item.id}"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function renderParts() {
  const term = clean(ui.partSearch.value).toLowerCase();
  const parts = state.parts.filter((item) => `${item.code} ${item.name} ${item.supplier}`.toLowerCase().includes(term));
  ui.partTable.innerHTML = `
    <thead>
      <tr>
        <th>Código</th>
        <th>Nombre</th>
        <th>Stock</th>
        <th>Mínimo</th>
        <th>Costo</th>
        <th>Proveedor</th>
        <th>Ubicación</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${parts.map((item) => `
        <tr>
          <td class="fw-semibold">${escapeHTML(item.code)}</td>
          <td>${escapeHTML(item.name)}</td>
          <td>${NUM.format(item.stock)}</td>
          <td>${NUM.format(item.minStock)}</td>
          <td>${MXN.format(toNumber(item.unitCost))}</td>
          <td>${escapeHTML(item.supplier || '-')}</td>
          <td>${escapeHTML(item.location || '-')}</td>
          <td>
            <div class="d-flex flex-column gap-2 align-items-start">
              ${stockBadge(item)}
              <div class="actions-inline">
                <button class="btn btn-sm btn-outline-light" data-action="edit" data-id="${item.id}"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function renderAssignments() {
  const rows = [...state.assignments].sort((a, b) => (a.date < b.date ? 1 : -1));
  ui.assignmentTable.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Vehículo</th>
        <th>Pieza</th>
        <th>Cantidad</th>
        <th>Costo unitario</th>
        <th>Subtotal</th>
        <th>Notas</th>
        <th>Acción</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((item) => {
        const vehicle = state.vehicles.find((v) => v.id === item.vehicleId);
        const part = state.parts.find((p) => p.id === item.partId);
        return `
          <tr>
            <td>${escapeHTML(item.date || '-')}</td>
            <td>${vehicle ? `${escapeHTML(vehicle.brand)} ${escapeHTML(vehicle.model)} · ${escapeHTML(vehicle.plate)}` : 'Vehículo eliminado'}</td>
            <td>${part ? `${escapeHTML(part.code)} · ${escapeHTML(part.name)}` : 'Pieza eliminada'}</td>
            <td>${NUM.format(item.quantity)}</td>
            <td>${MXN.format(toNumber(item.unitCost))}</td>
            <td class="fw-semibold">${MXN.format(toNumber(item.subtotal))}</td>
            <td>${escapeHTML(item.notes || '-')}</td>
            <td><button class="btn btn-sm btn-outline-danger" data-action="delete-assignment" data-id="${item.id}"><i class="bi bi-trash"></i></button></td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
}

function renderInvoices() {
  const term = clean(ui.invoiceSearch.value).toLowerCase();
  const invoices = state.invoices
    .filter((item) => `${item.folio} ${item.client} ${item.plate}`.toLowerCase().includes(term))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  ui.invoiceTable.innerHTML = `
    <thead>
      <tr>
        <th>Folio</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th>Vehículo</th>
        <th>Total</th>
        <th>Pago</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${invoices.map((item) => `
        <tr>
          <td class="fw-semibold">${escapeHTML(item.folio)}</td>
          <td>${escapeHTML(item.date)}</td>
          <td>${escapeHTML(item.client)}</td>
          <td>${escapeHTML(item.brand)} ${escapeHTML(item.model)} · ${escapeHTML(item.plate)}</td>
          <td>${MXN.format(toNumber(item.total))}</td>
          <td>${escapeHTML(item.paymentMethod)}</td>
          <td>
            <div class="actions-inline">
              <button class="btn btn-sm btn-outline-light" data-action="show" data-id="${item.id}"><i class="bi bi-eye"></i></button>
              <button class="btn btn-sm btn-warning text-dark" data-action="print" data-id="${item.id}"><i class="bi bi-printer"></i></button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  if (!invoices.length) {
    ui.invoicePreview.className = 'invoice-preview empty';
    ui.invoicePreview.textContent = 'Selecciona un vehículo finalizado para visualizar la factura.';
  }
}

function refreshSelects() {
  const vehicleOptions = state.vehicles
    .sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1))
    .map((item) => `<option value="${item.id}">${escapeHTML(item.brand)} ${escapeHTML(item.model)} · ${escapeHTML(item.plate)} · ${escapeHTML(item.client)}</option>`)
    .join('');

  document.getElementById('assignmentVehicleId').innerHTML = vehicleOptions || '<option value="">Sin vehículos</option>';

  const partOptions = state.parts
    .map((item) => `<option value="${item.id}">${escapeHTML(item.code)} · ${escapeHTML(item.name)} · Stock ${item.stock}</option>`)
    .join('');
  document.getElementById('assignmentPartId').innerHTML = partOptions || '<option value="">Sin piezas</option>';

  const selectedPart = state.parts[0];
  document.getElementById('assignmentUnitCost').value = selectedPart ? Number(selectedPart.unitCost).toFixed(2) : '0.00';

  const finalizados = state.vehicles.filter((item) => item.status === 'finalizado');
  document.getElementById('invoiceVehicleId').innerHTML = finalizados.length
    ? finalizados.map((item) => `<option value="${item.id}">${escapeHTML(item.brand)} ${escapeHTML(item.model)} · ${escapeHTML(item.plate)} · ${escapeHTML(item.client)}</option>`).join('')
    : '<option value="">Sin vehículos finalizados</option>';
}

function editVehicle(id) {
  const item = state.vehicles.find((row) => row.id === id);
  if (!item) return;
  document.getElementById('vehicleId').value = item.id;
  document.getElementById('vehicleEntryDate').value = item.entryDate || '';
  document.getElementById('vehicleDeliveryDate').value = item.deliveryDate || '';
  document.getElementById('vehicleClient').value = item.client || '';
  document.getElementById('vehiclePhone').value = item.phone || '';
  document.getElementById('vehiclePlate').value = item.plate || '';
  document.getElementById('vehicleBrand').value = item.brand || '';
  document.getElementById('vehicleModel').value = item.model || '';
  document.getElementById('vehicleYear').value = item.year || '';
  document.getElementById('vehicleColor').value = item.color || '';
  document.getElementById('vehicleStatus').value = item.status || 'esperando';
  document.getElementById('vehicleLaborCost').value = toNumber(item.laborCost).toFixed(2);
  document.getElementById('vehicleExtraCost').value = toNumber(item.extraCost).toFixed(2);
  document.getElementById('vehicleDiagnosis').value = item.diagnosis || '';
  document.getElementById('vehicleNotes').value = item.notes || '';
  document.getElementById('vehiclePhotoData').value = item.photo || '';
  document.getElementById('vehiclePhotoInput').value = '';
  paintVehiclePreview(item.photo || '');
  navigateTo('vehiculos');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteVehicle(id) {
  const hasInvoice = state.invoices.some((item) => item.vehicleId === id);
  if (hasInvoice) {
    toast('Elimina primero la factura asociada al vehículo.', 'danger');
    return;
  }
  if (!confirm('¿Eliminar este vehículo y sus piezas enlazadas?')) return;
  const removedAssignments = state.assignments.filter((item) => item.vehicleId === id);
  removedAssignments.forEach((item) => {
    const part = state.parts.find((p) => p.id === item.partId);
    if (part) part.stock += item.quantity;
  });
  state.assignments = state.assignments.filter((item) => item.vehicleId !== id);
  state.vehicles = state.vehicles.filter((item) => item.id !== id);
  saveState();
  renderAll();
  toast('Vehículo eliminado.', 'success');
}

function editEmployee(id) {
  const item = state.employees.find((row) => row.id === id);
  if (!item) return;
  document.getElementById('employeeId').value = item.id;
  document.getElementById('employeeName').value = item.name || '';
  document.getElementById('employeeRole').value = item.role || '';
  document.getElementById('employeePhone').value = item.phone || '';
  document.getElementById('employeeHireDate').value = item.hireDate || '';
  document.getElementById('employeeSalary').value = toNumber(item.salary).toFixed(2);
  document.getElementById('employeeStatus').value = item.status || 'activo';
  navigateTo('nominas');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteEmployee(id) {
  if (!confirm('¿Eliminar este empleado del registro?')) return;
  state.employees = state.employees.filter((item) => item.id !== id);
  saveState();
  renderAll();
  toast('Empleado eliminado.', 'success');
}

function editPart(id) {
  const item = state.parts.find((row) => row.id === id);
  if (!item) return;
  document.getElementById('partId').value = item.id;
  document.getElementById('partCode').value = item.code || '';
  document.getElementById('partName').value = item.name || '';
  document.getElementById('partStock').value = item.stock;
  document.getElementById('partMinStock').value = item.minStock;
  document.getElementById('partUnitCost').value = toNumber(item.unitCost).toFixed(2);
  document.getElementById('partSupplier').value = item.supplier || '';
  document.getElementById('partLocation').value = item.location || '';
  navigateTo('piezas');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deletePart(id) {
  const inUse = state.assignments.some((item) => item.partId === id);
  if (inUse) {
    toast('No puedes eliminar una pieza enlazada a un vehículo.', 'danger');
    return;
  }
  if (!confirm('¿Eliminar esta pieza del inventario?')) return;
  state.parts = state.parts.filter((item) => item.id !== id);
  saveState();
  renderAll();
  toast('Pieza eliminada.', 'success');
}

function deleteAssignment(id) {
  if (!confirm('¿Eliminar esta asignación y devolver el stock al inventario?')) return;
  const assignment = state.assignments.find((item) => item.id === id);
  if (!assignment) return;
  const part = state.parts.find((item) => item.id === assignment.partId);
  if (part) part.stock += assignment.quantity;
  state.assignments = state.assignments.filter((item) => item.id !== id);
  saveState();
  renderAll();
  toast('Asignación eliminada y stock restituido.', 'success');
}

function prepareInvoiceFromVehicle(id) {
  navigateTo('facturas');
  document.getElementById('invoiceVehicleId').value = id;
  const draft = buildInvoice(id, document.getElementById('invoiceDate').value, document.getElementById('invoicePaymentMethod').value, clean(document.getElementById('invoiceNotes').value), state.vehicles, state.parts, state.assignments);
  if (draft) {
    ui.invoicePreview.classList.remove('empty');
    ui.invoicePreview.innerHTML = renderInvoiceHTML(draft);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showInvoice(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) return;
  navigateTo('facturas');
  ui.invoicePreview.className = 'invoice-preview';
  ui.invoicePreview.innerHTML = renderInvoiceHTML(invoice);
}

function deleteInvoice(id) {
  if (!confirm('¿Eliminar esta factura?')) return;
  state.invoices = state.invoices.filter((item) => item.id !== id);
  saveState();
  renderAll();
  toast('Factura eliminada.', 'success');
}

function printInvoice(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) return;
  const win = window.open('', '_blank', 'width=1080,height=760');
  if (!win) {
    toast('Permite ventanas emergentes para imprimir.', 'danger');
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHTML(invoice.folio)}</title>
      <style>
        body{font-family:Arial,sans-serif;background:#f5f7fb;margin:0;padding:24px;color:#111827}
        .sheet{max-width:980px;margin:0 auto;background:#fff;border-radius:18px;padding:28px;box-shadow:0 12px 30px rgba(0,0,0,.12)}
        h1,h2,h3,h4,h5,p,div,span,strong,td,th{color:#111827}
        .muted{color:#4b5563}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{padding:10px;border-bottom:1px solid #d1d5db;text-align:left}
        .text-end{text-align:right}
        .head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
      </style>
    </head>
    <body>
      <div class="sheet">${renderInvoiceHTML(invoice)}</div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  win.document.close();
}

function renderInvoiceHTML(invoice) {
  return `
    <div class="invoice-sheet">
      <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
        <div>
          <div class="small-muted text-uppercase">mecanica automotriz granados</div>
          <h4 class="mb-1">Factura interna de servicio</h4>
          <div class="small-muted">Sistema digital del taller</div>
        </div>
        <div class="text-end">
          <div><strong>Folio:</strong> ${escapeHTML(invoice.folio)}</div>
          <div><strong>Fecha:</strong> ${escapeHTML(invoice.date)}</div>
          <div><strong>Método de pago:</strong> ${escapeHTML(invoice.paymentMethod)}</div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <div><strong>Cliente:</strong> ${escapeHTML(invoice.client)}</div>
          <div><strong>Teléfono:</strong> ${escapeHTML(invoice.phone || '-')}</div>
        </div>
        <div class="col-md-6">
          <div><strong>Vehículo:</strong> ${escapeHTML(invoice.brand)} ${escapeHTML(invoice.model)} ${escapeHTML(invoice.year || '')}</div>
          <div><strong>Placa:</strong> ${escapeHTML(invoice.plate)}</div>
          <div><strong>Estado:</strong> ${escapeHTML(invoice.statusLabel)}</div>
        </div>
      </div>

      <div class="mb-3">
        <strong>Diagnóstico:</strong>
        <div class="small-muted">${escapeHTML(invoice.diagnosis || '-')}</div>
      </div>

      <div class="mb-3">
        <strong>Trabajo realizado:</strong>
        <div class="small-muted">${escapeHTML(invoice.notes || invoice.repairNotes || '-')}</div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Cantidad</th>
            <th>Costo unitario</th>
            <th class="text-end">Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mano de obra</td>
            <td>1</td>
            <td>${MXN.format(invoice.laborCost)}</td>
            <td class="text-end">${MXN.format(invoice.laborCost)}</td>
          </tr>
          ${invoice.partsLines.map((line) => `
            <tr>
              <td>${escapeHTML(line.name)}</td>
              <td>${NUM.format(line.quantity)}</td>
              <td>${MXN.format(line.unitCost)}</td>
              <td class="text-end">${MXN.format(line.subtotal)}</td>
            </tr>
          `).join('')}
          <tr>
            <td>Costo adicional</td>
            <td>1</td>
            <td>${MXN.format(invoice.extraCost)}</td>
            <td class="text-end">${MXN.format(invoice.extraCost)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th colspan="3" class="text-end">Total</th>
            <th class="text-end">${MXN.format(invoice.total)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function buildInvoice(vehicleId, date, paymentMethod, notes, vehicles, parts, assignments) {
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) return null;
  const assigned = assignments.filter((item) => item.vehicleId === vehicleId);
  const partsLines = assigned.map((item) => {
    const part = parts.find((p) => p.id === item.partId);
    return {
      name: part ? `${part.code} · ${part.name}` : 'Pieza eliminada',
      quantity: item.quantity,
      unitCost: toNumber(item.unitCost),
      subtotal: toNumber(item.subtotal)
    };
  });
  const laborCost = toNumber(vehicle.laborCost);
  const extraCost = toNumber(vehicle.extraCost);
  const partsCost = sum(partsLines.map((line) => line.subtotal));
  return {
    id: uid('inv'),
    vehicleId: vehicle.id,
    folio: `FAC-${String(Date.now()).slice(-8)}`,
    date: date || today(),
    paymentMethod: paymentMethod || 'Efectivo',
    client: vehicle.client,
    phone: vehicle.phone,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    plate: vehicle.plate,
    statusLabel: labelFromStatus(vehicle.status),
    diagnosis: vehicle.diagnosis,
    repairNotes: vehicle.notes,
    notes,
    laborCost,
    extraCost,
    partsCost,
    total: laborCost + extraCost + partsCost,
    partsLines,
    createdAt: nowIso()
  };
}

function paintVehicleStatusChart() {
  const ctx = document.getElementById('chartVehicleStatus');
  if (charts.vehicleStatus) charts.vehicleStatus.destroy();
  charts.vehicleStatus = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Esperando', 'En trabajo', 'Finalizado'],
      datasets: [{
        label: 'Vehículos',
        data: [statusCount('esperando'), statusCount('en_trabajo'), statusCount('finalizado')],
        backgroundColor: ['rgba(255, 200, 87, 0.75)', 'rgba(96, 165, 250, 0.75)', 'rgba(45, 212, 191, 0.75)'],
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: chartOptions()
  });
}

function paintCostChart(totalLabor, totalExtras, totalParts) {
  const ctx = document.getElementById('chartCosts');
  if (charts.costs) charts.costs.destroy();
  charts.costs = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Mano de obra', 'Extras', 'Piezas'],
      datasets: [{
        data: [totalLabor, totalExtras, totalParts],
        backgroundColor: ['rgba(255, 200, 87, 0.8)', 'rgba(255, 159, 28, 0.8)', 'rgba(45, 212, 191, 0.8)'],
        borderColor: '#101828',
        borderWidth: 2
      }]
    },
    options: {
      ...chartOptions(),
      plugins: {
        ...chartOptions().plugins,
        legend: { labels: { color: '#dce7fb' } }
      }
    }
  });
}

function paintPayrollChart(activeEmployees) {
  const ctx = document.getElementById('chartPayroll');
  if (charts.payroll) charts.payroll.destroy();
  charts.payroll = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: activeEmployees.map((item) => item.name.split(' ').slice(0, 2).join(' ')),
      datasets: [{
        label: 'Sueldo mensual',
        data: activeEmployees.map((item) => toNumber(item.salary)),
        backgroundColor: 'rgba(255, 200, 87, 0.75)',
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: {
      ...chartOptions(),
      indexAxis: 'y'
    }
  });
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: '#dce7fb' },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        ticks: { color: '#dce7fb' },
        grid: { color: 'rgba(255,255,255,0.06)' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.raw;
            return typeof value === 'number' && value > 999 ? MXN.format(value) : value;
          }
        }
      }
    }
  };
}

function setDefaultDates() {
  if (!document.getElementById('vehicleEntryDate').value) document.getElementById('vehicleEntryDate').value = today();
  if (!document.getElementById('employeeHireDate').value) document.getElementById('employeeHireDate').value = today();
  if (!document.getElementById('invoiceDate').value) document.getElementById('invoiceDate').value = today();
  if (!document.getElementById('assignmentQty').value) document.getElementById('assignmentQty').value = 1;
}

function clearAllForms() {
  clearVehicleForm();
  clearEmployeeForm();
  clearPartForm();
  document.getElementById('assignmentForm').reset();
  document.getElementById('assignmentQty').value = 1;
  setDefaultDates();
}

function clearVehicleForm() {
  document.getElementById('vehicleForm').reset();
  document.getElementById('vehicleId').value = '';
  document.getElementById('vehiclePhotoData').value = '';
  document.getElementById('vehiclePhotoInput').value = '';
  paintVehiclePreview('');
  setDefaultDates();
}

function clearEmployeeForm() {
  document.getElementById('employeeForm').reset();
  document.getElementById('employeeId').value = '';
  setDefaultDates();
}

function clearPartForm() {
  document.getElementById('partForm').reset();
  document.getElementById('partId').value = '';
}

function paintVehiclePreview(src) {
  const preview = document.getElementById('vehiclePhotoPreview');
  if (!src) {
    preview.classList.add('empty');
    preview.innerHTML = 'Sin imagen';
    return;
  }
  preview.classList.remove('empty');
  preview.innerHTML = `<img src="${src}" alt="Vista previa del vehículo">`;
}

async function resizeImage(file, maxWidth, maxHeight, quality) {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function navigateTo(section) {
  document.querySelectorAll('.nav-btn').forEach((item) => item.classList.toggle('active', item.dataset.section === section));
  document.querySelectorAll('.page-section').forEach((item) => item.classList.toggle('active', item.id === section));
  ui.sectionTitle.textContent = sectionTitles[section] || 'Sistema';
}

function vehiclePartsTotal(vehicleId) {
  return sum(state.assignments.filter((item) => item.vehicleId === vehicleId).map((item) => toNumber(item.subtotal)));
}

function vehicleTotal(vehicleId) {
  const vehicle = state.vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) return 0;
  return toNumber(vehicle.laborCost) + toNumber(vehicle.extraCost) + vehiclePartsTotal(vehicleId);
}

function statusCount(status) {
  return state.vehicles.filter((item) => item.status === status).length;
}

function statusBadge(status) {
  return `<span class="badge-soft badge-${status}">${escapeHTML(labelFromStatus(status))}</span>`;
}

function stockBadge(part) {
  const low = Number(part.stock) <= Number(part.minStock);
  return `<span class="badge-soft ${low ? 'badge-stock-low' : 'badge-stock-ok'}">${low ? 'stock bajo' : 'stock estable'}</span>`;
}

function labelFromStatus(status) {
  if (status === 'esperando') return 'Esperando';
  if (status === 'en_trabajo') return 'En trabajo';
  if (status === 'finalizado') return 'Finalizado';
  if (status === 'activo') return 'Activo';
  if (status === 'baja') return 'Baja';
  return status || '-';
}

function upsert(list, record) {
  const index = list.findIndex((item) => item.id === record.id);
  if (index >= 0) list[index] = record;
  else list.unshift(record);
}

function toast(message, variant = 'primary') {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="toast align-items-center text-bg-${variant} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${escapeHTML(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  const toastEl = wrapper.firstElementChild;
  ui.toastContainer.appendChild(toastEl);
  const instance = new bootstrap.Toast(toastEl, { delay: 2400 });
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  instance.show();
}

function sum(values) {
  return values.reduce((acc, value) => acc + toNumber(value), 0);
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clean(value) {
  return String(value ?? '').trim();
}

function truncate(text, limit) {
  const safe = clean(text);
  return safe.length > limit ? `${safe.slice(0, limit - 1)}…` : safe;
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
