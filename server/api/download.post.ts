/*
  Alias temporaire de compatibilité.
  Le flux front utilise maintenant POST /api/download/analyze.
*/
import { handleDownloadAnalysisRequest } from '../utils/download-analysis-handler'

export default defineEventHandler(handleDownloadAnalysisRequest)
