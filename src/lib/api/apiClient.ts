import { getProfiles } from "./discovery/getProfiles";
import { getQuickScan } from "./discovery/getQuickScan";
import { getRegions } from "./discovery/getRegions";
import { getScores } from "./discovery/getScores";
import { search } from "./discovery/search";

import { getProfile } from "./territory/getProfile";
import { getZoning } from "./territory/getZoning";
import { getMarketAccess } from "./territory/getMarketAccess";
import { getMapLayers } from "./territory/getMapLayers";

import { getTrend } from "./intelligence/getTrend";
import { getDemand } from "./intelligence/getDemand";
import { getLandValue } from "./intelligence/getLandValue";
import { getGrowth } from "./intelligence/getGrowth";

import { getLocationScore } from "./assessment/getLocationScore";
import { getRiskProfile } from "./assessment/getRiskProfile";
import { getFeasibility } from "./assessment/getFeasibility";
import { getFinancialViability } from "./assessment/getFinancialViability";
import { getInvestmentSummary } from "./assessment/getInvestmentSummary";
import { getRegionalRanking } from "./assessment/getRegionalRanking";
import { getGapAnalysis } from "./assessment/getGapAnalysis";

import { compare } from "./decision/compare";
import { getBusinessRecommender } from "./decision/getBusinessRecommender";
import { getLandBanking } from "./decision/getLandBanking";
import { saveShortlist } from "./decision/saveShortlist";
import { getShortlist } from "./decision/getShortlist";
import { removeShortlist } from "./decision/removeShortlist";
import { updateShortlistNote } from "./decision/updateShortlistNote";

import { getAlerts } from "./monitoring/getAlerts";
import { assignAlert } from "./monitoring/assignAlert";
import { updateAlertStatus } from "./monitoring/updateAlertStatus";
import { getPipeline } from "./monitoring/getPipeline";
import { getPolicyLog } from "./monitoring/getPolicyLog";
import { createPolicyLog } from "./monitoring/createPolicyLog";
import { addPolicyLog } from "./monitoring/addPolicyLog";
import { getBenchmark } from "./monitoring/getBenchmark";
import { getMonthlySnapshots } from "./monitoring/getMonthlySnapshots";

export const apiClient = {
  discovery: { getProfiles, getQuickScan, getRegions, getScores, search },
  territory: { getProfile, getZoning, getMarketAccess, getMapLayers },
  intelligence: { getTrend, getDemand, getLandValue, getGrowth },
  assessment: {
    getLocationScore,
    getRiskProfile,
    getFeasibility,
    getFinancialViability,
    getInvestmentSummary,
    getRegionalRanking,
    getGapAnalysis,
  },
  decision: {
    compare,
    getBusinessRecommender,
    getLandBanking,
    saveShortlist,
    getShortlist,
    removeShortlist,
    updateShortlistNote,
  },
  monitoring: {
    getAlerts,
    assignAlert,
    updateAlertStatus,
    getPipeline,
    getPolicyLog,
    createPolicyLog,
    addPolicyLog,
    getBenchmark,
    getMonthlySnapshots,
  },
} as const;
