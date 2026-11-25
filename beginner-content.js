/* Beginner teaching copy. Engine identifiers are verified against the bundled data.
 * Each collection is an array. Text fields are {fa, en}; relatedIds are scoped links.
 * Movement pathId selects an authored path. Framing pathId is an example reference;
 * use framingId and its factors to modify the current movement instead.
 * Beginner lenses scale the authored focal path; referenceLensId is not the action.
 */
(function (root) {
  "use strict";
  const text = (fa, en) => ({ fa, en });
  const pathVariant = (id, fa, en) => ({ id, pathId: id, title: text(fa, en) });
  const lensVariant = (id, focalMM, fa, en) => ({ id, lensId: "authored", referenceLensId: id, focalMM, selectionEffect: "authored-lens-multiplier", title: text(fa, en) });
  const transitionVariant = (id, fa, en) => ({ id, transitionId: id, title: text(fa, en) });
  root.BEGINNER_CONTENT = {
    version: 1,
    labels: {
      definition: text("چیست؟", "What it does"),
      use: text("کجا به کار می‌آید؟", "When to use it"),
      tip: text("برای امتحان کردن", "Try this"),
      related: text("بیشتر کشف کن", "Explore next")
    },
    notes: {
      framingKeepsMotion: text("اندازهٔ قاب، فاصله و ارتفاع نگاه دوربین را تنظیم می‌کند؛ حرکت انتخابی و زمان‌بندی آن حفظ می‌شوند.", "Framing adjusts the camera distance and target height while keeping your chosen movement and its timing."),
      authoredLens: text("این انتخاب‌ها لنز شروع شات را تغییر می‌دهند؛ اگر حرکتت زوم داشته باشد، تغییر لنز در طول شات حفظ می‌شود.", "These choices change the starting lens. If your movement includes a zoom, its lens changes continue through the shot."),
      advancedFixedLens: text("در تنظیمات پیشرفته، انتخاب لنز پرایمِ ثابت تغییر فاصلهٔ کانونیِ مسیر را غیرفعال می‌کند.", "In advanced settings, a fixed prime lens disables the path’s focal-length animation."),
      framingAfterLens: text("تغییر لنز، اندازهٔ سوژه در قاب را هم عوض می‌کند؛ در صورت نیاز، اندازهٔ قاب را دوباره انتخاب کن.", "Changing the lens also changes the subject’s size in frame; choose a framing size again if needed."),
      opticalEstimate: text("دیافراگم و فاصلهٔ فوکوس برای برآورد عمق میدان‌اند؛ محوشدگی فیزیکی در تصویر شبیه‌سازی نمی‌شود.", "Aperture and focus distance provide a depth-of-field estimate; physical depth blur is not rendered."),
      transitionShots: text("نمای A شات فعلی توست. نمای B از یک مسیر سه‌بعدی دیگر ساخته می‌شود؛ لنز و تنظیمات اصلی بین آن‌ها مشترک‌اند.", "Shot A is your current shot. Shot B uses another 3D path; both share the main lens and camera settings."),
      totalDuration: text("مدت، زمان کل پیش‌نمایش است؛ با فعال شدن گذار، هر دو نما در همین بازه نمایش داده می‌شوند.", "Duration is the length of the whole preview. With a transition enabled, both shots fit within that time."),
      scenePreview: text("این صحنه‌ها نمونهٔ سادهٔ میزانسن‌اند؛ برای بررسی حرکت، قاب و نسبت اندازه‌ها از آن‌ها استفاده کن.", "These simplified scenes help you explore movement, framing and relative scale.")
    },
    movements: [
      {
        id: "dolly", icon: "arrow-right", pathId: "dolly-in", selectionEffect: "replace-path",
        title: text("دالی", "Dolly"),
        subtitle: text("نزدیک یا دور شدن", "Move closer or farther"),
        definition: text("دوربین در فضا به سوژه نزدیک یا از آن دور می‌شود؛ رابطهٔ سوژه و پس‌زمینه هم تغییر می‌کند.", "The camera moves closer to or farther from the subject, changing its relationship with the background."),
        use: text("برای نزدیک شدن تدریجی به یک واکنش، یا عقب رفتن و آشکار کردن محیط.", "Move toward a reaction, or pull back to reveal the surroundings."),
        tip: text("هنگام پخش به لبه‌های پس‌زمینه نگاه کن؛ با حرکت دوربین، موقعیت آن‌ها نسبت به سوژه تغییر می‌کند.", "Watch the background edges during playback: their position changes relative to the subject."),
        related: text("زوم را هم امتحان کن؛ آن‌جا دوربین جابه‌جا نمی‌شود.", "Compare this with zoom, where the camera stays in place."),
        relatedIds: [{ section: "movements", id: "zoom" }],
        variants: [pathVariant("dolly-in", "رو به جلو", "Push in"), pathVariant("dolly-out", "رو به عقب", "Pull back")]
      },
      {
        id: "pan", icon: "arrows-horizontal", pathId: "pan-left", selectionEffect: "replace-path",
        title: text("پن", "Pan"),
        subtitle: text("چرخش به چپ و راست", "Turn left or right"),
        definition: text("جای دوربین ثابت می‌ماند و جهت نگاه آن به چپ یا راست می‌چرخد.", "The camera stays in place while its view turns left or right."),
        use: text("برای دنبال کردن حرکت افقی یا نشان دادن چیزی که بیرون قاب بوده است.", "Follow sideways action or reveal something outside the frame."),
        tip: text("در نمای صحنه، جای دوربین را نگاه کن؛ جهت دید تغییر می‌کند، نه محل دوربین.", "In the scene view, watch the camera position: its direction changes, but its location does not."),
        related: text("در مدار، خود دوربین هم دور سوژه جابه‌جا می‌شود.", "With an orbit, the camera itself also moves around the subject."),
        relatedIds: [{ section: "movements", id: "orbit" }],
        variants: [pathVariant("pan-left", "به چپ", "Left"), pathVariant("pan-right", "به راست", "Right")]
      },
      {
        id: "tilt", icon: "arrows-vertical", pathId: "tilt-up", selectionEffect: "replace-path",
        title: text("تیلت", "Tilt"),
        subtitle: text("چرخش به بالا و پایین", "Turn up or down"),
        definition: text("دوربین در همان موقعیت می‌ماند و جهت نگاه آن رو به بالا یا پایین می‌چرخد.", "The camera remains in place while its view turns upward or downward."),
        use: text("برای نشان دادن ارتفاع یک ساختمان، یا هدایت نگاه از یک جزئیات به سوژه.", "Reveal the height of a building, or guide attention from a detail to the subject."),
        tip: text("تیلت را با بالا بردن دوربین اشتباه نگیر؛ در این حرکت، زاویهٔ دید تغییر می‌کند.", "Tilting is different from raising the camera: this movement changes the viewing angle."),
        related: text("پن همین نوع چرخشِ نگاه را در جهت افقی نشان می‌دهد.", "Pan demonstrates the same kind of turn in the horizontal direction."),
        relatedIds: [{ section: "movements", id: "pan" }],
        variants: [pathVariant("tilt-up", "به بالا", "Up"), pathVariant("tilt-down", "به پایین", "Down")]
      },
      {
        id: "zoom", icon: "zoom-in", pathId: "zoom-in", selectionEffect: "replace-path", requiresAuthoredLens: true,
        title: text("زوم", "Zoom"),
        subtitle: text("باز و بسته شدن قاب", "Widen or tighten the frame"),
        definition: text("فاصلهٔ کانونی تغییر می‌کند و قاب بازتر یا بسته‌تر می‌شود؛ جای دوربین ثابت می‌ماند.", "The focal length changes to widen or tighten the frame while the camera stays in place."),
        use: text("برای هدایت توجه به یک جزئیات، یا نشان دادن فضای بیشتری بدون جابه‌جایی دوربین.", "Direct attention to a detail, or reveal more of the surroundings without moving the camera."),
        tip: text("هنگام پخش، عدد لنز را ببین؛ با بیشتر شدن آن، قاب بسته‌تر می‌شود.", "Watch the lens value during playback: as it increases, the frame becomes tighter."),
        related: text("با دالی مقایسه کن: نزدیک شدن واقعی دوربین، رابطهٔ عمقی اجسام را هم تغییر می‌دهد.", "Compare with dolly: physically moving the camera also changes the depth relationships between objects."),
        relatedIds: [{ section: "movements", id: "dolly" }, { section: "lenses", id: "normal" }],
        variants: [pathVariant("zoom-in", "زوم به داخل", "Zoom in"), pathVariant("zoom-out", "زوم به خارج", "Zoom out")]
      },
      {
        id: "orbit", icon: "rotate-360", pathId: "orbit-180", selectionEffect: "replace-path",
        title: text("مدار", "Orbit"),
        subtitle: text("چرخش دور سوژه", "Move around the subject"),
        definition: text("دوربین روی مسیری قوسی دور سوژه می‌چرخد و در طول حرکت، آن را در قاب نگه می‌دارد.", "The camera travels along an arc around the subject while keeping it in view."),
        use: text("برای دیدن سوژه از چند جهت، معرفی یک آبجکت یا آشکار شدن محیط اطراف آن.", "Show several sides of a subject, introduce an object or reveal its surroundings."),
        tip: text("پس‌زمینه در طول مدار عوض می‌شود؛ قبل از انتخاب حرکت، اطراف سوژه را هم بررسی کن.", "The background changes throughout the orbit, so inspect the space around the subject."),
        related: text("در پن، دوربین در جای خود می‌چرخد؛ در مدار، مسیر دور سوژه را طی می‌کند.", "A pan turns from one position; an orbit travels around the subject."),
        relatedIds: [{ section: "movements", id: "pan" }, { section: "scenes", id: "forest" }],
        variants: [pathVariant("orbit-180", "نیم‌دور", "Half orbit"), pathVariant("orbit-left-180", "نیم‌دور معکوس", "Reverse half orbit"), pathVariant("orbit-360", "دور کامل", "Full orbit")]
      }
    ],
    framing: [
      {
        id: "close", icon: "zoom-in", pathId: "close", framingId: "close", selectionEffect: "framing-modifier", spanFactor: 0.32, targetHeightFactor: 0.88,
        title: text("نمای نزدیک", "Close-up"),
        subtitle: text("توجه روی چهره یا یک جزئیات", "Focus attention on a face or detail"),
        definition: text("بخش کوچکی از سوژه، مثل چهره یا یک جزئیات مهم، بیشتر قاب را پر می‌کند.", "A small part of the subject, such as a face or an important detail, fills much of the frame."),
        use: text("برای خواندن واکنش، احساس یا جزئیاتی که در نمای باز دیده نمی‌شود.", "Show a reaction, emotion or detail that would be hard to read in a wide shot."),
        tip: text("قاب را در ابتدا و انتهای حرکت ببین؛ با نزدیک شدن دوربین ممکن است بخشی از سوژه از قاب بیرون برود.", "Check the start and end of the move: parts of the subject may leave the frame as the camera gets closer."),
        related: text("نمای متوسط، زبان بدن و بخشی از محیط را هم نشان می‌دهد.", "A medium shot also shows body language and some surroundings."),
        relatedIds: [{ section: "framing", id: "medium" }]
      },
      {
        id: "medium", icon: "user", pathId: "medium", framingId: "medium", selectionEffect: "framing-modifier", spanFactor: 0.85, targetHeightFactor: 0.67,
        title: text("نمای متوسط", "Medium shot"),
        subtitle: text("تعادل میان چهره و زبان بدن", "Balance expression and body language"),
        definition: text("برای یک فرد، معمولاً بالاتنه در قاب دیده می‌شود؛ هم حالت چهره و هم حرکت دست‌ها قابل خواندن است.", "For a person, the frame usually includes the upper body, keeping both facial expression and hand movements readable."),
        use: text("برای گفت‌وگو، توضیح دادن یا کنشی که صورت و دست‌ها در آن مهم‌اند.", "Use it for dialogue, explanation or action involving both the face and hands."),
        tip: text("حرکت انتخابی‌ات حفظ می‌شود؛ بعد از تغییر قد سوژه یا نسبت تصویر، قاب را دوباره بررسی کن.", "Your chosen movement stays in place; check the framing again after changing subject height or aspect ratio."),
        related: text("نمای نزدیک بر جزئیات تأکید می‌کند؛ نمای باز محیط بیشتری نشان می‌دهد.", "A close-up emphasizes detail; a wide shot shows more context."),
        relatedIds: [{ section: "framing", id: "close" }, { section: "framing", id: "wide" }]
      },
      {
        id: "wide", icon: "photo", pathId: "wide", framingId: "wide", selectionEffect: "framing-modifier", spanFactor: 1.6, targetHeightFactor: 0.5,
        title: text("نمای باز", "Wide shot"),
        subtitle: text("سوژه را در محیطش ببین", "See the subject in its surroundings"),
        definition: text("سوژه همراه با فضای کافی از اطرافش دیده می‌شود تا جای آن در صحنه روشن باشد.", "The subject appears with enough surrounding space to make its place in the scene clear."),
        use: text("برای معرفی مکان، میزانسن چند نفر یا حرکت‌هایی که به فضای اطراف نیاز دارند.", "Introduce a location, show several people’s positions or make room for larger actions."),
        tip: text("یک لنز واید همیشه نمای باز نمی‌سازد؛ فاصلهٔ دوربین از سوژه هم اندازهٔ آن در قاب را تعیین می‌کند.", "A wide-angle lens does not always create a wide shot; camera distance also determines the subject’s size in frame."),
        related: text("لنز واید را از یک موقعیت ثابت با لنز معمولی مقایسه کن.", "Compare wide and normal lenses from the same camera position."),
        relatedIds: [{ section: "lenses", id: "wide" }, { section: "framing", id: "medium" }]
      }
    ],
    lenses: [
      {
        id: "wide", icon: "maximize", lensId: "authored", referenceLensId: "prime-24", focalMM: 24, selectionEffect: "authored-lens-multiplier",
        title: text("واید", "Wide"),
        subtitle: text("بخش بیشتری از محیط در قاب", "Include more of the surroundings"),
        definition: text("با سنسور و موقعیت دوربین ثابت، فاصلهٔ کانونی کوتاه‌تر زاویهٔ دید بازتری می‌دهد.", "With the same sensor and camera position, a shorter focal length gives a wider field of view."),
        use: text("برای نشان دادن محیط یا جا دادن سوژه و فضای اطراف در یک قاب.", "Show the environment or include the subject and its surroundings together."),
        tip: text("لنز را تغییر بده و قاب را مقایسه کن؛ حرکت انتخابی تو باقی می‌ماند.", "Change the lens and compare the frame; your chosen movement stays in place."),
        related: text("نمای باز نامِ اندازهٔ قاب است؛ واید نامِ نوع لنز.", "Wide shot describes the framing; wide-angle describes the lens."),
        relatedIds: [{ section: "framing", id: "wide" }, { section: "lenses", id: "normal" }],
        variants: [lensVariant("prime-24", 24, "۲۴ میلی‌متر", "24 mm"), lensVariant("prime-28", 28, "۲۸ میلی‌متر", "28 mm")]
      },
      {
        id: "normal", icon: "aperture", lensId: "authored", referenceLensId: "prime-50", focalMM: 50, selectionEffect: "authored-lens-multiplier",
        title: text("معمولی", "Normal"),
        subtitle: text("نقطهٔ شروع برای مقایسهٔ لنزها", "A starting point for lens comparisons"),
        definition: text("در تنظیمات پیش‌فرض، زاویهٔ دیدی بین واید و تله دارد؛ برای شروع مقایسهٔ لنزها مناسب است.", "In the default setup, its field of view sits between wide and telephoto: a useful starting point for comparison."),
        use: text("برای شروع طراحی یک قاب و مقایسهٔ آگاهانه با لنز بازتر یا بسته‌تر.", "Start a composition, then compare it with a wider or tighter lens."),
        tip: text("ابتدا این لنز را ببین، سپس واید و تله را امتحان کن؛ جای دوربین را برای مقایسه ثابت نگه دار.", "Start here, then try wide and telephoto; keep the camera position unchanged for the comparison."),
        related: text("اگر حرکت زوم را انتخاب کرده باشی، لنز از این مقدار شروع می‌شود و در طول شات تغییر می‌کند.", "If you choose a zoom movement, the lens starts from this value and changes through the shot."),
        relatedIds: [{ section: "lenses", id: "wide" }, { section: "lenses", id: "tele" }, { section: "movements", id: "zoom" }],
        variants: [lensVariant("prime-50", 50, "۵۰ میلی‌متر", "50 mm"), lensVariant("prime-40", 40, "۴۰ میلی‌متر", "40 mm")]
      },
      {
        id: "tele", icon: "zoom-in", lensId: "authored", referenceLensId: "prime-85", focalMM: 85, selectionEffect: "authored-lens-multiplier",
        title: text("تله", "Telephoto"),
        subtitle: text("زاویهٔ دید بسته‌تر", "A narrower field of view"),
        definition: text("با سنسور و موقعیت دوربین ثابت، فاصلهٔ کانونی بلندتر بخش کوچک‌تری از صحنه را بزرگ‌تر در قاب نشان می‌دهد.", "With the same sensor and camera position, a longer focal length shows a smaller part of the scene at a larger size."),
        use: text("برای تأکید بر سوژه یا یک جزئیات، وقتی نمی‌خواهی دوربین را نزدیک‌تر ببری.", "Emphasize a subject or detail without moving the camera closer."),
        tip: text("برای دیدن اثر خود لنز، جای دوربین را عوض نکن و به اندازهٔ سوژه در قاب نگاه کن.", "Keep the camera in place and watch the subject’s size in frame to see the lens’s effect."),
        related: text("دالی دوربین را جابه‌جا می‌کند؛ انتخاب تله فقط لنز را تغییر می‌دهد.", "Dolly moves the camera; selecting telephoto changes only the lens."),
        relatedIds: [{ section: "movements", id: "dolly" }, { section: "lenses", id: "normal" }],
        variants: [lensVariant("prime-85", 85, "۸۵ میلی‌متر", "85 mm"), lensVariant("prime-135", 135, "۱۳۵ میلی‌متر", "135 mm")]
      }
    ],
    transitions: [
      {
        id: "cut", icon: "transition-right", transitionId: "cut",
        title: text("کات", "Cut"),
        subtitle: text("تغییر مستقیم از یک نما به نمای بعد", "Switch directly to the next shot"),
        definition: text("تصویر نمای A در یک لحظه با نمای B جایگزین می‌شود.", "Shot A is replaced by shot B at a single moment."),
        use: text("برای جابه‌جایی روشن میان زاویه‌ها، کنش‌ها یا لحظه‌های داستان.", "Move clearly between angles, actions or moments in a story."),
        tip: text("به جای قرار گرفتن سوژه در دو طرف برش نگاه کن؛ کات خودکار، تطابق حرکت یا ترکیب‌بندی را تضمین نمی‌کند.", "Check the subject’s placement on both sides of the cut; an automatic cut does not ensure matching action or composition."),
        related: text("دیزالو دو تصویر را به‌تدریج روی هم می‌آورد.", "A cross dissolve gradually blends the two images."),
        relatedIds: [{ section: "transitions", id: "cross-dissolve" }],
        variants: [transitionVariant("cut", "کات مستقیم", "Hard cut")]
      },
      {
        id: "cross-dissolve", icon: "stack", transitionId: "dissolve",
        title: text("دیزالو", "Cross dissolve"),
        subtitle: text("یک تصویر محو می‌شود و دیگری ظاهر می‌شود", "Blend one image into the next"),
        definition: text("در بخشی از گذار، دو تصویر هم‌زمان دیده می‌شوند؛ سهم A کم و سهم B بیشتر می‌شود.", "Both images are visible during part of the transition as A fades out and B fades in."),
        use: text("برای یک اتصال نرم یا پیشنهاد گذشت زمان؛ معنای آن به دو تصویر و زمینهٔ داستان بستگی دارد.", "Make a gentle connection or suggest passing time; its meaning depends on the images and story context."),
        tip: text("گذار را کوتاه و بلند امتحان کن؛ هنگام هم‌پوشانی، شکل‌ها و کنتراست دو تصویر روی هم اثر می‌گذارند.", "Try shorter and longer transitions; the shapes and contrast of the two images interact during the blend."),
        related: text("کات همان تغییر نما را بدون هم‌پوشانیِ قابل دیدن انجام می‌دهد.", "A cut makes the change without a visible blend."),
        relatedIds: [{ section: "transitions", id: "cut" }],
        variants: [transitionVariant("dissolve", "دیزالو", "Cross dissolve")]
      },
      {
        id: "wipe", icon: "arrow-left", transitionId: "wipe-left",
        title: text("وایپ", "Wipe"),
        subtitle: text("نمای بعد از پشت یک مرز ظاهر می‌شود", "Reveal the next shot behind a moving edge"),
        definition: text("یک مرز روی تصویر حرکت می‌کند و به‌تدریج نمای B را جای نمای A آشکار می‌کند.", "An edge moves across the image, progressively revealing shot B in place of shot A."),
        use: text("برای اتصال گرافیکی دو تصویر یا تأکید بر یک جهت در تدوین.", "Create a graphic connection between images or emphasize a direction in the edit."),
        tip: text("جهت وایپ را با حرکت داخل نماها مقایسه کن؛ خودِ وایپ مسیر دوربین را تغییر نمی‌دهد.", "Compare the wipe direction with the movement inside each shot; the wipe does not change the camera path."),
        related: text("ویپ با کشیدگی و حرکت سریع تصویر، اتصال متفاوتی می‌سازد.", "Whip uses rapid image motion and streaking for a different connection."),
        relatedIds: [{ section: "transitions", id: "whip" }],
        variants: [transitionVariant("wipe-left", "به چپ", "Left"), transitionVariant("wipe-right", "به راست", "Right"), transitionVariant("wipe-up", "به بالا", "Up"), transitionVariant("wipe-down", "به پایین", "Down")]
      },
      {
        id: "whip", icon: "arrows-horizontal", transitionId: "whip-horizontal",
        title: text("ویپ", "Whip"),
        subtitle: text("اتصال سریع با حرکت و کشیدگی تصویر", "A fast connection with image motion and streaking"),
        definition: text("این افکت با جابه‌جایی و کشیدگی تقریبی تصویر، حس عبور سریع میان دو نما را می‌سازد.", "This effect uses approximate image shifts and streaking to suggest a rapid move between shots."),
        use: text("برای یک اتصال پرتحرک، به‌ویژه وقتی جهت حرکت دو نما با هم هماهنگ است.", "Create an energetic connection, especially when the two shots have compatible movement directions."),
        tip: text("این ابزار افکت تصویری است؛ حرکت واقعی دوربین یا مچ شدن دو پن را خودکار طراحی نمی‌کند.", "This is an image effect; it does not automatically plan a real camera move or match two pans."),
        related: text("پن یک حرکت دوربین است؛ ویپِ این بخش برای اتصال دو نما به کار می‌رود.", "Pan is a camera movement; the whip in this section connects two shots."),
        relatedIds: [{ section: "movements", id: "pan" }, { section: "transitions", id: "wipe" }],
        variants: [transitionVariant("whip-horizontal", "افقی", "Horizontal"), transitionVariant("whip-vertical", "عمودی", "Vertical")]
      }
    ],
    scenes: [
      {
        id: "street", icon: "building", sceneId: "street",
        title: text("خیابان", "Street"),
        subtitle: text("معماری و امتداد مسیر", "Architecture and a receding route"),
        definition: text("یک خیابان معماری‌شده برای دیدن جای دوربین، سوژه و پس‌زمینه در طول مسیر.", "An architectural street for observing the camera, subject and background along a route."),
        use: text("برای مقایسهٔ دالی و زوم یا بررسی تغییر خطوط ساختمان‌ها در حرکت.", "Compare dolly and zoom, or observe how building lines change during a move."),
        tip: text("حرکت را پخش کن و لبه‌های ساختمان‌ها را دنبال کن؛ آن‌ها تغییر دید دوربین را خواناتر می‌کنند.", "Play the move and follow the building edges; they make changes in viewpoint easier to read."),
        related: text("دالی، رابطهٔ عمقی سوژه و ساختمان‌ها را تغییر می‌دهد.", "Dolly changes the depth relationship between the subject and buildings."),
        relatedIds: [{ section: "movements", id: "dolly" }, { section: "movements", id: "zoom" }]
      },
      {
        id: "interior", icon: "lamp", sceneId: "room",
        title: text("فضای داخلی", "Interior"),
        subtitle: text("اتاق و دکور", "A room with furniture"),
        definition: text("یک فضای داخلی ساده برای بررسی جای سوژه، وسایل و قاب دوربین.", "A simple interior for checking the positions of the subject, furniture and camera frame."),
        use: text("برای طراحی یک گفت‌وگو، نمای متوسط یا حرکت کوتاه در اتاق.", "Plan dialogue, a medium shot or a short camera move through a room."),
        tip: text("مسیر را از نمای صحنه هم بررسی کن؛ برنامه از عبور دوربین از دیوار یا وسایل جلوگیری نمی‌کند.", "Inspect the path in scene view too; the app does not prevent the camera from passing through walls or furniture."),
        related: text("نمای متوسط، چهره و حرکت دست‌ها را با هم نشان می‌دهد.", "A medium shot shows facial expression and hand movement together."),
        relatedIds: [{ section: "framing", id: "medium" }, { section: "movements", id: "pan" }]
      },
      {
        id: "forest", icon: "trees", sceneId: "forest",
        title: text("جنگل", "Forest"),
        subtitle: text("لایه‌های درخت و عمق صحنه", "Layers of trees and scene depth"),
        definition: text("یک محیط جنگلی ساده با اجسام در فاصله‌های مختلف برای بررسی عمق تصویر.", "A simplified forest with objects at different distances for exploring image depth."),
        use: text("برای دیدن تغییر پس‌زمینه در مدار یا عبور عناصر نزدیک در حرکت دوربین.", "Observe the changing background during an orbit or nearby objects passing through the frame."),
        tip: text("حرکت را تا پایان ببین؛ یک درخت ممکن است در بخشی از مسیر جلوی سوژه را بگیرد.", "Watch the entire move: a tree may obscure the subject during part of the path."),
        related: text("مدار، اطراف سوژه را از چند جهت نشان می‌دهد.", "Orbit reveals the space around the subject from several directions."),
        relatedIds: [{ section: "movements", id: "orbit" }, { section: "framing", id: "wide" }]
      },
      {
        id: "snow", icon: "snowflake", sceneId: "snow",
        title: text("برف", "Snow"),
        subtitle: text("دهکده در فضای برفی", "A village in a snowy setting"),
        definition: text("یک دهکدهٔ برفی ساده برای آزمایش میزانسن در یک محیط متفاوت.", "A simplified snow village for trying the blocking in a different setting."),
        use: text("برای مقایسهٔ همان مسیر و قاب در یک محیط دیگر، یا ساخت نمای B با پس‌زمینه‌ای متفاوت.", "Compare the same path and framing in another environment, or give shot B a different background."),
        tip: text("بعد از تغییر محیط، کل مسیر را دوباره ببین؛ جای اجسام صحنه می‌تواند روی دیده شدن سوژه اثر بگذارد.", "Replay the whole path after changing the environment; object placement can affect the subject’s visibility."),
        related: text("دیزالو را میان دو محیط امتحان کن و شکل‌های روی هم افتاده را ببین.", "Try a dissolve between environments and watch how their shapes overlap."),
        relatedIds: [{ section: "transitions", id: "cross-dissolve" }, { section: "framing", id: "wide" }]
      }
    ]
  };
})(window);
