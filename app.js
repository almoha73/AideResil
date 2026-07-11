document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle');
    const cancelDateElecInput = document.getElementById('cancel-date-elec');
    const cancelDateGazInput = document.getElementById('cancel-date-gaz');
    const contractElecInput = document.getElementById('contract-elec');
    const contractGazInput = document.getElementById('contract-gaz');

    // Contract visibility groups
    const groupContractElec = document.getElementById('group-contract-elec');
    const groupContractGaz = document.getElementById('group-contract-gaz');
    const groupDateElec = document.getElementById('group-date-elec');
    const groupDateGaz = document.getElementById('group-date-gaz');
    const groupKeepActive = document.getElementById('group-keep-active');
    const keepActiveOther = document.getElementById('keep-active-other');
    const keepActiveLabel = document.getElementById('keep-active-label');

    // Meter elements
    const meterNonCommunicating = document.getElementById('meter-non-communicating');
    const groupElecMeter = document.getElementById('group-elec-meter');
    const groupElecReading = document.getElementById('group-elec-reading');
    const elecReadingProvided = document.getElementById('elec-reading-provided');
    const groupElecReadingInputs = document.getElementById('group-elec-reading-inputs');

    // Gaz appointment elements
    const gazAppointmentNeeded = document.getElementById('gaz-appointment-needed');
    const groupGazAppointment = document.getElementById('group-gaz-appointment');
    const groupGazAppointmentDetails = document.getElementById('group-gaz-appointment-details');
    const gazAppointmentDateInput = document.getElementById('gaz-appointment-date');
    const gazAppointmentTimeInput = document.getElementById('gaz-appointment-time');
    const groupGazAppointmentTimeCustom = document.getElementById('group-gaz-appointment-time-custom');
    const gazAppointmentTimeCustomInput = document.getElementById('gaz-appointment-time-custom');

    // Individual inputs
    const readingBaseVal = document.getElementById('reading-base-val');
    const readingHpVal = document.getElementById('reading-hp-val');
    const readingHcVal = document.getElementById('reading-hc-val');
    const readingHphVal = document.getElementById('reading-hph-val');
    const readingHpbVal = document.getElementById('reading-hpb-val');
    const readingHchVal = document.getElementById('reading-hch-val');
    const readingHcbVal = document.getElementById('reading-hcb-val');

    // Wrappers
    const wrapperReadingBase = document.getElementById('wrapper-reading-base');
    const wrapperReadingHp = document.getElementById('wrapper-reading-hp');
    const wrapperReadingHc = document.getElementById('wrapper-reading-hc');
    const wrapperReadingHph = document.getElementById('wrapper-reading-hph');
    const wrapperReadingHpb = document.getElementById('wrapper-reading-hpb');
    const wrapperReadingHch = document.getElementById('wrapper-reading-hch');
    const wrapperReadingHcb = document.getElementById('wrapper-reading-hcb');

    // Output elements
    const rulesBanner = document.getElementById('rules-banner');
    const rulesTitle = document.getElementById('rules-title');
    const rulesDescription = document.getElementById('rules-description');
    const emailSubjectInput = document.getElementById('email-subject-input');
    const emailBodyInput = document.getElementById('email-body-input');

    // Quick buttons
    const btnTodayElec = document.getElementById('btn-today-elec');
    const btnTomorrowElec = document.getElementById('btn-tomorrow-elec');
    const btnClearElec = document.getElementById('btn-clear-elec');

    const btnTodayGaz = document.getElementById('btn-today-gaz');
    const btnTomorrowGaz = document.getElementById('btn-tomorrow-gaz');
    const btnClearGaz = document.getElementById('btn-clear-gaz');

    const btnCopySubject = document.getElementById('btn-copy-subject');
    const btnCopyBody = document.getElementById('btn-copy-body');

    // -------------------------------------------------------------
    // Initial State & Theme Toggle
    // -------------------------------------------------------------
    const savedTheme = localStorage.getItem('aideResil_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aideResil_theme', newTheme);
    });

    // Set default date to today
    const todayDate = new Date();

    // Initialize Flatpickr calendars on the date fields
    const cancellationDatePickerElec = flatpickr("#cancel-date-elec", {
        locale: "fr",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d F Y",
        defaultDate: todayDate,
        allowInput: true,
        onChange: function () {
            generateEmail();
        }
    });

    const cancellationDatePickerGaz = flatpickr("#cancel-date-gaz", {
        locale: "fr",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d F Y",
        defaultDate: todayDate,
        allowInput: true,
        onChange: function () {
            generateEmail();
        }
    });

    const gazAppointmentDatePicker = flatpickr("#gaz-appointment-date", {
        locale: "fr",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d F Y",
        allowInput: true,
        onChange: function () {
            generateEmail();
        }
    });

    // -------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------
    function formatDateToYYYYMMDD(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function parseLocalDate(dateString) {
        if (!dateString) return new Date();
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function getFrenchHolidays(year) {
        const holidays = [
            `01-01`, // Jour de l'An
            `05-01`, // Fête du Travail
            `05-08`, // Victoire 1945
            `07-14`, // Fête Nationale
            `08-15`, // Assomption
            `11-01`, // Toussaint
            `11-11`, // Armistice 1918
            `12-25`  // Noël
        ];

        // Compute Easter for Gregorian calendar
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const monthIndex = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        const easter = new Date(year, monthIndex - 1, day);

        // Easter Monday is +1 day
        const easterMonday = new Date(easter);
        easterMonday.setDate(easter.getDate() + 1);

        // Ascension is +39 days after Easter
        const ascension = new Date(easter);
        ascension.setDate(easter.getDate() + 39);

        // Pentecost Monday is +50 days after Easter
        const pentecostMonday = new Date(easter);
        pentecostMonday.setDate(easter.getDate() + 50);

        const format = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        holidays.push(format(easterMonday));
        holidays.push(format(ascension));
        holidays.push(format(pentecostMonday));

        return holidays;
    }

    function isFrenchHoliday(date) {
        const year = date.getFullYear();
        const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const holidays = getFrenchHolidays(year);
        return holidays.includes(mmdd);
    }

    function isBusinessDay(date) {
        const day = date.getDay();
        if (day === 0 || day === 6) return false;
        return !isFrenchHoliday(date);
    }

    function getClosestBusinessDay(date) {
        const d = new Date(date);
        while (!isBusinessDay(d)) {
            d.setDate(d.getDate() + 1);
        }
        return d;
    }

    function getNextBusinessDay(baseDate) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + 1);
        while (!isBusinessDay(d)) {
            d.setDate(d.getDate() + 1);
        }
        return d;
    }

    function getGazPostponementReason(todayDate, nextBizDate) {
        const todayDay = todayDate.getDay();
        const isTodayBiz = isBusinessDay(todayDate);
        
        const diffTime = nextBizDate.getTime() - todayDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            if (isTodayBiz) {
                return "le jour même";
            } else {
                const dayNames = {
                    0: "le dimanche",
                    6: "le samedi"
                };
                return dayNames[todayDay] || "un jour férié";
            }
        }
        
        let parts = [];
        if (isTodayBiz) {
            parts.push("le jour même");
        }
        
        let hasWeekend = false;
        let hasHoliday = false;
        for (let i = 1; i < diffDays; i++) {
            const d = new Date(todayDate);
            d.setDate(d.getDate() + i);
            const day = d.getDay();
            if (day === 0 || day === 6) {
                hasWeekend = true;
            } else if (isFrenchHoliday(d)) {
                hasHoliday = true;
            }
        }
        
        if (hasWeekend) {
            parts.push("le week-end");
        }
        if (hasHoliday) {
            parts.push("un jour férié");
        }
        
        if (parts.length === 1) {
            return parts[0];
        } else if (parts.length === 2) {
            return `${parts[0]} ni ${parts[1]}`;
        } else {
            return `${parts[0]}, ni ${parts[1]}, ni ${parts[2]}`;
        }
    }


    function formatLongFrenchDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    function getFutureGazPostponementPhrase(reqDate, effDate) {
        const dayOfWeek = reqDate.getDay();
        const effDateStr = formatLongFrenchDate(effDate);
        if (dayOfWeek === 6) { // Saturday
            return `La date de résiliation demandée tombant un samedi, je vous informe qu'aucune résiliation ne peut être effectuée le week-end. Celle-ci est donc repoussée au lundi, et sera effective le ${effDateStr}.`;
        } else if (dayOfWeek === 0) { // Sunday
            return `La date de résiliation demandée tombant un dimanche, je vous informe qu'aucune résiliation ne peut être effectuée le week-end. Celle-ci est donc repoussée au lundi, et sera effective le ${effDateStr}.`;
        } else { // Public holiday
            const nextDay = new Date(reqDate);
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            const isLendemain = effDate.getTime() === nextDay.getTime();
            const suffix = isLendemain ? `, soit le lendemain` : ``;
            return `La date de résiliation demandée tombant un jour férié, je vous informe que celle-ci est repoussée au prochain jour ouvré${suffix}. Elle sera donc effective le ${effDateStr}.`;
        }
    }

    function getFutureGazBulletPostponementPhrase(reqDate, effDate) {
        const dayOfWeek = reqDate.getDay();
        const effDateStr = formatLongFrenchDate(effDate);
        if (dayOfWeek === 6) { // Saturday
            return `la date de résiliation demandée tombant un samedi, aucune résiliation ne pouvant être effectuée le week-end, la résiliation est repoussée au lundi. Elle sera donc effective le ${effDateStr}.`;
        } else if (dayOfWeek === 0) { // Sunday
            return `la date de résiliation demandée tombant un dimanche, aucune résiliation ne pouvant être effectuée le week-end, la résiliation est repoussée au lundi. Elle sera donc effective le ${effDateStr}.`;
        } else { // Public holiday
            const nextDay = new Date(reqDate);
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            const isLendemain = effDate.getTime() === nextDay.getTime();
            const suffix = isLendemain ? `, soit le lendemain` : ``;
            return `la date de résiliation demandée tombant un jour férié, la résiliation est repoussée au prochain jour ouvré${suffix}. Elle sera donc effective le ${effDateStr}.`;
        }
    }

    // -------------------------------------------------------------
    // Business Logic & Generation
    // -------------------------------------------------------------
    function generateEmail() {
        // 1. Inputs values
        const energyType = document.querySelector('input[name="energy-type"]:checked').value;
        const pdlElec = contractElecInput.value.trim() || '[PDL]';
        const pceGaz = contractGazInput.value.trim() || '[PCE]';

        const isNonCommunicating = meterNonCommunicating.checked;
        const indexProvided = elecReadingProvided.checked;
        let isAppointmentAlreadyInjected = false;

        function getElecReadingPhrase() {
            if (!isNonCommunicating || !indexProvided) {
                return "sur la base de la relève de compteur que vous m'avez transmise";
            }
            const meterType = document.querySelector('input[name="elec-meter-type"]:checked').value;
            const option = document.querySelector('input[name="elec-reading-option"]:checked').value;

            if (meterType === 'linky') {
                const valHph = readingHphVal.value.trim() || '[Index HPH]';
                const valHpb = readingHpbVal.value.trim() || '[Index HPB]';
                const valHch = readingHchVal.value.trim() || '[Index HCH]';
                const valHcb = readingHcbVal.value.trim() || '[Index HCB]';

                if (option === 'base') {
                    const valBase = readingBaseVal.value.trim() || '[Index Base]';
                    return `sur la base des relèves que vous m'avez transmises (Index Base : ${valBase} kWh, HPH : ${valHph} kWh, HPB : ${valHpb} kWh, HCH : ${valHch} kWh, HCB : ${valHcb} kWh)`;
                } else {
                    const valHp = readingHpVal.value.trim() || '[Index HP]';
                    const valHc = readingHcVal.value.trim() || '[Index HC]';
                    return `sur la base des relèves que vous m'avez transmises (Index HP : ${valHp} kWh, HC : ${valHc} kWh, HPH : ${valHph} kWh, HPB : ${valHpb} kWh, HCH : ${valHch} kWh, HCB : ${valHcb} kWh)`;
                }
            } else {
                if (option === 'base') {
                    const valBase = readingBaseVal.value.trim() || '[Index Base]';
                    return `sur la base de la relève que vous m'avez transmise (Index Base : ${valBase} kWh)`;
                } else {
                    const valHp = readingHpVal.value.trim() || '[Index Heures Pleines]';
                    const valHc = readingHcVal.value.trim() || '[Index Heures Creuses]';
                    return `sur la base des relèves que vous m'avez transmises (Index Heures Pleines : ${valHp} kWh, Heures Creuses : ${valHc} kWh)`;
                }
            }
        }

        function getElecReadingRequestPhrase(mode, dateSuffix = "à cette date") {
            const meterType = document.querySelector('input[name="elec-meter-type"]:checked').value;
            const option = document.querySelector('input[name="elec-reading-option"]:checked').value;

            if (meterType === 'linky') {
                if (option === 'base') {
                    if (mode === 'subjunctive') {
                        return `sous réserve que vous me transmettiez votre relève de compteur (l'index Base ainsi que les index de programmation locale HPH, HPB, HCH et HCB de votre compteur Linky non-communicant) ${dateSuffix}, sans quoi la résiliation ne pourra pas être effectuée`;
                    } else { // reminder
                        return `Pour rappel, votre compteur d'électricité étant un compteur Linky non-communicant, la transmission de votre relève (l'index Base ainsi que les index de programmation locale HPH, HPB, HCH et HCB) sera nécessaire le jour de la résiliation, celle-ci ne pouvant pas être effectuée sans cette relève.`;
                    }
                } else { // hphc
                    if (mode === 'subjunctive') {
                        return `sous réserve que vous me transmettiez vos relèves de compteur (les index Heures Pleines et Heures Creuses, ainsi que les index de programmation locale HPH, HPB, HCH et HCB de votre compteur Linky non-communicant) ${dateSuffix}, sans quoi la résiliation ne pourra pas être effectuée`;
                    } else { // reminder
                        return `Pour rappel, votre compteur d'électricité étant un compteur Linky non-communicant, la transmission de vos relèves (les index Heures Pleines et Heures Creuses, ainsi que les index de programmation locale HPH, HPB, HCH et HCB) sera nécessaire le jour de la résiliation, celle-ci ne pouvant pas être effectuée sans ces relèves.`;
                    }
                }
            } else { // ancien
                if (option === 'base') {
                    if (mode === 'subjunctive') {
                        return `sous réserve que vous me transmettiez votre relève de compteur (l'index de consommation Base de votre ancien compteur) ${dateSuffix}, sans quoi la résiliation ne pourra pas être effectuée`;
                    } else { // reminder
                        return `Pour rappel, votre compteur d'électricité étant un ancien compteur, la transmission de votre relève (l'index de consommation Base) sera nécessaire le jour de la résiliation, celle-ci ne pouvant pas être effectuée sans cette relève.`;
                    }
                } else { // hphc
                    if (mode === 'subjunctive') {
                        return `sous réserve que vous me transmettiez vos relèves de compteur (les index Heures Pleines et Heures Creuses de votre ancien compteur) ${dateSuffix}, sans quoi la résiliation ne pourra pas être effectuée`;
                    } else { // reminder
                        return `Pour rappel, votre compteur d'électricité étant un ancien compteur, la transmission de vos relèves (les index Heures Pleines et Heures Creuses) sera nécessaire le jour de la résiliation, celle-ci ne pouvant pas être effectuée sans ces relèves.`;
                    }
                }
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let emailSubject = '';
        let emailBody = '';
        let rulesAppliedText = '';
        let rulesStatusClass = 'status-success'; // success or warning

        // Next business day of today (since evaluation happens today)
        const nextBusinessDay = getNextBusinessDay(today);

        // 2. Generate content according to commodity rules
        if (energyType === 'elec') {
            const dateVal = cancelDateElecInput.value;
            const keepActive = keepActiveOther.checked;

            if (!dateVal) {
                emailSubject = "⚠️ Action requise : Date de résiliation de votre contrat d'électricité";
                if (isNonCommunicating) {
                    const meterType = document.querySelector('input[name="elec-meter-type"]:checked').value;
                    const option = document.querySelector('input[name="elec-reading-option"]:checked').value;
                    
                    let meterLabel = "";
                    let indexLabel = "";
                    if (meterType === 'linky') {
                        meterLabel = "un compteur Linky non-communicant";
                        indexLabel = option === 'base' 
                            ? "votre index Base ainsi que vos index de programmation locale (HPH, HPB, HCH et HCB)"
                            : "vos index Heures Pleines / Heures Creuses ainsi que vos index de programmation locale (HPH, HPB, HCH et HCB)";
                    } else {
                        meterLabel = "un ancien compteur (mécanique ou électronique)";
                        indexLabel = option === 'base'
                            ? "votre index de consommation Base"
                            : "vos index de consommation Heures Pleines et Heures Creuses";
                    }

                    if (indexProvided) {
                        const readingPhrase = getElecReadingPhrase();
                        emailBody = `J'ai bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}), ainsi que votre relève de compteur ${readingPhrase}.\n\nCependant, je constate que vous n'avez pas indiqué la date à laquelle vous souhaitez que cette résiliation prenne effet.\n\nPourriez-vous me communiquer la date de résiliation souhaitée ?\n- Si la date souhaitée est dans le futur, je vous informe que je ne peux pas prendre en compte la relève que vous m'avez transmise aujourd'hui car votre consommation évoluera d'ici là. Il vous faudra donc me communiquer une nouvelle relève le jour même de votre départ, car je ne peux pas résilier sans relève.\n- Si la résiliation doit intervenir immédiatement, j'utiliserai la relève que vous venez de me transmettre pour finaliser votre demande.\n\nDans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                    } else {
                        emailBody = `J'ai bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}).\n\nCependant, je constate d'une part que vous n'avez pas indiqué la date à laquelle vous souhaitez que cette résiliation prenne effet, et d'autre part que votre relève de compteur est manquante. Votre compteur étant ${meterLabel}, je vous informe qu'il n'est pas possible de procéder à la résiliation sans la transmission de votre relève (soit ${indexLabel}).\n\nPourriez-vous me communiquer la date de résiliation souhaitée ?\n- Si la date souhaitée est dans le futur, il vous faudra impérativement me transmettre votre relève le jour même où vous quittez le logement afin que je puisse finaliser la résiliation.\n- Si la résiliation doit intervenir immédiatement, merci de me transmettre votre relève dès aujourd'hui.\n\nDans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                    }
                } else {
                    emailBody = `J'ai bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}).\n\nCependant, je constate que vous n'avez pas indiqué la date à laquelle vous souhaitez que cette résiliation prenne effet.\n\nPourriez-vous me communiquer la date de résiliation souhaitée afin que je puisse finaliser votre demande ?\n\nDans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                }
                rulesAppliedText = "Date d'électricité manquante. E-mail de demande de date généré.";
                rulesStatusClass = 'status-warning';
            } else {
                const requestedDate = parseLocalDate(dateVal);
                requestedDate.setHours(0, 0, 0, 0);
                const isPast = requestedDate < today;
                const isToday = requestedDate.getTime() === today.getTime();
                const isFuture = requestedDate > today;

                const effElecDate = (isToday || isFuture) ? requestedDate : today;
                const effElecDateStr = formatLongFrenchDate(effElecDate);

                emailSubject = "Confirmation de la résiliation de votre contrat d'électricité";

                if (isNonCommunicating) {
                    const readingPhrase = getElecReadingPhrase();
                    if (isPast) {
                        const todayStr = formatLongFrenchDate(today);
                        rulesStatusClass = 'status-warning';
                        if (indexProvided) {
                            rulesAppliedText = `Compteur non communicant avec relève. Date passée (${formatLongFrenchDate(requestedDate)}) reprogrammée au jour même soit le ${todayStr}.`;
                            emailBody = `Je vous confirme la prise en compte de la résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).\n\nLa date de résiliation demandée étant dans le passé, et votre compteur étant non communicant, la résiliation sera effective ce jour, le ${todayStr}, ${readingPhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                        } else {
                            emailSubject = "🚨 Action requise : Résiliation impossible sans votre relève - Contrat d'électricité";
                            const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date. 🚨 URGENT : je ne peux pas résilier aujourd'hui sans relève, merci de la communiquer au plus vite");
                            rulesAppliedText = `Compteur non communicant sans relève. Date passée reprogrammée au jour même sous réserve de relève.`;
                            emailBody = `J'ai bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}).\n\nLa date de résiliation demandée étant dans le passé, et votre compteur étant non communicant, la résiliation sera effective ce jour, le ${todayStr}, ${reqPhrase}.`;
                        }
                    } else if (isToday) {
                        const dateStr = formatLongFrenchDate(requestedDate);
                        rulesStatusClass = 'status-success';
                        if (indexProvided) {
                            rulesAppliedText = `Compteur non communicant avec relève. Résiliation ce jour le ${dateStr}.`;
                            emailBody = `Je vous confirme la prise en compte de la résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).\n\nCelle-ci sera effective ce jour, le ${dateStr}, ${readingPhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                        } else {
                            emailSubject = "🚨 Action requise : Résiliation impossible sans votre relève - Contrat d'électricité";
                            const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date. 🚨 URGENT : je ne peux pas résilier aujourd'hui sans relève, merci de la communiquer au plus vite");
                            rulesAppliedText = `Compteur non communicant sans relève. Résiliation ce jour sous réserve de relève.`;
                            emailBody = `J'ai bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}).\n\nCelle-ci sera effective ce jour, le ${dateStr}, ${reqPhrase}.`;
                        }
                    } else { // isFuture
                        const dateStr = formatLongFrenchDate(requestedDate);
                        const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                        rulesAppliedText = `Compteur non communicant. Date future (${dateStr}). Résiliation le jour demandé sous réserve de relève.`;
                        rulesStatusClass = 'status-success';

                        let readingNotice = '';
                        if (indexProvided) {
                            readingNotice = `\n- L'index de consommation transmis aujourd'hui ne pouvant être enregistré par anticipation (votre consommation étant amenée à évoluer d'ici la date effective de résiliation), je vous invite à me communiquer une nouvelle relève à cette date`;
                        }

                        emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).\n\nVotre compteur étant non communicant, je vous informe que je résilierai votre contrat le jour même de votre demande, soit le ${dateStr}, ${reqPhrase}.${readingNotice}\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                    }
                } else {
                    if (isToday || isFuture) {
                        const dateStr = formatLongFrenchDate(requestedDate);
                        rulesAppliedText = `Date future ou égale au jour même (${formatLongFrenchDate(requestedDate)}). Résiliation confirmée le jour demandé.`;
                        rulesStatusClass = 'status-success';

                        const datePhrase = isToday ? `ce jour, le ${dateStr}` : `le ${dateStr}`;

                        emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).\n\nCelle-ci sera effective ${datePhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                    } else {
                        // Requested date is in the past
                        const todayStr = formatLongFrenchDate(today);
                        rulesAppliedText = `Date demandée dans le passé (${formatLongFrenchDate(requestedDate)}). Résiliation impossible dans le passé, reprogrammée le jour même soit le ${todayStr}.`;
                        rulesStatusClass = 'status-warning';

                        emailBody = `Je vous confirme la prise en compte de la résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).\n\nLa date de résiliation demandée étant dans le passé, je vous informe qu'il n'est pas possible de résilier un contrat de manière rétroactive. Par conséquent, j'ai procédé à la résiliation de votre contrat en date d'aujourd'hui, soit le ${todayStr}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                    }
                }

                if (keepActive) {
                    emailSubject = "⚠️ Confirmation de résiliation (électricité) & question pour votre contrat gaz";

                    const isBizDayForGaz = isBusinessDay(effElecDate);
                    const isEffElecToday = effElecDate.getTime() === today.getTime();

                    if (isBizDayForGaz && !isEffElecToday) {
                        emailBody += `\n\nPar ailleurs, je vous confirme que votre contrat de gaz (PCE n° ${pceGaz}) reste actif et n'est pas impacté par cette demande. Si vous souhaitez également procéder à sa résiliation, merci de me l'indiquer (et de me préciser si celle-ci doit être effectuée à la même date (${effElecDateStr})). Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    } else if (isEffElecToday) {
                        const nextBizStr = formatLongFrenchDate(nextBusinessDay);
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                        const nextBizPhrase = isTomorrow ? `soit demain, le ${nextBizStr}` : `soit le ${nextBizStr}`;
                        const reasonStr = getGazPostponementReason(today, nextBusinessDay);

                        emailBody += `\n\nPar ailleurs, je vous confirme que votre contrat de gaz (PCE n° ${pceGaz}) reste actif et n'est pas impacté par cette demande. Si votre souhait est également de le résilier à la même date, la résiliation du contrat de gaz ne pouvant pas s'effectuer ${reasonStr}, celle-ci prendra effet le prochain jour ouvré, ${nextBizPhrase}. Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    } else {
                        const proposedGazDate = getClosestBusinessDay(effElecDate);
                        const proposedGazDateStr = formatLongFrenchDate(proposedGazDate);
                        const dayOfWeek = effElecDate.getDay();
                        const reasons = {
                            6: 'samedi',
                            0: 'dimanche'
                        };
                        const reasonStr = reasons[dayOfWeek] || 'jour férié';
                        emailBody += `\n\nPar ailleurs, je vous confirme que votre contrat de gaz (PCE n° ${pceGaz}) reste actif et n'est pas impacté par cette demande. Si votre souhait est également de le résilier à la même date, la résiliation du contrat de gaz ne pouvant pas s'effectuer un ${reasonStr}, celle-ci prendra effet le prochain jour ouvré, soit le ${proposedGazDateStr}. Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    }
                    rulesAppliedText += " Offre de gaz maintenue active.";
                }

                emailBody += `\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
            }
        }
        else if (energyType === 'gaz') {
            const dateVal = cancelDateGazInput.value;
            const keepActive = keepActiveOther.checked;

            if (!dateVal) {
                emailSubject = "⚠️ Action requise : Date de résiliation de votre contrat de gaz";
                emailBody = `J'ai bien reçu votre demande de résiliation pour votre contrat de gaz (PCE n° ${pceGaz}).\n\nCependant, je constate que vous n'avez pas indiqué la date à laquelle vous souhaitez que cette résiliation prenne effet.\n\nPourriez-vous me communiquer la date de résiliation souhaitée afin que je puisse finaliser votre demande ?\n\nDans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                rulesAppliedText = "Date de gaz manquante. E-mail de demande de date généré.";
                rulesStatusClass = 'status-warning';
            } else {
                const requestedDate = parseLocalDate(dateVal);
                requestedDate.setHours(0, 0, 0, 0);
                const isPast = requestedDate < today;
                const isToday = requestedDate.getTime() === today.getTime();
                const isFuture = requestedDate > today;

                let effGazDate;

                emailSubject = "Confirmation de la résiliation de votre contrat de gaz";

                const isRdvNeeded = gazAppointmentNeeded && gazAppointmentNeeded.checked;
                const rdvDateVal = gazAppointmentDateInput.value;
                const rdvDate = rdvDateVal ? parseLocalDate(rdvDateVal) : null;

                if (isRdvNeeded) {
                    effGazDate = rdvDate || requestedDate || today;
                    const rdvDateStr = rdvDate ? formatLongFrenchDate(rdvDate) : "[Date de RDV]";
                    rulesAppliedText = `Rendez-vous GRDF nécessaire. Résiliation effective le jour de l'intervention (${rdvDateStr}).`;
                    rulesStatusClass = 'status-warning';

                    const requestedDateStr = requestedDate ? formatLongFrenchDate(requestedDate) : "";
                    const insteadOfPhrase = (requestedDateStr && requestedDateStr !== rdvDateStr) ? `, au lieu du ${requestedDateStr} comme demandé` : '';
                    emailBody = `Je vous confirme la prise en compte de la résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\nLa résiliation sera effective le ${rdvDateStr}${insteadOfPhrase}. En effet, GRDF, le gestionnaire du réseau gaz, a demandé un rendez-vous physique pour procéder à cette mise hors service (résiliation). Il peut arriver que GRDF demande votre présence pour cela au lieu d'effectuer une résiliation à distance.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                } else {
                    if (isFuture) {
                        const isRequestedBizDay = isBusinessDay(requestedDate);
                        if (isRequestedBizDay) {
                            effGazDate = requestedDate;
                            const dateStr = formatLongFrenchDate(requestedDate);
                            rulesAppliedText = `Date future (${formatLongFrenchDate(requestedDate)}). Résiliation confirmée le jour demandé.`;
                            rulesStatusClass = 'status-success';

                            emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\nCelle-ci sera effective le ${dateStr}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                        } else {
                            const effectiveDate = getClosestBusinessDay(requestedDate);
                            effGazDate = effectiveDate;
                            const effectiveDateStr = formatLongFrenchDate(effectiveDate);
                            const requestedDateStr = formatLongFrenchDate(requestedDate);

                            const dayOfWeekStr = requestedDate.getDay() === 6 ? 'samedi' : requestedDate.getDay() === 0 ? 'dimanche' : 'jour férié';
                            rulesAppliedText = `Date demandée (${requestedDateStr}) tombant un ${dayOfWeekStr}. Reportée au prochain jour ouvré soit le ${effectiveDateStr}.`;
                            rulesStatusClass = 'status-warning';

                            const explanationPhrase = getFutureGazPostponementPhrase(requestedDate, effectiveDate);

                            emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\n${explanationPhrase}\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                        }
                    } else if (isPast) {
                        effGazDate = nextBusinessDay;
                        const nextBizStr = formatLongFrenchDate(nextBusinessDay);
                        rulesAppliedText = `Date demandée dans le passé (${formatLongFrenchDate(requestedDate)}). Résiliation impossible dans le passé pour le Gaz. Décalée au prochain jour ouvré soit le ${nextBizStr}.`;
                        rulesStatusClass = 'status-warning';

                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                        const nextBizPhrase = isTomorrow ? `soit demain, le ${nextBizStr}` : `soit le ${nextBizStr}`;

                        emailBody = `Je vous confirme la prise en compte de la résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\nLa date de résiliation demandée étant dans le passé, je vous informe qu'il n'est pas possible de résilier un contrat de manière rétroactive. Par conséquent, la résiliation de votre contrat sera effective le prochain jour ouvré, ${nextBizPhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                    } else {
                        // Requested is today (must be next business day)
                        effGazDate = nextBusinessDay;
                        const nextBizStr = formatLongFrenchDate(nextBusinessDay);
                        rulesAppliedText = `Date demandée le jour même (${formatLongFrenchDate(requestedDate)}). Résiliation impossible immédiatement pour le Gaz. Décalée au prochain jour ouvré soit le ${nextBizStr}.`;
                        rulesStatusClass = 'status-warning';

                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                        const nextBizPhrase = isTomorrow ? `soit demain, le ${nextBizStr}` : `soit le ${nextBizStr}`;
                        const reasonStr = getGazPostponementReason(today, nextBusinessDay);

                        emailBody = `Je vous confirme la prise en compte de la résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\nLa résiliation du contrat de gaz ne pouvant pas s'effectuer ${reasonStr}, la résiliation de votre contrat sera effective le prochain jour ouvré, ${nextBizPhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                    }
                }

                const effGazDateStr = formatLongFrenchDate(effGazDate);

                if (keepActive) {
                    emailSubject = "⚠️ Confirmation de résiliation (gaz) & question pour votre contrat électricité";

                    // Compute proposed date for Electricity
                    const proposedElecDate = (requestedDate >= today) ? requestedDate : today;
                    const proposedElecDateStr = formatLongFrenchDate(proposedElecDate);

                    let proposedElecPhrase = '';
                    if (requestedDate.getTime() === effGazDate.getTime()) {
                        proposedElecPhrase = `à la même date (${effGazDateStr})`;
                    } else if (requestedDate.getTime() === today.getTime() || requestedDate < today) {
                        proposedElecPhrase = `à la date du jour (${proposedElecDateStr})`;
                    } else {
                        proposedElecPhrase = `à la date initialement souhaitée (${proposedElecDateStr})`;
                    }

                    emailBody += `\n\nPar ailleurs, je vous confirme que votre contrat d'électricité (PDL n° ${pdlElec}) reste actif et n'est pas impacté par cette demande. Si vous souhaitez également procéder à sa résiliation, merci de me l'indiquer (et de me préciser si celle-ci doit être effectuée ${proposedElecPhrase}). Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    rulesAppliedText += " Offre d'électricité maintenue active.";
                }

                emailBody += `\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
            }
        }
        else if (energyType === 'both') {
            const dateElecVal = cancelDateElecInput.value;
            const dateGazVal = cancelDateGazInput.value;

            if (!dateElecVal && !dateGazVal) {
                emailSubject = "⚠️ Action requise : Date de résiliation de vos contrats d'électricité et de gaz";
                if (isNonCommunicating) {
                    const meterType = document.querySelector('input[name="elec-meter-type"]:checked').value;
                    const option = document.querySelector('input[name="elec-reading-option"]:checked').value;
                    
                    let meterLabel = "";
                    let indexLabel = "";
                    if (meterType === 'linky') {
                        meterLabel = "un compteur Linky non-communicant";
                        indexLabel = option === 'base' 
                            ? "votre index Base ainsi que vos index de programmation locale (HPH, HPB, HCH et HCB)"
                            : "vos index Heures Pleines / Heures Creuses ainsi que vos index de programmation locale (HPH, HPB, HCH et HCB)";
                    } else {
                        meterLabel = "un ancien compteur (mécanique ou électronique)";
                        indexLabel = option === 'base'
                            ? "votre index de consommation Base"
                            : "vos index de consommation Heures Pleines et Heures Creuses";
                    }

                    if (indexProvided) {
                        const readingPhrase = getElecReadingPhrase();
                        emailBody = `J'ai bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}), ainsi que votre relève de compteur électrique ${readingPhrase}.\n\nCependant, je constate que vous n'avez pas indiqué les dates auxquelles vous souhaitez que ces résiliations prennent effet.\n\nPourriez-vous me préciser la date à laquelle vous souhaitez que ces résiliations prennent effet (en indiquant si vous souhaitez la même date pour les deux contrats ou des dates distinctes) ?\n- Si la date de résiliation de l'électricité souhaitée est dans le futur, je vous informe que je ne peux pas prendre en compte la relève que vous m'avez transmise aujourd'hui car votre consommation évoluera d'ici là. Il vous faudra donc me communiquer une nouvelle relève le jour même de votre départ, car je ne peux pas résilier sans relève.\n- Si celle-ci doit intervenir immédiatement, j'utiliserai la relève que vous venez de me transmettre pour finaliser votre demande.\n\nDans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                    } else {
                        emailBody = `J'ai bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nCependant, je constate d'une part que vous n'avez pas indiqué les dates auxquelles vous souhaitez que ces résiliations prennent effet, et d'autre part que la relève de votre compteur d'électricité est manquante. Votre compteur d'électricité étant ${meterLabel}, je vous informe qu'il n'est pas possible de procéder à la résiliation de ce contrat sans la transmission de votre relève (soit ${indexLabel}).\n\nPourriez-vous me préciser la date à laquelle vous souhaitez que ces résiliations prennent effet (en indiquant si vous souhaitez la même date pour les deux contrats ou des dates distinctes) ?\n- Si la date de résiliation de l'électricité souhaitée est dans le futur, il vous faudra impérativement me transmettre votre relève le jour même où vous quittez le logement afin que je puisse finaliser la résiliation.\n- Si celle-ci doit intervenir immédiatement, merci de me transmettre votre relève dès aujourd'hui.\n\nDans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                    }
                } else {
                    emailBody = `J'ai bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nCependant, vous n'avez pas mentionné la date de résiliation souhaitée pour vos contrats.\n\nPourriez-vous me préciser la date à laquelle vous souhaitez que ces résiliations prennent effet (en indiquant si vous souhaitez la même date pour les deux contrats ou des dates distinctes) ?\n\nDans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                }
                rulesAppliedText = "Les deux dates sont absentes. E-mail de demande de dates généré.";
                rulesStatusClass = 'status-warning';
            }
            else if (dateElecVal && !dateGazVal) {
                const reqElecDate = parseLocalDate(dateElecVal);
                reqElecDate.setHours(0, 0, 0, 0);

                let effElecDate;
                let elecExplanationText = '';
                if (isNonCommunicating) {
                    const readingPhrase = getElecReadingPhrase();
                    if (reqElecDate >= today) {
                        effElecDate = reqElecDate;
                        const dateStr = formatLongFrenchDate(reqElecDate);
                        const isElecToday = reqElecDate.getTime() === today.getTime();
                        if (isElecToday) {
                            if (indexProvided) {
                                elecExplanationText = `La résiliation sera effective ce jour, le ${dateStr}, ${readingPhrase}.`;
                            } else {
                                const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                                elecExplanationText = `La résiliation sera effective ce jour, le ${dateStr}, ${reqPhrase}.`;
                            }
                        } else {
                            const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                            let readingNotice = '';
                            if (indexProvided) {
                                readingNotice = `\n- L'index de consommation transmis aujourd'hui ne pouvant être enregistré par anticipation (votre consommation étant amenée à évoluer d'ici la date effective de résiliation), je vous invite à me communiquer une nouvelle relève à cette date`;
                            }
                            elecExplanationText = `Votre compteur étant non communicant, la résiliation sera effective le jour même de votre demande, soit le ${dateStr}, ${reqPhrase}.${readingNotice}`;
                        }
                    } else {
                        effElecDate = today;
                        const todayStr = formatLongFrenchDate(today);
                        if (indexProvided) {
                            elecExplanationText = `La résiliation sera effective en date d'aujourd'hui, soit le ${todayStr} (la date demandée étant dans le passé), ${readingPhrase}.`;
                        } else {
                            const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                            elecExplanationText = `La résiliation sera effective en date d'aujourd'hui, soit le ${todayStr} (la date demandée étant dans le passé), ${reqPhrase}.`;
                        }
                    }
                } else {
                    if (reqElecDate >= today) {
                        effElecDate = reqElecDate;
                        const dateStr = formatLongFrenchDate(reqElecDate);
                        const datePhrase = (reqElecDate.getTime() === today.getTime()) ? `ce jour, le ${dateStr}` : `le ${dateStr}`;
                        elecExplanationText = `La résiliation sera effective ${datePhrase}.`;
                    } else {
                        effElecDate = today;
                        elecExplanationText = `La résiliation sera effective en date d'aujourd'hui, soit le ${formatLongFrenchDate(today)} (la date demandée étant dans le passé).`;
                    }
                }

                const effElecDateStr = formatLongFrenchDate(effElecDate);

                const isRequestedBizDayForGaz = isBusinessDay(effElecDate);
                const isEffElecToday = effElecDate.getTime() === today.getTime();

                let proposedGazPhrase = '';
                if (isEffElecToday) {
                    const nextBizStr = formatLongFrenchDate(nextBusinessDay);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                    const nextBizPhrase = isTomorrow ? `soit demain, le ${nextBizStr}` : `soit le ${nextBizStr}`;
                    const reasonStr = getGazPostponementReason(today, nextBusinessDay);

                    proposedGazPhrase = `Si votre souhait est également de le résilier à la même date, la résiliation du contrat de gaz ne pouvant pas s'effectuer ${reasonStr}, celle-ci prendra effet le prochain jour ouvré, ${nextBizPhrase}.`;
                } else if (!isRequestedBizDayForGaz) {
                    const proposedGazDate = getClosestBusinessDay(effElecDate);
                    const proposedGazDateStr = formatLongFrenchDate(proposedGazDate);
                    const dayOfWeek = effElecDate.getDay();
                    const reasons = {
                        6: 'samedi',
                        0: 'dimanche'
                    };
                    const reasonStr = reasons[dayOfWeek] || 'jour férié';
                    proposedGazPhrase = `Si votre souhait est également de le résilier à la même date, la résiliation du contrat de gaz ne pouvant pas s'effectuer un ${reasonStr}, celle-ci prendra effet le prochain jour ouvré, soit le ${proposedGazDateStr}.`;
                } else {
                    proposedGazPhrase = `Souhaitez-vous que la résiliation de votre contrat de gaz soit également effectuée à cette même date (${effElecDateStr}) ?`;
                }

                emailSubject = "⚠️ Demande de confirmation - Date de résiliation de vos contrats d'électricité et de gaz";
                emailBody = `J'ai bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nPour votre contrat d'électricité : ${elecExplanationText} Votre facture de clôture d'électricité vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.\n\nCependant, la date souhaitée pour votre contrat de gaz n'a pas été précisée. ${proposedGazPhrase}\n\nDans l'attente de votre confirmation ou de vos instructions, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                rulesAppliedText = `Date électricité renseignée (${formatLongFrenchDate(reqElecDate)}), date gaz manquante. Confirmation pour l'électricité et demande de précision pour le gaz générées (post-report si week-end/aujourd'hui).`;
                rulesStatusClass = 'status-warning';
            }
            else if (!dateElecVal && dateGazVal) {
                const reqGazDate = parseLocalDate(dateGazVal);
                reqGazDate.setHours(0, 0, 0, 0);

                let effGazDate;
                let gazExplanationText = '';

                const isRdvNeeded = gazAppointmentNeeded && gazAppointmentNeeded.checked;
                const rdvDateVal = gazAppointmentDateInput.value;
                const rdvDate = rdvDateVal ? parseLocalDate(rdvDateVal) : null;

                if (isRdvNeeded) {
                    effGazDate = rdvDate || reqGazDate || today;
                    const rdvDateStr = rdvDate ? formatLongFrenchDate(rdvDate) : "[Date de RDV]";
                    const requestedDateStr = reqGazDate ? formatLongFrenchDate(reqGazDate) : "";
                    const insteadOfPhrase = (requestedDateStr && requestedDateStr !== rdvDateStr) ? `, au lieu du ${requestedDateStr} comme demandé` : '';
                    gazExplanationText = `La résiliation sera effective le ${rdvDateStr}${insteadOfPhrase}. En effet, GRDF, le gestionnaire du réseau gaz, a demandé un rendez-vous physique pour procéder à cette mise hors service (résiliation). Il peut arriver que GRDF demande votre présence pour cela au lieu de faire une résiliation à distance.`;
                } else {
                    if (reqGazDate > today) {
                        if (isBusinessDay(reqGazDate)) {
                            effGazDate = reqGazDate;
                            gazExplanationText = `La résiliation sera effective le ${formatLongFrenchDate(reqGazDate)}.`;
                        } else {
                            effGazDate = getClosestBusinessDay(reqGazDate);
                            const phrase = getFutureGazBulletPostponementPhrase(reqGazDate, effGazDate);
                            gazExplanationText = phrase.charAt(0).toUpperCase() + phrase.slice(1);
                        }
                    } else {
                        effGazDate = nextBusinessDay;
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                        const nextBizPhrase = isTomorrow ? `soit demain, le ${formatLongFrenchDate(nextBusinessDay)}` : `soit le ${formatLongFrenchDate(nextBusinessDay)}`;

                        if (reqGazDate.getTime() === today.getTime()) {
                            const reasonStr = getGazPostponementReason(today, nextBusinessDay);
                            gazExplanationText = `La résiliation ne pouvant pas s'effectuer ${reasonStr}, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}.`;
                        } else {
                            gazExplanationText = `La date demandée étant dans le passé, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}.`;
                        }
                    }
                }

                const effGazDateStr = formatLongFrenchDate(effGazDate);

                const proposedElecDate = (effGazDate >= today) ? effGazDate : today;
                const proposedElecDateStr = formatLongFrenchDate(proposedElecDate);

                let proposedElecPhrase = '';
                if (effGazDate.getTime() === proposedElecDate.getTime()) {
                    proposedElecPhrase = `Souhaitez-vous que la résiliation de votre contrat d'électricité soit également effectuée à cette même date (${effGazDateStr}) ?`;
                } else if (effGazDate.getTime() === today.getTime() || effGazDate < today) {
                    proposedElecPhrase = `Souhaitez-vous que la résiliation de votre contrat d'électricité soit également effectuée à la date du jour (${proposedElecDateStr}) ?`;
                } else {
                    proposedElecPhrase = `Souhaitez-vous que la résiliation de votre contrat d'électricité soit également effectuée à la date initialement souhaitée (${proposedElecDateStr}) ?`;
                }

                if (isNonCommunicating) {
                    const meterType = document.querySelector('input[name="elec-meter-type"]:checked').value;
                    const option = document.querySelector('input[name="elec-reading-option"]:checked').value;
                    
                    let meterLabel = "";
                    let indexLabel = "";
                    if (meterType === 'linky') {
                        meterLabel = "un compteur Linky non-communicant";
                        indexLabel = option === 'base' 
                            ? "votre index Base ainsi que vos index de programmation locale (HPH, HPB, HCH et HCB)"
                            : "vos index Heures Pleines / Heures Creuses ainsi que vos index de programmation locale (HPH, HPB, HCH et HCB)";
                    } else {
                        meterLabel = "un ancien compteur (mécanique ou électronique)";
                        indexLabel = option === 'base'
                            ? "votre index de consommation Base"
                            : "vos index de consommation Heures Pleines et Heures Creuses";
                    }

                    if (indexProvided) {
                        const readingPhrase = getElecReadingPhrase();
                        proposedElecPhrase += ` De plus, je vous confirme la bonne réception de votre relève de compteur électrique ${readingPhrase}. Cependant, n'ayant pas de date précise pour ce contrat :\n- Si la date de résiliation de l'électricité souhaitée est dans le futur, je vous informe que je ne peux pas prendre en compte la relève que vous m'avez transmise aujourd'hui car votre consommation évoluera d'ici là. Il vous faudra donc me communiquer une nouvelle relève le jour même de votre départ, car je ne peux pas résilier sans relève.\n- Si celle-ci doit intervenir immédiatement, j'utiliserai la relève que vous venez de me transmettre pour finaliser votre demande.`;
                    } else {
                        proposedElecPhrase += ` De plus, votre compteur électrique étant ${meterLabel}, je vous informe qu'il n'est pas possible de procéder à la résiliation de ce contrat sans la transmission de votre relève (soit ${indexLabel}).\n- Si la date de résiliation de l'électricité souhaitée est dans le futur, il vous faudra impérativement me transmettre votre relève le jour même où vous quittez le logement afin que je puisse finaliser la résiliation.\n- Si celle-ci doit intervenir immédiatement, merci de me transmettre votre relève dès aujourd'hui.`;
                    }
                }

                let gazDetailParagraph = `Pour votre contrat de gaz : ${gazExplanationText} Votre facture de clôture de gaz vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                let subjectTag = "";
                if (isRdvNeeded) {
                    const rdvTimeStr = (gazAppointmentTimeInput.value === 'custom'
                        ? gazAppointmentTimeCustomInput.value.trim()
                        : gazAppointmentTimeInput.value.trim()) || "[Plage horaire]";
                    const appointmentPhrase = `Ce rendez-vous est programmé sur la plage horaire : ${rdvTimeStr}. Si cette date ne vous convient pas, je vous invite à la modifier directement depuis le SMS envoyé par GRDF ou à les appeler directement pour faire le point au numéro suivant afin d'en savoir plus et pour déplacer le rendez-vous si nécessaire : 09 69 36 35 34.\nVous devez impérativement être présent ou vous faire représenter. Le jour de l'intervention, je vous demande de répondre à tous vos appels, car les techniciens appellent généralement en numéro masqué ou avec un numéro commençant par 09. Si vous ne répondez pas, ils ne se déplaceront pas, la résiliation ne pourra pas être effectuée et un déplacement vain risquera de vous être facturé.`;
                    
                    gazDetailParagraph = `Pour votre contrat de gaz : ${gazExplanationText}\n\n${appointmentPhrase}\n\nVotre facture de clôture de gaz vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                    isAppointmentAlreadyInjected = true;
                    subjectTag = "Rendez-vous obligatoire - ";
                }

                emailSubject = `⚠️ ${subjectTag}Demande de confirmation - Date de résiliation de vos contrats d'électricité et de gaz`;
                emailBody = `J'ai bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\n${gazDetailParagraph}\n\nCependant, la date souhaitée pour votre contrat d'électricité n'a pas été précisée. ${proposedElecPhrase}\n\nDans l'attente de votre confirmation ou de vos instructions, je reste à votre entière disposition pour tout renseignement complémentaire.`;
                rulesAppliedText = `Date gaz renseignée (${formatLongFrenchDate(reqGazDate)}), date électricité manquante. Confirmation pour le gaz et demande de précision pour l'électricité générées.`;
                rulesStatusClass = 'status-warning';
            }
            else {
                // Both dates are filled
                if (dateElecVal === dateGazVal) {
                    const requestedDate = parseLocalDate(dateElecVal);
                    requestedDate.setHours(0, 0, 0, 0);
                    const isPast = requestedDate < today;
                    const isToday = requestedDate.getTime() === today.getTime();
                    const isFuture = requestedDate > today;

                    emailSubject = "Confirmation de la résiliation de vos contrats d'électricité et de gaz";

                    const isRdvNeeded = gazAppointmentNeeded && gazAppointmentNeeded.checked;
                    const rdvDateVal = gazAppointmentDateInput.value;
                    const rdvDate = rdvDateVal ? parseLocalDate(rdvDateVal) : null;

                    if (isRdvNeeded) {
                        effElecDate = (isPast) ? today : requestedDate;
                        effGazDate = rdvDate || requestedDate || today;
                        const dateElecStr = formatLongFrenchDate(effElecDate);
                        const rdvDateStr = rdvDate ? formatLongFrenchDate(rdvDate) : "[Date de RDV]";
                        
                        rulesAppliedText = `Rendez-vous GRDF nécessaire. Élec effective le ${dateElecStr}. Gaz effective à la date du rendez-vous (${rdvDateStr}).`;
                        rulesStatusClass = 'status-warning';

                        let elecReadingClause = '';
                        if (isNonCommunicating) {
                            const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                            let readingNotice = '';
                            if (indexProvided) {
                                readingNotice = `\n- L'index de consommation transmis aujourd'hui ne pouvant être enregistré par anticipation (votre consommation étant amenée à évoluer d'ici la date effective de résiliation), je vous invite à me communiquer une nouvelle relève à cette date`;
                            }
                            
                            if (isToday || isPast) {
                                const readingText = indexProvided ? getElecReadingPhrase() : getElecReadingRequestPhrase('subjunctive', "à cette date. 🚨 URGENT : je ne peux pas résilier aujourd'hui sans relève, merci de la communiquer au plus vite");
                                elecReadingClause = `, ${readingText}`;
                                if (!indexProvided) {
                                    emailSubject = "🚨 Action requise : Résiliation élec impossible sans votre relève - Contrats d'électricité et de gaz";
                                }
                            } else {
                                elecReadingClause = `, ${reqPhrase}.${readingNotice}`;
                            }
                        }

                        const requestedDateStr = requestedDate ? formatLongFrenchDate(requestedDate) : "";
                        const insteadOfPhrase = (requestedDateStr && requestedDateStr !== rdvDateStr) ? `, au lieu du ${requestedDateStr} comme demandé` : '';

                        emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation sera effective le ${dateElecStr}${elecReadingClause}.\n- Pour votre contrat de gaz : la résiliation sera effective le ${rdvDateStr}${insteadOfPhrase}. En effet, GRDF, le gestionnaire du réseau gaz, a demandé un rendez-vous physique pour procéder à cette mise hors service (résiliation). Il peut arriver que GRDF demande votre présence pour cela au lieu d'effectuer une résiliation à distance.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                    } else {
                        if (isFuture) {
                            const isRequestedBizDay = isBusinessDay(requestedDate);
                            if (isRequestedBizDay) {
                                const dateStr = formatLongFrenchDate(requestedDate);
                                if (isNonCommunicating) {
                                    const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                                    rulesAppliedText = `Date future (${formatLongFrenchDate(requestedDate)}). Élec (sous réserve de relève de compteur non communicant) & Gaz seront résiliés à cette date.`;
                                    rulesStatusClass = 'status-warning';

                                    let readingNotice = '';
                                    if (indexProvided) {
                                        readingNotice = `\n- L'index de consommation transmis aujourd'hui ne pouvant être enregistré par anticipation (votre consommation étant amenée à évoluer d'ici la date effective de résiliation), je vous invite à me communiquer une nouvelle relève à cette date`;
                                    }

                                    emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : votre compteur étant non communicant, la résiliation sera effective le jour même de votre demande, soit le ${dateStr}, ${reqPhrase}.${readingNotice}\n- Pour votre contrat de gaz : la résiliation sera effective le ${dateStr}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                                } else {
                                    rulesAppliedText = `Date future (${formatLongFrenchDate(requestedDate)}). Les deux contrats (Élec & Gaz) seront résiliés à cette date.`;
                                    rulesStatusClass = 'status-success';

                                    emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nCes résiliations seront effectives le ${dateStr}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                                }
                            } else {
                                const effectiveDate = getClosestBusinessDay(requestedDate);
                                const effectiveDateStr = formatLongFrenchDate(effectiveDate);
                                const requestedDateStr = formatLongFrenchDate(requestedDate);

                                const dayOfWeekStr = requestedDate.getDay() === 6 ? 'samedi' : requestedDate.getDay() === 0 ? 'dimanche' : 'jour férié';
                                const bulletPhrase = getFutureGazBulletPostponementPhrase(requestedDate, effectiveDate);

                                if (isNonCommunicating) {
                                    const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                                    rulesAppliedText = `Date future (${requestedDateStr}) tombant un ${dayOfWeekStr}. Élec résilié le jour demandé (compteur non communicant sous réserve de relève). Gaz reporté au prochain jour ouvré (${effectiveDateStr}).`;
                                    rulesStatusClass = 'status-warning';

                                    let readingNotice = '';
                                    if (indexProvided) {
                                        readingNotice = `\n- L'index de consommation transmis aujourd'hui ne pouvant être enregistré par anticipation (votre consommation étant amenée à évoluer d'ici la date effective de résiliation), je vous invite à me communiquer une nouvelle relève à cette date`;
                                    }

                                    emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : votre compteur étant non communicant, la résiliation sera effective le jour même de votre demande, soit le ${requestedDateStr}, ${reqPhrase}.${readingNotice}\n- Pour votre contrat de gaz : ${bulletPhrase}\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                                } else {
                                    rulesAppliedText = `Date future (${requestedDateStr}) tombant un ${dayOfWeekStr}. Élec résilié à cette date. Gaz reporté au prochain jour ouvré (${effectiveDateStr}).`;
                                    rulesStatusClass = 'status-warning';

                                    emailBody = `Je vous confirme la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation sera effective le ${requestedDateStr}.\n- Pour votre contrat de gaz : ${bulletPhrase}\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                                }
                            }
                        } else if (isPast) {
                            const todayStr = formatLongFrenchDate(today);
                            const nextBizStr = formatLongFrenchDate(nextBusinessDay);

                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(0, 0, 0, 0);
                            const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                            const gazEffectivePhrase = isTomorrow ? `le prochain jour ouvré, soit demain, le ${nextBizStr}` : `le prochain jour ouvré, soit le ${nextBizStr}`;

                            if (isNonCommunicating) {
                                rulesAppliedText = `Date passée (${formatLongFrenchDate(requestedDate)}). Élec résilié ce jour (${todayStr}) (compteur non communicant). Gaz décalé ${gazEffectivePhrase}.`;
                                rulesStatusClass = 'status-warning';

                                if (!indexProvided) {
                                    emailSubject = "🚨 Action requise : Résiliation élec impossible sans votre relève - Contrats d'électricité et de gaz";
                                }
                                const readingText = indexProvided ? getElecReadingPhrase() : getElecReadingRequestPhrase('subjunctive', "à cette date. 🚨 URGENT : je ne peux pas résilier aujourd'hui sans relève, merci de la communiquer au plus vite");

                                emailBody = `Je vous confirme la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLa date de résiliation demandée étant dans le passé, je vous informe qu'il n'est pas possible de résilier un contrat de manière rétroactive.\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : votre compteur étant non communicant, la résiliation de votre contrat d'électricité est effective le jour d'aujourd'hui, soit le ${todayStr}, ${readingText}.\n- Pour votre contrat de gaz : la résiliation de votre contrat de gaz sera effective ${gazEffectivePhrase}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                            } else {
                                rulesAppliedText = `Date demandée dans le passé (${formatLongFrenchDate(requestedDate)}). Élec résilié le jour d'aujourd’hui (${todayStr}). Gaz décalé ${gazEffectivePhrase}.`;
                                rulesStatusClass = 'status-warning';

                                emailBody = `Je vous confirme la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLa date de résiliation demandée étant dans le passé, je vous informe qu'il n'est pas possible de résilier un contrat de manière rétroactive.\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation de votre contrat d'électricité est effective le jour d'aujourd'hui, soit le ${todayStr}.\n- Pour votre contrat de gaz : la résiliation de votre contrat de gaz sera effective ${gazEffectivePhrase}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                            }
                        } else {
                            // Requested is today
                            const todayStr = formatLongFrenchDate(today);
                            const nextBizStr = formatLongFrenchDate(nextBusinessDay);

                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(0, 0, 0, 0);
                            const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                            const nextBizPhrase = isTomorrow ? `soit demain, le ${nextBizStr}` : `soit le ${nextBizStr}`;
                            const reasonStr = getGazPostponementReason(today, nextBusinessDay);

                            if (isNonCommunicating) {
                                rulesAppliedText = `Date demandée aujourd'hui (${formatLongFrenchDate(requestedDate)}). Élec résilié aujourd'hui (${todayStr}) (compteur non communicant). Gaz décalé au prochain jour ouvré (${nextBizStr}).`;
                                rulesStatusClass = 'status-warning';

                                if (!indexProvided) {
                                    emailSubject = "🚨 Action requise : Résiliation élec impossible sans votre relève - Contrats d'électricité et de gaz";
                                }
                                const readingText = indexProvided ? getElecReadingPhrase() : getElecReadingRequestPhrase('subjunctive', "à cette date. 🚨 URGENT : je ne peux pas résilier aujourd'hui sans relève, merci de la communiquer au plus vite");

                                emailBody = `Je vous confirme la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation de votre contrat d'électricité est effective aujourd'hui, soit le ${todayStr}, ${readingText}.\n- Pour votre contrat de gaz : la résiliation de votre contrat de gaz ne pouvant pas s'effectuer ${reasonStr}, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                            } else {
                                rulesAppliedText = `Date demandée aujourd'hui (${formatLongFrenchDate(requestedDate)}). Élec résilié aujourd'hui (${todayStr}). Gaz décalé au prochain jour ouvré (${nextBizStr}).`;
                                rulesStatusClass = 'status-warning';

                                emailBody = `Je vous confirme la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation de votre contrat d'électricité est effective aujourd'hui, soit le ${todayStr}.\n- Pour votre contrat de gaz : la résiliation de votre contrat de gaz ne pouvant pas s'effectuer ${reasonStr}, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
                            }
                        }
                    }
                } else {
                    // Distinct filled dates
                    const reqElecDate = parseLocalDate(dateElecVal);
                    reqElecDate.setHours(0, 0, 0, 0);
                    const reqGazDate = parseLocalDate(dateGazVal);
                    reqGazDate.setHours(0, 0, 0, 0);

                    // Evaluate electricity date
                    let effElecDate;
                    let elecExplanationText = '';
                    if (isNonCommunicating) {
                        const readingPhrase = getElecReadingPhrase();
                        if (reqElecDate >= today) {
                            effElecDate = reqElecDate;
                            const dateStr = formatLongFrenchDate(reqElecDate);
                            const isElecToday = reqElecDate.getTime() === today.getTime();
                            if (isElecToday) {
                                if (indexProvided) {
                                    elecExplanationText = `la résiliation de votre contrat d'électricité sera effective ce jour, le ${dateStr}, ${readingPhrase}`;
                                } else {
                                    emailSubject = "🚨 Action requise : Résiliation élec impossible sans votre relève - Contrats d'électricité et de gaz";
                                    const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date. 🚨 URGENT : je ne peux pas résilier aujourd'hui sans relève, merci de la communiquer au plus vite");
                                    elecExplanationText = `la résiliation de votre contrat d'électricité sera effective ce jour, le ${dateStr}, ${reqPhrase}`;
                                }
                            } else {
                                const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date");
                                let readingNotice = '';
                                if (indexProvided) {
                                    readingNotice = `\n- L'index de consommation transmis aujourd'hui ne pouvant être enregistré par anticipation (votre consommation étant amenée à évoluer d'ici la date effective de résiliation), je vous invite à me communiquer une nouvelle relève à cette date`;
                                }
                                elecExplanationText = `votre compteur étant non communicant, la résiliation de votre contrat d'électricité sera effective le jour même de votre demande, soit le ${dateStr}, ${reqPhrase}.${readingNotice}`;
                            }
                        } else {
                            effElecDate = today;
                            const todayStr = formatLongFrenchDate(today);
                            if (indexProvided) {
                                elecExplanationText = `la résiliation de votre contrat d'électricité sera effective en date d'aujourd'hui, soit le ${todayStr} (la date demandée étant dans le passé), ${readingPhrase}`;
                            } else {
                                emailSubject = "🚨 Action requise : Résiliation élec impossible sans votre relève - Contrats d'électricité et de gaz";
                                const reqPhrase = getElecReadingRequestPhrase('subjunctive', "à cette date. 🚨 URGENT : je ne peux pas résilier aujourd'hui sans relève, merci de la communiquer au plus vite");
                                elecExplanationText = `la résiliation de votre contrat d'électricité sera effective en date d'aujourd'hui, soit le ${todayStr} (la date demandée étant dans le passé), ${reqPhrase}`;
                            }
                        }
                    } else {
                        if (reqElecDate >= today) {
                            effElecDate = reqElecDate;
                            const dateStr = formatLongFrenchDate(reqElecDate);
                            const datePhrase = (reqElecDate.getTime() === today.getTime()) ? `ce jour, le ${dateStr}` : `le ${dateStr}`;
                            elecExplanationText = `la résiliation sera effective ${datePhrase}`;
                        } else {
                            effElecDate = today;
                            elecExplanationText = `la résiliation sera effective en date d'aujourd'hui, soit le ${formatLongFrenchDate(today)} (la date demandée étant dans le passé)`;
                        }
                    }

                    // Evaluate gas date
                    let effGazDate;
                    let gazExplanationText = '';

                    const isRdvNeeded = gazAppointmentNeeded && gazAppointmentNeeded.checked;
                    const rdvDateVal = gazAppointmentDateInput.value;
                    const rdvDate = rdvDateVal ? parseLocalDate(rdvDateVal) : null;

                    if (isRdvNeeded) {
                        effGazDate = rdvDate || reqGazDate || today;
                        const rdvDateStr = rdvDate ? formatLongFrenchDate(rdvDate) : "[Date de RDV]";
                        const requestedDateStr = reqGazDate ? formatLongFrenchDate(reqGazDate) : "";
                        const insteadOfPhrase = (requestedDateStr && requestedDateStr !== rdvDateStr) ? `, au lieu du ${requestedDateStr} comme demandé` : '';
                        gazExplanationText = `la résiliation sera effective le ${rdvDateStr}${insteadOfPhrase}. En effet, GRDF, le gestionnaire du réseau gaz, a demandé un rendez-vous physique pour procéder à cette mise hors service (résiliation). Il peut arriver que GRDF demande votre présence pour cela au lieu d'effectuer une résiliation à distance`;
                    } else {
                        if (reqGazDate > today) {
                            if (isBusinessDay(reqGazDate)) {
                                effGazDate = reqGazDate;
                                gazExplanationText = `la résiliation sera effective le ${formatLongFrenchDate(reqGazDate)}`;
                            } else {
                                effGazDate = getClosestBusinessDay(reqGazDate);
                                const explanation = getFutureGazPostponementPhrase(reqGazDate, effGazDate);
                                gazExplanationText = explanation.charAt(0).toLowerCase() + explanation.slice(1);
                            }
                        } else {
                            effGazDate = nextBusinessDay;
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            tomorrow.setHours(0, 0, 0, 0);
                            const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                            const nextBizPhrase = isTomorrow ? `soit demain, le ${formatLongFrenchDate(nextBusinessDay)}` : `soit le ${formatLongFrenchDate(nextBusinessDay)}`;

                            if (reqGazDate.getTime() === today.getTime()) {
                                const reasonStr = getGazPostponementReason(today, nextBusinessDay);
                                gazExplanationText = `la résiliation ne pouvant pas s'effectuer ${reasonStr}, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}`;
                            } else {
                                gazExplanationText = `la date demandée étant dans le passé, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}`;
                            }
                        }
                    }

                    emailSubject = "Confirmation de la résiliation de vos contrats d'électricité et de gaz";
                    emailBody = `Je vous confirme la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : ${elecExplanationText}.\n- Pour votre contrat de gaz : ${gazExplanationText}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;

                    rulesAppliedText = `Deux dates distinctes. Élec effective le ${formatLongFrenchDate(effElecDate)}. Gaz effective le ${formatLongFrenchDate(effGazDate)}.`;
                    rulesStatusClass = 'status-warning';
                }
            }
        }

        // Inject Gaz Appointment details if needed
        if (gazAppointmentNeeded && gazAppointmentNeeded.checked && !isAppointmentAlreadyInjected) {
            // Update Subject with RDV Alert
            if (emailSubject.startsWith("⚠️")) {
                emailSubject = "⚠️ Rendez-vous obligatoire - " + emailSubject.substring(2);
            } else {
                emailSubject = "⚠️ Rendez-vous obligatoire - " + emailSubject;
            }

            const rdvTimeStr = (gazAppointmentTimeInput.value === 'custom'
                ? gazAppointmentTimeCustomInput.value.trim()
                : gazAppointmentTimeInput.value.trim()) || "[Plage horaire]";
            
            const appointmentPhrase = `Ce rendez-vous est programmé sur la plage horaire : ${rdvTimeStr}. Si cette date ne vous convient pas, je vous invite à la modifier directement depuis le SMS envoyé par GRDF ou à les appeler directement pour faire le point au numéro suivant afin d'en savoir plus et pour déplacer le rendez-vous si nécessaire : 09 69 36 35 34.\nVous devez impérativement être présent ou vous faire représenter. Le jour de l'intervention, je vous demande de répondre à tous vos appels, car les techniciens appellent généralement en numéro masqué ou avec un numéro commençant par 09. Si vous ne répondez pas, ils ne se déplaceront pas, la résiliation ne pourra pas être effectuée et un déplacement vain risquera de vous être facturé.`;

            const billPhrases = [
                "Vos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.",
                "Vos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations.",
                "Votre facture de clôture de gaz vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.",
                "Votre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation."
            ];

            let detectedBillPhrase = "";
            for (const phrase of billPhrases) {
                if (emailBody.includes(phrase)) {
                    detectedBillPhrase = phrase;
                    break;
                }
            }

            const closingSentences = [
                "Dans l'attente de votre confirmation ou de vos instructions, je reste à votre entière disposition pour tout renseignement complémentaire.",
                "Dans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire.",
                "Je reste à votre entière disposition pour tout renseignement complémentaire."
            ];

            let searchPhrase = "";
            for (const phrase of closingSentences) {
                if (emailBody.includes(phrase)) {
                    searchPhrase = phrase;
                    break;
                }
            }

            if (searchPhrase) {
                if (detectedBillPhrase) {
                    const targetText = `\n\n${detectedBillPhrase}\n\n${searchPhrase}`;
                    const replacementText = `\n\n${appointmentPhrase}\n\n${detectedBillPhrase}\n\n${searchPhrase}`;
                    if (emailBody.includes(targetText)) {
                        emailBody = emailBody.replace(targetText, replacementText);
                    } else {
                        emailBody = emailBody.replace(detectedBillPhrase, "");
                        emailBody = emailBody.replace(/\n\n\n/g, "\n\n");
                        emailBody = emailBody.replace(searchPhrase, `${appointmentPhrase}\n\n${detectedBillPhrase}\n\n${searchPhrase}`);
                    }
                } else {
                    emailBody = emailBody.replace(searchPhrase, `${appointmentPhrase}\n\n${searchPhrase}`);
                }
            }
        }

        // Update closing sentence if waiting for electric reading urgently
        if (isNonCommunicating && !indexProvided) {
            let isPastOrToday = false;
            if (energyType === 'elec') {
                const dateVal = cancelDateElecInput.value;
                if (dateVal) {
                    const requestedDate = parseLocalDate(dateVal);
                    requestedDate.setHours(0, 0, 0, 0);
                    if (requestedDate <= today) {
                        isPastOrToday = true;
                    }
                }
            } else if (energyType === 'both') {
                const dateElecVal = cancelDateBothInput.value || cancelDateElecInput.value;
                if (dateElecVal) {
                    const requestedDate = parseLocalDate(dateElecVal);
                    requestedDate.setHours(0, 0, 0, 0);
                    if (requestedDate <= today) {
                        isPastOrToday = true;
                    }
                }
            }
            if (isPastOrToday) {
                emailBody = emailBody.replace(
                    "Je reste à votre entière disposition pour tout renseignement complémentaire.",
                    "Dans l'attente de votre retour, je reste à votre entière disposition pour tout renseignement complémentaire."
                );
            }
        }

        // Update subject and body if waiting for a future electric reading
        if (isNonCommunicating) {
            let isFuture = false;
            if (energyType === 'elec') {
                const dateVal = cancelDateElecInput.value;
                if (dateVal) {
                    const requestedDate = parseLocalDate(dateVal);
                    requestedDate.setHours(0, 0, 0, 0);
                    if (requestedDate > today) {
                        isFuture = true;
                    }
                }
            } else if (energyType === 'both') {
                const dateElecVal = cancelDateBothInput.value || cancelDateElecInput.value;
                if (dateElecVal) {
                    const requestedDate = parseLocalDate(dateElecVal);
                    requestedDate.setHours(0, 0, 0, 0);
                    if (requestedDate > today) {
                        isFuture = true;
                    }
                }
            }

            if (isFuture) {
                // Update Subject
                if (energyType === 'elec') {
                    emailSubject = "⚠️ Action requise : Relève de compteur à fournir - Contrat d'électricité";
                } else if (energyType === 'both') {
                    emailSubject = "⚠️ Action requise : Relève de compteur à fournir - Vos contrats d'électricité et de gaz";
                }

                // Update Body introduction
                emailBody = emailBody.replace(
                    `Je vous confirme la prise en compte de votre demande de résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).`,
                    `J'ai bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}).`
                );
                emailBody = emailBody.replace(
                    `Je vous confirme la prise en compte de la résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).`,
                    `J'ai bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}).`
                );
                emailBody = emailBody.replace(
                    `Je vous confirme la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).`,
                    `J'ai bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).`
                );
                emailBody = emailBody.replace(
                    `Je vous confirme la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).`,
                    `J'ai bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).`
                );

                // Remove Invoice sentences
                emailBody = emailBody.replace(
                    "\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.",
                    ""
                );
                emailBody = emailBody.replace(
                    "\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.",
                    ""
                );
                emailBody = emailBody.replace(
                    "\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations.",
                    ""
                );
            }
        }

        // 3. Update Preview UI
        emailSubjectInput.value = emailSubject;
        emailBodyInput.value = emailBody;

        // Update rules feedback banner
        rulesTitle.textContent = energyType === 'both' ? 'Règles appliquées (Élec + Gaz)' :
            energyType === 'elec' ? 'Règles appliquées (Électricité)' : 'Règles appliquées (Gaz)';
        rulesDescription.textContent = rulesAppliedText;
        rulesBanner.className = `rules-feedback card ${rulesStatusClass}`;
    }

    function updateReadingFieldsVisibility() {
        const meterTypeRadio = document.querySelector('input[name="elec-meter-type"]:checked');
        const meterType = meterTypeRadio ? meterTypeRadio.value : 'linky';
        const optionRadio = document.querySelector('input[name="elec-reading-option"]:checked');
        const option = optionRadio ? optionRadio.value : 'base';

        const showBase = (option === 'base');
        const showHp = (option === 'hphc');
        const showHc = (option === 'hphc');
        const showLinkySub = (meterType === 'linky');

        if (showBase) {
            wrapperReadingBase.classList.remove('hide');
        } else {
            wrapperReadingBase.classList.add('hide');
            readingBaseVal.value = '';
        }

        if (showHp) {
            wrapperReadingHp.classList.remove('hide');
        } else {
            wrapperReadingHp.classList.add('hide');
            readingHpVal.value = '';
        }
        if (showHc) {
            wrapperReadingHc.classList.remove('hide');
        } else {
            wrapperReadingHc.classList.add('hide');
            readingHcVal.value = '';
        }

        if (showLinkySub) {
            wrapperReadingHph.classList.remove('hide');
            wrapperReadingHpb.classList.remove('hide');
            wrapperReadingHch.classList.remove('hide');
            wrapperReadingHcb.classList.remove('hide');
        } else {
            wrapperReadingHph.classList.add('hide');
            wrapperReadingHpb.classList.add('hide');
            wrapperReadingHch.classList.add('hide');
            wrapperReadingHcb.classList.add('hide');

            readingHphVal.value = '';
            readingHpbVal.value = '';
            readingHchVal.value = '';
            readingHcbVal.value = '';
        }
    }

    // Update form visibility based on selected contract types
    function updateContractInputVisibility() {
        const energyType = document.querySelector('input[name="energy-type"]:checked').value;
        const keepActive = keepActiveOther.checked;

        if (energyType === 'elec') {
            groupKeepActive.classList.remove('hide');
            keepActiveLabel.textContent = "Le client demande la résiliation de son contrat d'électricité, mais détient à la même adresse un contrat de gaz pour lequel il n'a pas demandé de résiliation.";
            groupContractElec.classList.remove('hide');
            groupDateElec.classList.remove('hide');
            groupDateGaz.classList.add('hide');
            if (keepActive) {
                groupContractGaz.classList.remove('hide');
            } else {
                groupContractGaz.classList.add('hide');
            }
            groupElecMeter.classList.remove('hide');

            // Hide Gaz appointment
            groupGazAppointment.classList.add('hide');
            gazAppointmentNeeded.checked = false;
            groupGazAppointmentDetails.classList.add('hide');
            gazAppointmentDatePicker.clear();
            gazAppointmentTimeInput.value = '';
            gazAppointmentTimeCustomInput.value = '';
            groupGazAppointmentTimeCustom.classList.add('hide');
        } else if (energyType === 'gaz') {
            groupKeepActive.classList.remove('hide');
            keepActiveLabel.textContent = "Le client demande la résiliation de son contrat de gaz, mais détient à la même adresse un contrat d'électricité pour lequel il n'a pas demandé de résiliation.";
            groupContractGaz.classList.remove('hide');
            groupDateGaz.classList.remove('hide');
            groupDateElec.classList.add('hide');
            if (keepActive) {
                groupContractElec.classList.remove('hide');
            } else {
                groupContractElec.classList.add('hide');
            }
            groupElecMeter.classList.add('hide');
            meterNonCommunicating.checked = false;
            groupElecReading.classList.add('hide');
            elecReadingProvided.checked = false;
            groupElecReadingInputs.classList.add('hide');

            const defaultLinkyRadio = document.querySelector('input[name="elec-meter-type"][value="linky"]');
            if (defaultLinkyRadio) defaultLinkyRadio.checked = true;
            const defaultBaseRadio = document.querySelector('input[name="elec-reading-option"][value="base"]');
            if (defaultBaseRadio) defaultBaseRadio.checked = true;

            readingBaseVal.value = '';
            readingHpVal.value = '';
            readingHcVal.value = '';
            readingHphVal.value = '';
            readingHpbVal.value = '';
            readingHchVal.value = '';
            readingHcbVal.value = '';

            updateReadingFieldsVisibility();

            // Show Gaz appointment
            groupGazAppointment.classList.remove('hide');
        } else {
            groupKeepActive.classList.add('hide');
            groupContractElec.classList.remove('hide');
            groupContractGaz.classList.remove('hide');
            groupDateElec.classList.remove('hide');
            groupDateGaz.classList.remove('hide');
            groupElecMeter.classList.remove('hide');

            // Show Gaz appointment
            groupGazAppointment.classList.remove('hide');
        }
        updateReadingFieldsVisibility();
    }

    // -------------------------------------------------------------
    // Toast Notification System
    // -------------------------------------------------------------
    function triggerToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        // Remove toast from DOM after animations finish
        setTimeout(() => {
            toast.remove();
        }, 2500);
    }

    // -------------------------------------------------------------
    // Event Listeners
    // -------------------------------------------------------------

    // Radio buttons contract selectors
    document.querySelectorAll('input[name="energy-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateContractInputVisibility();
            generateEmail();
        });
    });

    // Inputs value change triggers
    cancelDateElecInput.addEventListener('input', generateEmail);
    cancelDateGazInput.addEventListener('input', generateEmail);
    contractElecInput.addEventListener('input', generateEmail);
    contractGazInput.addEventListener('input', generateEmail);
    keepActiveOther.addEventListener('change', () => {
        updateContractInputVisibility();
        generateEmail();
    });

    meterNonCommunicating.addEventListener('change', () => {
        if (meterNonCommunicating.checked) {
            groupElecReading.classList.remove('hide');
        } else {
            groupElecReading.classList.add('hide');
            elecReadingProvided.checked = false;
            groupElecReadingInputs.classList.add('hide');

            const defaultLinkyRadio = document.querySelector('input[name="elec-meter-type"][value="linky"]');
            if (defaultLinkyRadio) defaultLinkyRadio.checked = true;
            const defaultBaseRadio = document.querySelector('input[name="elec-reading-option"][value="base"]');
            if (defaultBaseRadio) defaultBaseRadio.checked = true;

            readingBaseVal.value = '';
            readingHpVal.value = '';
            readingHcVal.value = '';
            readingHphVal.value = '';
            readingHpbVal.value = '';
            readingHchVal.value = '';
            readingHcbVal.value = '';

            updateReadingFieldsVisibility();
        }
        generateEmail();
    });

    elecReadingProvided.addEventListener('change', () => {
        if (elecReadingProvided.checked) {
            groupElecReadingInputs.classList.remove('hide');
            updateReadingFieldsVisibility();
        } else {
            groupElecReadingInputs.classList.add('hide');

            readingBaseVal.value = '';
            readingHpVal.value = '';
            readingHcVal.value = '';
            readingHphVal.value = '';
            readingHpbVal.value = '';
            readingHchVal.value = '';
            readingHcbVal.value = '';

            updateReadingFieldsVisibility();
        }
        generateEmail();
    });

    document.querySelectorAll('input[name="elec-meter-type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateReadingFieldsVisibility();
            generateEmail();
        });
    });

    document.querySelectorAll('input[name="elec-reading-option"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateReadingFieldsVisibility();
            generateEmail();
        });
    });

    readingBaseVal.addEventListener('input', generateEmail);
    readingHpVal.addEventListener('input', generateEmail);
    readingHcVal.addEventListener('input', generateEmail);
    readingHphVal.addEventListener('input', generateEmail);
    readingHpbVal.addEventListener('input', generateEmail);
    readingHchVal.addEventListener('input', generateEmail);
    readingHcbVal.addEventListener('input', generateEmail);

    gazAppointmentNeeded.addEventListener('change', () => {
        if (gazAppointmentNeeded.checked) {
            groupGazAppointmentDetails.classList.remove('hide');
        } else {
            groupGazAppointmentDetails.classList.add('hide');
            gazAppointmentDatePicker.clear();
            gazAppointmentTimeInput.value = '';
            gazAppointmentTimeCustomInput.value = '';
            groupGazAppointmentTimeCustom.classList.add('hide');
        }
        generateEmail();
    });

    gazAppointmentTimeInput.addEventListener('change', () => {
        if (gazAppointmentTimeInput.value === 'custom') {
            groupGazAppointmentTimeCustom.classList.remove('hide');
        } else {
            groupGazAppointmentTimeCustom.classList.add('hide');
            gazAppointmentTimeCustomInput.value = '';
        }
        generateEmail();
    });

    gazAppointmentTimeCustomInput.addEventListener('input', generateEmail);

    // Clear buttons
    btnClearElec.addEventListener('click', () => {
        cancellationDatePickerElec.clear();
        generateEmail();
    });
    btnClearGaz.addEventListener('click', () => {
        cancellationDatePickerGaz.clear();
        generateEmail();
    });

    // Date Shortcut Buttons Elec
    btnTodayElec.addEventListener('click', () => {
        cancellationDatePickerElec.setDate(new Date(), true);
    });

    btnTomorrowElec.addEventListener('click', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        cancellationDatePickerElec.setDate(tomorrow, true);
    });

    // Date Shortcut Buttons Gaz
    btnTodayGaz.addEventListener('click', () => {
        cancellationDatePickerGaz.setDate(new Date(), true);
    });

    btnTomorrowGaz.addEventListener('click', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        cancellationDatePickerGaz.setDate(tomorrow, true);
    });

    // Copy Event Handlers
    btnCopySubject.addEventListener('click', () => {
        emailSubjectInput.select();
        navigator.clipboard.writeText(emailSubjectInput.value)
            .then(() => {
                triggerToast('Objet copié !');
                btnCopySubject.classList.add('copy-success-pulse');
                setTimeout(() => btnCopySubject.classList.remove('copy-success-pulse'), 400);
            })
            .catch(err => {
                console.error('Erreur lors de la copie de l\'objet:', err);
            });
    });

    btnCopyBody.addEventListener('click', () => {
        emailBodyInput.select();
        navigator.clipboard.writeText(emailBodyInput.value)
            .then(() => {
                triggerToast('Corps du message copié !');
                btnCopyBody.classList.add('copy-success-pulse');
                setTimeout(() => btnCopyBody.classList.remove('copy-success-pulse'), 400);
            })
            .catch(err => {
                console.error('Erreur lors de la copie du message:', err);
            });
    });

    // Run initial configuration update and email rendering
    updateContractInputVisibility();
    generateEmail();
});
