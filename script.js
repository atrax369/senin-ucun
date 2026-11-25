document.addEventListener('DOMContentLoaded', () => {
    const questionCard = document.getElementById('questionCard');
    const answerCard = document.getElementById('answerCard');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const audioToggle = document.getElementById('audioToggle');
    const audioText = document.getElementById('audioText');

    // ==========================================
    // 1. WEB AUDIO API — YUMŞAQ ROMANTİK MELODİYA
    // ==========================================
    let audioCtx = null;
    let isPlaying = false;
    let melodyInterval = null;
    let masterGain = null;

    // Zərif, isti və sakitləşdirici arpeggio akkordları (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
    const chordSequence = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
        [164.81, 196.00, 246.94, 293.66], // Em7   (E3, G3, B3, D4)
        [146.83, 174.61, 220.00, 261.63], // Dm7   (D3, F3, A3, C4)
        [130.81, 196.00, 246.94, 329.63]  // Cmaj7 (C3, G3, B3, E4)
    ];

    let chordIndex = 0;
    let noteIndex = 0;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playSoftNote(freq) {
        if (!audioCtx || !isPlaying) return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        // Yumşaq piano/arfaabənzər səs tonu
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Yüksək tezlikləri yumşaldan filtr
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, now);

        // Səsin rəvan artıb-azalması (ADSR envelope)
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.14, now + 0.35);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 3.3);
    }

    function startMusic() {
        initAudio();
        if (isPlaying) return;

        isPlaying = true;
        audioToggle.classList.add('playing');
        audioText.textContent = 'Musiqi';

        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setTargetAtTime(0.65, audioCtx.currentTime, 0.8);

        // İlk notu dərhal səsləndir
        playNextArpeggioNote();

        // Hər 750ms-dən bir zərif not çal
        melodyInterval = setInterval(playNextArpeggioNote, 750);
    }

    function playNextArpeggioNote() {
        const currentChord = chordSequence[chordIndex];
        const freq = currentChord[noteIndex];
        playSoftNote(freq);

        noteIndex++;
        if (noteIndex >= currentChord.length) {
            noteIndex = 0;
            chordIndex = (chordIndex + 1) % chordSequence.length;
        }
    }

    function stopMusic() {
        if (!isPlaying) return;
        isPlaying = false;
        audioToggle.classList.remove('playing');
        audioText.textContent = 'Səssiz';

        if (melodyInterval) {
            clearInterval(melodyInterval);
            melodyInterval = null;
        }

        if (audioCtx && masterGain) {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.3);
        }
    }

    audioToggle.addEventListener('click', () => {
        if (isPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    });

    // ==========================================
    // 2. "YOX" DÜYMƏSİNİN MƏRHƏLƏLİ ƏRİMƏSİ
    // ==========================================
    const noStages = [
        { text: 'Yox',   scale: 1,    opacity: 1,    yesScale: 1 },
        { text: 'Yo...', scale: 0.84, opacity: 0.82, yesScale: 1.09 },
        { text: 'Y...',  scale: 0.66, opacity: 0.6,  yesScale: 1.18 },
        { text: '...',   scale: 0.45, opacity: 0.35, yesScale: 1.28 }
    ];

    let noStep = 0;
    let lastTriggerTime = 0;

    function advanceNoButton(e) {
        if (e) e.preventDefault();

        // Eyni anda həm mouseover, həm touchstart/click işləməsin deyə qısa qoruma
        const now = Date.now();
        if (now - lastTriggerTime < 220) return;
        lastTriggerTime = now;

        noStep++;

        if (noStep < noStages.length) {
            const stage = noStages[noStep];
            noBtn.textContent = stage.text;
            noBtn.style.transform = `scale(${stage.scale})`;
            noBtn.style.opacity = stage.opacity;
            yesBtn.style.transform = `scale(${stage.yesScale})`;
        } else {
            // Son mərhələ: "Yox" düyməsi tamamilə yoxa çıxır, "Hə" düyməsi mərkəzdə böyüyür
            noBtn.style.transform = 'scale(0)';
            noBtn.style.opacity = '0';
            noBtn.style.pointerEvents = 'none';
            yesBtn.style.transform = 'scale(1.32)';

            setTimeout(() => {
                noBtn.style.display = 'none';
            }, 350);
        }
    }

    // Kompüterdə üzərinə gəldikdə, mobil və ya klikdə toxunduqda işləsin
    noBtn.addEventListener('mouseenter', advanceNoButton);
    noBtn.addEventListener('touchstart', advanceNoButton, { passive: false });
    noBtn.addEventListener('click', advanceNoButton);

    // ==========================================
    // 3. "HƏ" DÜYMƏSİ VƏ EKRAN KEÇİDİ
    // ==========================================
    yesBtn.addEventListener('click', () => {
        // Musiqini avtomatik başlat
        if (!isPlaying) {
            startMusic();
        }

        // Sual kartını rəvan şəkildə gizlət
        questionCard.classList.add('fade-out');

        setTimeout(() => {
            questionCard.classList.remove('active', 'fade-out');
            questionCard.classList.add('hidden');

            // Cavab kartını aç
            answerCard.classList.remove('hidden');
            answerCard.classList.add('active');
        }, 650);
    });
});