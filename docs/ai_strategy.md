# AI Strategy & BBR Compliance

## 1. Computer Vision & OCR Pipeline

To accurately interpret Swedish architectural drawings, the system utilizes a hybrid pipeline:

### A. Geometric Extraction (Vectorization)
For PDF drawings (which are vector-based), we do not rely solely on pixels. We parse the underlying vector paths to get exact measurements.
- **Library**: `pdf.js` or `MuPDF` to extract line segments.
- **Logic**: Identify closed loops to detect rooms and walls.
- **Scale Calibration**: The system looks for "skalstock" (scale bars) or dimension lines (måttlinjer) to calibrate the pixel-to-meter ratio.

### B. Semantic Segmentation (Raster Images)
For scanned drawings or JPEGs, we use a Vision Transformer (ViT) model fine-tuned on architectural datasets.
- **Classes**: `Wall`, `Window`, `Door`, `Staircase`, `Room_Label`.
- **Model**: Mask2Former or similar state-of-the-art segmentation models.

### C. OCR (Text Recognition)
- **Target**: Room names ("Kök", "Vardagsrum"), dimensions ("2400"), and identifiers ("D10", "F04").
- **Context**: The OCR output is spatially mapped to the geometric regions to assign properties (e.g., a text "Klinker" inside a room polygon implies the floor material).

## 2. Swedish Building Regulations (BBR) Integration

You asked if the system "knows" the requirements. A production-grade Estimator AI must be explicitly grounded in **Boverkets byggregler (BBR)** and **SIS Standards**.

### How it works (RAG Architecture):
The AI is connected to a Vector Database containing indexed PDFs of:
1.  **BBR** (e.g., *Avsnitt 5: Brandskydd*, *Avsnitt 9: Energihushållning*).
2.  **AMA Hus** (Allmän Material- och Arbetsbeskrivning).
3.  **Svensk Standard** (SS).

### Example Scenarios:
- **Stair Safety**: If the AI detects a staircase, it checks **BBR 8:232**. If the step height seems >180mm, it flags a warning.
- **Accessibility**: It verifies that the bathroom on the entrance floor meets the "Tillgänglighet" requirements (e.g., 1.7m x 1.9m turning space) per **BBR 3:1**.
- **Energy**: It infers U-values based on the wall thickness and checks against the climate zone (Klimatzon) requirements in **BBR 9**.

### My Current Knowledge
As an AI assistant, I have been trained on a vast corpus that includes general knowledge of BBR. For example, I know that:
- **Ceiling Height**: Minimum 2.40m is the standard for habitable rooms (**BBR 3:3**).
- **Daylight**: Window glass area should typically be at least 10% of the floor area (**BBR 6:322**).
- **Wet Rooms**: Must have specific waterproofing layers (Tätskikt) compliant with GVK or BKR industry rules.

This prototype will simulate this "Expert Knowledge" by flagging common issues in the "Assumption Dashboard".
