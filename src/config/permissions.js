const ROLE_ADMIN_ID = process.env.ROLE_ADMIN_ID;
const ROLE_MEMBRU_MARE_ID = process.env.ROLE_MEMBRU_MARE_ID;
const ROLE_MEMBRU_MIC_ID = process.env.ROLE_MEMBRU_MIC_ID;

const MANAGE_POINTS_ROLE_IDS = [
  ROLE_ADMIN_ID,
  ROLE_MEMBRU_MARE_ID,
].filter(Boolean);

const RESET_POINTS_ROLE_IDS = [
  ROLE_ADMIN_ID,
].filter(Boolean);

function memberHasAnyRole(member, roleIds) {
  if (!member || !member.roles || !member.roles.cache) {
    return false;
  }

  return roleIds.some((roleId) => member.roles.cache.has(roleId));
}

function canManagePoints(member) {
  return memberHasAnyRole(member, MANAGE_POINTS_ROLE_IDS);
}

function canResetPoints(member) {
  return memberHasAnyRole(member, RESET_POINTS_ROLE_IDS);
}

function isMembruMic(member) {
  return ROLE_MEMBRU_MIC_ID ? memberHasAnyRole(member, [ROLE_MEMBRU_MIC_ID]) : false;
}

module.exports = {
  canManagePoints,
  canResetPoints,
  isMembruMic,
};
