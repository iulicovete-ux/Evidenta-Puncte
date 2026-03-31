const ACTIVITIES = {
  // ===== FIXED =====
  donatii_familie: {
    label: "Donații familie",
    type: "fixed",
    points: 3,
  },

  postat_anunt: {
    label: "Postat anunț angajare",
    type: "fixed",
    points: 1,
  },

  idee_eveniment: {
    label: "Idee eveniment + organizare",
    type: "fixed",
    points: 2,
  },

  mineriada: {
    label: "Mineriadă + procesare",
    type: "fixed",
    points: 3,
  },

  participare_eveniment: {
    label: "Participare eveniment",
    type: "fixed",
    points: 1,
  },

  ajutat_rafinat: {
    label: "Ajutat rafinat",
    type: "fixed",
    points: 1,
  },

  adus_angajat: {
    label: "Adus angajat la service",
    type: "fixed",
    points: 1,
  },

  cultivare: {
    label: "Cultivare plantație",
    type: "fixed",
    points: 3,
  },

  transport_ls_cayo: {
    label: "Transport LS - Cayo",
    type: "fixed",
    points: 1,
  },

  actiuni_service: {
    label: "Acțiuni service",
    type: "fixed",
    points: 1,
  },

  angajare_merida: {
    label: "Angajare Merida",
    type: "fixed",
    points: 2,
  },

  jaf: {
    label: "Jaf",
    type: "fixed",
    points: 7,
  },

  rapire: {
    label: "Răpire",
    type: "fixed",
    points: 5,
  },

  // ===== HOURLY =====
  plimbare: {
    label: "Plimbare",
    type: "hourly",
    pointsPerUnit: 1,
  },

  patrula_ls: {
    label: "Patrulă LS",
    type: "hourly",
    pointsPerUnit: 1,
  },

  patrula_cayo: {
    label: "Patrulă Cayo",
    type: "hourly",
    pointsPerUnit: 1,
  },

  asist_cayo: {
    label: "Asist Cayo + păzit",
    type: "hourly",
    pointsPerUnit: 1,
  },

  actiune_angajari: {
    label: "Acțiune angajări",
    type: "hourly",
    pointsPerUnit: 1,
  },

  // ===== QUANTITY =====
  livrat_familie: {
    label: "Livrat familie",
    type: "quantity",
    unitSize: 50, // 50 plicuri = 1 pct
    pointsPerUnit: 1,
  },

  livrat_membru: {
    label: "Livrat membru",
    type: "quantity",
    unitSize: 50,
    pointsPerUnit: 1,
  },
};

// ===== HELPERS =====

function getActivity(key) {
  return ACTIVITIES[key];
}

function getAllActivities() {
  return ACTIVITIES;
}

module.exports = {
  ACTIVITIES,
  getActivity,
  getAllActivities,
};
