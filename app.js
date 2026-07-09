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

    // Output elements
    const rulesBanner = document.getElementById('rules-banner');
    const rulesTitle = document.getElementById('rules-title');
    const rulesDescription = document.getElementById('rules-description');
    const emailSubjectInput = document.getElementById('email-subject-input');
    const emailBodyInput = document.getElementById('email-body-input');

    // Quick buttons
    const btnTodayElec = document.getElementById('btn-today-elec');
    const btnTomorrowElec = document.getElementById('btn-tomorrow-elec');
    const btnNextMondayElec = document.getElementById('btn-next-monday-elec');
    const btnClearElec = document.getElementById('btn-clear-elec');

    const btnTodayGaz = document.getElementById('btn-today-gaz');
    const btnTomorrowGaz = document.getElementById('btn-tomorrow-gaz');
    const btnNextMondayGaz = document.getElementById('btn-next-monday-gaz');
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

    function getNextMonday() {
        const d = new Date();
        const currentDay = d.getDay();
        // Sunday is 0, Monday is 1, and so on.
        const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
        d.setDate(d.getDate() + daysUntilNextMonday);
        return d;
    }

    function formatLongFrenchDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    function getFutureGazPostponementPhrase(reqDate, effDate) {
        const dayOfWeek = reqDate.getDay();
        const effDateStr = formatLongFrenchDate(effDate);
        if (dayOfWeek === 6) { // Saturday
            return `La date de résiliation demandée tombant un samedi, nous vous informons que celle-ci est repoussée au lundi. Elle sera donc effective le ${effDateStr}.`;
        } else if (dayOfWeek === 0) { // Sunday
            return `La date de résiliation demandée tombant un dimanche, nous vous informons que celle-ci est repoussée au lundi. Elle sera donc effective le ${effDateStr}.`;
        } else { // Public holiday
            const nextDay = new Date(reqDate);
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            const isLendemain = effDate.getTime() === nextDay.getTime();
            const suffix = isLendemain ? `, soit le lendemain` : ``;
            return `La date de résiliation demandée tombant un jour férié, nous vous informons que celle-ci est repoussée au prochain jour ouvré${suffix}. Elle sera donc effective le ${effDateStr}.`;
        }
    }

    function getFutureGazBulletPostponementPhrase(reqDate, effDate) {
        const dayOfWeek = reqDate.getDay();
        const effDateStr = formatLongFrenchDate(effDate);
        if (dayOfWeek === 6) { // Saturday
            return `la date de résiliation demandée tombant un samedi, la résiliation est repoussée au lundi. Elle sera donc effective le ${effDateStr}.`;
        } else if (dayOfWeek === 0) { // Sunday
            return `la date de résiliation demandée tombant un dimanche, la résiliation est repoussée au lundi. Elle sera donc effective le ${effDateStr}.`;
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
                emailBody = `Nous avons bien reçu votre demande de résiliation pour votre contrat d'électricité (PDL n° ${pdlElec}).\n\nCependant, nous constatons que vous n'avez pas indiqué la date à laquelle vous souhaitez que cette résiliation prenne effet.\n\nPourriez-vous nous communiquer la date de résiliation souhaitée afin que nous puissions finaliser votre demande ?\n\nDans l'attente de votre retour, nous restons à votre entière disposition pour tout renseignement complémentaire.`;
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

                if (isToday || isFuture) {
                    const dateStr = formatLongFrenchDate(requestedDate);
                    rulesAppliedText = `Date future ou égale au jour même (${formatLongFrenchDate(requestedDate)}). Résiliation confirmée le jour demandé.`;
                    rulesStatusClass = 'status-success';

                    const datePhrase = isToday ? `ce jour, le ${dateStr}` : `le ${dateStr}`;

                    emailBody = `Nous vous confirmons la prise en compte de votre demande de résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).\n\nCelle-ci sera effective ${datePhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                } else {
                    // Requested date is in the past
                    const todayStr = formatLongFrenchDate(today);
                    rulesAppliedText = `Date demandée dans le passé (${formatLongFrenchDate(requestedDate)}). Résiliation impossible dans le passé, reprogrammée le jour même soit le ${todayStr}.`;
                    rulesStatusClass = 'status-warning';

                    emailBody = `Nous vous confirmons la prise en compte de la résiliation de votre contrat d'électricité (PDL n° ${pdlElec}).\n\nLa date de résiliation demandée étant dans le passé, nous vous informons qu'il n'est pas possible de résilier un contrat de manière rétroactive. Par conséquent, nous avons procédé à la résiliation de votre contrat en date d'aujourd'hui, soit le ${todayStr}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                }

                if (keepActive) {
                    emailSubject = "⚠️ Confirmation de résiliation (électricité) & question pour votre contrat gaz";

                    const isBizDayForGaz = isBusinessDay(effElecDate);
                    const isEffElecToday = effElecDate.getTime() === today.getTime();

                    if (isBizDayForGaz && !isEffElecToday) {
                        emailBody += `\n\nPar ailleurs, nous vous confirmons que votre contrat de gaz (PCE n° ${pceGaz}) reste actif et n'est pas impacté par cette demande. Si vous souhaitez également procéder à sa résiliation, merci de nous l'indiquer (et de nous préciser si celle-ci doit être effectuée à la même date (${effElecDateStr})). Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    } else if (isEffElecToday) {
                        const nextBizStr = formatLongFrenchDate(nextBusinessDay);
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                        const nextBizPhrase = isTomorrow ? `soit demain, le ${nextBizStr}` : `soit le ${nextBizStr}`;

                        emailBody += `\n\nPar ailleurs, nous vous confirmons que votre contrat de gaz (PCE n° ${pceGaz}) reste actif et n'est pas impacté par cette demande. Si votre souhait est également de le résilier à la même date, la résiliation du contrat de gaz ne pouvant pas s'effectuer le jour même, celle-ci prendra effet le prochain jour ouvré, ${nextBizPhrase}. Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    } else {
                        const proposedGazDate = getClosestBusinessDay(effElecDate);
                        const proposedGazDateStr = formatLongFrenchDate(proposedGazDate);
                        const dayOfWeek = effElecDate.getDay();
                        const reasons = {
                            6: 'samedi',
                            0: 'dimanche'
                        };
                        const reasonStr = reasons[dayOfWeek] || 'jour férié';
                        emailBody += `\n\nPar ailleurs, nous vous confirmons que votre contrat de gaz (PCE n° ${pceGaz}) reste actif et n'est pas impacté par cette demande. Si votre souhait est également de le résilier à la même date, la résiliation du contrat de gaz ne pouvant pas s'effectuer un ${reasonStr}, celle-ci prendra effet le prochain jour ouvré, soit le ${proposedGazDateStr}. Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    }
                    rulesAppliedText += " Offre de gaz maintenue active.";
                }

                emailBody += `\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.`;
            }
        }
        else if (energyType === 'gaz') {
            const dateVal = cancelDateGazInput.value;
            const keepActive = keepActiveOther.checked;

            if (!dateVal) {
                emailSubject = "⚠️ Action requise : Date de résiliation de votre contrat de gaz";
                emailBody = `Nous avons bien reçu votre demande de résiliation pour votre contrat de gaz (PCE n° ${pceGaz}).\n\nCependant, nous constatons que vous n'avez pas indiqué la date à laquelle vous souhaitez que cette résiliation prenne effet.\n\nPourriez-vous nous communiquer la date de résiliation souhaitée afin que nous puissions finaliser votre demande ?\n\nDans l'attente de votre retour, nous restons à votre entière disposition pour tout renseignement complémentaire.`;
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

                if (isFuture) {
                    const isRequestedBizDay = isBusinessDay(requestedDate);
                    if (isRequestedBizDay) {
                        effGazDate = requestedDate;
                        const dateStr = formatLongFrenchDate(requestedDate);
                        rulesAppliedText = `Date future (${formatLongFrenchDate(requestedDate)}). Résiliation confirmée le jour demandé.`;
                        rulesStatusClass = 'status-success';

                        emailBody = `Nous vous confirmons la prise en compte de votre demande de résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\nCelle-ci sera effective le ${dateStr}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
                    } else {
                        const effectiveDate = getClosestBusinessDay(requestedDate);
                        effGazDate = effectiveDate;
                        const effectiveDateStr = formatLongFrenchDate(effectiveDate);
                        const requestedDateStr = formatLongFrenchDate(requestedDate);

                        const dayOfWeekStr = requestedDate.getDay() === 6 ? 'samedi' : requestedDate.getDay() === 0 ? 'dimanche' : 'jour férié';
                        rulesAppliedText = `Date demandée (${requestedDateStr}) tombant un ${dayOfWeekStr}. Reportée au prochain jour ouvré soit le ${effectiveDateStr}.`;
                        rulesStatusClass = 'status-warning';

                        const explanationPhrase = getFutureGazPostponementPhrase(requestedDate, effectiveDate);

                        emailBody = `Nous vous confirmons la prise en compte de votre demande de résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\n${explanationPhrase}\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
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

                    emailBody = `Nous vous confirmons la prise en compte de la résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\nLa date de résiliation demandée étant dans le passé, nous vous informons qu'il n'est pas possible de résilier un contrat de manière rétroactive. Par conséquent, la résiliation de votre contrat sera effective le prochain jour ouvré, ${nextBizPhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
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

                    emailBody = `Nous vous confirmons la prise en compte de la résiliation de votre contrat de gaz (PCE n° ${pceGaz}).\n\nLa résiliation de contrat de gaz ne pouvant pas s'effectuer le jour même, la résiliation de votre contrat sera effective le prochain jour ouvré, ${nextBizPhrase}.\n\nVotre facture de clôture vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.`;
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

                    emailBody += `\n\nPar ailleurs, nous vous confirmons que votre contrat d'électricité (PDL n° ${pdlElec}) reste actif et n'est pas impacté par cette demande. Si vous souhaitez également procéder à sa résiliation, merci de nous l'indiquer (et de nous préciser si celle-ci doit être effectuée ${proposedElecPhrase}). Dans l'attente de votre confirmation à ce sujet, veuillez noter que sans réponse de votre part, ce contrat restera actif.`;
                    rulesAppliedText += " Offre d'électricité maintenue active.";
                }

                emailBody += `\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.`;
            }
        }
        else if (energyType === 'both') {
            const dateElecVal = cancelDateElecInput.value;
            const dateGazVal = cancelDateGazInput.value;

            if (!dateElecVal && !dateGazVal) {
                emailSubject = "⚠️ Action requise : Date de résiliation de vos contrats d'électricité et de gaz";
                emailBody = `Nous avons bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nCependant, vous n'avez pas mentionné la date de résiliation souhaitée pour vos contrats.\n\nPourriez-vous nous préciser la date à laquelle vous souhaitez que ces résiliations prennent effet (en indiquant si vous souhaitez la même date pour les deux contrats ou des dates distinctes) ?\n\nDans l'attente de votre retour, nous restons à votre entière disposition pour tout renseignement complémentaire.`;
                rulesAppliedText = "Les deux dates sont absentes. E-mail de demande de dates généré.";
                rulesStatusClass = 'status-warning';
            }
            else if (dateElecVal && !dateGazVal) {
                const reqElecDate = parseLocalDate(dateElecVal);
                reqElecDate.setHours(0, 0, 0, 0);

                let effElecDate;
                let elecExplanationText = '';
                if (reqElecDate >= today) {
                    effElecDate = reqElecDate;
                    const dateStr = formatLongFrenchDate(reqElecDate);
                    const datePhrase = (reqElecDate.getTime() === today.getTime()) ? `ce jour, le ${dateStr}` : `le ${dateStr}`;
                    elecExplanationText = `La résiliation sera effective ${datePhrase}.`;
                } else {
                    effElecDate = today;
                    elecExplanationText = `La résiliation sera effective en date d'aujourd'hui, soit le ${formatLongFrenchDate(today)} (la date demandée étant dans le passé).`;
                }

                const effElecDateStr = formatLongFrenchDate(effElecDate);

                const isRequestedBizDayForGaz = isBusinessDay(effElecDate);
                const isEffElecToday = effElecDate.getTime() === today.getTime();

                let proposedGazPhrase = '';
                if (isEffElecToday) {
                    proposedGazPhrase = `Si votre souhait est également de le résilier à la même date, la résiliation du contrat de gaz ne pouvant pas s'effectuer le jour même, celle-ci prendra effet le prochain jour ouvré, soit demain, le ${formatLongFrenchDate(nextBusinessDay)}.`;
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
                emailBody = `Nous avons bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nPour votre contrat d'électricité : ${elecExplanationText} Votre facture de clôture d'électricité vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.\n\nCependant, la date souhaitée pour votre contrat de gaz n'a pas été précisée. ${proposedGazPhrase}\n\nDans l'attente de votre confirmation ou de vos instructions, nous restons à votre entière disposition pour tout renseignement complémentaire.`;
                rulesAppliedText = `Date électricité renseignée (${formatLongFrenchDate(reqElecDate)}), date gaz manquante. Confirmation pour l'électricité et demande de précision pour le gaz générées (post-report si week-end/aujourd'hui).`;
                rulesStatusClass = 'status-warning';
            }
            else if (!dateElecVal && dateGazVal) {
                const reqGazDate = parseLocalDate(dateGazVal);
                reqGazDate.setHours(0, 0, 0, 0);

                let effGazDate;
                let gazExplanationText = '';
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
                        gazExplanationText = `La résiliation ne pouvant pas s'effectuer le jour même, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}.`;
                    } else {
                        gazExplanationText = `La date demandée étant dans le passé, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}.`;
                    }
                }

                const effGazDateStr = formatLongFrenchDate(effGazDate);

                const proposedElecDate = (reqGazDate >= today) ? reqGazDate : today;
                const proposedElecDateStr = formatLongFrenchDate(proposedElecDate);

                let proposedElecPhrase = '';
                if (reqGazDate.getTime() === effGazDate.getTime()) {
                    proposedElecPhrase = `Souhaitez-vous que la résiliation de votre contrat d'électricité soit également effectuée à cette même date (${effGazDateStr}) ?`;
                } else if (reqGazDate.getTime() === today.getTime() || reqGazDate < today) {
                    proposedElecPhrase = `Souhaitez-vous que la résiliation de votre contrat d'électricité soit également effectuée à la date du jour (${proposedElecDateStr}) ?`;
                } else {
                    proposedElecPhrase = `Souhaitez-vous que la résiliation de votre contrat d'électricité soit également effectuée à la date initialement souhaitée (${proposedElecDateStr}) ?`;
                }

                emailSubject = "⚠️ Demande de confirmation - Date de résiliation de vos contrats d'électricité et de gaz";
                emailBody = `Nous avons bien reçu votre demande de résiliation pour vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nPour votre contrat de gaz : ${gazExplanationText} Votre facture de clôture de gaz vous sera adressée dans un délai de 15 jours à 3 semaines après cette résiliation.\n\nCependant, la date souhaitée pour votre contrat d'électricité n'a pas été précisée. ${proposedElecPhrase}\n\nDans l'attente de votre confirmation ou de vos instructions, nous restons à votre entière disposition pour tout renseignement complémentaire.`;
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

                    if (isFuture) {
                        const isRequestedBizDay = isBusinessDay(requestedDate);
                        if (isRequestedBizDay) {
                            const dateStr = formatLongFrenchDate(requestedDate);
                            rulesAppliedText = `Date future (${formatLongFrenchDate(requestedDate)}). Les deux contrats (Élec & Gaz) seront résiliés à cette date.`;
                            rulesStatusClass = 'status-success';

                            emailBody = `Nous vous confirmons la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nCes résiliations seront effectives le ${dateStr}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations.\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.`;
                        } else {
                            const effectiveDate = getClosestBusinessDay(requestedDate);
                            const effectiveDateStr = formatLongFrenchDate(effectiveDate);
                            const requestedDateStr = formatLongFrenchDate(requestedDate);

                            const dayOfWeekStr = requestedDate.getDay() === 6 ? 'samedi' : requestedDate.getDay() === 0 ? 'dimanche' : 'jour férié';
                            rulesAppliedText = `Date future (${requestedDateStr}) tombant un ${dayOfWeekStr}. Élec résilié à cette date. Gaz reporté au prochain jour ouvré (${effectiveDateStr}).`;
                            rulesStatusClass = 'status-warning';

                            const bulletPhrase = getFutureGazBulletPostponementPhrase(requestedDate, effectiveDate);

                            emailBody = `Nous vous confirmons la prise en compte de votre demande de résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation sera effective le ${requestedDateStr}.\n- Pour votre contrat de gaz : ${bulletPhrase}\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.`;
                        }
                    } else if (isPast) {
                        // Split logic for past date: Elec is today, Gaz is tomorrow if business day or next business day
                        const todayStr = formatLongFrenchDate(today);
                        const nextBizStr = formatLongFrenchDate(nextBusinessDay);

                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                        const gazEffectivePhrase = isTomorrow ? `le prochain jour ouvré, soit demain, le ${nextBizStr}` : `le prochain jour ouvré, soit le ${nextBizStr}`;

                        rulesAppliedText = `Date demandée dans le passé (${formatLongFrenchDate(requestedDate)}). Élec résilié le jour d'aujourd’hui (${todayStr}). Gaz décalé ${gazEffectivePhrase}.`;
                        rulesStatusClass = 'status-warning';

                        emailBody = `Nous vous confirmons la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLa date de résiliation demandée étant dans le passé, nous vous informons qu'il n'est pas possible de résilier un contrat de manière rétroactive.\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation de votre contrat d'électricité est effective le jour d'aujourd'hui, soit le ${todayStr}.\n- Pour votre contrat de gaz : la résiliation de votre contrat de gaz sera effective ${gazEffectivePhrase}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.`;
                    } else {
                        // Requested is today (isToday)
                        const todayStr = formatLongFrenchDate(today);
                        const nextBizStr = formatLongFrenchDate(nextBusinessDay);
                        rulesAppliedText = `Date demandée aujourd'hui (${formatLongFrenchDate(requestedDate)}). Élec résilié aujourd'hui (${todayStr}). Gaz décalé au prochain jour ouvré (${nextBizStr}).`;
                        rulesStatusClass = 'status-warning';

                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        const isTomorrow = nextBusinessDay.getTime() === tomorrow.getTime();
                        const nextBizPhrase = isTomorrow ? `soit demain, le ${nextBizStr}` : `soit le ${nextBizStr}`;

                        emailBody = `Nous vous confirmons la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : la résiliation de votre contrat d'électricité est effective aujourd'hui, soit le ${todayStr}.\n- Pour votre contrat de gaz : la résiliation de votre contrat de gaz ne pouvant pas s'effectuer le jour même, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.`;
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
                    if (reqElecDate >= today) {
                        effElecDate = reqElecDate;
                        const dateStr = formatLongFrenchDate(reqElecDate);
                        const datePhrase = (reqElecDate.getTime() === today.getTime()) ? `ce jour, le ${dateStr}` : `le ${dateStr}`;
                        elecExplanationText = `la résiliation sera effective ${datePhrase}`;
                    } else {
                        effElecDate = today;
                        elecExplanationText = `la résiliation sera effective en date d'aujourd'hui, soit le ${formatLongFrenchDate(today)} (la date demandée étant dans le passé)`;
                    }

                    // Evaluate gas date
                    let effGazDate;
                    let gazExplanationText = '';
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
                            gazExplanationText = `la résiliation ne pouvant pas s'effectuer le jour même, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}`;
                        } else {
                            gazExplanationText = `la date demandée étant dans le passé, la résiliation sera effective le prochain jour ouvré, ${nextBizPhrase}`;
                        }
                    }

                    emailSubject = "Confirmation de la résiliation de vos contrats d'électricité et de gaz";
                    emailBody = `Nous vous confirmons la prise en compte de la résiliation de vos contrats d'électricité (PDL n° ${pdlElec}) et de gaz (PCE n° ${pceGaz}).\n\nLes modalités et dates effectives sont les suivantes :\n- Pour votre contrat d'électricité : ${elecExplanationText}.\n- Pour votre contrat de gaz : ${gazExplanationText}.\n\nVos factures de clôture vous seront adressées dans un délai de 15 jours à 3 semaines après ces résiliations respectives.\n\nNous restons à votre entière disposition pour tout renseignement complémentaire.`;

                    rulesAppliedText = `Deux dates distinctes. Élec effective le ${formatLongFrenchDate(effElecDate)}. Gaz effective le ${formatLongFrenchDate(effGazDate)}.`;
                    rulesStatusClass = 'status-warning';
                }
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

    // Update form visibility based on selected contract types
    function updateContractInputVisibility() {
        const energyType = document.querySelector('input[name="energy-type"]:checked').value;
        const keepActive = keepActiveOther.checked;

        if (energyType === 'elec') {
            groupKeepActive.classList.remove('hide');
            keepActiveLabel.textContent = "Le client détient aussi un contrat de gaz et souhaite le conserver actif (ne résilier que l'électricité)";
            groupContractElec.classList.remove('hide');
            groupDateElec.classList.remove('hide');
            groupDateGaz.classList.add('hide');
            if (keepActive) {
                groupContractGaz.classList.remove('hide');
            } else {
                groupContractGaz.classList.add('hide');
            }
        } else if (energyType === 'gaz') {
            groupKeepActive.classList.remove('hide');
            keepActiveLabel.textContent = "Le client détient aussi un contrat d'électricité et souhaite le conserver actif (ne résilier que le gaz)";
            groupContractGaz.classList.remove('hide');
            groupDateGaz.classList.remove('hide');
            groupDateElec.classList.add('hide');
            if (keepActive) {
                groupContractElec.classList.remove('hide');
            } else {
                groupContractElec.classList.add('hide');
            }
        } else {
            groupKeepActive.classList.add('hide');
            groupContractElec.classList.remove('hide');
            groupContractGaz.classList.remove('hide');
            groupDateElec.classList.remove('hide');
            groupDateGaz.classList.remove('hide');
        }
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

    btnNextMondayElec.addEventListener('click', () => {
        cancellationDatePickerElec.setDate(getNextMonday(), true);
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

    btnNextMondayGaz.addEventListener('click', () => {
        cancellationDatePickerGaz.setDate(getNextMonday(), true);
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
