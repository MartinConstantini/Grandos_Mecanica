
const DB_KEY = 'mag_taller_db_v1';

const demoData = {
  appointments: [
    {
      id: crypto.randomUUID(),
      date: '2026-04-02',
      time: '09:00',
      client: 'Juan Pérez',
      phone: '4291002233',
      vehicle: 'Nissan Versa',
      model: '2020',
      plate: 'GTO-123-A',
      status: 'Confirmada',
      notes: 'Revisión general y testigo de motor encendido'
    },
    {
      id: crypto.randomUUID(),
      date: '2026-04-04',
      time: '12:30',
      client: 'María López',
      phone: '4295534400',
      vehicle: 'Chevrolet Aveo',
      model: '2018',
      plate: 'ABC-219-Z',
      status: 'Atendida',
      notes: 'Servicio de frenos y cambio de aceite'
    }
  ],
  repairs: [
    {
      id: crypto.randomUUID(),
      entryDate: '2026-04-02',
      deliveryDate: '2026-04-03',
      client: 'Juan Pérez',
      technician: 'Carlos Ramírez',
      vehicle: 'Nissan Versa',
      model: '2020',
      status: 'En reparación',
      labor: 1800,
      parts: 2450,
      diagnosis: 'Código P0301, vibración en ralentí y caída intermitente de potencia.',
      action: 'Cambio de bobina, bujía, limpieza de cuerpo de aceleración y borrado de códigos.',
      notes: 'Se recomienda afinación preventiva en 3 meses.'
    },
    {
      id: crypto.randomUUID(),
      entryDate: '2026-04-04',
      deliveryDate: '2026-04-04',
      client: 'María López',
      technician: 'Luis Granados',
      vehicle: 'Chevrolet Aveo',
      model: '2018',
      status: 'Finalizada',
      labor: 900,
      parts: 1200,
      diagnosis: 'Desgaste irregular en balatas y ruido por cristalización.',
      action: 'Cambio de balatas delanteras y rectificado ligero.',
      notes: 'Vehículo entregado con prueba de ruta.'
    }
  ],
  expenses: [
    {
      id: crypto.randomUUID(),
      date: '2026-04-01',
      category: 'Infraestructura TI',
      provider: 'TecnoRed Bajío',
      amount: 2499.00,
      method: 'Transferencia',
      concept: 'Adquisición de dos repetidores WiFi compatibles con modo mesh.'
    },
    {
      id: crypto.randomUUID(),
      date: '2026-04-05',
      category: 'Mantenimiento',
      provider: 'Refacciones y Servicio',
      amount: 1350.00,
      method: 'Efectivo',
      concept: 'Limpieza técnica y actualización de escáner automotriz.'
    },
    {
      id: crypto.randomUUID(),
      date: '2026-04-08',
      category: 'Nómina',
      provider: 'Personal técnico',
      amount: 5200.00,
      method: 'Transferencia',
      concept: 'Pago parcial de nómina semanal.'
    }
  ],
  network: [
    {
      id: crypto.randomUUID(),
      date: '2026-04-01',
      location: 'Recepción',
      device: 'TP-Link Deco X20',
      mode: 'Router principal',
      ip: '192.168.1.1',
      status: 'Operativo',
      actions: 'Configuración de SSID principal, canal automático, DHCP y seguridad WPA2/WPA3.',
      notes: 'Nodo maestro enlazado con taller y oficina.'
    },
    {
      id: crypto.randomUUID(),
      date: '2026-04-01',
      location: 'Área de taller',
      device: 'TP-Link Deco X20',
      mode: 'Nodo mesh',
      ip: '192.168.1.2',
      status: 'Operativo',
      actions: 'Instalación y sincronización de nodo secundario para extender cobertura.',
      notes: 'Mejora en escaneo y consulta de historial.'
    }
  ],
  assets: [
    {
      id: crypto.randomUUID(),
      type: 'Escáner automotriz',
      name: 'Autel MaxiCheck',
      brand: 'Autel',
      model: 'MX808',
      serial: 'AUTEL-MX808-01',
      status: 'Operativo',
      lastService: '2026-04-05',
      nextService: '2026-07-05',
      actions: 'Actualización de firmware, validación OBD-II y limpieza de conectores.',
      notes: 'Sin fallas críticas.'
    },
    {
      id: crypto.randomUUID(),
      type: 'PC',
      name: 'Equipo recepción',
      brand: 'Dell',
      model: 'OptiPlex 3070',
      serial: 'DELL-3070-RX',
      status: 'Operativo',
      lastService: '2026-04-07',
      nextService: '2026-08-07',
      actions: 'Optimización de inicio, limpieza interna, actualización del navegador y respaldo.',
      notes: 'Respuesta estable.'
    }
  ]
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function getDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(demoData));
    return clone(demoData);
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...clone(demoData), ...parsed };
  } catch {
    localStorage.setItem(DB_KEY, JSON.stringify(demoData));
    return clone(demoData);
  }
}

export function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

export function resetDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(demoData));
  return clone(demoData);
}

export function exportDb() {
  return JSON.stringify(getDb(), null, 2);
}

export function upsertItem(collection, item) {
  const db = getDb();
  const items = db[collection] || [];
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) items[index] = item;
  else items.unshift(item);
  db[collection] = items;
  saveDb(db);
  return db;
}

export function deleteItem(collection, id) {
  const db = getDb();
  db[collection] = (db[collection] || []).filter((i) => i.id !== id);
  saveDb(db);
  return db;
}

export function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const str = String(value ?? '');
    return `"${str.replaceAll('"', '""')}"`;
  };
  return [headers.join(','), ...rows.map(row => headers.map(h => escape(row[h])).join(','))].join('\n');
}
