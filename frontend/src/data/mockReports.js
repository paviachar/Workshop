// Realistic sample data for ReportSaathi Educational Demo

export const MOCK_REPORTS = [
  {
    id: 'cbc-report-01',
    title: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    date: '12 Nov 2026',
    patientContext: '42 Y / Male • Routine Annual Health Checkup',
    labName: 'Metropolis Diagnostics & Research Center',
    overallSummary:
      'Your blood report is largely healthy with normal infection-fighting white blood cells and clotting platelets. However, your hemoglobin and red blood cell counts are slightly lower than the typical reference range. This often reflects mild nutritional anemia (such as low iron levels), which can cause you to feel fatigued or low on energy.',
    keyHighlights: [
      'Total White Blood Cell (WBC) count is normal (8,200 /cumm), indicating no active infection.',
      'Platelet count is healthy (210,000 /cumm), confirming normal blood clotting function.',
      'Hemoglobin (11.4 g/dL) and Hematocrit (34.2%) are mildly lower than standard male reference ranges.',
      'Red blood cell size indices (MCV & MCH) are slightly low, suggesting small, pale red blood cells often seen in iron deficiency.'
    ],
    doctorQuestions: [
      'My hemoglobin is 11.4 g/dL and MCV is 74 fL. Could this be caused by an iron deficiency or dietary factor?',
      'Would you recommend checking my serum ferritin and iron saturation levels?',
      'Are dietary changes (like more iron-rich foods) sufficient, or should I take a temporary iron supplement?',
      'When would you like me to repeat this blood test to check my progress?'
    ],
    findings: [
      {
        testName: 'Hemoglobin (Hb)',
        value: '11.4',
        unit: 'g/dL',
        referenceRange: '13.0 - 17.0',
        status: 'Low',
        plainExplanation:
          'Hemoglobin is the iron-rich protein in your red blood cells that carries oxygen from your lungs to the rest of your body.',
        analogy:
          'Think of hemoglobin as the delivery trucks in your bloodstream. When there are fewer trucks, less oxygen reaches your muscles and brain, which can make you feel tired or sluggish.',
        clinicalMeaning:
          'Values below 13.0 g/dL in men typically indicate mild anemia, commonly related to dietary iron intake or minor blood loss.'
      },
      {
        testName: 'Total Leucocyte Count (WBC)',
        value: '8,200',
        unit: '/cumm',
        referenceRange: '4,000 - 11,000',
        status: 'Normal',
        plainExplanation:
          'White blood cells (leukocytes) are your immune system’s defense team that fight bacteria, viruses, and inflammation.',
        analogy:
          'Think of WBCs as your body’s security guards. A normal count means your immune system is calm, alert, and not fighting an acute infection.',
        clinicalMeaning:
          'Your count is right in the healthy middle zone, showing no signs of acute bacterial infection or immune suppression.'
      },
      {
        testName: 'Platelet Count',
        value: '210,000',
        unit: '/cumm',
        referenceRange: '150,000 - 450,000',
        status: 'Normal',
        plainExplanation:
          'Platelets are tiny cellular fragments in your blood that stick together to form clots whenever you get a cut or scrape.',
        analogy:
          'Like an instant patch kit for a punctured bicycle tire, platelets seal up tiny breaks in blood vessel walls so you stop bleeding.',
        clinicalMeaning:
          'A healthy platelet count ensures your body can stop bleeding quickly after cuts or dental work.'
      },
      {
        testName: 'Packed Cell Volume (PCV / Hematocrit)',
        value: '34.2',
        unit: '%',
        referenceRange: '40.0 - 50.0',
        status: 'Low',
        plainExplanation:
          'Hematocrit measures the percentage of your total blood volume made up of oxygen-carrying red blood cells.',
        analogy:
          'If your blood were a bottle of juice with fruit pulp, hematocrit is the percentage of the bottle taken up by the pulp versus liquid.',
        clinicalMeaning:
          'A lower percentage directly corresponds to the slightly lower red blood cell count seen above.'
      },
      {
        testName: 'Mean Corpuscular Volume (MCV)',
        value: '74.0',
        unit: 'fL',
        referenceRange: '80.0 - 96.0',
        status: 'Low',
        plainExplanation:
          'MCV measures the average microscopic size of an individual red blood cell.',
        analogy:
          'Imagine sizing fruits: standard cells are medium oranges, whereas a low MCV means they are more like smaller tangerines.',
        clinicalMeaning:
          'Smaller red blood cells (microcytosis) are most frequently associated with insufficient iron to build full-sized cells.'
      },
      {
        testName: 'Mean Corpuscular Hemoglobin (MCH)',
        value: '24.5',
        unit: 'pg',
        referenceRange: '27.0 - 33.0',
        status: 'Low',
        plainExplanation:
          'MCH measures the actual weight of hemoglobin packed inside each individual red blood cell.',
        analogy:
          'How much cargo each single delivery truck is holding. Lower MCH means each cell carries a little less oxygen payload.',
        clinicalMeaning:
          'Tends to track closely with low MCV and supports a microcytic, hypochromic picture.'
      },
      {
        testName: 'Red Blood Cell Count (RBC)',
        value: '4.1',
        unit: 'mil/cumm',
        referenceRange: '4.5 - 5.5',
        status: 'Low',
        plainExplanation:
          'The total number of red blood cells circulating throughout your entire cardiovascular system.',
        analogy:
          'The total number of operational vehicles currently driving on the highway.',
        clinicalMeaning:
          'Slightly below standard adult male values, which is why your physician may look into iron reserves.'
      },
      {
        testName: 'Neutrophils',
        value: '62',
        unit: '%',
        referenceRange: '40 - 70',
        status: 'Normal',
        plainExplanation:
          'The most abundant type of white blood cell, specialized in immediately attacking bacterial invaders.',
        analogy:
          'The frontline first responders of your immune department.',
        clinicalMeaning:
          'A balanced percentage indicating no active bacterial response.'
      }
    ]
  },
  {
    id: 'lipid-report-02',
    title: 'Fasting Lipid & Cholesterol Profile',
    category: 'Cardiovascular',
    date: '08 Nov 2026',
    patientContext: '51 Y / Female • 12-Hour Fasting Blood Sample',
    labName: 'Apollo Clinical Diagnostic Labs',
    overallSummary:
      'Your lipid profile shows elevated total cholesterol and triglycerides, accompanied by slightly elevated LDL ("bad") cholesterol. On a positive note, your HDL ("good") cholesterol provides some vascular protection. These numbers suggest that lifestyle adjustments—such as increasing soluble fiber, moderating saturated fats, and staying physically active—would be very beneficial to discuss with your doctor.',
    keyHighlights: [
      'Total Cholesterol (242 mg/dL) is above the desirable threshold of 200 mg/dL.',
      'Triglycerides (215 mg/dL) are elevated above the recommended 150 mg/dL.',
      'LDL ("bad") cholesterol is 157 mg/dL (recommended is under 100 mg/dL).',
      'HDL ("good") cholesterol is 42 mg/dL, which can often be improved with aerobic exercise.'
    ],
    doctorQuestions: [
      'Given my LDL level of 157 mg/dL, what is my overall 10-year cardiovascular risk profile?',
      'Can I try focused dietary modifications and exercise for 3 to 6 months before considering cholesterol medication?',
      'What specific dietary changes have the biggest impact on lowering triglycerides?',
      'Do you recommend checking a high-sensitivity CRP or ApoB test for deeper cardiovascular insight?'
    ],
    findings: [
      {
        testName: 'Total Cholesterol',
        value: '242',
        unit: 'mg/dL',
        referenceRange: '< 200',
        status: 'High',
        plainExplanation:
          'The total amount of all circulating cholesterol fats combined in your bloodstream.',
        analogy:
          'The total traffic volume on the highway, combining delivery vans, passenger cars, and cleanup trucks.',
        clinicalMeaning:
          'Readings above 240 mg/dL are classified as high and warrant a medical consultation on heart-healthy habits.'
      },
      {
        testName: 'Triglycerides',
        value: '215',
        unit: 'mg/dL',
        referenceRange: '< 150',
        status: 'High',
        plainExplanation:
          'A common type of fat stored in your body from unburned calories, refined sugars, or simple carbohydrates.',
        analogy:
          'Surplus fuel stored away in reserve tanks when your body takes in more immediate energy than it burns.',
        clinicalMeaning:
          'Levels between 200-499 mg/dL are considered high. Reducing sugary beverages and alcohol often produces rapid improvements.'
      },
      {
        testName: 'HDL Cholesterol (Good Cholesterol)',
        value: '42',
        unit: 'mg/dL',
        referenceRange: '> 50',
        status: 'Low',
        plainExplanation:
          'High-Density Lipoprotein (HDL) acts as a vascular cleanup crew, gathering excess cholesterol and returning it to the liver.',
        analogy:
          'The street sweepers that clean excess debris off the arterial roadways.',
        clinicalMeaning:
          'Higher numbers (>50 for women) are protective. Regular brisk walking, olive oil, and nuts can help raise HDL.'
      },
      {
        testName: 'LDL Cholesterol (Bad Cholesterol)',
        value: '157',
        unit: 'mg/dL',
        referenceRange: '< 100',
        status: 'High',
        plainExplanation:
          'Low-Density Lipoprotein (LDL) can slowly build up along the inside walls of your arteries over years if elevated.',
        analogy:
          'Plumbing pipes accumulating mineral scale over time, which can narrow the water flow if not addressed.',
        clinicalMeaning:
          'An optimal target is typically under 100 mg/dL. Your physician will assess your personalized target based on family history.'
      },
      {
        testName: 'VLDL Cholesterol',
        value: '43',
        unit: 'mg/dL',
        referenceRange: '< 30',
        status: 'High',
        plainExplanation:
          'Very Low-Density Lipoprotein is produced by your liver specifically to distribute triglycerides to your tissues.',
        analogy:
          'Cargo barges dedicated strictly to carrying fuel barrels from the refinery.',
        clinicalMeaning:
          'Directly correlates with elevated triglycerides; improving dietary carbohydrate quality helps normalize this.'
      }
    ]
  },
  {
    id: 'metabolic-report-03',
    title: 'Comprehensive Metabolic & Kidney Panel (CMP)',
    category: 'Metabolic & Renal',
    date: '28 Oct 2026',
    patientContext: '39 Y / Female • Preventive Wellness Assessment',
    labName: 'LifeLine Pathology & Diagnostic Services',
    overallSummary:
      'Your kidney function markers (Creatinine and eGFR) and electrolytes are in great condition, showing strong filtration capacity. Your fasting blood sugar and HbA1c are slightly above baseline in the borderline prediabetes zone. Catching this early is empowering, as moderate dietary mindfulness and daily walking often completely reverse borderline blood sugar numbers.',
    keyHighlights: [
      'Kidney filtration (eGFR > 90 mL/min and Creatinine 0.85 mg/dL) is excellent.',
      'Fasting Blood Glucose is 112 mg/dL (typical fasting range is 70 - 99 mg/dL).',
      'HbA1c is 5.9%, placing it in the early borderline / prediabetic monitoring range (5.7% - 6.4%).',
      'Liver enzymes (ALT and AST) are healthy and within standard limits.'
    ],
    doctorQuestions: [
      'My fasting blood sugar is 112 mg/dL and HbA1c is 5.9%. What dietary strategies do you recommend to bring this back into the normal range?',
      'Are there specific carbohydrate guidelines or meal timings I should follow?',
      'How frequently should we recheck my HbA1c to monitor my progress?',
      'Do my other metabolic numbers look well-balanced?'
    ],
    findings: [
      {
        testName: 'Fasting Blood Glucose',
        value: '112',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        status: 'High',
        plainExplanation:
          'The amount of sugar (glucose) present in your bloodstream after fasting for at least 8 hours overnight.',
        analogy:
          'The baseline level of water in a reservoir in the morning before any new rainfall enters.',
        clinicalMeaning:
          'Fasting levels between 100-125 mg/dL indicate impaired fasting glucose (borderline prediabetes).'
      },
      {
        testName: 'HbA1c (Glycated Hemoglobin)',
        value: '5.9',
        unit: '%',
        referenceRange: '< 5.7',
        status: 'Borderline',
        plainExplanation:
          'A three-month rolling average of your blood sugar levels, measured by how much sugar has stuck to your red blood cells.',
        analogy:
          'A quarterly GPA report card for your blood sugar, rather than a single pop quiz score on one day.',
        clinicalMeaning:
          'A reading between 5.7% and 6.4% is classified as prediabetes, offering a window of opportunity for lifestyle reversal.'
      },
      {
        testName: 'Serum Creatinine',
        value: '0.85',
        unit: 'mg/dL',
        referenceRange: '0.60 - 1.10',
        status: 'Normal',
        plainExplanation:
          'A natural muscle breakdown waste product filtered out of your blood by healthy, functioning kidneys.',
        analogy:
          'Exhaust smoke filtered out through a clean car filter. Normal levels mean the filters are working smoothly.',
        clinicalMeaning:
          'A normal creatinine indicates that your kidneys are clearing waste efficiently.'
      },
      {
        testName: 'eGFR (Estimated Kidney Filtration Rate)',
        value: '94',
        unit: 'mL/min/1.73m²',
        referenceRange: '> 90',
        status: 'Normal',
        plainExplanation:
          'Calculates how many milliliters of blood your kidneys can clean and filter each minute.',
        analogy:
          'The flow rate of clean water passing through a household water purification filter.',
        clinicalMeaning:
          'A value above 90 signifies optimal, robust kidney filtration function.'
      },
      {
        testName: 'ALT / SGPT (Liver Enzyme)',
        value: '26',
        unit: 'U/L',
        referenceRange: '7 - 45',
        status: 'Normal',
        plainExplanation:
          'An enzyme found predominantly inside liver cells that helps process nutrients and filter chemicals.',
        analogy:
          'Factory machinery that remains safely inside the plant. Low levels in the bloodstream show that liver cells are intact.',
        clinicalMeaning:
          'A normal reading shows absence of acute liver cell inflammation.'
      }
    ]
  }
]
