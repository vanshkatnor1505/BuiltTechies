const MEDICAL_TERMS = [
  "ache",
  "allergy",
  "anxiety",
  "appendicitis",
  "arthritis",
  "asthma",
  "autism",
  "bacteria",
  "blood pressure",
  "blood sugar",
  "bone",
  "breast",
  "cancer",
  "cardiac",
  "cardiology",
  "clinic",
  "cold",
  "condition",
  "cough",
  "covid",
  "covid 19",
  "dentist",
  "dengue",
  "depression",
  "diabetes",
  "dialysis",
  "disease",
  "doctor",
  "emergency",
  "endocrine",
  "ent",
  "epilepsy",
  "fever",
  "flu",
  "fungal",
  "gastro",
  "gastroenterology",
  "gynecology",
  "health",
  "healthcare",
  "heart",
  "hospital",
  "hypertension",
  "hypotension",
  "infection",
  "injury",
  "insomnia",
  "intensive care",
  "ivf",
  "kidney",
  "liver",
  "malaria",
  "medicine",
  "migraine",
  "mri",
  "neurology",
  "obesity",
  "obstetrics",
  "oncology",
  "orthopedic",
  "orthopaedic",
  "pain",
  "patient",
  "pharmacy",
  "piles",
  "physiotherapy",
  "physician",
  "pregnancy",
  "prescription",
  "prostate",
  "psychiatry",
  "psychologist",
  "radiology",
  "rash",
  "rectal",
  "rehab",
  "respiratory",
  "report",
  "retina",
  "rheumatology",
  "scoliosis",
  "seizure",
  "sexually transmitted",
  "sleep apnea",
  "spine",
  "stomach",
  "stroke",
  "symptom",
  "surgery",
  "thyroid",
  "therapy",
  "treatment",
  "tumor",
  "ultrasound",
  "uti",
  "vaccine",
  "virus",
  "wellness",
  "wound",
];

const MEDICAL_ABBREVIATIONS = new Set([
  "a&e",
  "aids",
  "bp",
  "cbc",
  "cpr",
  "ct",
  "ecg",
  "eeg",
  "emr",
  "er",
  "hiv",
  "icu",
  "lab",
  "mri",
  "ncd",
  "obgyn",
  "pcos",
  "pcr",
  "pt",
  "tb",
  "tsh",
  "uti",
  "vitals",
  "xray",
]);

const MEDICAL_SUFFIX_PATTERN =
  /\b[a-z]+(?:algia|emia|iasis|itis|megaly|oma|opathy|penia|phobia|plasia|sclerosis|syndrome|trophy|virus)\b/;

const NON_LATIN_MEDICAL_TERMS = [
  "बुखार",
  "दर्द",
  "अस्पताल",
  "डॉक्टर",
  "दवा",
  "इलाज",
  "स्वास्थ्य",
  "बीमारी",
  "लक्षण",
  "रिपोर्ट",
  "दिल",
  "गुर्दा",
  "कैंसर",
  "मधुमेह",
  "गर्भावस्था",
  "ਪੰਜਾਬੀ",
  "ਬੁਖਾਰ",
  "ਦਰਦ",
  "ਹਸਪਤਾਲ",
  "ਡਾਕਟਰ",
  "ਦਵਾਈ",
  "ਇਲਾਜ",
  "ਸਿਹਤ",
  "ਬਿਮਾਰੀ",
  "ਲੱਛਣ",
  "ਰਿਪੋਰਟ",
  "ਦਿਲ",
  "ਗੁਰਦਾ",
  "ਕੈਂਸਰ",
  "ਸ਼ੂਗਰ",
];

export function isMedicalQuery(value = "") {
  const rawQuery = String(value).toLowerCase().trim();
  const normalizedQuery = rawQuery
    .replace(/[^a-z0-9\s:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedQuery) {
    return NON_LATIN_MEDICAL_TERMS.some((term) => rawQuery.includes(term));
  }

  const queryWords = normalizedQuery.split(" ");
  const containsMedicalTerm = MEDICAL_TERMS.some((term) => {
    if (term.includes(" ")) {
      return (
        normalizedQuery === term ||
        normalizedQuery.includes(` ${term} `) ||
        normalizedQuery.startsWith(`${term} `) ||
        normalizedQuery.endsWith(` ${term}`)
      );
    }

    return queryWords.includes(term);
  });

  return (
    containsMedicalTerm ||
    queryWords.some((word) => MEDICAL_ABBREVIATIONS.has(word)) ||
    NON_LATIN_MEDICAL_TERMS.some((term) => rawQuery.includes(term)) ||
    MEDICAL_SUFFIX_PATTERN.test(normalizedQuery)
  );
}
