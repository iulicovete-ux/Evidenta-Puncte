// src/config/activities.js
const ACTIVITIES = {
  // ===== SPECIAL =====
  donatii_familie: {
    label: "Donații familie",
    type: "donation_family",
    options: {
      otel: {
        label: "Oțel",
        mode: "quantity",
        unitSize: 25,
        pointsPerUnit: 3,
      },
      sulf: {
        label: "Sulf",
        mode: "quantity",
        unitSize: 50,
        pointsPerUnit: 3,
      },
      polimer: {
        label: "Polimer",
        mode: "quantity",
        unitSize: 500,
        pointsPerUnit: 3,
      },
      fosfor: {
        label: "Fosfor",
        mode: "quantity",
        unitSize: 100,
        pointsPerUnit: 3,
      },
      baterie: {
        label: "Baterie",
        mode: "quantity",
        unitSize: 1,
        pointsPerUnit: 1,
      },
      placa: {
        label: "Placă",
        mode: "quantity",
        unitSize: 1,
        pointsPerUnit: 1,
      },
      fire: {
        label: "Fire",
        mode: "quantity",
        unitSize: 1,
        pointsPerUnit: 1,
      },
      gps_tracker: {
        label: "GPS Tracker",
        mode: "quantity",
        unitSize: 1,
        pointsPerUnit: 5,
      },
      hacking_device: {
        label: "Hacking Device",
        mode: "quantity",
        unitSize: 1,
        pointsPerUnit: 5,
      },
    },
  },

  // ===== FIXED =====
  actiune_generala: {
    label: "Acțiune generală",
    type: "fixed_with_required_note",
    points: 1,
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

  // ===== SPECIAL QUANTITY =====
  livrat_familie: {
    label: "Livrat familie",
    type: "delivery_quantity",
    options: {
      meta: {
        label: "Meta",
        unitSize: 50,
        pointsPerUnit: 1,
      },
      carduri_lsd: {
        label: "Carduri / LSD",
        unitSize: 35,
        pointsPerUnit: 1,
      },
    },
  },

  livrat_membru: {
    label: "Livrat membru",
    type: "delivery_quantity",
    options: {
      meta: {
        label: "Meta",
        unitSize: 50,
        pointsPerUnit: 1,
      },
      carduri_lsd: {
        label: "Carduri / LSD",
        unitSize: 35,
        pointsPerUnit: 1,
      },
    },
  },
};

function getActivity(key) {
  return ACTIVITIES[key];
}

function getAllActivities() {
  return ACTIVITIES;
}

function getDonationOption(activityKey, optionKey) {
  const activity = ACTIVITIES[activityKey];

  if (!activity || activity.type !== "donation_family") {
    return null;
  }

  return activity.options[optionKey] || null;
}

function getDeliveryOption(activityKey, optionKey) {
  const activity = ACTIVITIES[activityKey];

  if (!activity || activity.type !== "delivery_quantity") {
    return null;
  }

  return activity.options[optionKey] || null;
}

module.exports = {
  ACTIVITIES,
  getActivity,
  getAllActivities,
  getDonationOption,
  getDeliveryOption,
};
