import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  ...(process.env.CORS_ORIGINS || "").split(","),
  process.env.FRONTEND_URL || "",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
]
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Request origin is not allowed by the API."));
    },
  }),
);

app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "BuiltTechies API",
  });

  app.post("/api/state-hospital-recommendations", async (req, res) => {
    try {
      const { disease, state = "" } = req.body;
      if (!disease || typeof disease !== "string" || !state || typeof state !== "string") {
        return res.status(400).json({
          success: false,
          message: "Disease and state are required.",
        });
      }

      if (!process.env.TAVILY_API_KEY) {
        return res.json({
          success: true,
          searched: false,
          recommendations: [],
          message: "State-wide research requires TAVILY_API_KEY.",
        });
      }

      const searchResponse = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `top hospitals for ${disease} treatment in ${state} India`,
          search_depth: "advanced",
          max_results: 6,
          include_answer: false,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error("The state-wide hospital research provider could not be reached.");
      }

      const data = await searchResponse.json();
      const recommendations = (data.results || [])
        .filter((result) => result.url && result.title)
        .slice(0, 5)
        .map((result) => ({
          name: result.title,
          summary: result.content || "Open the source for treatment and hospital details.",
          sourceUrl: result.url,
        }));

      res.json({
        success: true,
        searched: true,
        state,
        disease,
        recommendations,
        disclaimer: "These are source-backed search results, not a universal clinical ranking.",
      });
    } catch (error) {
      console.error("STATE HOSPITAL RESEARCH ERROR:", error);
      res.status(502).json({
        success: false,
        message: "Unable to find state-wide hospital recommendations right now.",
      });
    }
  });
});

/* =========================================================
   MULTER
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return callback(
        new Error("Only PDF files are allowed."),
      );
    }

    callback(null, true);
  },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("audio/")) {
      return callback(new Error("Only audio files are allowed."));
    }

    callback(null, true);
  },
});

/* =========================================================
   HEALTHCARE SYSTEM PROMPT
========================================================= */

const HEALTHCARE_SYSTEM_PROMPT = `
You are Vital, an AI healthcare navigation assistant.

Your role is to help users navigate healthcare options.

You can:
- Understand a user's healthcare requirement.
- Ask necessary follow-up questions.
- Identify relevant medical specialties.
- Help users search for suitable hospitals.
- Explain healthcare terminology.
- Help users understand medical reports in simple language.
- Discuss factors such as location, budget, insurance, facilities,
  specialist availability and treatment availability.
- Help compare healthcare options when verified data is available.
- Communicate in the user's selected language.

IMPORTANT SAFETY RULES:

1. You are NOT a doctor.
2. Do not claim to diagnose the user.
3. Do not present a definitive diagnosis.
4. Do not prescribe medicines or dosages.
5. Do not invent hospital information.
6. Do not invent treatment costs, success rates, doctors,
   insurance coverage or medical outcomes.
7. If information is unavailable, explicitly say that it
   needs to be verified.
8. For emergency symptoms, recommend contacting local emergency
   services or going to the nearest emergency department.
9. Medical report explanations are informational and should not
   replace assessment by a qualified healthcare professional.
10. Keep responses clear and practical.
11. Ask only the follow-up questions that are actually needed.

When discussing hospitals, distinguish between:
- user requirements
- verified information
- unavailable information

Never describe one hospital as universally "the best".

Instead use language such as:
- "matches your requirements"
- "may be suitable based on the available information"
- "this option matches X of your stated requirements"

Selected language:
{{LANGUAGE}}

Always reply in the selected language. If the user writes in another language,
follow that language unless they explicitly ask for a translation.
`;

/* =========================================================
   LANGUAGE MAP
========================================================= */

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  pa: "Punjabi",
};

// These Groq-hosted models are available on the Groq free tier.
const FREE_TIER_CHAT_MODEL = "openai/gpt-oss-20b";
const FREE_TIER_STT_MODEL = "whisper-large-v3-turbo";

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Vital Healthcare AI",
  });
});

/* =========================================================
   CHAT
========================================================= */

app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      language = "en",
    } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages must be an array.",
      });
    }

    const selectedLanguage =
      LANGUAGE_NAMES[language] || "English";

    const systemPrompt =
      HEALTHCARE_SYSTEM_PROMPT.replace(
        "{{LANGUAGE}}",
        selectedLanguage,
      );

    const conversation = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages
        .filter(
          (message) =>
            message &&
            ["user", "assistant"].includes(
              message.role,
            ),
        )
        .slice(-20)
        .map((message) => ({
          role: message.role,
          content: String(message.content),
        })),
    ];

    const completion =
      await groq.chat.completions.create({
        model: FREE_TIER_CHAT_MODEL,

        messages: conversation,

        temperature: 0.35,

        max_completion_tokens: 1200,
      });

    const content =
      completion.choices?.[0]?.message?.content ||
      "I couldn't generate a response right now.";

    res.json({
      success: true,
      message: content,
      language,
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);

    res.status(500).json({
      success: false,
      message:
        "Unable to connect to the healthcare assistant.",
    });
  }
});

/* =========================================================
   SPEECH TO TEXT
========================================================= */

app.post(
  "/api/transcribe",
  audioUpload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Audio file is required.",
        });
      }

      const language = req.body.language || "en";

      const extension =
        req.file.mimetype === "audio/webm"
          ? "webm"
          : req.file.mimetype === "audio/mp4"
            ? "mp4"
            : req.file.mimetype === "audio/wav"
              ? "wav"
              : "webm";

      const audioFile = new File(
        [req.file.buffer],
        `voice.${extension}`,
        {
          type: req.file.mimetype,
        },
      );

      const transcription =
        await groq.audio.transcriptions.create({
          file: audioFile,

          model: FREE_TIER_STT_MODEL,

          language:
            language === "en"
              ? "en"
              : language === "hi"
                ? "hi"
                : language === "pa"
                  ? "pa"
                  : undefined,

          response_format: "json",
        });

      res.json({
        success: true,
        text: transcription.text || "",
        language,
      });
    } catch (error) {
      console.error(
        "TRANSCRIPTION ERROR:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to transcribe the audio.",
      });
    }
  },
);

/* =========================================================
   PDF REPORT ANALYSIS
========================================================= */

app.post(
  "/api/analyze-report",
  upload.single("report"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "PDF report is required.",
        });
      }

      const isPdf =
        req.file.mimetype === "application/pdf" ||
        req.file.originalname
          .toLowerCase()
          .endsWith(".pdf");

      if (!isPdf) {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are supported.",
        });
      }

      const language =
        req.body.language || "en";

      const selectedLanguage =
        LANGUAGE_NAMES[language] ||
        "English";

      /* -----------------------------------------------
         Extract PDF text
      ------------------------------------------------ */

      const pdfParser = new PDFParse({ data: req.file.buffer });
      const parsedPdf = await pdfParser.getText();
      await pdfParser.destroy();

      const extractedText = parsedPdf.text?.trim();

      if (!extractedText) {
        return res.status(422).json({
          success: false,
          message:
            "This PDF does not contain extractable text. Scanned/image-only PDFs need OCR support.",
        });
      }

      /*
        Prevent unnecessarily huge requests.

        Later we can implement chunking for very large
        medical reports.
      */

      const limitedText =
        extractedText.slice(0, 50000);

      /* -----------------------------------------------
         Analysis prompt
      ------------------------------------------------ */

      const reportPrompt = `
You are analyzing a medical report for healthcare navigation.

Selected language:
${selectedLanguage}

Analyze the following report and explain it in simple language.

IMPORTANT:
- Do not diagnose the patient.
- Do not prescribe medicines.
- Do not change or recommend medication dosages.
- Do not claim certainty where the report does not provide it.
- Do not invent missing values.
- Clearly distinguish report findings from interpretation.
- If something is unclear, say so.
- Recommend discussing important findings with a qualified healthcare professional.
- If an emergency-looking finding is explicitly present in the report, advise appropriate urgent medical attention without claiming a diagnosis.

Return the response using this structure:

1. SIMPLE SUMMARY
Explain what the report is generally about.

2. IMPORTANT FINDINGS
List notable values or observations from the report.

3. WHAT THEY MAY MEAN
Explain the terminology and findings in simple language.
Do not turn this into a definitive diagnosis.

4. RELEVANT SPECIALTY
If the report clearly indicates a medical specialty that may be relevant,
state it and explain why.

5. QUESTIONS TO ASK A DOCTOR
Give practical questions the patient may discuss with a doctor.

6. HEALTHCARE NAVIGATION
Mention what type of healthcare professional or department may be relevant
based only on the available report information.

7. IMPORTANT NOTE
Clearly state that this is informational and not a medical diagnosis.

MEDICAL REPORT:

${limitedText}
`;

      const completion =
        await groq.chat.completions.create({
          model: FREE_TIER_CHAT_MODEL,

          messages: [
            {
              role: "system",
              content:
                "You are a careful healthcare report explanation assistant.",
            },
            {
              role: "user",
              content: reportPrompt,
            },
          ],

          temperature: 0.2,

          max_completion_tokens: 2500,
        });

      const analysis =
        completion.choices?.[0]?.message
          ?.content ||
        "Unable to analyze the report.";

      res.json({
        success: true,
        filename: req.file.originalname,
        pages: parsedPdf.numpages,
        analysis,
        extractedCharacters:
          extractedText.length,
        language,
      });
    } catch (error) {
      console.error(
        "REPORT ANALYSIS ERROR:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to analyze the PDF report.",
      });
    }
  },
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "The request body was not valid JSON.",
    });
  }

  if (!error) {
    return next();
  }

  if (
    error instanceof multer.MulterError &&
    error.code === "LIMIT_FILE_SIZE"
  ) {
    return res.status(413).json({
      success: false,
      message:
        "PDF file is too large. Maximum size is 10 MB.",
    });
  }

  if (
    error?.message ===
    "Only PDF files are allowed."
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Only PDF files are allowed.",
    });
  }

  console.error("SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Something went wrong.",
  });
});

/* =========================================================
   HOSPITAL RESEARCH
   Uses Tavily when configured. Results remain source-backed;
   missing clinical metrics are never inferred by the AI.
========================================================= */

async function searchGoogleImages(name, address = "") {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    return [];
  }

  const query = encodeURIComponent(`${name} ${address} hospital`);
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(process.env.GOOGLE_SEARCH_API_KEY)}&cx=${encodeURIComponent(process.env.GOOGLE_SEARCH_ENGINE_ID)}&q=${query}&searchType=image&num=6&safe=active`,
  );

  if (!response.ok) {
    throw new Error("Google image search could not be reached.");
  }

  const data = await response.json();
  return (data.items || [])
    .filter((item) => item.link)
    .map((item) => ({
      title: item.title || `${name} hospital`,
      url: item.link,
      sourceUrl: item.image?.contextLink || item.link,
      artist: "",
      source: "Google Images",
    }));
}

async function searchGooglePlaceImages(name, address = "") {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return [];
  }

  const query = encodeURIComponent(`${name} ${address}`);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${encodeURIComponent(process.env.GOOGLE_MAPS_API_KEY)}`,
  );

  if (!response.ok) {
    throw new Error("Google Maps place search could not be reached.");
  }

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Maps place search failed (${data.status}).`);
  }

  const place = data.results?.[0];
  const placeUrl = place?.place_id
    ? `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(place.place_id)}`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (place?.photos || [])
    .slice(0, 6)
    .map((photo) => ({
      title: `${name} hospital`,
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=900&photo_reference=${encodeURIComponent(photo.photo_reference)}&key=${encodeURIComponent(process.env.GOOGLE_MAPS_API_KEY)}`,
      sourceUrl: placeUrl,
      artist: photo.html_attributions?.[0]?.replace(/<[^>]*>/g, "") || "",
      source: "Google Maps",
    }));
}

async function searchHospitalImagesFromCommons(name, address = "") {
  const query = encodeURIComponent(`${name} ${address}`);
  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=900&format=json&origin=*`,
    {
      headers: {
        "User-Agent": "BuiltTechies healthcare comparison app",
      },
    },
  );

  if (!response.ok) {
    throw new Error("The image search provider could not be reached.");
  }

  const data = await response.json();
  return Object.values(data.query?.pages || {})
    .map((page) => {
      const imageInfo = page.imageinfo?.[0];
      const metadata = imageInfo?.extmetadata || {};
      const mime = imageInfo?.mime || "";

      if (!imageInfo?.thumburl || !mime.startsWith("image/")) {
        return null;
      }

      return {
        title: page.title?.replace(/^File:/, "") || "Hospital image",
        url: imageInfo.thumburl,
        sourceUrl: imageInfo.descriptionurl || imageInfo.url,
        artist: metadata.Artist?.value?.replace(/<[^>]*>/g, "") || "",
        source: "Wikimedia Commons",
      };
    })
    .filter(Boolean);
}

function getHospitalImageFallback(name) {
  return [{
    title: `${name} hospital`,
    url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85",
    sourceUrl: "https://unsplash.com/",
    artist: "",
    source: "Hospital image fallback",
    isFallback: true,
  }];
}

async function searchHospitalImages(name, address = "") {
  const googleImages = [
    ...(await searchGoogleImages(name, address).catch((error) => {
      console.error("GOOGLE IMAGE SEARCH ERROR:", error);
      return [];
    })),
    ...(await searchGooglePlaceImages(name, address).catch((error) => {
      console.error("GOOGLE MAPS IMAGE SEARCH ERROR:", error);
      return [];
    })),
  ];

  if (googleImages.length > 0) {
    return googleImages;
  }

  const commonsImages = await searchHospitalImagesFromCommons(name, address);
  return commonsImages.length > 0
    ? commonsImages
    : getHospitalImageFallback(name);
}

app.post("/api/hospital-research", async (req, res) => {
  try {
    const { name, address = "", website = "" } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, message: "Hospital name is required." });
    }

    let images = [];
    try {
      images = await searchHospitalImages(name, address);
    } catch (imageError) {
      console.error("HOSPITAL IMAGE SEARCH ERROR:", imageError);
      try {
        images = await searchHospitalImagesFromCommons(name, address);
      } catch (fallbackError) {
        console.error("HOSPITAL IMAGE FALLBACK ERROR:", fallbackError);
      }
    }

    if (images.length === 0) {
      images = getHospitalImageFallback(name);
    }

    if (!process.env.TAVILY_API_KEY) {
      return res.json({
        success: true,
        searched: false,
        message: "Internet verification is not configured. Add TAVILY_API_KEY to enable source-backed web research.",
        metrics: {},
        images,
        sources: website ? [{ title: "Hospital website listed in map data", url: website }] : [],
      });
    }

    const query = `${name} ${address} hospital reviews patient experience rating photos patients treated success rate treatment cost insurance`;
    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, search_depth: "advanced", max_results: 8, include_answer: false }),
    });
    if (!searchResponse.ok) throw new Error("The web research provider could not be reached.");
    const searchData = await searchResponse.json();
    const sources = (searchData.results || []).map((result) => ({ title: result.title, url: result.url, content: result.content })).filter((result) => result.url);

    const evidence = sources.map((source, index) => `[${index + 1}] ${source.title}\n${source.content}`).join("\n\n").slice(0, 24000);
    let extracted = {
      metrics: {},
      summary: "No verified hospital-specific metrics were found.",
      reviews: [],
    };
    if (evidence) {
      try {
        const completion = await groq.chat.completions.create({
          model: FREE_TIER_CHAT_MODEL,
          temperature: 0,
          max_completion_tokens: 900,
          messages: [{ role: "system", content: "Extract only explicit facts about this exact hospital from the supplied web-search excerpts. Never estimate, generalize, or invent clinical statistics or reviews. Return valid JSON only: {metrics:{patientsTreated:string|null,successRate:string|null,treatmentCost:string|null,insurance:string|null}, summary:string, reviews:[{text:string,rating:string|null,sourceIndex:number}]}. Include at most three short review excerpts or public patient-experience statements when the source explicitly contains them. Keep review text faithful to the source, do not invent quotations, and use sourceIndex to reference the supplied excerpt. Each metric and review must be null or omitted unless the source explicitly supports it." }, { role: "user", content: `Hospital: ${name}\nLocation: ${address}\n\nSearch evidence:\n${evidence}` }],
        });
        extracted = JSON.parse(completion.choices?.[0]?.message?.content || "{}");
      } catch (extractionError) {
        console.error("HOSPITAL RESEARCH EXTRACTION ERROR:", extractionError);
        extracted.summary = "Search sources were found, but verified hospital information could not be extracted.";
      }
    }
    let imageUrl = "";
    if (website && /^https?:\/\//i.test(website)) {
      try {
        const websiteResponse = await fetch(website, {
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "CurePulse public information preview" },
        });
        const html = (await websiteResponse.text()).slice(0, 500000);
        const imageMatch = html.match(
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        ) || html.match(
          /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
        );

        if (imageMatch?.[1]) {
          imageUrl = new URL(imageMatch[1], website).href;
        }
      } catch (imageError) {
        console.warn("PUBLIC HOSPITAL IMAGE LOOKUP FAILED:", imageError.message);
      }
    }

    res.json({
      success: true,
      searched: true,
      metrics: extracted.metrics || {},
      summary: extracted.summary || "No verified hospital-specific metrics were found.",
      reviews: Array.isArray(extracted.reviews)
        ? extracted.reviews.filter((review) => review?.text).slice(0, 3)
        : [],
      images: imageUrl
        ? [
          ...images,
          {
            title: `${name} hospital website image`,
            url: imageUrl,
            sourceUrl: website,
            artist: "",
            source: "Hospital website",
          },
        ]
        : images,
      imageUrl,
      sources: sources.map(({ title, url }) => ({ title, url })),
    });
  } catch (error) {
    console.error("HOSPITAL RESEARCH ERROR:", error);
    res.status(502).json({ success: false, message: "Unable to verify hospital information right now." });
  }
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `Vital Healthcare AI server running on http://localhost:${PORT}`,
  );
});
