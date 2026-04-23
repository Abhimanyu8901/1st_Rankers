const { ActivityLog } = require("../models");

const logActivity = async ({
  action,
  entityType,
  entityName,
  entityEmail,
  performedBy,
  performedByRole,
  description
}) =>
  ActivityLog.create({
    action,
    entityType,
    entityName,
    entityEmail,
    performedBy,
    performedByRole,
    description
  });

module.exports = { logActivity };
