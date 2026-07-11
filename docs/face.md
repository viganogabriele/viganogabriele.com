# 3D face description

## Subject likeness

Create a stylized 3D head/bust based on the attached photos of a young adult man. The likeness should be recognizable from facial structure, hair silhouette, eyebrows, nose, eyes, jawline, and expression. Do not create a generic male avatar.

The face has a **slim oval-to-long-oval structure**, with a relatively narrow lower face, defined but not heavy cheekbones, and a clean tapered jawline. The jaw is visible and sharp enough to feel structured, especially from the three-quarter angle, but it should not become square or overly masculine. The chin is **narrow, softly rounded, and slightly pointed**, with a subtle forward projection. The cheeks are lean, with a slight hollow beneath the cheekbones.

The overall head shape is balanced and youthful: longer than wide, with a narrow jaw and a slightly broader upper face.

---

## Hair

The hair is one of the strongest identity features.

Model **thick, dark brown to near-black wavy hair**, medium length on top, with shorter tapered sides. The hair has natural volume and a soft, loose wave pattern, not tight curls. The front hair falls forward in curved locks, especially around the center of the forehead. There is a loose curtain-like separation near the front, with one noticeable wavy strand dropping toward the forehead.

The hair should not look like a helmet. It needs layered volume, visible directionality, and an organic silhouette.

Important hair characteristics:

```txt
- dark brown / near-black
- dense and voluminous
- wavy, not straight
- medium length on top
- shorter sides
- soft front fringe
- curved lock falling near the center/front of the forehead
- natural asymmetry
```

For the Yuta Abe-inspired style, the hair can be represented as a **dark faceted sculptural mass** with subtle wireframe contour lines and glowing edge highlights. Keep the hair shape readable even if the material is black glass or matte black.

Avoid:

```txt
- buzz cut
- slicked-back hair
- flat straight hair
- overly curly hair
- anime hair spikes
- generic side-part haircut
```

---

## Forehead and hairline

The forehead is medium height, partially covered by the front hair. The hairline is not fully exposed because of the wavy fringe. The visible forehead is smooth and slightly rounded. Preserve the natural forehead-to-hair transition instead of drawing a hard, artificial hairline.

---

## Eyebrows

The eyebrows are very important for likeness.

They are **dark, thick, dense, and expressive**, with a mostly straight shape and a slight natural arch. They sit relatively low over the eyes, giving the face a focused, serious look. The inner brow area is strong and well-defined.

In the render, the eyebrow region should create a clear shadow line above the eyes. Even in wireframe mode, the brow ridge should be readable.

Avoid thin, overly groomed, or highly arched eyebrows.

---

## Eyes

The eyes are **brown / warm hazel-brown**, almond-shaped, and slightly deep-set. They are medium-sized, horizontally oriented, and framed by strong eyebrows. The upper eyelid is more prominent than the lower lid. The gaze should feel calm, focused, and slightly serious.

For the final landing-page render, do not make the eyes photorealistic unless the whole piece is intended to be realistic. In the Yuta Abe-style version, the eyes should be represented as **dark recessed almond-shaped cavities** with subtle warm brown glints or very low-intensity reflective highlights.

Good eye treatment:

```txt
- dark recessed eye sockets
- almond eye shape preserved
- subtle amber-brown glint
- thin glowing outline around eyelid geometry
- no exaggerated cartoon eyes
```

Avoid:

```txt
- blue or green eyes
- large anime eyes
- glowing sci-fi laser eyes
- empty skull-like eye holes
- overly realistic human eyeballs that clash with the wireframe style
```

---

## Nose

The nose is a major likeness anchor.

It is **straight, narrow-to-medium in width, and well-defined**, with a clean bridge and a softly rounded tip. The bridge is fairly prominent, especially in the close-up three-quarter photo. The nose projects naturally from the face and should not be flattened.

From the front, the nose is centered and slim, with a moderate-width base. From the three-quarter view, the profile shows a clear straight bridge and defined tip.

Model the nose with enough geometry to show:

```txt
- straight bridge
- narrow upper bridge
- defined nasal ridge
- softly rounded tip
- natural nostril shape
- moderate projection
```

Avoid:

```txt
- tiny generic nose
- overly wide nose
- button nose
- sharp exaggerated Roman nose
- flattened avatar-style nose
```

---

## Mouth and lips

The mouth is medium width, with a neutral-to-slightly serious expression in the primary reference and a light smile in the secondary reference. For the landing-page 3D head, use a **neutral closed-mouth expression** with a subtle softness, not a broad smile.

The upper lip is thinner and more defined; the lower lip is fuller. The mouth line is mostly horizontal, with natural slight asymmetry. The Cupid’s bow is present but not exaggerated.

Recommended expression:

```txt
- closed lips
- calm, neutral expression
- slight natural softness
- no big smile
- no angry expression
```

The lips should be readable through geometry and shadow, not through strong red color. In the Yuta-style render, the lips can be represented by a thin dark groove with a few subtle glowing contour edges.

---

## Jaw, chin, and facial hair

The jawline is defined but slim. The lower face narrows toward the chin. The chin is rounded and slightly pointed.

There is **light facial hair / stubble** visible along the jawline, chin, upper lip, and sideburn area, more noticeable in the close-up mirror photo. This should be subtle. Do not create a full beard.

For the stylized render, stubble can be represented as:

```txt
- sparse tiny dots
- short dark micro-lines
- low-opacity particle texture along jaw/chin
- subtle halftone density increase around beard area
```

Avoid:

```txt
- full beard
- heavy mustache
- clean plastic baby-face
- overly rugged jaw
```

---

## Ears

The ears are visible and slightly protrude from the head. They are medium-sized, with a natural oval shape. The ear on the viewer’s left side is especially visible in the close-up photo. Do not hide the ears completely behind the hair.

In the stylized version, the ears should remain part of the head silhouette, with simplified internal folds rendered through wireframe lines or dark contour geometry.

---

## Skin and surface treatment

The natural skin tone is light-to-medium with warm/pink undertones, but the final render should **not** be a normal realistic skin portrait. The face should be transformed into a cinematic technical object.

Use the real face for geometry and proportions, then apply a dark WebGL-style material system:

```txt
- black glass / dark graphite base material
- white emissive triangular wireframe
- small glowing vertices
- subtle cyan-blue rim light
- halftone dot mode as alternate state
- transparent depth layers
- soft bloom around bright lines
```

The likeness should come from the shape, not from skin color.

---

# Target visual style

The render should feel like the Yuta Abe landing-page model, but with a human head instead of the cat.

## Core aesthetic

```txt
A large centered human head/bust floating in a black digital space.
The face is sculpted accurately from the reference photos.
The material is dark, almost black, with luminous white wireframe topology.
The head is built from triangular mesh lines, glowing vertices, dark recessed facial planes, and subtle cyan-blue rim lighting.
The background contains sparse pixel-grid particles and atmospheric depth.
The object feels interactive, technical, premium, and cinematic.
```

## Geometry style

Use a **triangulated low-poly / mid-poly mesh**, but do not simplify the face so much that the likeness is lost.

Recommended geometry balance:

```txt
- recognizable human likeness
- triangulated topology visible
- medium-detail facial planes
- accurate nose, brow, lips, jaw, and hair silhouette
- not photorealistic skin
- not cartoonish
```

The wireframe should follow the actual facial structure:

```txt
- denser mesh around eyes, nose, lips, jawline, and hairline
- larger triangles on forehead, cheeks, neck, and back of head
- small glowing vertex points at important intersections
- occasional brighter edge highlights on brow, nose bridge, cheekbone, jaw, and hair fringe
```

## Materials

Use this material stack:

```txt
Base surface:
- almost black glass or graphite
- very low roughness variation
- slightly reflective
- mostly hidden in darkness

Wireframe:
- thin white emissive lines
- irregular brightness, not perfectly uniform
- subtle blue-white glow
- small bloom at intersections

Vertices:
- tiny glowing nodes
- slightly brighter at facial landmarks

Alternate mode:
- halftone dot shader
- white dots on black surface
- dots follow facial volume
- denser dots on lit areas
- deep shadows remain black

Lighting:
- black environment
- cold white key highlights
- cyan-blue rim light
- minimal volumetric haze
- high contrast
```

## Mood

The mood should be:

```txt
technical
cinematic
dark
premium
interactive
mysterious
precise
personal
```

Not:

```txt
friendly startup
cartoon avatar
LinkedIn portrait
gaming mascot
cyberpunk cliché
horror skull
AI-generated plastic face
```

---

# Final prompt for a 3D artist or generator

Use this version when submitting the brief.

```txt
Create a cinematic interactive 3D head/bust based on the attached reference photos. The close-up mirror selfie is the primary likeness reference; the blue-background portrait is secondary for frontal proportions and symmetry.

The subject is a young adult man with a slim oval-to-long-oval face, lean cheeks, defined but not square jawline, narrow softly rounded chin, thick dark brown wavy hair, strong dark eyebrows, almond-shaped brown eyes, a straight narrow-to-medium nose with a defined bridge and softly rounded tip, medium-width lips with a thinner upper lip and fuller lower lip, and subtle light stubble along the jaw, chin, upper lip, and sideburns.

The hair is a key likeness feature: thick, dark, voluminous, wavy, medium length on top, shorter on the sides, with natural loose front locks falling toward the forehead. Do not make the hair flat, slicked back, spiky, or generic.

Render the head as a dark technical 3D object inspired by an interactive WebGL portfolio aesthetic: black glass / dark graphite surface, luminous white triangular wireframe topology, small glowing vertices, subtle cyan-blue rim light, dark recessed eye sockets, and high-contrast cinematic lighting. The likeness must remain recognizable through accurate facial geometry, especially the hair silhouette, eyebrows, eyes, nose bridge, mouth line, jaw, and chin.

The model should float centered in a black digital space, like a premium interactive landing-page object. Use a large front-facing composition with slight depth and a calm neutral expression. The head should feel like a personal digital artifact, not a realistic portrait photo and not a cartoon avatar.

Add a sparse background of dark blue-gray pixel-grid particles, subtle atmospheric haze, and very soft bloom around the wireframe edges. The final look should be cinematic, technical, premium, and memorable.

Also create an alternate visual state where the same head becomes a halftone point-cloud version: black surface with white dot patterns following the facial volume, similar to a shader/debug mode. The dot pattern should preserve the facial structure and hair silhouette.
```

---

# Negative prompt / things to avoid

Give this to the artist or generator too.

```txt
Do not create a generic male avatar.
Do not change the face shape into a square jaw or superhero face.
Do not remove the wavy front hair.
Do not make the hair straight, slicked back, spiky, or helmet-like.
Do not make the eyebrows thin.
Do not make the eyes blue, green, oversized, or cartoon-like.
Do not make the nose small, flat, or button-shaped.
Do not add a full beard or heavy mustache.
Do not make the expression angry, smiling broadly, or exaggerated.
Do not use realistic skin texture as the main look.
Do not create a colorful cyberpunk neon portrait.
Do not copy the cat model, cat ears, dog icon, text, UI, or layout from the reference site.
Do not make it horror-like, skull-like, robotic, or alien.
Do not add random sci-fi armor, headset, helmet, cables, sunglasses, or facial accessories.
```

---

# Recommended deliverables for a 3D artist

Ask for a **real-time WebGL-ready asset**, not only a static render.

```txt
1. High-quality 3D head/bust model
   Format: .blend source file + .glb/.gltf export

2. Two material states
   A. black glass / graphite + glowing triangular wireframe
   B. halftone dot / point-cloud shader state

3. Optimized topology
   - suitable for React Three Fiber / Three.js
   - triangulated visible topology
   - clean normals
   - no unnecessary hidden geometry

4. Separate material controls
   - base surface
   - wireframe lines
   - glowing vertices
   - eyes / eye sockets
   - hair mass
   - stubble dots
   - rim-light response

5. Animation-ready setup
   - idle slow rotation
   - slight mouse-follow rotation
   - optional blink not required
   - optional material transition between wireframe and halftone mode

6. Web performance versions
   - high-quality version for desktop
   - compressed/optimized version for web
   - fallback still render for mobile or reduced motion

7. Preview renders
   - front view
   - 3/4 view
   - dark landing-page composition
   - transparent-background PNG/WebP fallback
```

For the actual website, the most useful export is:

```txt
.glb model
compressed textures
separate emissive wireframe material
dark base material
optional shader instructions
turntable preview
fallback PNG/WebP render
```

---

# Instructions for a 3D artist

Send them this workflow:

```txt
1. Use the close-up mirror selfie as the primary reference for current facial likeness.
2. Use the blue-background portrait to verify front-facing proportions, ear placement, and symmetry.
3. Sculpt the face first in neutral realistic proportions.
4. Do not stylize until the likeness is approved.
5. After likeness approval, convert the head into the cinematic technical style:
   - dark graphite/glass base
   - triangulated wireframe
   - glowing white edges
   - cyan rim light
   - halftone alternate mode
6. Preserve likeness anchors:
   - thick wavy front hair
   - strong eyebrows
   - almond brown eyes
   - straight defined nose
   - slim tapered jaw
   - subtle stubble
7. Export a WebGL-ready GLB for React Three Fiber.
8. Provide a static render fallback for users without WebGL or with reduced motion.
```

Important: ask for a **likeness approval stage before final styling**. If the artist applies the wireframe style too early, it becomes harder to correct the face.

---

# Instructions for an AI image / 3D generator

Use this order:

```txt
1. Upload the close-up mirror selfie as the main face reference.
2. Upload the blue-background portrait as secondary reference.
3. Upload the Yuta-style screenshots only as style references.
4. Set face/identity reference strength high.
5. Set style reference strength medium.
6. Ask for a centered 3D bust/head, not a full body.
7. Use a neutral expression.
8. Generate several front-facing and 3/4 variants.
9. Reject anything that changes the hair, eyebrows, nose, or jaw too much.
10. Once the likeness is correct, generate the wireframe/halftone final style.
```

Suggested generator prompt:

```txt
Use the attached face photos as identity references. Create a centered cinematic 3D bust/head of the same person, matching his facial proportions accurately: slim oval face, thick dark wavy hair with front locks, strong dark eyebrows, almond brown eyes, straight defined nose, medium lips, narrow rounded chin, defined slim jawline, and subtle stubble.

Transform the head into a dark interactive WebGL-style technical object: black graphite/glass surface, white glowing triangular wireframe mesh, small glowing vertex points, dark recessed eyes with subtle warm brown glints, cyan-blue rim light, black background, sparse pixel-grid particles, cinematic depth, soft bloom, premium technical atmosphere.

The final image should look like a personal portfolio landing-page hero object: memorable, precise, dark, interactive, and premium. It should not look like a normal portrait, cartoon avatar, robot, skull, or cyberpunk character.
```

Use this negative prompt:

```txt
generic face, different person, square jaw, beard, heavy mustache, straight hair, slicked-back hair, short hair, thin eyebrows, blue eyes, anime eyes, cartoon, robot, skull, helmet, armor, sunglasses, full body, colorful neon, realistic skin portrait, LinkedIn headshot, smiling broadly, angry expression, cat, dog, animal ears, copied website UI
```

---

# Best implementation direction for your landing page

For the portfolio, the final object should not be just a PNG. It should behave like a **central interactive identity object**.

Recommended behavior:

```txt
Idle:
- head floats centered
- slow rotation, 2–4 degrees
- wireframe lines shimmer subtly
- background particles drift slowly

Mouse movement:
- head rotates slightly toward cursor
- wireframe brightness shifts based on angle
- particles move with parallax

Scroll:
- camera pulls back
- head fragments slightly into project nodes
- transition into Work section

Shift / system mode:
- material switches from wireframe mesh to halftone dot-cloud mode
- HUD labels appear
- facial topology becomes more abstract

Reduced motion:
- static high-quality render
- no forced canvas interaction
```

This gives you the Yuta Abe-level interaction principle while making the object personal and distinct: **your own head as a cinematic technical artifact**, not a copied mascot.
