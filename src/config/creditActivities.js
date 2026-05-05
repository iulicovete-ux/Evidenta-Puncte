const CREDIT_ACTIVITIES = {
  jaf: {
    label: "Jaf",
    credits: 1,
  },
  rapire: {
    label: "Răpire",
    credits: 1,
  },
  razie: {
    label: "Razie",
    credits: 1,
  },
};

function getCreditActivity(key) {
  return CREDIT_ACTIVITIES[key] || null;
}

function getAllCreditActivities() {
  return CREDIT_ACTIVITIES;
}

module.exports = {
  CREDIT_ACTIVITIES,
  getCreditActivity,
  getAllCreditActivities,
};
