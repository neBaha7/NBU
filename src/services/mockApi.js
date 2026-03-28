const mockResponses = {
  default: {
    answer: `Based on the analysis of NBU's annual financial statements for fiscal year 2134, the company demonstrated strong revenue growth of 18.3% year-over-year, reaching a total consolidated revenue of ₦4.2 trillion. The operating margin expanded by 230 basis points to 34.7%, driven primarily by improved cost efficiencies in the digital banking segment and reduced provisioning for credit losses.\n\nKey highlights include:\n\n• Net interest income grew 22.1% to ₦1.8 trillion, benefiting from the rising rate environment and strategic repositioning of the loan portfolio toward higher-yielding commercial segments.\n\n• Non-interest revenue contributed ₦2.4 trillion, with the digital payments vertical alone accounting for ₦890 billion — a 41% increase reflecting accelerated adoption of the NexaPay platform.\n\n• Return on equity improved to 24.3% from 21.1% in the prior year, exceeding the board's strategic target of 22% and placing NBU among the top-performing financial institutions in the region.`,
    sources: [
      {
        id: 1,
        filename: 'NSBU_annual_2134.xlsx',
        sheet: 'Sheet 1 — Income Statement',
        relevance: 0.97,
      },
      {
        id: 2,
        filename: 'Q4_earnings_report_2134.pdf',
        sheet: 'Pages 12–18',
        relevance: 0.94,
      },
      {
        id: 3,
        filename: 'NSBU_annual_2134.xlsx',
        sheet: 'Sheet 3 — Segment Breakdown',
        relevance: 0.91,
      },
      {
        id: 4,
        filename: 'Digital_Banking_KPIs_Q4.xlsx',
        sheet: 'NexaPay Metrics',
        relevance: 0.88,
      },
      {
        id: 5,
        filename: 'Board_Strategy_Review_2134.pdf',
        sheet: 'ROE Targets — Page 7',
        relevance: 0.82,
      },
    ],
  },
  revenue: {
    answer: `NBU's total revenue for fiscal year 2134 was ₦4.2 trillion, representing an 18.3% increase compared to the prior year. Revenue was primarily driven by two segments:\n\n1. Net Interest Income (₦1.8T): The rising interest rate environment significantly benefited the bank's lending operations, particularly in the commercial and SME segments, which saw a combined growth of 26%.\n\n2. Non-Interest Revenue (₦2.4T): Digital transaction fees and FX trading gains were the leading contributors. The NexaPay platform processed over 2.1 billion transactions during the year.\n\nGeographically, domestic operations contributed 72% of total revenue, while the West African subsidiary network contributed the remaining 28%, with Ghana and Côte d'Ivoire being the strongest performers.`,
    sources: [
      {
        id: 1,
        filename: 'NSBU_annual_2134.xlsx',
        sheet: 'Sheet 1 — Revenue Summary',
        relevance: 0.98,
      },
      {
        id: 2,
        filename: 'Geographic_Segment_Report.xlsx',
        sheet: 'Regional Breakdown',
        relevance: 0.93,
      },
      {
        id: 3,
        filename: 'NexaPay_Transaction_Volume.csv',
        sheet: 'Monthly Aggregates',
        relevance: 0.87,
      },
    ],
  },
  risk: {
    answer: `NBU's risk profile for 2134 showed notable improvement across key metrics. The non-performing loan (NPL) ratio declined to 2.8% from 3.9% in the prior year, reflecting the bank's proactive remediation strategy and improved macroeconomic conditions.\n\nThe Capital Adequacy Ratio (CAR) stood at 18.4%, well above the regulatory minimum of 15%, providing a comfortable buffer for growth initiatives. Tier 1 capital ratio was 15.7%.\n\nCredit risk provisioning decreased by 18% year-over-year to ₦156 billion, as the expected credit loss model reflected improved forward-looking economic scenarios. However, management flagged concentration risk in the energy sector, which accounts for 23% of the total loan book, as an area requiring ongoing monitoring.`,
    sources: [
      {
        id: 1,
        filename: 'Risk_Management_Report_2134.pdf',
        sheet: 'Pages 4–11',
        relevance: 0.96,
      },
      {
        id: 2,
        filename: 'NSBU_annual_2134.xlsx',
        sheet: 'Sheet 5 — Credit Quality',
        relevance: 0.92,
      },
      {
        id: 3,
        filename: 'Basel_III_Compliance_Dashboard.xlsx',
        sheet: 'Capital Ratios',
        relevance: 0.89,
      },
      {
        id: 4,
        filename: 'Sector_Exposure_Analysis.xlsx',
        sheet: 'Energy Sector',
        relevance: 0.84,
      },
    ],
  },
};

function matchQuery(query) {
  const q = query.toLowerCase();
  if (q.includes('revenue') || q.includes('income') || q.includes('earnings') || q.includes('sales')) {
    return 'revenue';
  }
  if (q.includes('risk') || q.includes('npl') || q.includes('capital') || q.includes('provision') || q.includes('compliance')) {
    return 'risk';
  }
  return 'default';
}

export async function searchDocuments(query) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));

  const key = matchQuery(query);
  const response = mockResponses[key];

  return {
    query,
    answer: response.answer,
    sources: response.sources,
    timestamp: new Date().toISOString(),
    processingTimeMs: Math.floor(200 + Math.random() * 300),
  };
}
