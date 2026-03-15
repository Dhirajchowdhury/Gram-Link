// Mock scheme data for testing
export const mockSchemes = [
  {
    id: "PM-KISAN",
    name: "PM-KISAN",
    description:
      "Pradhan Mantri Kisan Samman Nidhi - Income support to all landholding farmers",
    benefit: "₹6000/year",
    score: 95,
    eligibility: [
      "Landholding farmer families",
      "All India coverage",
      "No income limit",
    ],
    documents: [
      "Aadhaar Card",
      "Bank Account Details",
      "Land Ownership Documents",
    ],
    applicationProcess: [
      "Visit nearest CSC or agriculture office",
      "Fill application form",
      "Submit required documents",
      "Verification by authorities",
      "Amount credited to bank account",
    ],
    helpline: "155261",
    website: "https://pmkisan.gov.in/",
  },
  {
    id: "AYUSHMAN",
    name: "Ayushman Bharat",
    description:
      "Pradhan Mantri Jan Arogya Yojana - Health insurance for poor families",
    benefit: "₹5 lakh coverage",
    score: 88,
    eligibility: [
      "Families from socio-economic caste census",
      "Income below poverty line",
      "All India coverage",
    ],
    documents: ["Aadhaar Card", "Ration Card", "Income Certificate"],
    applicationProcess: [
      "Visit nearest Ayushman Mitra",
      "Get eligibility verified",
      "Receive Ayushman Card",
      "Use at empanelled hospitals",
    ],
    helpline: "14555",
    website: "https://pmjay.gov.in/",
  },
  {
    id: "PM-AWAS",
    name: "PM Awas Yojana",
    description: "Housing for All - Financial assistance for building houses",
    benefit: "₹1.2-2.5 lakh subsidy",
    score: 82,
    eligibility: [
      "Economically Weaker Section",
      "Low Income Group",
      "No pucca house owned",
    ],
    documents: [
      "Aadhaar Card",
      "Income Certificate",
      "Bank Account Details",
      "Property Documents",
    ],
    applicationProcess: [
      "Apply online at pmayg.nic.in",
      "Submit required documents",
      "Verification by authorities",
      "Subsidy credited in installments",
    ],
    helpline: "1800-11-6163",
    website: "https://pmaymis.gov.in/",
  },
  {
    id: "SUKANYA",
    name: "Sukanya Samriddhi Yojana",
    description: "Savings scheme for girl child education and marriage",
    benefit: "7.6% interest rate",
    score: 75,
    eligibility: [
      "Girl child below 10 years",
      "Indian resident",
      "Maximum 2 girl children per family",
    ],
    documents: [
      "Birth Certificate of girl child",
      "Parent's Aadhaar Card",
      "Address Proof",
    ],
    applicationProcess: [
      "Visit nearest Post Office or Bank",
      "Fill account opening form",
      "Submit documents",
      "Minimum deposit ₹250",
    ],
    helpline: "1800-11-0001",
    website: "https://www.nsiindia.gov.in/",
  },
  {
    id: "PM-MUDRA",
    name: "PM Mudra Yojana",
    description: "Loans for small businesses and entrepreneurs",
    benefit: "Up to ₹10 lakh loan",
    score: 70,
    eligibility: [
      "Small business owners",
      "Entrepreneurs",
      "Self-employed individuals",
    ],
    documents: ["Aadhaar Card", "PAN Card", "Business Plan", "Bank Statements"],
    applicationProcess: [
      "Visit nearest bank or NBFC",
      "Fill loan application",
      "Submit business plan",
      "Loan approval and disbursal",
    ],
    helpline: "1800-180-1111",
    website: "https://www.mudra.org.in/",
  },
];

export const getUserEligibleSchemes = (userProfile) => {
  // Simple mock eligibility logic
  // In real app, this will be done by backend
  return mockSchemes
    .map((scheme) => ({
      ...scheme,
      score: Math.floor(Math.random() * 30) + 70, // Random score 70-100
    }))
    .sort((a, b) => b.score - a.score);
};
