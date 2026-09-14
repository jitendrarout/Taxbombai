const { getDivisor, UNIFORM_LIFETIME_TABLE, DEFAULT_RMD_START_AGE } = require('./rmdTable');
const {
  estimateMarginalTax,
  projectRmdSchedule,
  compareRothConversionLadder,
  DEFAULT_BRACKETS_SINGLE,
} = require('./calculator');
const { explainProjection } = require('./explainer');

module.exports = {
  // RMD table
  getDivisor,
  UNIFORM_LIFETIME_TABLE,
  DEFAULT_RMD_START_AGE,
  // Calculation engine
  estimateMarginalTax,
  projectRmdSchedule,
  compareRothConversionLadder,
  DEFAULT_BRACKETS_SINGLE,
  // AI explainer
  explainProjection,
};
